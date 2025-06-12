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
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Management;
using System.Security.Cryptography;
using System.Linq;

// FIXED AuthResponse Class - No more nullable errors!
public class AuthResponse
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }
    
    [JsonPropertyName("message")]
    public string Message { get; set; }
    
    [JsonPropertyName("user_id")]
    public int UserId { get; set; }  // FIXED: No longer nullable
    
    [JsonPropertyName("username")]
    public string Username { get; set; }
    
    [JsonPropertyName("email")]
    public string Email { get; set; }
    
    [JsonPropertyName("expires_at")]
    public DateTime? ExpiresAt { get; set; }
    
    [JsonPropertyName("hwid_locked")]
    public bool? HwidLocked { get; set; }
}

// Session tracking response
public class SessionResponse
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }
    
    [JsonPropertyName("message")]
    public string Message { get; set; }
    
    [JsonPropertyName("session_token")]
    public string SessionToken { get; set; }
}

// User information class
public class UserInfo
{
    public int UserId { get; set; }
    public string Username { get; set; }
    public string Email { get; set; }
    public DateTime LoginTime { get; set; } = DateTime.Now;
}

// Auth API Client
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
        var loginData = new { username, password, version, hwid };
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

    public async Task<SessionResponse> StartSessionAsync(int userId, string sessionToken)
    {
        var sessionData = new { user_id = userId, session_token = sessionToken, action = "start" };
        var json = JsonSerializer.Serialize(sessionData);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync($"{_baseUrl}/api/v1/session/track", content);
        var responseJson = await response.Content.ReadAsStringAsync();

        return JsonSerializer.Deserialize<SessionResponse>(responseJson, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
    }

    public async Task<SessionResponse> SendHeartbeatAsync(string sessionToken)
    {
        var sessionData = new { session_token = sessionToken, action = "heartbeat" };
        var json = JsonSerializer.Serialize(sessionData);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync($"{_baseUrl}/api/v1/session/track", content);
        var responseJson = await response.Content.ReadAsStringAsync();

        return JsonSerializer.Deserialize<SessionResponse>(responseJson, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
    }

    public async Task<SessionResponse> EndSessionAsync(string sessionToken)
    {
        var sessionData = new { session_token = sessionToken, action = "end" };
        var json = JsonSerializer.Serialize(sessionData);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync($"{_baseUrl}/api/v1/session/track", content);
        var responseJson = await response.Content.ReadAsStringAsync();

        return JsonSerializer.Deserialize<SessionResponse>(responseJson, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });
    }
}

// Complete Login Form with Enhanced Session Monitoring
public partial class LoginForm : Form
{
    private AuthApiClient _authClient;
    private TextBox txtUsername;
    private TextBox txtPassword;
    private Button btnLogin;
    private Label lblStatus;
    
    // Session monitoring variables
    private System.Windows.Forms.Timer sessionTimer;
    private System.Windows.Forms.Timer heartbeatTimer;
    private int currentUserId;
    private string currentSessionToken;
    private int sessionCheckFailures = 0;
    private readonly int maxFailures = 3;

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

        var lblUsername = new Label { Text = "Username:", Location = new System.Drawing.Point(50, 50), Size = new System.Drawing.Size(80, 23) };
        txtUsername = new TextBox { Location = new System.Drawing.Point(140, 50), Size = new System.Drawing.Size(200, 23) };

        var lblPassword = new Label { Text = "Password:", Location = new System.Drawing.Point(50, 90), Size = new System.Drawing.Size(80, 23) };
        txtPassword = new TextBox { Location = new System.Drawing.Point(140, 90), Size = new System.Drawing.Size(200, 23), UseSystemPasswordChar = true };

        btnLogin = new Button { Text = "Login", Location = new System.Drawing.Point(140, 130), Size = new System.Drawing.Size(100, 30) };
        btnLogin.Click += async (s, e) => await LoginAsync();

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

            string hwid = GetHardwareId();
            
            var loginResult = await _authClient.LoginAsync(txtUsername.Text, txtPassword.Text, "${selectedApplication?.version || "1.0.0"}", hwid);
            
            if (loginResult.Success)
            {
                lblStatus.Text = loginResult.Message;
                lblStatus.ForeColor = System.Drawing.Color.Green;
                
                MessageBox.Show(loginResult.Message, "Login Successful", MessageBoxButtons.OK, MessageBoxIcon.Information);
                
                // FIXED: No more .Value needed since UserId is now int, not int?
                var verifyResult = await _authClient.VerifyAsync(loginResult.UserId);
                if (verifyResult.Success)
                {
                    Console.WriteLine("User session verified successfully!");
                    
                    this.Hide();
                    
                    var mainForm = new MainForm();
                    mainForm.UserData = new UserInfo
                    {
                        UserId = loginResult.UserId,  // FIXED: No .Value needed
                        Username = loginResult.Username,
                        Email = loginResult.Email
                    };
                    mainForm.Show();
                    
                    // Start enhanced session monitoring
                    StartSessionMonitoring(loginResult.UserId);  // FIXED: No .Value needed
                }
                else
                {
                    MessageBox.Show("Session verification failed. Please try logging in again.", 
                                  "Security Warning", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    
                    txtUsername.Clear();
                    txtPassword.Clear();
                    txtUsername.Focus();
                }
            }
            else
            {
                lblStatus.Text = loginResult.Message;
                lblStatus.ForeColor = System.Drawing.Color.Red;
                
                MessageBox.Show(loginResult.Message, "Login Failed", MessageBoxButtons.OK, MessageBoxIcon.Error);
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

    private void StartSessionMonitoring(int userId)
    {
        currentUserId = userId;
        sessionCheckFailures = 0;
        currentSessionToken = GenerateSessionToken();
        
        // Start session tracking on server
        Task.Run(async () => {
            try 
            {
                var sessionResult = await _authClient.StartSessionAsync(userId, currentSessionToken);
                if (sessionResult.Success)
                {
                    Console.WriteLine($"Session started: {currentSessionToken.Substring(0, 8)}...");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to start session: {ex.Message}");
            }
        });
        
        // Session verification every 5 minutes
        sessionTimer = new System.Windows.Forms.Timer();
        sessionTimer.Interval = 300000; // 5 minutes
        sessionTimer.Tick += async (s, e) => await VerifySessionPeriodically();
        sessionTimer.Start();
        
        // Heartbeat every 30 seconds
        heartbeatTimer = new System.Windows.Forms.Timer();
        heartbeatTimer.Interval = 30000; // 30 seconds
        heartbeatTimer.Tick += async (s, e) => await SendHeartbeat();
        heartbeatTimer.Start();
        
        Console.WriteLine("Session monitoring started successfully");
    }

    private string GenerateSessionToken()
    {
        var guid = Guid.NewGuid().ToString("N");
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        return $"sess_{guid}_{timestamp}";
    }

    private async Task VerifySessionPeriodically()
    {
        try
        {
            var verifyResult = await _authClient.VerifyAsync(currentUserId);
            if (!verifyResult.Success)
            {
                sessionCheckFailures++;
                Console.WriteLine($"Session verification failed ({sessionCheckFailures}/{maxFailures})");
                
                if (sessionCheckFailures >= maxFailures)
                {
                    await ForceLogout("Your session has expired. Please login again.");
                }
            }
            else
            {
                sessionCheckFailures = 0;
                Console.WriteLine($"Session verified at {DateTime.Now:HH:mm:ss}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Session verification error: {ex.Message}");
        }
    }

    private async Task SendHeartbeat()
    {
        try
        {
            if (!string.IsNullOrEmpty(currentSessionToken))
            {
                var heartbeatResult = await _authClient.SendHeartbeatAsync(currentSessionToken);
                if (!heartbeatResult.Success)
                {
                    Console.WriteLine($"Heartbeat failed: {heartbeatResult.Message}");
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Heartbeat error: {ex.Message}");
        }
    }

    private async Task ForceLogout(string reason)
    {
        // End session on server
        if (!string.IsNullOrEmpty(currentSessionToken))
        {
            try
            {
                await _authClient.EndSessionAsync(currentSessionToken);
                Console.WriteLine("Session ended on server");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to end session: {ex.Message}");
            }
        }
        
        // Stop timers
        sessionTimer?.Stop();
        sessionTimer?.Dispose();
        heartbeatTimer?.Stop();
        heartbeatTimer?.Dispose();
        
        // Show message and return to login
        MessageBox.Show(reason, "Session Expired", MessageBoxButtons.OK, MessageBoxIcon.Warning);
        
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
        
        // Clear session data
        currentSessionToken = null;
        currentUserId = 0;
        sessionCheckFailures = 0;
    }

    public void StopSessionMonitoring()
    {
        sessionTimer?.Stop();
        sessionTimer?.Dispose();
        heartbeatTimer?.Stop();
        heartbeatTimer?.Dispose();
        Console.WriteLine("Session monitoring stopped");
    }

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

// Sample MainForm class
public class MainForm : Form
{
    public UserInfo UserData { get; set; }

    public MainForm()
    {
        this.Text = "Main Application - User: " + (UserData?.Username ?? "Unknown");
        this.Size = new System.Drawing.Size(600, 400);
        this.StartPosition = FormStartPosition.CenterScreen;
        
        var welcomeLabel = new Label
        {
            Text = $"Welcome to the application!\\n\\nUser ID: {UserData?.UserId}\\nUsername: {UserData?.Username}\\nLogin Time: {UserData?.LoginTime}",
            Location = new System.Drawing.Point(50, 50),
            Size = new System.Drawing.Size(500, 200),
            Font = new System.Drawing.Font("Arial", 12)
        };
        this.Controls.Add(welcomeLabel);
    }
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

/*
SETUP INSTRUCTIONS:
1. Install NuGet Package: System.Text.Json
2. Add all using statements shown above
3. Replace YOUR_API_KEY with your actual API key: ${apiKey}
4. Replace YOUR_BASE_URL with: ${baseUrl}
5. Build and run the application

FIXED ISSUES:
- Changed int? UserId to int UserId (no more nullable errors)
- Proper JSON property mapping with [JsonPropertyName] attributes
- Complete session monitoring with heartbeat functionality
- Enhanced error handling for network issues
- Automatic session cleanup on application exit

FEATURES INCLUDED:
- Login with HWID verification
- Session verification every 5 minutes
- Heartbeat every 30 seconds
- Automatic logout on session expiry
- Complete error handling for all scenarios
- Session tracking on server
*/`;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Integration Examples</h1>
            <p className="text-muted-foreground">
              Complete code examples for integrating with your authentication API.
            </p>
          </div>

          <div className="grid gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>
                  Select your application to get customized integration code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="app-select">Select Application</Label>
                  <Select value={selectedApp} onValueChange={setSelectedApp}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an application" />
                    </SelectTrigger>
                    <SelectContent>
                      {applications.map((app) => (
                        <SelectItem key={app.id} value={app.id.toString()}>
                          {app.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedApplication && (
                  <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                    <div>
                      <Label className="text-sm font-medium">API Key</Label>
                      <p className="text-sm font-mono text-muted-foreground break-all">
                        {selectedApplication.apiKey}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Base URL</Label>
                      <p className="text-sm font-mono text-muted-foreground">
                        {baseUrl}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Tabs value={selectedLanguage} onValueChange={setSelectedLanguage} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="csharp">C# WinForms</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="nodejs">Node.js</TabsTrigger>
            </TabsList>
            
            <TabsContent value="csharp" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    C# WinForms Login Implementation
                  </CardTitle>
                  <CardDescription>
                    Complete C# WinForms application with enhanced session monitoring and all authentication features.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Fixed Nullable Error</Badge>
                        <Badge variant="secondary">Session Monitoring</Badge>
                        <Badge variant="secondary">HWID Support</Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(csharpLoginExample)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Code
                      </Button>
                    </div>
                    
                    <div className="relative">
                      <Textarea
                        value={csharpLoginExample}
                        readOnly
                        className="min-h-[400px] font-mono text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="python" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Python Implementation</CardTitle>
                  <CardDescription>
                    Python authentication client with session management
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Python example coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="nodejs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Node.js Implementation</CardTitle>
                  <CardDescription>
                    JavaScript/TypeScript authentication client
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Node.js example coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}