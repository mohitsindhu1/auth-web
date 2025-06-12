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
                
                // Verify user session
                var verifyResult = await _authClient.VerifyAsync(loginResult.UserId.Value);
                if (verifyResult.Success)
                {
                    // Hide login form and show main application
                    this.Hide();
                    var mainForm = new MainForm();
                    mainForm.Show();
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

public class AuthResponse
{
    public bool Success { get; set; }
    public string Message { get; set; }  // This contains your custom messages!
    public int? UserId { get; set; }
    public string Username { get; set; }
    public string Email { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public bool? HwidLocked { get; set; }
    public string RequiredVersion { get; set; }
    public string CurrentVersion { get; set; }
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
}`;

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

  const getCodeExample = () => {
    switch (selectedLanguage) {
      case "csharp":
        return csharpLoginExample;
      case "python":
        return pythonExample;
      case "nodejs":
        return nodejsExample;
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
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="nodejs">Node.js</SelectItem>
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