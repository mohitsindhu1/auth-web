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

    public async Task<AuthResponse> RegisterAsync(string username, string password, string email = null, DateTime? expiresAt = null)
    {
        var registerData = new
        {
            username,
            password,
            email,
            expiresAt = expiresAt?.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        };

        var json = JsonSerializer.Serialize(registerData);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync($"{_baseUrl}/api/v1/register", content);
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
    public string Message { get; set; }
    public int? UserId { get; set; }
    public string Username { get; set; }
    public string Email { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public bool? HwidLocked { get; set; }
    public string RequiredVersion { get; set; }
    public string CurrentVersion { get; set; }
}

// Usage Example
class Program
{
    static async Task Main(string[] args)
    {
        var authClient = new AuthApiClient("${apiKey}");

        try
        {
            // Login example
            var loginResult = await authClient.LoginAsync("testuser", "password123", "${selectedApplication?.version || "1.0.0"}", "HWID-12345");
            
            if (loginResult.Success)
            {
                Console.WriteLine($"Login successful! User ID: {loginResult.UserId}");
                Console.WriteLine($"Message: {loginResult.Message}");
                
                // Verify user session
                var verifyResult = await authClient.VerifyAsync(loginResult.UserId.Value);
                if (verifyResult.Success)
                {
                    Console.WriteLine("User session verified successfully!");
                }
            }
            else
            {
                Console.WriteLine($"Login failed: {loginResult.Message}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
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
            print(f"Login successful! User ID: {login_result.get('user_id')}")
            print(f"Message: {login_result.get('message')}")
            
            # Verify user session
            verify_result = client.verify(login_result["user_id"])
            if verify_result.get("success"):
                print("User session verified successfully!")
        else:
            print(f"Login failed: {login_result.get('message')}")
    
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
            console.log(\`Login successful! User ID: \${loginResult.user_id}\`);
            console.log(\`Message: \${loginResult.message}\`);
            
            // Verify user session
            const verifyResult = await client.verify(loginResult.user_id);
            if (verifyResult.success) {
                console.log('User session verified successfully!');
            }
        } else {
            console.log(\`Login failed: \${loginResult.message}\`);
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

        {/* Code Examples */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Code Example</CardTitle>
                <CardDescription>
                  Complete implementation example for {selectedLanguage === "csharp" ? "C#" : selectedLanguage}
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