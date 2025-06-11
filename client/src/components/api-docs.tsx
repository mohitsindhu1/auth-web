import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code } from "lucide-react";

export default function ApiDocs() {
  return (
    <section id="docs" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            API Documentation
          </h2>
          <p className="text-xl text-secondary-custom max-w-2xl mx-auto">
            Simple REST endpoints for user authentication, registration, and management
          </p>
        </div>

        {/* API Endpoints */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Login Endpoint */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <CardTitle>User Login</CardTitle>
                <Badge className="bg-green-100 text-green-800">POST</Badge>
              </div>
              <code className="text-sm text-primary-custom bg-blue-50 px-3 py-1 rounded">
                /api/auth/login
              </code>
            </CardHeader>
            <CardContent className="p-6">
              <h4 className="font-semibold mb-3">Request Body:</h4>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto mb-4">
{`{
  "username": "user123",
  "password": "userpassword",
  "api_key": "your_api_key"
}`}
              </pre>
              <h4 className="font-semibold mb-3">Response:</h4>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "success": true,
  "message": "Login successful",
  "user_id": "12345",
  "session_token": "abc123..."
}`}
              </pre>
            </CardContent>
          </Card>

          {/* Register Endpoint */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <CardTitle>User Registration</CardTitle>
                <Badge className="bg-blue-100 text-blue-800">POST</Badge>
              </div>
              <code className="text-sm text-primary-custom bg-blue-50 px-3 py-1 rounded">
                /api/auth/register
              </code>
            </CardHeader>
            <CardContent className="p-6">
              <h4 className="font-semibold mb-3">Request Body:</h4>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto mb-4">
{`{
  "username": "newuser",
  "password": "securepassword",
  "email": "user@example.com",
  "api_key": "your_api_key"
}`}
              </pre>
              <h4 className="font-semibold mb-3">Response:</h4>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "success": true,
  "message": "User registered successfully",
  "user_id": "12346"
}`}
              </pre>
            </CardContent>
          </Card>
        </div>

        {/* C# Integration Example */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center">
              <Code className="h-6 w-6 text-primary-custom mr-3" />
              C# WinForms Integration Example
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <pre className="bg-gray-900 text-green-400 p-6 rounded-lg text-sm overflow-x-auto">
{`using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

public class AuthService
{
    private static readonly HttpClient client = new HttpClient();
    private const string API_BASE = "https://24dff18d-18d0-4b5a-b988-058e9bf61703-00-3eqcnf9gyu1ms.picard.replit.dev/api";
    private const string API_KEY = "test-api-key-123";

    // Enhanced login with version checking and HWID locking
    public async Task<AuthResponse> LoginUser(string username, string password, string appVersion = "1.0.0", string hwid = null)
    {
        // Generate HWID if not provided
        if (string.IsNullOrEmpty(hwid))
        {
            hwid = GetHardwareId();
        }

        var loginData = new
        {
            username = username,
            password = password,
            version = appVersion,
            hwid = hwid
        };

        var json = JsonConvert.SerializeObject(loginData);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        
        // Add API key to headers
        client.DefaultRequestHeaders.Clear();
        client.DefaultRequestHeaders.Add("X-API-Key", API_KEY);

        try
        {
            var response = await client.PostAsync($"{API_BASE}/v1/login", content);
            var responseString = await response.Content.ReadAsStringAsync();
            var result = JsonConvert.DeserializeObject<AuthResponse>(responseString);
            
            return result;
        }
        catch (Exception ex)
        {
            return new AuthResponse 
            { 
                Success = false, 
                Message = $"Connection error: {ex.Message}" 
            };
        }
    }

    // Generate hardware ID for HWID locking
    private string GetHardwareId()
    {
        try
        {
            var motherboard = new ManagementObjectSearcher("SELECT SerialNumber FROM Win32_BaseBoard").Get().Cast<ManagementObject>().First();
            var cpu = new ManagementObjectSearcher("SELECT ProcessorId FROM Win32_Processor").Get().Cast<ManagementObject>().First();
            
            string mbSerial = motherboard["SerialNumber"]?.ToString() ?? "Unknown";
            string cpuId = cpu["ProcessorId"]?.ToString() ?? "Unknown";
            
            return $"{mbSerial}-{cpuId}".GetHashCode().ToString("X");
        }
        catch
        {
            // Fallback to MAC address
            return NetworkInterface.GetAllNetworkInterfaces()
                .FirstOrDefault()?
                .GetPhysicalAddress()?
                .ToString() ?? Environment.MachineName;
        }
    }

    public async Task<bool> RegisterUser(string username, string password, string email)
    {
        var registerData = new
        {
            username = username,
            password = password,
            email = email,
            api_key = API_KEY
        };

        var json = JsonConvert.SerializeObject(registerData);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        try
        {
            var response = await client.PostAsync($"{API_BASE}/auth/register", content);
            var responseString = await response.Content.ReadAsStringAsync();
            var result = JsonConvert.DeserializeObject<AuthResponse>(responseString);
            
            return result.Success;
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Error: {ex.Message}");
            return false;
        }
    }
}

public class AuthResponse
{
    [JsonProperty("success")]
    public bool Success { get; set; }
    
    [JsonProperty("message")]
    public string Message { get; set; }
    
    [JsonProperty("user_id")]
    public int UserId { get; set; }
    
    [JsonProperty("username")]
    public string Username { get; set; }
    
    [JsonProperty("email")]
    public string Email { get; set; }
    
    [JsonProperty("expires_at")]
    public DateTime? ExpiresAt { get; set; }
    
    [JsonProperty("hwid_locked")]
    public bool HwidLocked { get; set; }
    
    [JsonProperty("required_version")]
    public string RequiredVersion { get; set; }
    
    [JsonProperty("current_version")]
    public string CurrentVersion { get; set; }
}

// Enhanced Usage in your WinForm with custom message handling:
private async void btnLogin_Click(object sender, EventArgs e)
{
    var authService = new AuthService();
    var result = await authService.LoginUser(txtUsername.Text, txtPassword.Text, "1.0.0");
    
    if (result.Success)
    {
        // Show custom success message from server
        MessageBox.Show(result.Message, "Login Success", MessageBoxButtons.OK, MessageBoxIcon.Information);
        
        // Check if account will expire soon
        if (result.ExpiresAt.HasValue && result.ExpiresAt.Value <= DateTime.Now.AddDays(7))
        {
            MessageBox.Show($"Your account expires on {result.ExpiresAt.Value:yyyy-MM-dd}", 
                          "Account Expiring Soon", MessageBoxButtons.OK, MessageBoxIcon.Warning);
        }
        
        // Show HWID lock status
        if (result.HwidLocked)
        {
            MessageBox.Show("Your account is hardware-locked to this device for security.", 
                          "Security Notice", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }
        
        // Proceed to main application
        this.Hide();
        var mainForm = new MainForm();
        mainForm.Show();
    }
    else
    {
        // Show custom error message from server
        MessageBox.Show(result.Message, "Login Failed", MessageBoxButtons.OK, MessageBoxIcon.Error);
        
        // Handle version mismatch
        if (!string.IsNullOrEmpty(result.RequiredVersion))
        {
            var updateResult = MessageBox.Show(
                $"Your version ({result.CurrentVersion}) is outdated. Required: {result.RequiredVersion}\\n\\nWould you like to download the update?",
                "Update Required", 
                MessageBoxButtons.YesNo, 
                MessageBoxIcon.Question);
                
            if (updateResult == DialogResult.Yes)
            {
                // Open update URL or trigger auto-updater
                Process.Start("https://your-app-download-url.com");
            }
        }
    }
}

private async void btnRegister_Click(object sender, EventArgs e)
{
    var authService = new AuthService();
    bool registerSuccess = await authService.RegisterUser(
        txtUsername.Text, 
        txtPassword.Text, 
        txtEmail.Text
    );
    
    if (registerSuccess)
    {
        MessageBox.Show("User registered successfully!");
    }
    else
    {
        MessageBox.Show("Registration failed!");
    }
}`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
