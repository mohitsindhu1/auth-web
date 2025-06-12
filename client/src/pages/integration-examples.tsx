import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Code, Download, ExternalLink, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";

interface Application {
  id: number;
  name: string;
  apiKey: string;
  version: string;
}

export default function IntegrationExamples() {
  const { toast } = useToast();
  const [selectedApp, setSelectedApp] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("csharp");

  // Fetch applications for API key selection
  const { data: applications = [] } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  const selectedApplication = applications.find(app => app.id.toString() === selectedApp);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Code copied to clipboard",
    });
  };

  const baseUrl = window.location.origin;
  const apiKey = selectedApplication?.apiKey || "YOUR_API_KEY";

  const csharpLoginExample = `using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Management;
using System.Security.Cryptography;

// Complete WinForms Login Form Implementation
public partial class LoginForm : Form
{
    private AuthApiClient _authClient;
    private TextBox txtUsername;
    private TextBox txtPassword;
    private Button btnLogin;
    private Label lblStatus;

    public LoginForm()
    {
        InitializeComponent();
        _authClient = new AuthApiClient("${apiKey}");
    }

    private void InitializeComponent()
    {
        this.Text = "Application Login";
        this.Size = new System.Drawing.Size(400, 300);
        this.StartPosition = FormStartPosition.CenterScreen;

        // Username
        var lblUsername = new Label { Text = "Username:", Location = new System.Drawing.Point(50, 50), Size = new System.Drawing.Size(80, 23) };
        txtUsername = new TextBox { Location = new System.Drawing.Point(140, 50), Size = new System.Drawing.Size(200, 23) };

        // Password
        var lblPassword = new Label { Text = "Password:", Location = new System.Drawing.Point(50, 90), Size = new System.Drawing.Size(80, 23) };
        txtPassword = new TextBox { Location = new System.Drawing.Point(140, 90), Size = new System.Drawing.Size(200, 23), UseSystemPasswordChar = true };

        // Login Button
        btnLogin = new Button { Text = "Login", Location = new System.Drawing.Point(140, 130), Size = new System.Drawing.Size(100, 30) };
        btnLogin.Click += async (s, e) => await LoginAsync();

        // Status Label
        lblStatus = new Label { Location = new System.Drawing.Point(50, 180), Size = new System.Drawing.Size(300, 60), ForeColor = System.Drawing.Color.Red };

        this.Controls.AddRange(new Control[] { lblUsername, txtUsername, lblPassword, txtPassword, btnLogin, lblStatus });
    }

    private async Task LoginAsync()
    {
        try
        {
            btnLogin.Enabled = false;
            lblStatus.Text = "Authenticating...";
            lblStatus.ForeColor = System.Drawing.Color.Blue;

            // Get HWID for hardware locking
            string hwid = GetHardwareId();
            
            var loginResult = await _authClient.LoginAsync(
                txtUsername.Text, 
                txtPassword.Text, 
                "${selectedApplication?.version || "1.0.0"}", 
                hwid
            );
            
            if (loginResult.Success)
            {
                // Display custom success message from your application settings
                lblStatus.Text = loginResult.Message;
                lblStatus.ForeColor = System.Drawing.Color.Green;
                
                // Show success message box with custom message
                MessageBox.Show(
                    loginResult.Message, 
                    "Login Successful", 
                    MessageBoxButtons.OK, 
                    MessageBoxIcon.Information
                );
                
                // Verify user session (Double security check)
                var verifyResult = await _authClient.VerifyAsync(loginResult.UserId);
                if (verifyResult.Success)
                {
                    Console.WriteLine("User session verified successfully!");
                    
                    // Hide login form and show main application
                    this.Hide();
                    
                    // Create and show main application window
                    var mainForm = new MainForm();
                    mainForm.UserData = new UserInfo
                    {
                        UserId = loginResult.UserId,
                        Username = loginResult.Username,
                        Email = loginResult.Email
                    };
                    mainForm.Show();
                    
                    // Start session monitoring for periodic verification
                    StartSessionMonitoring(loginResult.UserId);
                }
                else
                {
                    // Session verification failed - security issue
                    MessageBox.Show("Session verification failed. Please try logging in again.", 
                                  "Security Warning", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    
                    // Clear fields and stay on login form
                    txtUsername.Clear();
                    txtPassword.Clear();
                    txtUsername.Focus();
                }
            }
            else
            {
                // Display custom error message from your application settings
                lblStatus.Text = loginResult.Message;
                lblStatus.ForeColor = System.Drawing.Color.Red;
                
                // Show error message box with custom message
                MessageBox.Show(
                    loginResult.Message, 
                    "Login Failed", 
                    MessageBoxButtons.OK, 
                    MessageBoxIcon.Error
                );
                
                // Handle specific error types based on the custom messages
                HandleLoginError(loginResult.Message);
            }
        }
        catch (Exception ex)
        {
            lblStatus.Text = $"Connection error: {ex.Message}";
            lblStatus.ForeColor = System.Drawing.Color.Red;
            MessageBox.Show($"Network error: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
        finally
        {
            btnLogin.Enabled = true;
        }
    }

    private void HandleLoginError(string errorMessage)
    {
        // Handle different error types based on your custom messages
        if (errorMessage.ToLower().Contains("disabled"))
        {
            // Custom account disabled message - user can configure this message
            MessageBox.Show("Your account has been disabled. Please contact our support team.", 
                          "Account Disabled", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            Application.Exit();
        }
        else if (errorMessage.ToLower().Contains("expired"))
        {
            // Custom account expired message - user can configure this message
            MessageBox.Show("Your subscription has expired. Please renew to continue using the application.", 
                          "Subscription Expired", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            System.Diagnostics.Process.Start("https://yourwebsite.com/renew");
        }
        else if (errorMessage.ToLower().Contains("version"))
        {
            // Custom version mismatch message - user can configure this message
            MessageBox.Show("Your application version is outdated. Please download the latest version.", 
                          "Version Mismatch", MessageBoxButtons.OK, MessageBoxIcon.Information);
            System.Diagnostics.Process.Start("https://yourwebsite.com/download");
            Application.Exit();
        }
        else if (errorMessage.ToLower().Contains("hwid") || errorMessage.ToLower().Contains("hardware"))
        {
            // Custom HWID mismatch message - user can configure this message
            MessageBox.Show("Hardware ID mismatch detected. Please contact support to reset your device binding.", 
                          "Device Mismatch", MessageBoxButtons.OK, MessageBoxIcon.Warning);
        }
    }

    // Enhanced Session Monitoring with Automatic Session Management
    private System.Windows.Forms.Timer sessionTimer;
    private System.Windows.Forms.Timer heartbeatTimer;
    private int currentUserId;
    private int sessionCheckFailures = 0;
    private readonly int maxFailures = 3; // Allow 3 failures before forcing logout
    
    private void StartSessionMonitoring(int userId)
    {
        currentUserId = userId;
        sessionCheckFailures = 0;
        
        // Primary session verification every 5 minutes
        sessionTimer = new System.Windows.Forms.Timer();
        sessionTimer.Interval = 300000; // 5 minutes
        sessionTimer.Tick += async (s, e) => await VerifySessionPeriodically();
        sessionTimer.Start();
        
        // Heartbeat timer every 30 seconds to maintain session activity
        heartbeatTimer = new System.Windows.Forms.Timer();
        heartbeatTimer.Interval = 30000; // 30 seconds
        heartbeatTimer.Tick += async (s, e) => await SendHeartbeat();
        heartbeatTimer.Start();
        
        Console.WriteLine("Enhanced session monitoring started:");
        Console.WriteLine("- Session verification: every 5 minutes");
        Console.WriteLine("- Session heartbeat: every 30 seconds");
    }
    
    private async Task VerifySessionPeriodically()
    {
        try
        {
            var verifyResult = await _authClient.VerifyAsync(currentUserId);
            if (!verifyResult.Success)
            {
                sessionCheckFailures++;
                Console.WriteLine($"Session verification failed (attempt {sessionCheckFailures}/{maxFailures})");
                
                if (sessionCheckFailures >= maxFailures)
                {
                    await ForceLogout("Your session has expired. Please login again.");
                }
            }
            else
            {
                sessionCheckFailures = 0; // Reset failure counter on success
                Console.WriteLine($"✓ Session verified successfully at {DateTime.Now:HH:mm:ss}");
                
                // Check if account status changed
                if (verifyResult.Message.Contains("disabled") || verifyResult.Message.Contains("expired"))
                {
                    await ForceLogout(verifyResult.Message);
                }
            }
        }
        catch (HttpRequestException httpEx)
        {
            sessionCheckFailures++;
            Console.WriteLine($"Network error during session check: {httpEx.Message}");
            
            if (sessionCheckFailures >= maxFailures)
            {
                await ForceLogout("Unable to verify session due to network issues. Please check your connection and login again.");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Session verification error: {ex.Message}");
            // Don't increment failures for unknown errors, just log them
        }
    }
    
    private async Task SendHeartbeat()
    {
        try
        {
            // Simple heartbeat to maintain session activity
            var heartbeatResult = await _authClient.VerifyAsync(currentUserId);
            if (!heartbeatResult.Success)
            {
                Console.WriteLine($"⚠ Heartbeat failed: {heartbeatResult.Message}");
            }
        }
        catch (Exception ex)
        {
            // Silent heartbeat failures - don't show to user
            Console.WriteLine($"Heartbeat error: {ex.Message}");
        }
    }
    
    private async Task ForceLogout(string reason)
    {
        // Stop all timers
        sessionTimer?.Stop();
        sessionTimer?.Dispose();
        heartbeatTimer?.Stop();
        heartbeatTimer?.Dispose();
        
        // Show logout message
        MessageBox.Show(reason, "Session Expired", MessageBoxButtons.OK, MessageBoxIcon.Warning);
        
        // Close main application and return to login
        if (this.InvokeRequired)
        {
            this.Invoke(new Action(() => {
                CloseMainFormsAndShowLogin();
            }));
        }
        else
        {
            CloseMainFormsAndShowLogin();
        }
    }
    
    private void CloseMainFormsAndShowLogin()
    {
        foreach (Form form in Application.OpenForms.Cast<Form>().ToArray())
        {
            if (form.Name == "MainForm" || form.GetType().Name == "MainForm")
            {
                form.Hide();
                form.Close();
            }
        }
        
        this.Show();
        this.WindowState = FormWindowState.Normal;
        this.BringToFront();
        txtUsername.Clear();
        txtPassword.Clear();
        txtUsername.Focus();
        

    }
    
    // Call this when user manually logs out or closes the application
    public void StopSessionMonitoring()
    {
        sessionTimer?.Stop();
        sessionTimer?.Dispose();
        heartbeatTimer?.Stop();
        heartbeatTimer?.Dispose();
        Console.WriteLine("Session monitoring stopped");
    }
    
    // Override form closing to clean up timers
    protected override void OnFormClosing(FormClosingEventArgs e)
    {
        StopSessionMonitoring();
        base.OnFormClosing(e);
    }

    private string GetHardwareId()
    {
        try
        {
            var mc = new ManagementClass("win32_processor");
            var moc = mc.GetInstances();
            string cpuId = "";
            foreach (ManagementObject mo in moc)
            {
                cpuId = mo.Properties["processorID"].Value.ToString();
                break;
            }

            var drive = new ManagementObject(@"win32_logicaldisk.deviceid=""C:""");
            drive.Get();
            string volumeSerial = drive["VolumeSerialNumber"].ToString();

            string combined = cpuId + volumeSerial;
            using (var sha256 = SHA256.Create())
            {
                byte[] hash = sha256.ComputeHash(Encoding.UTF8.GetBytes(combined));
                return Convert.ToBase64String(hash);
            }
        }
        catch
        {
            return Environment.MachineName + Environment.UserName;
        }
    }
}

// Auth API Client Class
public class AuthApiClient
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _baseUrl;

    public AuthApiClient(string apiKey, string baseUrl = "${baseUrl}")
    {
        _httpClient = new HttpClient();
        _apiKey = apiKey;
        _baseUrl = baseUrl;
        _httpClient.DefaultRequestHeaders.Add("X-API-Key", _apiKey);
    }

    public async Task<AuthResponse> LoginAsync(string username, string password, string version = null, string hwid = null)
    {
        var loginData = new
        {
            username,
            password,
            version,
            hwid
        };

        var json = JsonSerializer.Serialize(loginData);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync($"{_baseUrl}/api/v1/login", content);
        var responseJson = await response.Content.ReadAsStringAsync();

        return JsonSerializer.Deserialize<AuthResponse>(responseJson, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
    }

    public async Task<AuthResponse> VerifyAsync(int userId)
    {
        var verifyData = new { user_id = userId };
        var json = JsonSerializer.Serialize(verifyData);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync($"{_baseUrl}/api/v1/verify", content);
        var responseJson = await response.Content.ReadAsStringAsync();

        return JsonSerializer.Deserialize<AuthResponse>(responseJson, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
    }
}

// Updated AuthResponse to match API format exactly
public class AuthResponse
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }
    
    [JsonPropertyName("message")]
    public string Message { get; set; }  // Custom messages from your app settings
    
    [JsonPropertyName("user_id")]
    public int UserId { get; set; }  // No longer nullable - API returns integer
    
    [JsonPropertyName("username")]
    public string Username { get; set; }
    
    [JsonPropertyName("email")]
    public string Email { get; set; }
    
    [JsonPropertyName("expires_at")]
    public DateTime? ExpiresAt { get; set; }
    
    [JsonPropertyName("hwid_locked")]
    public bool? HwidLocked { get; set; }
    
    [JsonPropertyName("required_version")]
    public string RequiredVersion { get; set; }
    
    [JsonPropertyName("current_version")]
    public string CurrentVersion { get; set; }
}

// User Information Class for Main Application
public class UserInfo
{
    public int UserId { get; set; }
    public string Username { get; set; }
    public string Email { get; set; }
    public DateTime LoginTime { get; set; } = DateTime.Now;
}

// Program Entry Point
class Program
{
    [STAThread]
    static void Main()
    {
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);
        Application.Run(new LoginForm());
    }
}

// ========== TESTING DIFFERENT WEBHOOK SCENARIOS ==========

// Test Class for Different Webhook Events
public class WebhookTestHelper
{
    private readonly AuthApiClient _authClient;

    public WebhookTestHelper(string apiKey)
    {
        _authClient = new AuthApiClient(apiKey);
    }

    // Test 1: Invalid Username/Password (Should trigger login_failed webhook)
    public async Task TestInvalidLogin()
    {
        Console.WriteLine("Testing Invalid Login - Should trigger 'login_failed' webhook:");
        var result = await _authClient.LoginAsync("wronguser", "wrongpass", "${selectedApplication?.version || "1.0.0"}", "test-hwid");
        Console.WriteLine($"Result: {result.Success}, Message: {result.Message}");
        Console.WriteLine("Check Discord for login_failed webhook notification\\n");
    }

    // Test 2: Version Mismatch (Should trigger version_mismatch webhook)
    public async Task TestVersionMismatch()
    {
        Console.WriteLine("Testing Version Mismatch - Should trigger 'version_mismatch' webhook:");
        var result = await _authClient.LoginAsync("MOHIT", "correct_password", "0.0.1", "test-hwid");
        Console.WriteLine($"Result: {result.Success}, Message: {result.Message}");
        Console.WriteLine("Check Discord for version_mismatch webhook notification\\n");
    }

    // Test 3: Wrong Password for Existing User (Should trigger login_failed webhook)
    public async Task TestWrongPassword()
    {
        Console.WriteLine("Testing Wrong Password - Should trigger 'login_failed' webhook:");
        var result = await _authClient.LoginAsync("MOHIT", "wrongpassword", "${selectedApplication?.version || "1.0.0"}", "test-hwid");
        Console.WriteLine($"Result: {result.Success}, Message: {result.Message}");
        Console.WriteLine("Check Discord for login_failed webhook notification\\n");
    }

    // Test 4: Run All Tests
    public async Task RunAllWebhookTests()
    {
        Console.WriteLine("=== WEBHOOK TESTING SUITE ===\\n");
        
        await TestInvalidLogin();
        await Task.Delay(2000); // Wait between tests
        
        await TestWrongPassword();
        await Task.Delay(2000);
        
        await TestVersionMismatch();
        await Task.Delay(2000);

        Console.WriteLine("=== All webhook tests completed ===");
        Console.WriteLine("Check your Discord channel for webhook notifications");
    }
}

// Enhanced Login Form with Webhook Testing
public partial class LoginFormWithTesting : LoginForm
{
    private Button btnTestWebhooks;
    private WebhookTestHelper webhookTester;

    public LoginFormWithTesting() : base()
    {
        AddTestingControls();
        webhookTester = new WebhookTestHelper("${apiKey}");
    }

    private void AddTestingControls()
    {
        // Add Test Webhooks Button
        btnTestWebhooks = new Button 
        { 
            Text = "Test All Webhooks", 
            Location = new System.Drawing.Point(250, 130), 
            Size = new System.Drawing.Size(120, 30),
            BackColor = System.Drawing.Color.Orange,
            ForeColor = System.Drawing.Color.White
        };
        btnTestWebhooks.Click += async (s, e) => await TestWebhooksClick();
        this.Controls.Add(btnTestWebhooks);

        // Add instruction label
        var lblInstructions = new Label 
        { 
            Text = "Use 'Test All Webhooks' to trigger different webhook events", 
            Location = new System.Drawing.Point(50, 200), 
            Size = new System.Drawing.Size(300, 40),
            ForeColor = System.Drawing.Color.Blue
        };
        this.Controls.Add(lblInstructions);
    }

    private async Task TestWebhooksClick()
    {
        btnTestWebhooks.Enabled = false;
        btnTestWebhooks.Text = "Testing...";

        try
        {
            // Show console window for testing output
            AllocConsole();
            
            await webhookTester.RunAllWebhookTests();
            
            MessageBox.Show("Webhook testing completed! Check the console output and your Discord channel.", 
                          "Testing Complete", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Error during webhook testing: {ex.Message}", 
                          "Testing Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
        finally
        {
            btnTestWebhooks.Enabled = true;
            btnTestWebhooks.Text = "Test All Webhooks";
        }
    }

    [System.Runtime.InteropServices.DllImport("kernel32.dll")]
    private static extern bool AllocConsole();
}

/*
=== WEBHOOK TESTING INSTRUCTIONS ===

To test all webhook events:

1. COMPILE AND RUN the application
2. Click "Test All Webhooks" button
3. Watch Discord channel for notifications:
   - login_failed (invalid credentials)
   - version_mismatch (wrong version)
   - login_failed (wrong password)

4. To test other events manually:
   - account_disabled: Disable user in dashboard, then try login
   - account_expired: Set expiration date in past, then try login
   - hwid_mismatch: Login with one HWID, then change and login again
   - login_blocked_ip: Add your IP to blacklist, then try login
   - login_blocked_username: Add username to blacklist, then try login
   - login_blocked_hwid: Add HWID to blacklist, then try login

5. SUCCESS webhook (user_login) triggers on valid login

All webhooks should appear in your Discord channel with detailed information.
*/`;

  const pythonExample = `import requests
import json
from datetime import datetime
from typing import Optional, Dict, Any

class AuthApiClient:
    def __init__(self, api_key: str, base_url: str = "${baseUrl}"):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            "X-API-Key": api_key,
            "Content-Type": "application/json"
        }

    def login(self, username: str, password: str, version: Optional[str] = None, hwid: Optional[str] = None) -> Dict[str, Any]:
        """Login a user with username and password"""
        data = {
            "username": username,
            "password": password
        }
        if version:
            data["version"] = version
        if hwid:
            data["hwid"] = hwid

        response = requests.post(
            f"{self.base_url}/api/v1/login",
            headers=self.headers,
            json=data
        )
        return response.json()

    def register(self, username: str, password: str, email: Optional[str] = None, expires_at: Optional[datetime] = None) -> Dict[str, Any]:
        """Register a new user"""
        data = {
            "username": username,
            "password": password
        }
        if email:
            data["email"] = email
        if expires_at:
            data["expiresAt"] = expires_at.isoformat()

        response = requests.post(
            f"{self.base_url}/api/v1/register",
            headers=self.headers,
            json=data
        )
        return response.json()

    def verify(self, user_id: int) -> Dict[str, Any]:
        """Verify a user session"""
        data = {"user_id": user_id}
        response = requests.post(
            f"{self.base_url}/api/v1/verify",
            headers=self.headers,
            json=data
        )
        return response.json()

# Usage Example
if __name__ == "__main__":
    client = AuthApiClient("${apiKey}")
    
    try:
        # Login example
        login_result = client.login("testuser", "password123", "${selectedApplication?.version || "1.0.0"}", "HWID-12345")
        
        if login_result.get("success"):
            # Display custom success message from application settings
            message = login_result.get('message', 'Login successful!')
            print(f"Login successful! User ID: {login_result.get('user_id')}")
            print(f"Welcome Message: {message}")
            
            # Show success message in GUI (if using tkinter)
            # import tkinter.messagebox as msgbox
            # msgbox.showinfo("Login Successful", message)
            
            # Verify user session
            verify_result = client.verify(login_result["user_id"])
            if verify_result.get("success"):
                print("User session verified successfully!")
                # Your application logic here
                # main_window.show()  # Example: Show main application window
        else:
            # Display custom error message from application settings
            error_message = login_result.get('message', 'Login failed')
            print(f"Login failed: {error_message}")
            
            # Show error message in GUI (if using tkinter)
            # import tkinter.messagebox as msgbox
            # msgbox.showerror("Login Failed", error_message)
            
            # Handle different error types based on message content
            if "disabled" in error_message.lower():
                print("Account has been disabled. Please contact support.")
            elif "expired" in error_message.lower():
                print("Account has expired. Please renew your subscription.")
            elif "version" in error_message.lower():
                print("Version mismatch. Please update your application.")
            elif "hwid" in error_message.lower():
                print("Hardware ID mismatch. Please contact support to reset your HWID.")
    
    except Exception as e:
        print(f"Error: {e}")`;

  const nodejsExample = `const axios = require('axios');

class AuthApiClient {
    constructor(apiKey, baseUrl = '${baseUrl}') {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.headers = {
            'X-API-Key': apiKey,
            'Content-Type': 'application/json'
        };
    }

    async login(username, password, version = null, hwid = null) {
        const data = { username, password };
        if (version) data.version = version;
        if (hwid) data.hwid = hwid;

        try {
            const response = await axios.post(\`\${this.baseUrl}/api/v1/login\`, data, {
                headers: this.headers
            });
            return response.data;
        } catch (error) {
            return error.response?.data || { success: false, message: 'Network error' };
        }
    }

    async register(username, password, email = null, expiresAt = null) {
        const data = { username, password };
        if (email) data.email = email;
        if (expiresAt) data.expiresAt = expiresAt;

        try {
            const response = await axios.post(\`\${this.baseUrl}/api/v1/register\`, data, {
                headers: this.headers
            });
            return response.data;
        } catch (error) {
            return error.response?.data || { success: false, message: 'Network error' };
        }
    }

    async verify(userId) {
        const data = { user_id: userId };

        try {
            const response = await axios.post(\`\${this.baseUrl}/api/v1/verify\`, data, {
                headers: this.headers
            });
            return response.data;
        } catch (error) {
            return error.response?.data || { success: false, message: 'Network error' };
        }
    }
}

// Usage Example
(async () => {
    const client = new AuthApiClient('${apiKey}');
    
    try {
        // Login example
        const loginResult = await client.login('testuser', 'password123', '${selectedApplication?.version || "1.0.0"}', 'HWID-12345');
        
        if (loginResult.success) {
            // Display custom success message from application settings
            const message = loginResult.message || 'Login successful!';
            console.log(\`Login successful! User ID: \${loginResult.user_id}\`);
            console.log(\`Welcome Message: \${message}\`);
            
            // Show success notification (if using Electron or web)
            // new Notification('Login Successful', { body: message });
            // Or display in UI: document.getElementById('status').textContent = message;
            
            // Verify user session
            const verifyResult = await client.verify(loginResult.user_id);
            if (verifyResult.success) {
                console.log('User session verified successfully!');
                // Your application logic here
                // showMainInterface(); // Example: Show main application interface
            }
        } else {
            // Display custom error message from application settings
            const errorMessage = loginResult.message || 'Login failed';
            console.log(\`Login failed: \${errorMessage}\`);
            
            // Show error notification (if using Electron or web)
            // new Notification('Login Failed', { body: errorMessage });
            // Or display in UI: document.getElementById('error').textContent = errorMessage;
            
            // Handle different error types based on message content
            if (errorMessage.toLowerCase().includes('disabled')) {
                console.log('Account has been disabled. Please contact support.');
            } else if (errorMessage.toLowerCase().includes('expired')) {
                console.log('Account has expired. Please renew your subscription.');
            } else if (errorMessage.toLowerCase().includes('version')) {
                console.log('Version mismatch. Please update your application.');
            } else if (errorMessage.toLowerCase().includes('hwid')) {
                console.log('Hardware ID mismatch. Please contact support to reset your HWID.');
            }
        }
    } catch (error) {
        console.error(\`Error: \${error.message}\`);
    }
})();`;

  const curlExample = `# Login
curl -X POST "${baseUrl}/api/v1/login" \\
  -H "X-API-Key: ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": "testuser",
    "password": "password123",
    "version": "${selectedApplication?.version || "1.0.0"}",
    "hwid": "HWID-12345"
  }'

# Register
curl -X POST "${baseUrl}/api/v1/register" \\
  -H "X-API-Key: ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": "newuser",
    "password": "newpassword123",
    "email": "user@example.com"
  }'

# Verify
curl -X POST "${baseUrl}/api/v1/verify" \\
  -H "X-API-Key: ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "user_id": 1
  }'`;

  const cppExample = `#include <iostream>
#include <string>
#include <curl/curl.h>
#include <json/json.h>
#include <windows.h>
#include <intrin.h>
#include <sstream>
#include <iomanip>

// Custom Message Display Class
class MessageDisplay {
public:
    static void ShowSuccess(const std::string& message, const std::string& title = "Login Successful") {
        MessageBoxA(NULL, message.c_str(), title.c_str(), MB_OK | MB_ICONINFORMATION);
    }
    
    static void ShowError(const std::string& message, const std::string& title = "Login Failed") {
        MessageBoxA(NULL, message.c_str(), title.c_str(), MB_OK | MB_ICONERROR);
    }
    
    static void ShowWarning(const std::string& message, const std::string& title = "Warning") {
        MessageBoxA(NULL, message.c_str(), title.c_str(), MB_OK | MB_ICONWARNING);
    }
};

// HTTP Response Structure
struct WriteMemoryStruct {
    char* memory;
    size_t size;
};

static size_t WriteMemoryCallback(void* contents, size_t size, size_t nmemb, struct WriteMemoryStruct* userp) {
    size_t realsize = size * nmemb;
    char* ptr = (char*)realloc(userp->memory, userp->size + realsize + 1);
    if (!ptr) {
        printf("Not enough memory (realloc returned NULL)\\n");
        return 0;
    }
    userp->memory = ptr;
    memcpy(&(userp->memory[userp->size]), contents, realsize);
    userp->size += realsize;
    userp->memory[userp->size] = 0;
    return realsize;
}

// Authentication API Client Class
class AuthApiClient {
private:
    std::string apiKey;
    std::string baseUrl;
    CURL* curl;

public:
    AuthApiClient(const std::string& key, const std::string& url = "${baseUrl}") 
        : apiKey(key), baseUrl(url) {
        curl_global_init(CURL_GLOBAL_DEFAULT);
        curl = curl_easy_init();
    }

    ~AuthApiClient() {
        if (curl) {
            curl_easy_cleanup(curl);
        }
        curl_global_cleanup();
    }

    // Generate Hardware ID for HWID locking
    std::string GetHardwareId() {
        try {
            // Get CPU ID
            int cpuInfo[4] = { 0 };
            __cpuid(cpuInfo, 1);
            
            std::stringstream ss;
            ss << std::hex << cpuInfo[0] << cpuInfo[1] << cpuInfo[2] << cpuInfo[3];
            
            // Get Volume Serial Number
            DWORD volumeSerial;
            GetVolumeInformationA("C:\\\\", NULL, 0, &volumeSerial, NULL, NULL, NULL, 0);
            ss << std::hex << volumeSerial;
            
            return ss.str();
        }
        catch (...) {
            return "DEFAULT_HWID";
        }
    }

    // Login Method with Complete Message Handling
    Json::Value Login(const std::string& username, const std::string& password, 
                     const std::string& version = "${selectedApplication?.version || "1.0.0"}", 
                     const std::string& hwid = "") {
        Json::Value response;
        
        if (!curl) {
            response["success"] = false;
            response["message"] = "Failed to initialize HTTP client";
            return response;
        }

        // Prepare JSON data
        Json::Value jsonData;
        jsonData["username"] = username;
        jsonData["password"] = password;
        jsonData["version"] = version;
        jsonData["hwid"] = hwid.empty() ? GetHardwareId() : hwid;

        Json::StreamWriterBuilder builder;
        std::string jsonString = Json::writeString(builder, jsonData);

        // Setup headers
        struct curl_slist* headers = NULL;
        std::string authHeader = "X-API-Key: " + apiKey;
        headers = curl_slist_append(headers, "Content-Type: application/json");
        headers = curl_slist_append(headers, authHeader.c_str());

        // Setup response memory
        struct WriteMemoryStruct chunk;
        chunk.memory = (char*)malloc(1);
        chunk.size = 0;

        // Configure CURL
        curl_easy_setopt(curl, CURLOPT_URL, (baseUrl + "/api/v1/login").c_str());
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, jsonString.c_str());
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteMemoryCallback);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, (void*)&chunk);

        // Execute request
        CURLcode res = curl_easy_perform(curl);
        
        if (res != CURLE_OK) {
            response["success"] = false;
            response["message"] = "Network connection failed";
        } else {
            // Parse response
            Json::CharReaderBuilder readerBuilder;
            Json::CharReader* reader = readerBuilder.newCharReader();
            std::string errs;
            
            if (reader->parse(chunk.memory, chunk.memory + chunk.size, &response, &errs)) {
                // Handle custom messages from application settings
                HandleLoginResponse(response);
            } else {
                response["success"] = false;
                response["message"] = "Failed to parse server response";
            }
            delete reader;
        }

        // Cleanup
        curl_slist_free_all(headers);
        if (chunk.memory) {
            free(chunk.memory);
        }

        return response;
    }

    // Handle Login Response with Custom Messages
    void HandleLoginResponse(const Json::Value& response) {
        bool success = response.get("success", false).asBool();
        std::string message = response.get("message", "Unknown response").asString();

        if (success) {
            // Display custom success message from application settings
            MessageDisplay::ShowSuccess(message, "Authentication Successful");
            
            std::cout << "Login successful!" << std::endl;
            std::cout << "User ID: " << response.get("user_id", 0).asInt() << std::endl;
            std::cout << "Welcome Message: " << message << std::endl;
            
            // Verify user session
            int userId = response.get("user_id", 0).asInt();
            if (userId > 0) {
                Json::Value verifyResult = Verify(userId);
                if (verifyResult.get("success", false).asBool()) {
                    std::cout << "User session verified successfully!" << std::endl;
                    // Your application logic here
                    // ShowMainWindow(); // Example: Show main application window
                }
            }
        } else {
            // Display custom error message from application settings
            MessageDisplay::ShowError(message, "Authentication Failed");
            
            std::cout << "Login failed: " << message << std::endl;
            
            // Handle different error types based on custom messages
            std::string lowerMessage = message;
            std::transform(lowerMessage.begin(), lowerMessage.end(), lowerMessage.begin(), ::tolower);
            
            if (lowerMessage.find("disabled") != std::string::npos) {
                MessageDisplay::ShowWarning("Your account has been disabled. Please contact support.", "Account Disabled");
                exit(1);
            } else if (lowerMessage.find("expired") != std::string::npos) {
                MessageDisplay::ShowWarning("Your subscription has expired. Please renew to continue.", "Subscription Expired");
                ShellExecuteA(NULL, "open", "https://yourwebsite.com/renew", NULL, NULL, SW_SHOWNORMAL);
            } else if (lowerMessage.find("version") != std::string::npos) {
                MessageDisplay::ShowWarning("Your application version is outdated. Please download the latest version.", "Version Mismatch");
                ShellExecuteA(NULL, "open", "https://yourwebsite.com/download", NULL, NULL, SW_SHOWNORMAL);
                exit(1);
            } else if (lowerMessage.find("hwid") != std::string::npos || lowerMessage.find("hardware") != std::string::npos) {
                MessageDisplay::ShowWarning("Hardware ID mismatch detected. Please contact support to reset your device binding.", "Device Mismatch");
            }
        }
    }

    // Verify Method
    Json::Value Verify(int userId) {
        Json::Value response;
        
        if (!curl) {
            response["success"] = false;
            response["message"] = "Failed to initialize HTTP client";
            return response;
        }

        Json::Value jsonData;
        jsonData["user_id"] = userId;

        Json::StreamWriterBuilder builder;
        std::string jsonString = Json::writeString(builder, jsonData);

        struct curl_slist* headers = NULL;
        std::string authHeader = "X-API-Key: " + apiKey;
        headers = curl_slist_append(headers, "Content-Type: application/json");
        headers = curl_slist_append(headers, authHeader.c_str());

        struct WriteMemoryStruct chunk;
        chunk.memory = (char*)malloc(1);
        chunk.size = 0;

        curl_easy_setopt(curl, CURLOPT_URL, (baseUrl + "/api/v1/verify").c_str());
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, jsonString.c_str());
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteMemoryCallback);
        curl_easy_setopt(curl, CURLOPT_WRITEDATA, (void*)&chunk);

        CURLcode res = curl_easy_perform(curl);
        
        if (res != CURLE_OK) {
            response["success"] = false;
            response["message"] = "Network connection failed";
        } else {
            Json::CharReaderBuilder readerBuilder;
            Json::CharReader* reader = readerBuilder.newCharReader();
            std::string errs;
            reader->parse(chunk.memory, chunk.memory + chunk.size, &response, &errs);
            delete reader;
        }

        curl_slist_free_all(headers);
        if (chunk.memory) {
            free(chunk.memory);
        }

        return response;
    }
};

// Main Application Window Class
class LoginWindow {
private:
    HWND hwnd;
    HWND usernameEdit;
    HWND passwordEdit;
    HWND loginButton;
    HWND statusLabel;
    AuthApiClient* authClient;

public:
    LoginWindow() {
        authClient = new AuthApiClient("${apiKey}");
    }

    ~LoginWindow() {
        delete authClient;
    }

    // Create Login Window
    bool CreateLoginWindow(HINSTANCE hInstance) {
        const char* className = "AuthLoginWindow";
        
        WNDCLASS wc = {};
        wc.lpfnWndProc = WindowProc;
        wc.hInstance = hInstance;
        wc.lpszClassName = className;
        wc.hbrBackground = (HBRUSH)(COLOR_WINDOW + 1);
        wc.hCursor = LoadCursor(NULL, IDC_ARROW);

        RegisterClass(&wc);

        hwnd = CreateWindowEx(
            0, className, "Application Login",
            WS_OVERLAPPEDWINDOW & ~WS_MAXIMIZEBOX & ~WS_THICKFRAME,
            CW_USEDEFAULT, CW_USEDEFAULT, 400, 300,
            NULL, NULL, hInstance, this
        );

        if (hwnd == NULL) return false;

        ShowWindow(hwnd, SW_SHOW);
        UpdateWindow(hwnd);
        return true;
    }

    // Window Message Handler
    static LRESULT CALLBACK WindowProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam) {
        LoginWindow* window = NULL;
        
        if (uMsg == WM_NCCREATE) {
            CREATESTRUCT* pCreate = (CREATESTRUCT*)lParam;
            window = (LoginWindow*)pCreate->lpCreateParams;
            SetWindowLongPtr(hwnd, GWLP_USERDATA, (LONG_PTR)window);
        } else {
            window = (LoginWindow*)GetWindowLongPtr(hwnd, GWLP_USERDATA);
        }

        if (window) {
            return window->HandleMessage(hwnd, uMsg, wParam, lParam);
        }
        
        return DefWindowProc(hwnd, uMsg, wParam, lParam);
    }

    // Handle Window Messages
    LRESULT HandleMessage(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam) {
        switch (uMsg) {
        case WM_CREATE:
            CreateControls(hwnd);
            return 0;

        case WM_COMMAND:
            if (LOWORD(wParam) == 1001) { // Login button clicked
                OnLoginButtonClick();
            }
            return 0;

        case WM_DESTROY:
            PostQuitMessage(0);
            return 0;
        }
        
        return DefWindowProc(hwnd, uMsg, wParam, lParam);
    }

    // Create UI Controls
    void CreateControls(HWND parent) {
        // Username
        CreateWindow("STATIC", "Username:", WS_VISIBLE | WS_CHILD,
                    50, 50, 80, 20, parent, NULL, NULL, NULL);
        usernameEdit = CreateWindow("EDIT", "", WS_VISIBLE | WS_CHILD | WS_BORDER,
                                   140, 50, 200, 25, parent, NULL, NULL, NULL);

        // Password
        CreateWindow("STATIC", "Password:", WS_VISIBLE | WS_CHILD,
                    50, 90, 80, 20, parent, NULL, NULL, NULL);
        passwordEdit = CreateWindow("EDIT", "", WS_VISIBLE | WS_CHILD | WS_BORDER | ES_PASSWORD,
                                   140, 90, 200, 25, parent, NULL, NULL, NULL);

        // Login Button
        loginButton = CreateWindow("BUTTON", "Login", WS_VISIBLE | WS_CHILD | BS_PUSHBUTTON,
                                  140, 130, 100, 30, parent, (HMENU)1001, NULL, NULL);

        // Status Label
        statusLabel = CreateWindow("STATIC", "", WS_VISIBLE | WS_CHILD,
                                  50, 180, 300, 60, parent, NULL, NULL, NULL);
    }

    // Login Button Click Handler
    void OnLoginButtonClick() {
        char username[256] = {0};
        char password[256] = {0};
        
        GetWindowTextA(usernameEdit, username, sizeof(username));
        GetWindowTextA(passwordEdit, password, sizeof(password));

        if (strlen(username) == 0 || strlen(password) == 0) {
            MessageDisplay::ShowError("Please enter both username and password.");
            return;
        }

        SetWindowTextA(statusLabel, "Authenticating...");
        EnableWindow(loginButton, FALSE);

        // Perform login with message handling
        Json::Value result = authClient->Login(username, password);
        
        EnableWindow(loginButton, TRUE);
        
        if (result.get("success", false).asBool()) {
            SetWindowTextA(statusLabel, "Login successful!");
            // Hide login window and show main application
            ShowWindow(hwnd, SW_HIDE);
            // ShowMainApplication(); // Your main app logic
        } else {
            std::string errorMsg = result.get("message", "Login failed").asString();
            SetWindowTextA(statusLabel, errorMsg.c_str());
        }
    }
};

// Application Entry Point
int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow) {
    LoginWindow loginWindow;
    
    if (!loginWindow.CreateLoginWindow(hInstance)) {
        MessageBox(NULL, "Failed to create login window", "Error", MB_OK | MB_ICONERROR);
        return 1;
    }

    MSG msg = {};
    while (GetMessage(&msg, NULL, 0, 0)) {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }

    return 0;
}

// Compilation Instructions:
// g++ -o auth_app main.cpp -lcurl -ljsoncpp -luser32 -lshell32 -lole32
// Required libraries: libcurl, jsoncpp
// Link with: user32.lib shell32.lib ole32.lib (Windows)`;

  const javaExample = `import java.io.*;
import java.net.http.*;
import java.net.URI;
import java.security.MessageDigest;
import java.util.Properties;
import javax.swing.*;
import javax.swing.border.EmptyBorder;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import com.google.gson.*;

// Custom Message Display Class
class MessageDisplay {
    public static void showSuccess(String message, String title) {
        JOptionPane.showMessageDialog(null, message, title, JOptionPane.INFORMATION_MESSAGE);
    }
    
    public static void showError(String message, String title) {
        JOptionPane.showMessageDialog(null, message, title, JOptionPane.ERROR_MESSAGE);
    }
    
    public static void showWarning(String message, String title) {
        JOptionPane.showMessageDialog(null, message, title, JOptionPane.WARNING_MESSAGE);
    }
}

// Authentication Response Class
class AuthResponse {
    private boolean success;
    private String message;
    private Integer userId;
    private String username;
    private String email;
    private String expiresAt;
    private Boolean hwidLocked;
    private String requiredVersion;
    private String currentVersion;

    // Getters and setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    // ... other getters and setters
}

// Hardware ID Generator
class HardwareIdGenerator {
    public static String getHardwareId() {
        try {
            // Get system properties
            String os = System.getProperty("os.name");
            String arch = System.getProperty("os.arch");
            String user = System.getProperty("user.name");
            String javaVersion = System.getProperty("java.version");
            
            // Combine properties
            String combined = os + arch + user + javaVersion;
            
            // Generate hash
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(combined.getBytes("UTF-8"));
            
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            
            return hexString.toString().substring(0, 32); // First 32 characters
        } catch (Exception e) {
            return "DEFAULT_HWID_" + System.currentTimeMillis();
        }
    }
}

// Authentication API Client
class AuthApiClient {
    private final String apiKey;
    private final String baseUrl;
    private final HttpClient httpClient;
    private final Gson gson;

    public AuthApiClient(String apiKey, String baseUrl) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl != null ? baseUrl : "${baseUrl}";
        this.httpClient = HttpClient.newHttpClient();
        this.gson = new Gson();
    }

    public AuthResponse login(String username, String password, String version, String hwid) {
        try {
            // Prepare request data
            JsonObject jsonData = new JsonObject();
            jsonData.addProperty("username", username);
            jsonData.addProperty("password", password);
            jsonData.addProperty("version", version != null ? version : "${selectedApplication?.version || "1.0.0"}");
            jsonData.addProperty("hwid", hwid != null ? hwid : HardwareIdGenerator.getHardwareId());

            String jsonString = gson.toJson(jsonData);

            // Build HTTP request
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/api/v1/login"))
                .header("Content-Type", "application/json")
                .header("X-API-Key", apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(jsonString))
                .build();

            // Send request
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            
            // Parse response
            AuthResponse authResponse = gson.fromJson(response.body(), AuthResponse.class);
            
            // Handle custom messages from application settings
            handleLoginResponse(authResponse);
            
            return authResponse;
            
        } catch (Exception e) {
            AuthResponse errorResponse = new AuthResponse();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Network connection failed: " + e.getMessage());
            return errorResponse;
        }
    }

    public AuthResponse verify(int userId) {
        try {
            JsonObject jsonData = new JsonObject();
            jsonData.addProperty("user_id", userId);
            String jsonString = gson.toJson(jsonData);

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/api/v1/verify"))
                .header("Content-Type", "application/json")
                .header("X-API-Key", apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(jsonString))
                .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            return gson.fromJson(response.body(), AuthResponse.class);
            
        } catch (Exception e) {
            AuthResponse errorResponse = new AuthResponse();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Network connection failed: " + e.getMessage());
            return errorResponse;
        }
    }

    private void handleLoginResponse(AuthResponse response) {
        if (response.isSuccess()) {
            // Display custom success message from application settings
            MessageDisplay.showSuccess(response.getMessage(), "Authentication Successful");
            
            System.out.println("Login successful!");
            System.out.println("User ID: " + response.getUserId());
            System.out.println("Welcome Message: " + response.getMessage());
            
            // Verify user session
            if (response.getUserId() != null) {
                AuthResponse verifyResult = verify(response.getUserId());
                if (verifyResult.isSuccess()) {
                    System.out.println("User session verified successfully!");
                    // Your application logic here
                    // showMainWindow(); // Example: Show main application window
                }
            }
        } else {
            // Display custom error message from application settings
            MessageDisplay.showError(response.getMessage(), "Authentication Failed");
            
            System.out.println("Login failed: " + response.getMessage());
            
            // Handle different error types based on custom messages
            String message = response.getMessage().toLowerCase();
            
            if (message.contains("disabled")) {
                MessageDisplay.showWarning("Your account has been disabled. Please contact support.", "Account Disabled");
                System.exit(1);
            } else if (message.contains("expired")) {
                MessageDisplay.showWarning("Your subscription has expired. Please renew to continue.", "Subscription Expired");
                try {
                    Desktop.getDesktop().browse(URI.create("https://yourwebsite.com/renew"));
                } catch (Exception e) { /* ignore */ }
            } else if (message.contains("version")) {
                MessageDisplay.showWarning("Your application version is outdated. Please download the latest version.", "Version Mismatch");
                try {
                    Desktop.getDesktop().browse(URI.create("https://yourwebsite.com/download"));
                } catch (Exception e) { /* ignore */ }
                System.exit(1);
            } else if (message.contains("hwid") || message.contains("hardware")) {
                MessageDisplay.showWarning("Hardware ID mismatch detected. Please contact support to reset your device binding.", "Device Mismatch");
            }
        }
    }
}

// Login Window GUI Class
class LoginWindow extends JFrame {
    private JTextField usernameField;
    private JPasswordField passwordField;
    private JButton loginButton;
    private JLabel statusLabel;
    private AuthApiClient authClient;

    public LoginWindow() {
        authClient = new AuthApiClient("${apiKey}", "${baseUrl}");
        initializeComponents();
    }

    private void initializeComponents() {
        setTitle("Application Login");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(400, 300);
        setLocationRelativeTo(null);
        setResizable(false);

        // Create main panel
        JPanel mainPanel = new JPanel(new GridBagLayout());
        mainPanel.setBorder(new EmptyBorder(20, 20, 20, 20));
        GridBagConstraints gbc = new GridBagConstraints();

        // Username
        gbc.gridx = 0; gbc.gridy = 0;
        gbc.anchor = GridBagConstraints.WEST;
        gbc.insets = new Insets(5, 5, 5, 5);
        mainPanel.add(new JLabel("Username:"), gbc);

        gbc.gridx = 1; gbc.fill = GridBagConstraints.HORIZONTAL;
        gbc.weightx = 1.0;
        usernameField = new JTextField(20);
        mainPanel.add(usernameField, gbc);

        // Password
        gbc.gridx = 0; gbc.gridy = 1;
        gbc.fill = GridBagConstraints.NONE;
        gbc.weightx = 0;
        mainPanel.add(new JLabel("Password:"), gbc);

        gbc.gridx = 1; gbc.fill = GridBagConstraints.HORIZONTAL;
        gbc.weightx = 1.0;
        passwordField = new JPasswordField(20);
        mainPanel.add(passwordField, gbc);

        // Login Button
        gbc.gridx = 0; gbc.gridy = 2;
        gbc.gridwidth = 2;
        gbc.fill = GridBagConstraints.NONE;
        gbc.weightx = 0;
        gbc.anchor = GridBagConstraints.CENTER;
        gbc.insets = new Insets(20, 5, 5, 5);
        loginButton = new JButton("Login");
        loginButton.setPreferredSize(new Dimension(100, 30));
        loginButton.addActionListener(new LoginActionListener());
        mainPanel.add(loginButton, gbc);

        // Status Label
        gbc.gridy = 3;
        gbc.insets = new Insets(10, 5, 5, 5);
        statusLabel = new JLabel(" ");
        statusLabel.setHorizontalAlignment(SwingConstants.CENTER);
        statusLabel.setForeground(Color.RED);
        mainPanel.add(statusLabel, gbc);

        add(mainPanel);

        // Enter key support
        getRootPane().setDefaultButton(loginButton);
    }

    private class LoginActionListener implements ActionListener {
        @Override
        public void actionPerformed(ActionEvent e) {
            String username = usernameField.getText().trim();
            String password = new String(passwordField.getPassword());

            if (username.isEmpty() || password.isEmpty()) {
                MessageDisplay.showError("Please enter both username and password.", "Input Required");
                return;
            }

            // Disable UI during authentication
            loginButton.setEnabled(false);
            statusLabel.setText("Authenticating...");
            statusLabel.setForeground(Color.BLUE);

            // Perform authentication in background thread
            SwingWorker<AuthResponse, Void> worker = new SwingWorker<AuthResponse, Void>() {
                @Override
                protected AuthResponse doInBackground() throws Exception {
                    return authClient.login(username, password, "${selectedApplication?.version || "1.0.0"}", null);
                }

                @Override
                protected void done() {
                    try {
                        AuthResponse result = get();
                        
                        if (result.isSuccess()) {
                            statusLabel.setText("Login successful!");
                            statusLabel.setForeground(Color.GREEN);
                            
                            // Hide login window and show main application
                            setVisible(false);
                            // showMainApplication(); // Your main app logic here
                            
                        } else {
                            statusLabel.setText(result.getMessage());
                            statusLabel.setForeground(Color.RED);
                        }
                        
                    } catch (Exception ex) {
                        statusLabel.setText("Authentication failed: " + ex.getMessage());
                        statusLabel.setForeground(Color.RED);
                    } finally {
                        loginButton.setEnabled(true);
                    }
                }
            };
            
            worker.execute();
        }
    }
}

// Main Application Class
public class AuthApplication {
    public static void main(String[] args) {
        // Set look and feel
        try {
            UIManager.setLookAndFeel(UIManager.getSystemLookAndFeel());
        } catch (Exception e) {
            // Use default look and feel
        }

        // Create and show login window
        SwingUtilities.invokeLater(() -> {
            new LoginWindow().setVisible(true);
        });
    }
}

// Required dependencies (Maven):
/*
<dependencies>
    <dependency>
        <groupId>com.google.code.gson</groupId>
        <artifactId>gson</artifactId>
        <version>2.10.1</version>
    </dependency>
</dependencies>
*/`;

  const phpExample = `<?php
// Custom Message Display Class
class MessageDisplay {
    public static function showSuccess($message, $title = "Login Successful") {
        // For web applications - show alert
        echo "<script>alert('$title: $message');</script>";
        
        // For CLI applications - print colored output
        if (php_sapi_name() === 'cli') {
            echo "\\033[32m[$title] $message\\033[0m\\n";
        }
    }
    
    public static function showError($message, $title = "Login Failed") {
        // For web applications - show alert
        echo "<script>alert('$title: $message');</script>";
        
        // For CLI applications - print colored output
        if (php_sapi_name() === 'cli') {
            echo "\\033[31m[$title] $message\\033[0m\\n";
        }
    }
    
    public static function showWarning($message, $title = "Warning") {
        // For web applications - show alert
        echo "<script>alert('$title: $message');</script>";
        
        // For CLI applications - print colored output
        if (php_sapi_name() === 'cli') {
            echo "\\033[33m[$title] $message\\033[0m\\n";
        }
    }
}

// Hardware ID Generator Class
class HardwareIdGenerator {
    public static function getHardwareId() {
        try {
            // Get system information
            $os = php_uname('s');
            $hostname = gethostname();
            $php_version = phpversion();
            $server_addr = $_SERVER['SERVER_ADDR'] ?? 'unknown';
            
            // Combine system properties
            $combined = $os . $hostname . $php_version . $server_addr;
            
            // Generate hash
            return substr(hash('sha256', $combined), 0, 32);
        } catch (Exception $e) {
            return 'DEFAULT_HWID_' . time();
        }
    }
}

// Authentication API Client Class
class AuthApiClient {
    private $apiKey;
    private $baseUrl;
    
    public function __construct($apiKey, $baseUrl = '${baseUrl}') {
        $this->apiKey = $apiKey;
        $this->baseUrl = $baseUrl;
    }
    
    // Login Method with Complete Message Handling
    public function login($username, $password, $version = '${selectedApplication?.version || "1.0.0"}', $hwid = null) {
        try {
            // Prepare request data
            $data = [
                'username' => $username,
                'password' => $password,
                'version' => $version,
                'hwid' => $hwid ?: HardwareIdGenerator::getHardwareId()
            ];
            
            $jsonData = json_encode($data);
            
            // Setup cURL
            $ch = curl_init();
            curl_setopt_array($ch, [
                CURLOPT_URL => $this->baseUrl . '/api/v1/login',
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => $jsonData,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPHEADER => [
                    'Content-Type: application/json',
                    'X-API-Key: ' . $this->apiKey
                ],
                CURLOPT_TIMEOUT => 30,
                CURLOPT_SSL_VERIFYPEER => true
            ]);
            
            // Execute request
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
            curl_close($ch);
            
            if ($error) {
                return [
                    'success' => false,
                    'message' => 'Network connection failed: ' . $error
                ];
            }
            
            if ($httpCode !== 200) {
                return [
                    'success' => false,
                    'message' => 'HTTP Error: ' . $httpCode
                ];
            }
            
            // Parse response
            $result = json_decode($response, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                return [
                    'success' => false,
                    'message' => 'Failed to parse server response'
                ];
            }
            
            // Handle custom messages from application settings
            $this->handleLoginResponse($result);
            
            return $result;
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Authentication error: ' . $e->getMessage()
            ];
        }
    }
    
    // Verify Method
    public function verify($userId) {
        try {
            $data = ['user_id' => $userId];
            $jsonData = json_encode($data);
            
            $ch = curl_init();
            curl_setopt_array($ch, [
                CURLOPT_URL => $this->baseUrl . '/api/v1/verify',
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => $jsonData,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPHEADER => [
                    'Content-Type: application/json',
                    'X-API-Key: ' . $this->apiKey
                ],
                CURLOPT_TIMEOUT => 30
            ]);
            
            $response = curl_exec($ch);
            $error = curl_error($ch);
            curl_close($ch);
            
            if ($error) {
                return [
                    'success' => false,
                    'message' => 'Network connection failed: ' . $error
                ];
            }
            
            return json_decode($response, true);
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Verification error: ' . $e->getMessage()
            ];
        }
    }
    
    // Handle Login Response with Custom Messages
    private function handleLoginResponse($response) {
        $success = $response['success'] ?? false;
        $message = $response['message'] ?? 'Unknown response';
        
        if ($success) {
            // Display custom success message from application settings
            MessageDisplay::showSuccess($message, "Authentication Successful");
            
            echo "Login successful!\\n";
            echo "User ID: " . ($response['user_id'] ?? 'N/A') . "\\n";
            echo "Welcome Message: " . $message . "\\n";
            
            // Verify user session
            $userId = $response['user_id'] ?? null;
            if ($userId) {
                $verifyResult = $this->verify($userId);
                if ($verifyResult['success'] ?? false) {
                    echo "User session verified successfully!\\n";
                    // Your application logic here
                    // $this->showMainInterface(); // Example: Show main application interface
                }
            }
        } else {
            // Display custom error message from application settings
            MessageDisplay::showError($message, "Authentication Failed");
            
            echo "Login failed: " . $message . "\\n";
            
            // Handle different error types based on custom messages
            $lowerMessage = strtolower($message);
            
            if (strpos($lowerMessage, 'disabled') !== false) {
                MessageDisplay::showWarning("Your account has been disabled. Please contact support.", "Account Disabled");
                exit(1);
            } elseif (strpos($lowerMessage, 'expired') !== false) {
                MessageDisplay::showWarning("Your subscription has expired. Please renew to continue.", "Subscription Expired");
                // Redirect to renewal page
                if (!headers_sent()) {
                    header('Location: https://yourwebsite.com/renew');
                    exit();
                }
            } elseif (strpos($lowerMessage, 'version') !== false) {
                MessageDisplay::showWarning("Your application version is outdated. Please download the latest version.", "Version Mismatch");
                // Redirect to download page
                if (!headers_sent()) {
                    header('Location: https://yourwebsite.com/download');
                    exit();
                }
            } elseif (strpos($lowerMessage, 'hwid') !== false || strpos($lowerMessage, 'hardware') !== false) {
                MessageDisplay::showWarning("Hardware ID mismatch detected. Please contact support to reset your device binding.", "Device Mismatch");
            }
        }
    }
}

// Login Form Class (Web Application)
class LoginForm {
    private $authClient;
    
    public function __construct($apiKey) {
        $this->authClient = new AuthApiClient($apiKey);
    }
    
    // Display Login Form
    public function displayForm() {
        ?>
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Application Login</title>
            <style>
                body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
                .login-container { max-width: 400px; margin: 50px auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .form-group { margin-bottom: 20px; }
                label { display: block; margin-bottom: 5px; font-weight: bold; }
                input[type="text"], input[type="password"] { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; }
                .login-btn { width: 100%; padding: 12px; background: #007cba; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; }
                .login-btn:hover { background: #005a87; }
                .login-btn:disabled { background: #ccc; cursor: not-allowed; }
                .status { margin-top: 15px; padding: 10px; border-radius: 4px; text-align: center; }
                .status.success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
                .status.error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
                .status.info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
            </style>
        </head>
        <body>
            <div class="login-container">
                <h2>Application Login</h2>
                <form method="POST" action="">
                    <div class="form-group">
                        <label for="username">Username:</label>
                        <input type="text" id="username" name="username" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password:</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <div class="form-group">
                        <button type="submit" name="login" class="login-btn">Login</button>
                    </div>
                </form>
                
                <?php $this->handleLoginSubmit(); ?>
            </div>
        </body>
        </html>
        <?php
    }
    
    // Handle Login Form Submission
    private function handleLoginSubmit() {
        if (isset($_POST['login'])) {
            $username = $_POST['username'] ?? '';
            $password = $_POST['password'] ?? '';
            
            if (empty($username) || empty($password)) {
                echo '<div class="status error">Please enter both username and password.</div>';
                return;
            }
            
            echo '<div class="status info">Authenticating...</div>';
            
            // Perform authentication
            $result = $this->authClient->login($username, $password);
            
            if ($result['success']) {
                echo '<div class="status success">' . htmlspecialchars($result['message']) . '</div>';
                echo '<script>setTimeout(function() { window.location.href = "dashboard.php"; }, 2000);</script>';
            } else {
                echo '<div class="status error">' . htmlspecialchars($result['message']) . '</div>';
            }
        }
    }
}

// CLI Application Example
class CliApplication {
    private $authClient;
    
    public function __construct($apiKey) {
        $this->authClient = new AuthApiClient($apiKey);
    }
    
    public function run() {
        echo "=== Application Authentication ===\\n\\n";
        
        // Get username
        echo "Username: ";
        $username = trim(fgets(STDIN));
        
        // Get password (hide input)
        echo "Password: ";
        $password = $this->getHiddenInput();
        
        echo "\\nAuthenticating...\\n";
        
        // Perform authentication
        $result = $this->authClient->login($username, $password);
        
        if ($result['success']) {
            echo "\\n=== Authentication Successful ===\\n";
            echo "Welcome to the application!\\n";
            // Continue with main application logic
        } else {
            echo "\\n=== Authentication Failed ===\\n";
            echo "Please try again.\\n";
            exit(1);
        }
    }
    
    private function getHiddenInput() {
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            // Windows
            $exe = __DIR__ . '/hiddeninput.exe';
            if (file_exists($exe)) {
                return rtrim(shell_exec($exe));
            }
            return trim(fgets(STDIN)); // Fallback
        } else {
            // Unix/Linux/Mac
            system('stty -echo');
            $password = trim(fgets(STDIN));
            system('stty echo');
            return $password;
        }
    }
}

// Usage Examples:

// For Web Application:
// $loginForm = new LoginForm('${apiKey}');
// $loginForm->displayForm();

// For CLI Application:
// $cliApp = new CliApplication('${apiKey}');
// $cliApp->run();

// For Direct API Usage:
// $authClient = new AuthApiClient('${apiKey}');
// $result = $authClient->login('username', 'password');
// if ($result['success']) {
//     echo "Login successful: " . $result['message'];
// } else {
//     echo "Login failed: " . $result['message'];
// }
?>`;

  const getCodeExample = () => {
    switch (selectedLanguage) {
      case "csharp":
        return csharpLoginExample;
      case "cpp":
        return cppExample;
      case "python":
        return pythonExample;
      case "nodejs":
        return nodejsExample;
      case "java":
        return javaExample;
      case "php":
        return phpExample;
      case "curl":
        return curlExample;
      default:
        return csharpLoginExample;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Code className="h-8 w-8" />
              Integration Examples
            </h1>
            <p className="text-muted-foreground">Ready-to-use code examples for integrating with your applications</p>
          </div>
        </div>

        {/* Configuration */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>
              Select your application and programming language to customize the examples
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="application">Application</Label>
                <Select value={selectedApp} onValueChange={setSelectedApp}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an application" />
                  </SelectTrigger>
                  <SelectContent>
                    {applications.map(app => (
                      <SelectItem key={app.id} value={app.id.toString()}>
                        {app.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="language">Programming Language</Label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csharp">C# (.NET)</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="nodejs">Node.js</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="php">PHP</SelectItem>
                    <SelectItem value="curl">cURL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {selectedApplication && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">API Key:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="bg-background px-2 py-1 rounded text-xs font-mono">
                        {selectedApplication.apiKey}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(selectedApplication.apiKey)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Version:</span>
                    <div className="mt-1">
                      <Badge variant="outline">{selectedApplication.version}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Message Handling Info */}
        <Card className="mb-8 border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-700 dark:text-blue-400">
              <div className="h-6 w-6 bg-blue-500 rounded-full mr-3 flex items-center justify-center">
                <span className="text-white text-sm">!</span>
              </div>
              Important: Custom Message Display
            </CardTitle>
            <CardDescription>
              Your application settings contain custom messages that will be displayed to users. Here's how they work:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-semibold text-green-800 dark:text-green-400 mb-2">Success Messages</h4>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <li>• <strong>Login Success:</strong> Your custom welcome message</li>
                  <li>• Displayed when authentication succeeds</li>
                  <li>• Can include personalized greeting text</li>
                </ul>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <h4 className="font-semibold text-red-800 dark:text-red-400 mb-2">Error Messages</h4>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  <li>• <strong>Login Failed:</strong> Invalid credentials message</li>
                  <li>• <strong>Account Disabled:</strong> Custom disabled message</li>
                  <li>• <strong>Account Expired:</strong> Custom expiration message</li>
                  <li>• <strong>Version Mismatch:</strong> Update required message</li>
                  <li>• <strong>HWID Mismatch:</strong> Hardware binding message</li>
                </ul>
              </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                <strong>💡 Pro Tip:</strong> The <code className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">Message</code> field in the API response contains 
                the exact text you configured in your application settings. Use <code className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">loginResult.Message</code> to 
                display these custom messages to your users.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Code Examples */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Code Example</CardTitle>
                <CardDescription>
                  Complete implementation example for {selectedLanguage === "csharp" ? "C#" : selectedLanguage} with proper message handling
                </CardDescription>
              </div>
              <Button onClick={() => copyToClipboard(getCodeExample())}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Code
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{getCodeExample()}</code>
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Implementation Notes */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Implementation Notes</CardTitle>
            <CardDescription>Important considerations for message display</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-blue-600 dark:text-blue-400">Message Response Structure</h4>
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                  <pre className="text-xs">
{`{
  "success": true/false,
  "message": "Your custom message here",
  "user_id": 123,
  "username": "user123",
  // ... other fields
}`}
                  </pre>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-green-600 dark:text-green-400">Best Practices</h4>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Always display the <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">message</code> field to users
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Use appropriate UI elements (MessageBox, notifications, etc.)
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Handle different error types with specific actions
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Test with your actual configured messages
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Complete Implementation Guide */}
        <Card className="mt-8 border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center text-purple-700 dark:text-purple-400">
              <div className="h-6 w-6 bg-purple-500 rounded-full mr-3 flex items-center justify-center">
                <span className="text-white text-sm">📋</span>
              </div>
              Complete Implementation Guide
            </CardTitle>
            <CardDescription>
              Step-by-step guide for organizing your authentication code with proper file structure
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* File Structure */}
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Recommended File Structure</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium mb-2 text-blue-600 dark:text-blue-400">C# / .NET Project</h5>
                  <pre className="text-xs bg-white dark:bg-gray-800 p-3 rounded border">
{`YourProject/
├── Auth/
│   ├── AuthApiClient.cs      (API client class)
│   ├── AuthResponse.cs       (Response models)
│   └── MessageDisplay.cs     (UI message handler)
├── Utils/
│   └── HardwareIdGenerator.cs (HWID generation)
├── Forms/
│   ├── LoginForm.cs          (Login UI)
│   └── MainForm.cs           (Main application)
└── Program.cs                (Entry point)`}
                  </pre>
                </div>
                <div>
                  <h5 className="font-medium mb-2 text-green-600 dark:text-green-400">C++ Project</h5>
                  <pre className="text-xs bg-white dark:bg-gray-800 p-3 rounded border">
{`YourProject/
├── include/
│   ├── AuthApiClient.h       (API client header)
│   ├── MessageDisplay.h      (Message display header)
│   └── LoginWindow.h         (Window class header)
├── src/
│   ├── AuthApiClient.cpp     (API implementation)
│   ├── MessageDisplay.cpp    (UI message handler)
│   ├── LoginWindow.cpp       (Login window)
│   └── main.cpp              (Entry point)
└── CMakeLists.txt            (Build configuration)`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Component Breakdown */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Component Organization</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* API Client */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h5 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">API Client Class</h5>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Handles HTTP requests</li>
                    <li>• Manages authentication</li>
                    <li>• Processes API responses</li>
                    <li>• Contains login/verify methods</li>
                  </ul>
                  <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                    <strong>File:</strong> AuthApiClient.{selectedLanguage === "csharp" ? "cs" : selectedLanguage === "cpp" ? "cpp" : selectedLanguage === "java" ? "java" : selectedLanguage === "php" ? "php" : "py"}
                  </div>
                </div>

                {/* Message Display */}
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h5 className="font-semibold text-green-800 dark:text-green-400 mb-2">Message Display</h5>
                  <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    <li>• Shows success messages</li>
                    <li>• Displays error alerts</li>
                    <li>• Handles warning dialogs</li>
                    <li>• Custom message formatting</li>
                  </ul>
                  <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                    <strong>Separate Class:</strong> MessageDisplay
                  </div>
                </div>

                {/* UI Components */}
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h5 className="font-semibold text-purple-800 dark:text-purple-400 mb-2">UI Components</h5>
                  <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                    <li>• Login form/window</li>
                    <li>• Button event handlers</li>
                    <li>• Status labels</li>
                    <li>• Input validation</li>
                  </ul>
                  <div className="mt-2 text-xs text-purple-600 dark:text-purple-400">
                    <strong>File:</strong> LoginForm/LoginWindow
                  </div>
                </div>
              </div>
            </div>

            {/* Button Implementation */}
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
              <h4 className="font-semibold text-orange-800 dark:text-orange-400 mb-3">Login Button Implementation</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium mb-2">Button Click Handler Logic</h5>
                  <ul className="text-sm space-y-1">
                    <li>1. Validate input fields</li>
                    <li>2. Disable button during request</li>
                    <li>3. Show "Authenticating..." status</li>
                    <li>4. Call API client login method</li>
                    <li>5. Handle response with MessageDisplay</li>
                    <li>6. Re-enable button</li>
                    <li>7. Navigate to main app on success</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Error Handling in Button</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Network connection errors</li>
                    <li>• Empty field validation</li>
                    <li>• API response parsing</li>
                    <li>• Custom message display</li>
                    <li>• Specific error type actions</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Webhook Integration */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <h4 className="font-semibold text-indigo-800 dark:text-indigo-400 mb-3">Webhook & Blacklist Integration</h4>
              <div className="space-y-3">
                <div>
                  <h5 className="font-medium">Automatic Webhook Triggers</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your authentication system automatically sends webhooks for these events:
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="text-sm">✓ Login success/failure</div>
                    <div className="text-sm">✓ Account disabled attempts</div>
                    <div className="text-sm">✓ HWID mismatch detection</div>
                    <div className="text-sm">✓ Version mismatch</div>
                    <div className="text-sm">✓ Blacklist violations</div>
                    <div className="text-sm">✓ Multiple failed attempts</div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                  <h6 className="font-medium text-sm mb-1">No Additional Code Required</h6>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Webhooks and blacklist checking happen automatically on the server side. 
                    Your client code just needs to handle the response messages properly.
                  </p>
                </div>
              </div>
            </div>

            {/* Security Features */}
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <h4 className="font-semibold text-red-800 dark:text-red-400 mb-3">Security Implementation Checklist</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium mb-2">Client-Side Security</h5>
                  <ul className="text-sm space-y-1">
                    <li>✓ Generate unique HWID per machine</li>
                    <li>✓ Send application version in requests</li>
                    <li>✓ Handle all custom error messages</li>
                    <li>✓ Implement proper session verification</li>
                    <li>✓ Exit on critical security violations</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Server-Side (Automatic)</h5>
                  <ul className="text-sm space-y-1">
                    <li>✓ IP blacklist checking</li>
                    <li>✓ Username blacklist validation</li>
                    <li>✓ HWID blacklist enforcement</li>
                    <li>✓ Rate limiting protection</li>
                    <li>✓ Webhook notifications</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Testing Guide */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-400 mb-3">Testing Your Implementation</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h5 className="font-medium mb-2">Success Scenarios</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Valid user login</li>
                    <li>• Custom success message display</li>
                    <li>• Session verification</li>
                    <li>• Webhook delivery</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Error Scenarios</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Invalid credentials</li>
                    <li>• Disabled account</li>
                    <li>• Expired subscription</li>
                    <li>• Version mismatch</li>
                    <li>• HWID violation</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Security Tests</h5>
                  <ul className="text-sm space-y-1">
                    <li>• Blacklisted IP attempt</li>
                    <li>• Blacklisted username</li>
                    <li>• Rate limit testing</li>
                    <li>• Network error handling</li>
                  </ul>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* API Reference */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
              <CardDescription>Available authentication endpoints</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="default">POST</Badge>
                  <code className="text-sm">/api/v1/login</code>
                </div>
                <p className="text-sm text-muted-foreground">
                  Authenticate users with username, password, version, and HWID validation
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="default">POST</Badge>
                  <code className="text-sm">/api/v1/register</code>
                </div>
                <p className="text-sm text-muted-foreground">
                  Register new users with optional email and expiration date
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="default">POST</Badge>
                  <code className="text-sm">/api/v1/verify</code>
                </div>
                <p className="text-sm text-muted-foreground">
                  Verify user sessions and check account status
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features Supported</CardTitle>
              <CardDescription>Authentication features available in the API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  ✓ Username/Password Authentication
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  ✓ Hardware ID (HWID) Locking
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  ✓ Version Control & Updates
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  ✓ Account Expiration Management
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  ✓ IP/Username/HWID Blacklisting
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  ✓ Real-time Webhook Notifications
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  ✓ Comprehensive Activity Logging
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Response Examples */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Response Examples</CardTitle>
            <CardDescription>Sample API responses for different scenarios</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="success" className="space-y-4">
              <TabsList>
                <TabsTrigger value="success">Successful Login</TabsTrigger>
                <TabsTrigger value="failed">Failed Login</TabsTrigger>
                <TabsTrigger value="blocked">Blocked Access</TabsTrigger>
                <TabsTrigger value="expired">Account Expired</TabsTrigger>
              </TabsList>
              
              <TabsContent value="success">
                <pre className="bg-muted p-4 rounded-lg text-sm">
                  <code>{JSON.stringify({
                    success: true,
                    message: "Login successful!",
                    user_id: 123,
                    username: "testuser",
                    email: "user@example.com",
                    expires_at: "2024-12-31T23:59:59.000Z",
                    hwid_locked: true
                  }, null, 2)}</code>
                </pre>
              </TabsContent>
              
              <TabsContent value="failed">
                <pre className="bg-muted p-4 rounded-lg text-sm">
                  <code>{JSON.stringify({
                    success: false,
                    message: "Invalid credentials!"
                  }, null, 2)}</code>
                </pre>
              </TabsContent>
              
              <TabsContent value="blocked">
                <pre className="bg-muted p-4 rounded-lg text-sm">
                  <code>{JSON.stringify({
                    success: false,
                    message: "Access denied: IP address is blacklisted"
                  }, null, 2)}</code>
                </pre>
              </TabsContent>
              
              <TabsContent value="expired">
                <pre className="bg-muted p-4 rounded-lg text-sm">
                  <code>{JSON.stringify({
                    success: false,
                    message: "Account has expired!"
                  }, null, 2)}</code>
                </pre>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}