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
    private const string API_BASE = "https://your-api-domain.com/api";
    private const string API_KEY = "your_api_key_here";

    public async Task<bool> LoginUser(string username, string password)
    {
        var loginData = new
        {
            username = username,
            password = password,
            api_key = API_KEY
        };

        var json = JsonConvert.SerializeObject(loginData);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        try
        {
            var response = await client.PostAsync($"{API_BASE}/auth/login", content);
            var responseString = await response.Content.ReadAsStringAsync();
            var result = JsonConvert.DeserializeObject<AuthResponse>(responseString);
            
            return result.Success;
        }
        catch (Exception ex)
        {
            // Handle error
            return false;
        }
    }
}

public class AuthResponse
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public string UserId { get; set; }
    public string SessionToken { get; set; }
}

// Usage in your WinForm:
private async void btnLogin_Click(object sender, EventArgs e)
{
    var authService = new AuthService();
    bool loginSuccess = await authService.LoginUser(txtUsername.Text, txtPassword.Text);
    
    if (loginSuccess)
    {
        MessageBox.Show("Login successful!");
        // Proceed to next form/step
    }
    else
    {
        MessageBox.Show("Invalid credentials!");
    }
}`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
