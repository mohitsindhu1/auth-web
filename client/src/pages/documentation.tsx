import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Code, Copy, LogOut, Moon, Sun, Book, Zap, Users, Lock } from "lucide-react";
import { Link } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";

export default function Documentation() {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Code copied to clipboard",
    });
  };

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="phantom-nav fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 phantom-text mr-3" />
              <span className="text-xl font-bold text-foreground">Phantom Auth</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  Home
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-foreground hover:text-primary"
              >
                {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center">
            <Book className="h-16 w-16 phantom-text mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Documentation
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Complete integration guide for Phantom Auth API. Learn how to implement secure authentication in your C# WinForms applications with HWID locking, version control, and blacklist management.
            </p>
          </div>
        </div>

        {/* Quick Start Guide */}
        <Card className="phantom-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 phantom-text mr-2" />
              Quick Start Guide
            </CardTitle>
            <CardDescription>
              Get up and running with Phantom Auth in 5 minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Step 1: Create an Application</h3>
                <p className="text-muted-foreground mb-2">
                  Go to your dashboard and create a new application to get your API key.
                </p>
                <Link href="/dashboard">
                  <Button className="phantom-button">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Step 2: Get Your API Key</h3>
                <p className="text-muted-foreground">
                  After creating an application, copy the API key from your dashboard. You'll need this for all API requests.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Step 3: Start Making API Calls</h3>
                <p className="text-muted-foreground">
                  Use the API endpoints below to register users, authenticate them, and manage sessions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Reference */}
        <Card className="phantom-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Code className="h-5 w-5 phantom-text mr-2" />
              API Reference
            </CardTitle>
            <CardDescription>
              Complete API documentation with examples
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Base URL:</strong> {window.location.origin}/api/v1
                <br />
                <strong>Authentication:</strong> Include your API key in the <code>X-API-Key</code> header or as <code>api_key</code> query parameter.
              </AlertDescription>
            </Alert>

            <Tabs defaultValue="register" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="register">Register User</TabsTrigger>
                <TabsTrigger value="login">User Login</TabsTrigger>
                <TabsTrigger value="verify">Verify Session</TabsTrigger>
              </TabsList>

              {/* Register User */}
              <TabsContent value="register">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold mb-2">POST /register</h4>
                    <p className="text-muted-foreground mb-4">Register a new user in your application</p>
                    
                    <div className="bg-muted/50 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Request</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => copyToClipboard(`curl -X POST "${window.location.origin}/api/v1/register" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepassword123",
    "expiresAt": "2024-12-31T23:59:59Z"
  }'`)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <pre className="text-sm overflow-x-auto">
{`curl -X POST "${window.location.origin}/api/v1/register" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -d '{
    "username": "johndoe",
    "email": "john@example.com", 
    "password": "securepassword123",
    "expiresAt": "2024-12-31T23:59:59Z"
  }'`}
                      </pre>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Response</span>
                        <Badge variant="secondary">200 OK</Badge>
                      </div>
                      <pre className="text-sm overflow-x-auto">
{`{
  "success": true,
  "message": "User registered successfully",
  "user_id": 123
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* User Login */}
              <TabsContent value="login">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold mb-2">POST /login</h4>
                    <p className="text-muted-foreground mb-4">Authenticate a user with username and password</p>
                    
                    <div className="bg-muted/50 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Enhanced Request (with version and HWID)</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => copyToClipboard(`curl -X POST "${window.location.origin}/api/v1/login" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -d '{
    "username": "johndoe",
    "password": "securepassword123",
    "version": "1.0.0",
    "hwid": "HWID-12345-ABCDE"
  }'`)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <pre className="text-sm overflow-x-auto">
{`curl -X POST "${window.location.origin}/api/v1/login" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -d '{
    "username": "johndoe",
    "password": "securepassword123",
    "version": "1.0.0",
    "hwid": "HWID-12345-ABCDE"
  }'`}
                      </pre>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Response</span>
                        <Badge variant="secondary">200 OK</Badge>
                      </div>
                      <pre className="text-sm overflow-x-auto">
{`{
  "success": true,
  "message": "Login successful!",
  "user_id": 123,
  "username": "johndoe",
  "email": "john@example.com",
  "expires_at": "2024-12-31T23:59:59Z",
  "hwid_locked": true
  "email": "john@example.com"
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Verify Session */}
              <TabsContent value="verify">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold mb-2">POST /verify</h4>
                    <p className="text-muted-foreground mb-4">Verify if a user session is still valid</p>
                    
                    <div className="bg-muted/50 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Request</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => copyToClipboard(`curl -X POST "${window.location.origin}/api/v1/verify" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -d '{
    "user_id": 123
  }'`)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <pre className="text-sm overflow-x-auto">
{`curl -X POST "${window.location.origin}/api/v1/verify" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -d '{
    "user_id": 123
  }'`}
                      </pre>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Response</span>
                        <Badge variant="secondary">200 OK</Badge>
                      </div>
                      <pre className="text-sm overflow-x-auto">
{`{
  "success": true,
  "message": "User verified",
  "user_id": 123,
  "username": "johndoe",
  "email": "john@example.com",
  "expires_at": "2024-12-31T23:59:59.000Z"
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Integration Examples */}
        <Card className="phantom-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 phantom-text mr-2" />
              Integration Examples
            </CardTitle>
            <CardDescription>
              Ready-to-use code examples for different programming languages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="javascript" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="csharp">C#</TabsTrigger>
                <TabsTrigger value="php">PHP</TabsTrigger>
              </TabsList>

              {/* JavaScript Example */}
              <TabsContent value="javascript">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">JavaScript/Node.js Integration</h4>
                  
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Login Form Example</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(`class PhantomAuth {
  constructor(apiKey, baseUrl = '${window.location.origin}/api/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async login(username, password) {
    const response = await fetch(\`\${this.baseUrl}/login\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey
      },
      body: JSON.stringify({ username, password })
    });
    
    return await response.json();
  }

  async register(username, email, password, expiresAt = null) {
    const response = await fetch(\`\${this.baseUrl}/register\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey
      },
      body: JSON.stringify({ username, email, password, expiresAt })
    });
    
    return await response.json();
  }

  async verify(userId) {
    const response = await fetch(\`\${this.baseUrl}/verify\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey
      },
      body: JSON.stringify({ user_id: userId })
    });
    
    return await response.json();
  }
}

// Usage example
const auth = new PhantomAuth('your_api_key_here');

// Login button click handler
document.getElementById('loginBtn').addEventListener('click', async () => {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  try {
    const result = await auth.login(username, password);
    if (result.success) {
      localStorage.setItem('user_id', result.user_id);
      alert('Login successful!');
    } else {
      alert('Login failed: ' + result.message);
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
});`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <pre className="text-sm overflow-x-auto">
{`class PhantomAuth {
  constructor(apiKey, baseUrl = '${window.location.origin}/api/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async login(username, password) {
    const response = await fetch(\`\${this.baseUrl}/login\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey
      },
      body: JSON.stringify({ username, password })
    });
    
    return await response.json();
  }

  async register(username, email, password, expiresAt = null) {
    const response = await fetch(\`\${this.baseUrl}/register\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey
      },
      body: JSON.stringify({ username, email, password, expiresAt })
    });
    
    return await response.json();
  }

  async verify(userId) {
    const response = await fetch(\`\${this.baseUrl}/verify\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey
      },
      body: JSON.stringify({ user_id: userId })
    });
    
    return await response.json();
  }
}

// Usage example
const auth = new PhantomAuth('your_api_key_here');

// Login button click handler
document.getElementById('loginBtn').addEventListener('click', async () => {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  try {
    const result = await auth.login(username, password);
    if (result.success) {
      localStorage.setItem('user_id', result.user_id);
      alert('Login successful!');
    } else {
      alert('Login failed: ' + result.message);
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
});`}
                    </pre>
                  </div>
                </div>
              </TabsContent>

              {/* Python Example */}
              <TabsContent value="python">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Python Integration</h4>
                  
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Python Class Example</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(`import requests
import json

class PhantomAuth:
    def __init__(self, api_key, base_url="${window.location.origin}/api/v1"):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            'Content-Type': 'application/json',
            'X-API-Key': api_key
        }
    
    def login(self, username, password):
        url = f"{self.base_url}/login"
        data = {
            'username': username,
            'password': password
        }
        
        response = requests.post(url, headers=self.headers, json=data)
        return response.json()
    
    def register(self, username, email, password, expires_at=None):
        url = f"{self.base_url}/register"
        data = {
            'username': username,
            'email': email,
            'password': password
        }
        
        if expires_at:
            data['expiresAt'] = expires_at
            
        response = requests.post(url, headers=self.headers, json=data)
        return response.json()
    
    def verify(self, user_id):
        url = f"{self.base_url}/verify"
        data = {'user_id': user_id}
        
        response = requests.post(url, headers=self.headers, json=data)
        return response.json()

# Usage example
auth = PhantomAuth('your_api_key_here')

# Login example
result = auth.login('johndoe', 'password123')
if result.get('success'):
    print(f"Login successful! User ID: {result.get('user_id')}")
else:
    print(f"Login failed: {result.get('message')}")

# Register example  
result = auth.register('newuser', 'user@example.com', 'password123', '2024-12-31T23:59:59Z')
if result.get('success'):
    print(f"Registration successful! User ID: {result.get('user_id')}")
else:
    print(f"Registration failed: {result.get('message')}")`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <pre className="text-sm overflow-x-auto">
{`import requests
import json

class PhantomAuth:
    def __init__(self, api_key, base_url="${window.location.origin}/api/v1"):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            'Content-Type': 'application/json',
            'X-API-Key': api_key
        }
    
    def login(self, username, password):
        url = f"{self.base_url}/login"
        data = {
            'username': username,
            'password': password
        }
        
        response = requests.post(url, headers=self.headers, json=data)
        return response.json()
    
    def register(self, username, email, password, expires_at=None):
        url = f"{self.base_url}/register"
        data = {
            'username': username,
            'email': email,
            'password': password
        }
        
        if expires_at:
            data['expiresAt'] = expires_at
            
        response = requests.post(url, headers=self.headers, json=data)
        return response.json()
    
    def verify(self, user_id):
        url = f"{self.base_url}/verify"
        data = {'user_id': user_id}
        
        response = requests.post(url, headers=self.headers, json=data)
        return response.json()

# Usage example
auth = PhantomAuth('your_api_key_here')

# Login example
result = auth.login('johndoe', 'password123')
if result.get('success'):
    print(f"Login successful! User ID: {result.get('user_id')}")
else:
    print(f"Login failed: {result.get('message')}")

# Register example  
result = auth.register('newuser', 'user@example.com', 'password123', '2024-12-31T23:59:59Z')
if result.get('success'):
    print(f"Registration successful! User ID: {result.get('user_id')}")
else:
    print(f"Registration failed: {result.get('message')}")`}
                    </pre>
                  </div>
                </div>
              </TabsContent>

              {/* C# Example */}
              <TabsContent value="csharp">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">C# Integration</h4>
                  
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">C# Class Example</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(`using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

public class PhantomAuth
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _baseUrl;

    public PhantomAuth(string apiKey, string baseUrl = "${window.location.origin}/api/v1")
    {
        _apiKey = apiKey;
        _baseUrl = baseUrl;
        _httpClient = new HttpClient();
        _httpClient.DefaultRequestHeaders.Add("X-API-Key", apiKey);
    }

    public async Task<AuthResponse> LoginAsync(string username, string password)
    {
        var data = new { username, password };
        var json = JsonConvert.SerializeObject(data);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync($"{_baseUrl}/login", content);
        var responseJson = await response.Content.ReadAsStringAsync();
        
        return JsonConvert.DeserializeObject<AuthResponse>(responseJson);
    }

    public async Task<AuthResponse> RegisterAsync(string username, string email, string password, DateTime? expiresAt = null)
    {
        var data = new { username, email, password, expiresAt };
        var json = JsonConvert.SerializeObject(data);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync($"{_baseUrl}/register", content);
        var responseJson = await response.Content.ReadAsStringAsync();
        
        return JsonConvert.DeserializeObject<AuthResponse>(responseJson);
    }

    public async Task<AuthResponse> VerifyAsync(int userId)
    {
        var data = new { user_id = userId };
        var json = JsonConvert.SerializeObject(data);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync($"{_baseUrl}/verify", content);
        var responseJson = await response.Content.ReadAsStringAsync();
        
        return JsonConvert.DeserializeObject<AuthResponse>(responseJson);
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
}

// Usage example
var auth = new PhantomAuth("your_api_key_here");

// Login example
var loginResult = await auth.LoginAsync("johndoe", "password123");
if (loginResult.Success)
{
    Console.WriteLine($"Login successful! User ID: {loginResult.UserId}");
}
else
{
    Console.WriteLine($"Login failed: {loginResult.Message}");
}`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <pre className="text-sm overflow-x-auto">
{`using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

public class PhantomAuth
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _baseUrl;

    public PhantomAuth(string apiKey, string baseUrl = "${window.location.origin}/api/v1")
    {
        _apiKey = apiKey;
        _baseUrl = baseUrl;
        _httpClient = new HttpClient();
        _httpClient.DefaultRequestHeaders.Add("X-API-Key", apiKey);
    }

    public async Task<AuthResponse> LoginAsync(string username, string password)
    {
        var data = new { username, password };
        var json = JsonConvert.SerializeObject(data);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync($"{_baseUrl}/login", content);
        var responseJson = await response.Content.ReadAsStringAsync();
        
        return JsonConvert.DeserializeObject<AuthResponse>(responseJson);
    }

    public async Task<AuthResponse> RegisterAsync(string username, string email, string password, DateTime? expiresAt = null)
    {
        var data = new { username, email, password, expiresAt };
        var json = JsonConvert.SerializeObject(data);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync($"{_baseUrl}/register", content);
        var responseJson = await response.Content.ReadAsStringAsync();
        
        return JsonConvert.DeserializeObject<AuthResponse>(responseJson);
    }

    public async Task<AuthResponse> VerifyAsync(int userId)
    {
        var data = new { user_id = userId };
        var json = JsonConvert.SerializeObject(data);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync($"{_baseUrl}/verify", content);
        var responseJson = await response.Content.ReadAsStringAsync();
        
        return JsonConvert.DeserializeObject<AuthResponse>(responseJson);
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
}

// Usage example
var auth = new PhantomAuth("your_api_key_here");

// Login example
var loginResult = await auth.LoginAsync("johndoe", "password123");
if (loginResult.Success)
{
    Console.WriteLine($"Login successful! User ID: {loginResult.UserId}");
}
else
{
    Console.WriteLine($"Login failed: {loginResult.Message}");
}`}
                    </pre>
                  </div>
                </div>
              </TabsContent>

              {/* PHP Example */}
              <TabsContent value="php">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">PHP Integration</h4>
                  
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">PHP Class Example</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(`<?php

class PhantomAuth {
    private $apiKey;
    private $baseUrl;

    public function __construct($apiKey, $baseUrl = "${window.location.origin}/api/v1") {
        $this->apiKey = $apiKey;
        $this->baseUrl = $baseUrl;
    }

    public function login($username, $password) {
        $url = $this->baseUrl . '/login';
        $data = [
            'username' => $username,
            'password' => $password
        ];

        return $this->makeRequest($url, $data);
    }

    public function register($username, $email, $password, $expiresAt = null) {
        $url = $this->baseUrl . '/register';
        $data = [
            'username' => $username,
            'email' => $email,
            'password' => $password
        ];

        if ($expiresAt) {
            $data['expiresAt'] = $expiresAt;
        }

        return $this->makeRequest($url, $data);
    }

    public function verify($userId) {
        $url = $this->baseUrl . '/verify';
        $data = ['user_id' => $userId];

        return $this->makeRequest($url, $data);
    }

    private function makeRequest($url, $data) {
        $ch = curl_init();
        
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'X-API-Key: ' . $this->apiKey
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return json_decode($response, true);
    }
}

// Usage example
$auth = new PhantomAuth('your_api_key_here');

// Login example
$result = $auth->login('johndoe', 'password123');
if ($result['success']) {
    echo "Login successful! User ID: " . $result['user_id'];
} else {
    echo "Login failed: " . $result['message'];
}

// Register example
$result = $auth->register('newuser', 'user@example.com', 'password123', '2024-12-31T23:59:59Z');
if ($result['success']) {
    echo "Registration successful! User ID: " . $result['user_id'];
} else {
    echo "Registration failed: " . $result['message'];
}

?>`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <pre className="text-sm overflow-x-auto">
{`<?php

class PhantomAuth {
    private $apiKey;
    private $baseUrl;

    public function __construct($apiKey, $baseUrl = "${window.location.origin}/api/v1") {
        $this->apiKey = $apiKey;
        $this->baseUrl = $baseUrl;
    }

    public function login($username, $password) {
        $url = $this->baseUrl . '/login';
        $data = [
            'username' => $username,
            'password' => $password
        ];

        return $this->makeRequest($url, $data);
    }

    public function register($username, $email, $password, $expiresAt = null) {
        $url = $this->baseUrl . '/register';
        $data = [
            'username' => $username,
            'email' => $email,
            'password' => $password
        ];

        if ($expiresAt) {
            $data['expiresAt'] = $expiresAt;
        }

        return $this->makeRequest($url, $data);
    }

    public function verify($userId) {
        $url = $this->baseUrl . '/verify';
        $data = ['user_id' => $userId];

        return $this->makeRequest($url, $data);
    }

    private function makeRequest($url, $data) {
        $ch = curl_init();
        
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'X-API-Key: ' . $this->apiKey
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return json_decode($response, true);
    }
}

// Usage example
$auth = new PhantomAuth('your_api_key_here');

// Login example
$result = $auth->login('johndoe', 'password123');
if ($result['success']) {
    echo "Login successful! User ID: " . $result['user_id'];
} else {
    echo "Login failed: " . $result['message'];
}

// Register example
$result = $auth->register('newuser', 'user@example.com', 'password123', '2024-12-31T23:59:59Z');
if ($result['success']) {
    echo "Registration successful! User ID: " . $result['user_id'];
} else {
    echo "Registration failed: " . $result['message'];
}

?>`}
                    </pre>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Security Best Practices */}
        <Card className="phantom-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="h-5 w-5 phantom-text mr-2" />
              Security Best Practices
            </CardTitle>
            <CardDescription>
              Important security considerations when using Phantom Auth
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">🔐 Keep Your API Key Secure</h4>
                <p className="text-muted-foreground">Never expose your API key in client-side code. Store it securely on your server.</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">⏰ Set User Expiration Times</h4>
                <p className="text-muted-foreground">Use the expiresAt parameter to set time limits on user accounts for enhanced security.</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">🔄 Verify User Sessions</h4>
                <p className="text-muted-foreground">Regularly verify user sessions using the /verify endpoint to ensure accounts are still valid.</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">🚦 Handle Errors Gracefully</h4>
                <p className="text-muted-foreground">Always check the success field in API responses and handle errors appropriately.</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">🔒 Use HTTPS</h4>
                <p className="text-muted-foreground">Always use HTTPS when making API requests to protect data in transit.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}