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

  async sendWebhook(webhook: Webhook, payload: WebhookPayload): Promise<boolean> {
    try {
      const payloadString = JSON.stringify(payload);
      const signature = webhook.secret 
        ? this.generateSignature(payloadString, webhook.secret)
        : undefined;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'KeyAuth-Webhook/1.0',
        'X-Webhook-Timestamp': payload.timestamp,
        'X-Webhook-Event': payload.event,
      };

      if (signature) {
        headers['X-Webhook-Signature'] = `sha256=${signature}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: payloadString,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      return response.ok;
    } catch (error) {
      console.error('Webhook delivery failed:', error);
      return false;
    }
  }

  async deliverWebhooks(userId: string, event: string, payload: WebhookPayload): Promise<void> {
    try {
      const webhooks = await storage.getUserWebhooks(userId);
      const activeWebhooks = webhooks.filter(w => 
        w.isActive && w.events.includes(event)
      );

      // Send webhooks in parallel
      const deliveryPromises = activeWebhooks.map(webhook => 
        this.sendWebhook(webhook, payload)
      );

      await Promise.allSettled(deliveryPromises);
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
      await storage.createActivityLog({
        ...activityData,
        success: activityData.success ?? true,
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
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