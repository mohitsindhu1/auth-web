import crypto from 'crypto';
import { storage } from './storage';
import type { Webhook, ActivityLog } from '@shared/schema';

export interface WebhookPayload {
  event: string;
  timestamp: string;
  application_id: number;
  user_data?: {
    id: number;
    username: string;
    email?: string;
    hwid?: string;
    ip_address?: string;
    user_agent?: string;
    location?: string;
  };
  metadata?: any;
  success: boolean;
  error_message?: string;
}

export class WebhookService {
  private static instance: WebhookService;
  
  static getInstance(): WebhookService {
    if (!WebhookService.instance) {
      WebhookService.instance = new WebhookService();
    }
    return WebhookService.instance;
  }

  private generateSignature(payload: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  private formatDiscordWebhook(payload: WebhookPayload): any {
    const color = payload.success ? 0x00ff00 : 0xff0000; // Green for success, red for failure
    const eventEmoji: Record<string, string> = {
      'user_login': '🔐',
      'login_failed': '❌',
      'user_register': '👤',
      'account_expired': '⏰',
      'hwid_mismatch': '🔒',
      'version_mismatch': '🔄',
      'account_disabled': '🚫',
      'login_blocked_ip': '🚫',
      'login_blocked_username': '🚫',
      'login_blocked_hwid': '🚫'
    };

    interface DiscordEmbedField {
      name: string;
      value: string;
      inline: boolean;
    }

    const fields: DiscordEmbedField[] = [];

    const embed = {
      title: `${eventEmoji[payload.event as keyof typeof eventEmoji] || '📊'} ${payload.event.replace('_', ' ').toUpperCase()}`,
      color: color,
      timestamp: payload.timestamp,
      fields: fields,
      footer: {
        text: `Application ID: ${payload.application_id}`
      }
    };

    if (payload.user_data) {
      fields.push({
        name: 'User Information',
        value: `**Username:** ${payload.user_data.username}\n${payload.user_data.email ? `**Email:** ${payload.user_data.email}\n` : ''}${payload.user_data.ip_address ? `**IP:** ${payload.user_data.ip_address}\n` : ''}${payload.user_data.hwid ? `**HWID:** ${payload.user_data.hwid}\n` : ''}`,
        inline: true
      });
    }

    if (payload.error_message) {
      fields.push({
        name: 'Error Details',
        value: payload.error_message,
        inline: false
      });
    }

    if (payload.metadata) {
      fields.push({
        name: 'Additional Information',
        value: Object.entries(payload.metadata).map(([key, value]) => `**${key}:** ${value}`).join('\n'),
        inline: false
      });
    }

    return {
      embeds: [embed]
    };
  }

  async sendWebhook(webhook: Webhook, payload: WebhookPayload, retryCount: number = 0): Promise<boolean> {
    const maxRetries = 3;
    const retryDelay = Math.pow(2, retryCount) * 1000; // Exponential backoff
    
    try {
      // Check if this is a Discord webhook URL
      const isDiscordWebhook = webhook.url.includes('discord.com/api/webhooks');
      
      let webhookPayload;
      if (isDiscordWebhook) {
        webhookPayload = this.formatDiscordWebhook(payload);
      } else {
        webhookPayload = payload;
      }

      const payloadString = JSON.stringify(webhookPayload);
      const signature = webhook.secret 
        ? this.generateSignature(payloadString, webhook.secret)
        : undefined;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'PhantomAuth-Webhook/1.0',
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
      };

      // Only add custom headers for non-Discord webhooks
      if (!isDiscordWebhook) {
        headers['X-Webhook-Timestamp'] = payload.timestamp;
        headers['X-Webhook-Event'] = payload.event;
        headers['X-Webhook-Retry-Count'] = retryCount.toString();
        
        if (signature) {
          headers['X-Webhook-Signature'] = `sha256=${signature}`;
        }
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // Extended timeout for international connectivity
      
      console.log(`Sending webhook to: ${webhook.url} (attempt ${retryCount + 1}/${maxRetries + 1})`);
      
      // Add DNS preflight for better international connectivity
      const startTime = Date.now();
      
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: payloadString,
        signal: controller.signal,
        // Enhanced global server compatibility settings
        keepalive: true,
        redirect: 'follow',
        // Additional options for better international delivery
        cache: 'no-cache',
        mode: 'cors',
        referrerPolicy: 'no-referrer'
      });
      
      clearTimeout(timeoutId);

      const responseTime = Date.now() - startTime;
      console.log(`Webhook response status: ${response.status}, response time: ${responseTime}ms`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Webhook error response (${response.status}):`, errorText);
        console.error(`Request details: URL=${webhook.url}, Event=${payload.event}, User=${payload.user_data?.id || 'unknown'}`);
        
        // Enhanced retry logic for international connectivity issues
        if ((response.status >= 500 || response.status === 429 || response.status === 0) && retryCount < maxRetries) {
          const adjustedDelay = retryDelay + (Math.random() * 1000); // Add jitter for international requests
          console.log(`Retrying webhook in ${adjustedDelay}ms... (Status: ${response.status})`);
          await new Promise(resolve => setTimeout(resolve, adjustedDelay));
          return this.sendWebhook(webhook, payload, retryCount + 1);
        }
      } else {
        console.log(`Webhook delivered successfully in ${responseTime}ms`);
      }

      return response.ok;
    } catch (error) {
      const errorName = error instanceof Error ? error.name : 'Unknown';
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      console.error(`Webhook delivery failed (${errorName}):`, errorMessage);
      console.error(`Request details: URL=${webhook.url}, Event=${payload.event}, Retry=${retryCount + 1}/${maxRetries + 1}`);
      
      // Enhanced retry logic for international connectivity issues
      const isRetryableError = error instanceof Error && (
        error.name === 'AbortError' ||
        error.name === 'TypeError' ||
        error.name === 'TimeoutError' ||
        error.message.includes('fetch') ||
        error.message.includes('network') ||
        error.message.includes('timeout') ||
        error.message.includes('ENOTFOUND') ||
        error.message.includes('ECONNRESET') ||
        error.message.includes('ETIMEDOUT') ||
        error.message.includes('socket hang up')
      );
      
      if (retryCount < maxRetries && isRetryableError) {
        const adjustedDelay = retryDelay + (Math.random() * 2000); // Increased jitter for international requests
        console.log(`Retrying webhook in ${adjustedDelay}ms due to ${errorName}: ${errorMessage}`);
        await new Promise(resolve => setTimeout(resolve, adjustedDelay));
        return this.sendWebhook(webhook, payload, retryCount + 1);
      }
      
      console.error(`Final webhook delivery failure after ${retryCount + 1} attempts`);
      return false;
    }
  }

  async deliverWebhooks(userId: string, event: string, payload: WebhookPayload): Promise<void> {
    try {
      const webhooks = await storage.getUserWebhooks(userId);
      console.log(`Attempting to deliver webhook for event: ${event}`);
      console.log(`Found ${webhooks.length} webhooks for user ${userId}`);
      console.log(`Request origin: IP=${payload.user_data?.ip_address || 'unknown'}, Location=${payload.user_data?.location || 'unknown'}`);
      
      const activeWebhooks = webhooks.filter(w => 
        w.isActive && w.events.includes(event)
      );
      
      console.log(`Active webhooks for event ${event}:`, activeWebhooks.length);
      activeWebhooks.forEach(w => {
        console.log(`Webhook ${w.id} events:`, w.events);
      });

      // Send webhooks with enhanced monitoring and sequential delivery for better reliability
      const deliveryResults = [];
      
      for (const webhook of activeWebhooks) {
        console.log(`Delivering webhook ${webhook.id} to: ${webhook.url}`);
        const startTime = Date.now();
        
        try {
          const success = await this.sendWebhook(webhook, payload);
          const duration = Date.now() - startTime;
          
          deliveryResults.push({
            webhookId: webhook.id,
            url: webhook.url,
            success,
            duration,
            error: null
          });
          
          console.log(`Webhook ${webhook.id} delivery ${success ? 'succeeded' : 'failed'} in ${duration}ms`);
        } catch (error) {
          const duration = Date.now() - startTime;
          const errorMessage = error instanceof Error ? error.message : String(error);
          
          deliveryResults.push({
            webhookId: webhook.id,
            url: webhook.url,
            success: false,
            duration,
            error: errorMessage
          });
          
          console.error(`Webhook ${webhook.id} delivery failed after ${duration}ms:`, errorMessage);
        }
        
        // Add small delay between webhook deliveries to prevent overwhelming
        if (activeWebhooks.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      // Log comprehensive delivery summary
      const successCount = deliveryResults.filter(r => r.success).length;
      const failureCount = deliveryResults.length - successCount;
      console.log(`Webhook delivery summary: ${successCount} succeeded, ${failureCount} failed out of ${deliveryResults.length} total`);
      
      if (failureCount > 0) {
        console.log('Failed deliveries:', deliveryResults.filter(r => !r.success));
      }
    } catch (error) {
      console.error('Failed to deliver webhooks:', error);
    }
  }

  async logActivity(activityData: {
    applicationId: number;
    appUserId?: number;
    event: string;
    ipAddress?: string;
    hwid?: string;
    userAgent?: string;
    metadata?: any;
    success?: boolean;
    errorMessage?: string;
  }): Promise<void> {
    try {
      // Only include appUserId if it's a valid number and the user exists
      const logData = {
        ...activityData,
        success: activityData.success ?? true,
      };
      
      // Remove appUserId if it doesn't exist or is invalid
      if (activityData.appUserId && activityData.appUserId > 0) {
        try {
          const userExists = await storage.getAppUser(activityData.appUserId);
          if (!userExists) {
            delete logData.appUserId;
          }
        } catch {
          delete logData.appUserId;
        }
      } else {
        delete logData.appUserId;
      }
      
      await storage.createActivityLog(logData);
    } catch (error) {
      console.error('Failed to log activity:', error);
      // Don't throw the error - continue with webhook delivery even if logging fails
    }
  }

  async logAndNotify(
    userId: string,
    applicationId: number,
    event: string,
    userData?: any,
    options: {
      success?: boolean;
      errorMessage?: string;
      metadata?: any;
      ipAddress?: string;
      hwid?: string;
      userAgent?: string;
    } = {}
  ): Promise<void> {
    // Log the activity
    await this.logActivity({
      applicationId,
      appUserId: userData?.id,
      event,
      ipAddress: options.ipAddress,
      hwid: options.hwid,
      userAgent: options.userAgent,
      metadata: options.metadata,
      success: options.success ?? true,
      errorMessage: options.errorMessage,
    });

    // Prepare webhook payload
    const webhookPayload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      application_id: applicationId,
      success: options.success ?? true,
      error_message: options.errorMessage,
      metadata: options.metadata,
    };

    if (userData) {
      webhookPayload.user_data = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        hwid: userData.hwid || options.hwid,
        ip_address: options.ipAddress,
        user_agent: options.userAgent,
      };
    }

    // Deliver webhooks
    await this.deliverWebhooks(userId, event, webhookPayload);
  }
}

export const webhookService = WebhookService.getInstance();