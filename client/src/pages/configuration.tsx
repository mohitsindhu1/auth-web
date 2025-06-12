import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Edit3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";

interface Application {
  id: number;
  name: string;
  apiKey: string;
  loginSuccessMessage: string;
  loginFailedMessage: string;
  accountDisabledMessage: string;
  accountExpiredMessage: string;
  versionMismatchMessage: string;
  hwidMismatchMessage: string;
}

interface CodeTemplate {
  language: string;
  title: string;
  description: string;
  code: string;
  filename: string;
}

export default function Configuration() {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [baseUrl, setBaseUrl] = useState("");
  const [editingCode, setEditingCode] = useState<{[key: string]: string}>({});
  const { toast } = useToast();

  const { data: applications = [] } = useQuery({
    queryKey: ["/api/applications"],
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const generateCodeTemplates = (app: Application): CodeTemplate[] => [
    {
      language: "csharp",
      title: "C# WinForms Implementation",
      description: "Complete C# authentication client with session management",
      filename: "AuthClient.cs",
      code: `using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Management;
using System.Security.Cryptography;
using Newtonsoft.Json;

public class AuthClient
{
    private readonly string _apiKey = "${app.apiKey}";
    private readonly string _baseUrl = "${baseUrl}/api";
    private readonly HttpClient _httpClient;
    private string _sessionToken;
    private string _hwid;

    public AuthClient()
    {
        _httpClient = new HttpClient();
        _hwid = GetHardwareId();
    }

    public class AuthResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public string UserId { get; set; }
        public string SessionToken { get; set; }
        public UserData User { get; set; }
    }

    public class UserData
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public bool IsActive { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public string Hwid { get; set; }
    }

    private string GetHardwareId()
    {
        try
        {
            string cpuId = "";
            string mbId = "";
            
            ManagementObjectSearcher cpuSearcher = new ManagementObjectSearcher("SELECT ProcessorId FROM Win32_Processor");
            foreach (ManagementObject cpu in cpuSearcher.Get())
            {
                cpuId = cpu["ProcessorId"]?.ToString() ?? "";
                break;
            }

            ManagementObjectSearcher mbSearcher = new ManagementObjectSearcher("SELECT SerialNumber FROM Win32_BaseBoard");
            foreach (ManagementObject mb in mbSearcher.Get())
            {
                mbId = mb["SerialNumber"]?.ToString() ?? "";
                break;
            }

            string combined = cpuId + mbId;
            using (SHA256 sha256 = SHA256.Create())
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

    public async Task<AuthResponse> LoginAsync(string username, string password, string version = "1.0.0")
    {
        try
        {
            var loginData = new
            {
                username = username,
                password = password,
                hwid = _hwid,
                version = version,
                ip_address = await GetPublicIpAsync(),
                user_agent = "C# AuthClient/1.0"
            };

            var json = JsonConvert.SerializeObject(loginData);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            
            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("X-API-Key", _apiKey);

            var response = await _httpClient.PostAsync($"{_baseUrl}/auth/login", content);
            var responseContent = await response.Content.ReadAsStringAsync();
            
            var authResponse = JsonConvert.DeserializeObject<AuthResponse>(responseContent);
            
            if (authResponse.Success && !string.IsNullOrEmpty(authResponse.SessionToken))
            {
                _sessionToken = authResponse.SessionToken;
            }

            return authResponse;
        }
        catch (Exception ex)
        {
            return new AuthResponse 
            { 
                Success = false, 
                Message = "Connection error: " + ex.Message 
            };
        }
    }

    public async Task<AuthResponse> RegisterAsync(string username, string password, string email, string version = "1.0.0")
    {
        try
        {
            var registerData = new
            {
                username = username,
                password = password,
                email = email,
                hwid = _hwid,
                version = version,
                ip_address = await GetPublicIpAsync(),
                user_agent = "C# AuthClient/1.0"
            };

            var json = JsonConvert.SerializeObject(registerData);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            
            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("X-API-Key", _apiKey);

            var response = await _httpClient.PostAsync($"{_baseUrl}/auth/register", content);
            var responseContent = await response.Content.ReadAsStringAsync();
            
            return JsonConvert.DeserializeObject<AuthResponse>(responseContent);
        }
        catch (Exception ex)
        {
            return new AuthResponse 
            { 
                Success = false, 
                Message = "Connection error: " + ex.Message 
            };
        }
    }

    public async Task<bool> VerifySessionAsync()
    {
        if (string.IsNullOrEmpty(_sessionToken)) return false;

        try
        {
            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("X-API-Key", _apiKey);
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_sessionToken}");

            var response = await _httpClient.GetAsync($"{_baseUrl}/auth/verify");
            var responseContent = await response.Content.ReadAsStringAsync();
            var authResponse = JsonConvert.DeserializeObject<AuthResponse>(responseContent);

            return authResponse.Success;
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> LogoutAsync()
    {
        if (string.IsNullOrEmpty(_sessionToken)) return true;

        try
        {
            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("X-API-Key", _apiKey);
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_sessionToken}");

            var response = await _httpClient.PostAsync($"{_baseUrl}/auth/logout", null);
            var responseContent = await response.Content.ReadAsStringAsync();
            var authResponse = JsonConvert.DeserializeObject<AuthResponse>(responseContent);

            if (authResponse.Success)
            {
                _sessionToken = null;
            }

            return authResponse.Success;
        }
        catch
        {
            return false;
        }
    }

    private async Task<string> GetPublicIpAsync()
    {
        try
        {
            var response = await _httpClient.GetStringAsync("https://api.ipify.org");
            return response.Trim();
        }
        catch
        {
            return "127.0.0.1";
        }
    }

    public void Dispose()
    {
        _httpClient?.Dispose();
    }
}

// Example Usage:
/*
public partial class LoginForm : Form
{
    private AuthClient authClient;

    public LoginForm()
    {
        InitializeComponent();
        authClient = new AuthClient();
    }

    private async void btnLogin_Click(object sender, EventArgs e)
    {
        var result = await authClient.LoginAsync(txtUsername.Text, txtPassword.Text);
        
        if (result.Success)
        {
            MessageBox.Show("${app.loginSuccessMessage}");
            // Open main application form
        }
        else
        {
            MessageBox.Show(result.Message);
        }
    }

    private async void btnRegister_Click(object sender, EventArgs e)
    {
        var result = await authClient.RegisterAsync(txtUsername.Text, txtPassword.Text, txtEmail.Text);
        MessageBox.Show(result.Message);
    }
}
*/`
    },
    {
      language: "python",
      title: "Python Implementation",
      description: "Python authentication client with session management",
      filename: "auth_client.py",
      code: `import requests
import hashlib
import platform
import uuid
import json
from typing import Optional, Dict, Any

class AuthClient:
    def __init__(self):
        self.api_key = "${app.apiKey}"
        self.base_url = "${baseUrl}/api"
        self.session_token = None
        self.hwid = self._get_hardware_id()
        self.session = requests.Session()

    def _get_hardware_id(self) -> str:
        """Generate unique hardware ID"""
        try:
            # Get system information
            system_info = {
                'platform': platform.platform(),
                'processor': platform.processor(),
                'machine': platform.machine(),
                'node': platform.node(),
                'mac': hex(uuid.getnode())
            }
            
            # Create hash from system info
            info_string = json.dumps(system_info, sort_keys=True)
            return hashlib.sha256(info_string.encode()).hexdigest()
        except:
            return hashlib.sha256(f"{platform.node()}{uuid.getnode()}".encode()).hexdigest()

    def _get_public_ip(self) -> str:
        """Get public IP address"""
        try:
            response = requests.get('https://api.ipify.org', timeout=5)
            return response.text.strip()
        except:
            return '127.0.0.1'

    def login(self, username: str, password: str, version: str = "1.0.0") -> Dict[str, Any]:
        """Authenticate user with username and password"""
        try:
            login_data = {
                "username": username,
                "password": password,
                "hwid": self.hwid,
                "version": version,
                "ip_address": self._get_public_ip(),
                "user_agent": "Python AuthClient/1.0"
            }

            headers = {
                "X-API-Key": self.api_key,
                "Content-Type": "application/json"
            }

            response = self.session.post(
                f"{self.base_url}/auth/login",
                json=login_data,
                headers=headers,
                timeout=10
            )

            result = response.json()
            
            if result.get('success') and result.get('session_token'):
                self.session_token = result['session_token']
                
            return result

        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "message": f"Connection error: {str(e)}"
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error: {str(e)}"
            }

    def register(self, username: str, password: str, email: str, version: str = "1.0.0") -> Dict[str, Any]:
        """Register new user"""
        try:
            register_data = {
                "username": username,
                "password": password,
                "email": email,
                "hwid": self.hwid,
                "version": version,
                "ip_address": self._get_public_ip(),
                "user_agent": "Python AuthClient/1.0"
            }

            headers = {
                "X-API-Key": self.api_key,
                "Content-Type": "application/json"
            }

            response = self.session.post(
                f"{self.base_url}/auth/register",
                json=register_data,
                headers=headers,
                timeout=10
            )

            return response.json()

        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "message": f"Connection error: {str(e)}"
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error: {str(e)}"
            }

    def verify_session(self) -> bool:
        """Verify current session token"""
        if not self.session_token:
            return False

        try:
            headers = {
                "X-API-Key": self.api_key,
                "Authorization": f"Bearer {self.session_token}"
            }

            response = self.session.get(
                f"{self.base_url}/auth/verify",
                headers=headers,
                timeout=10
            )

            result = response.json()
            return result.get('success', False)

        except:
            return False

    def logout(self) -> bool:
        """Logout and end session"""
        if not self.session_token:
            return True

        try:
            headers = {
                "X-API-Key": self.api_key,
                "Authorization": f"Bearer {self.session_token}"
            }

            response = self.session.post(
                f"{self.base_url}/auth/logout",
                headers=headers,
                timeout=10
            )

            result = response.json()
            
            if result.get('success'):
                self.session_token = None
                
            return result.get('success', False)

        except:
            return False

    def get_user_info(self) -> Optional[Dict[str, Any]]:
        """Get current user information"""
        if not self.session_token:
            return None

        try:
            headers = {
                "X-API-Key": self.api_key,
                "Authorization": f"Bearer {self.session_token}"
            }

            response = self.session.get(
                f"{self.base_url}/auth/user",
                headers=headers,
                timeout=10
            )

            result = response.json()
            return result.get('user') if result.get('success') else None

        except:
            return None

# Example Usage:
if __name__ == "__main__":
    # Initialize auth client
    auth = AuthClient()
    
    # Login example
    username = input("Username: ")
    password = input("Password: ")
    
    result = auth.login(username, password)
    
    if result['success']:
        print("${app.loginSuccessMessage}")
        
        # Verify session
        if auth.verify_session():
            print("Session is valid")
            
            # Get user info
            user_info = auth.get_user_info()
            if user_info:
                print(f"Welcome, {user_info['username']}!")
        
        # Logout
        auth.logout()
        print("Logged out successfully")
    else:
        print(f"Login failed: {result['message']}")
`
    },
    {
      language: "nodejs",
      title: "Node.js Implementation",
      description: "Node.js authentication client with session management",
      filename: "auth-client.js",
      code: `const axios = require('axios');
const crypto = require('crypto');
const os = require('os');

class AuthClient {
    constructor() {
        this.apiKey = '${app.apiKey}';
        this.baseUrl = '${baseUrl}/api';
        this.sessionToken = null;
        this.hwid = this._getHardwareId();
        
        // Create axios instance with default config
        this.client = axios.create({
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    _getHardwareId() {
        try {
            const systemInfo = {
                platform: os.platform(),
                arch: os.arch(),
                hostname: os.hostname(),
                cpus: os.cpus()[0]?.model || 'unknown',
                totalmem: os.totalmem(),
                networkInterfaces: Object.keys(os.networkInterfaces())
            };

            const infoString = JSON.stringify(systemInfo);
            return crypto.createHash('sha256').update(infoString).digest('hex');
        } catch (error) {
            return crypto.createHash('sha256').update(os.hostname() + os.userInfo().username).digest('hex');
        }
    }

    async _getPublicIp() {
        try {
            const response = await axios.get('https://api.ipify.org', { timeout: 5000 });
            return response.data.trim();
        } catch (error) {
            return '127.0.0.1';
        }
    }

    async login(username, password, version = '1.0.0') {
        try {
            const loginData = {
                username,
                password,
                hwid: this.hwid,
                version,
                ip_address: await this._getPublicIp(),
                user_agent: 'Node.js AuthClient/1.0'
            };

            const response = await this.client.post('/auth/login', loginData, {
                headers: {
                    'X-API-Key': this.apiKey
                }
            });

            const result = response.data;

            if (result.success && result.session_token) {
                this.sessionToken = result.session_token;
            }

            return result;

        } catch (error) {
            if (error.response) {
                return error.response.data;
            }
            return {
                success: false,
                message: \`Connection error: \${error.message}\`
            };
        }
    }

    async register(username, password, email, version = '1.0.0') {
        try {
            const registerData = {
                username,
                password,
                email,
                hwid: this.hwid,
                version,
                ip_address: await this._getPublicIp(),
                user_agent: 'Node.js AuthClient/1.0'
            };

            const response = await this.client.post('/auth/register', registerData, {
                headers: {
                    'X-API-Key': this.apiKey
                }
            });

            return response.data;

        } catch (error) {
            if (error.response) {
                return error.response.data;
            }
            return {
                success: false,
                message: \`Connection error: \${error.message}\`
            };
        }
    }

    async verifySession() {
        if (!this.sessionToken) {
            return false;
        }

        try {
            const response = await this.client.get('/auth/verify', {
                headers: {
                    'X-API-Key': this.apiKey,
                    'Authorization': \`Bearer \${this.sessionToken}\`
                }
            });

            return response.data.success;

        } catch (error) {
            return false;
        }
    }

    async logout() {
        if (!this.sessionToken) {
            return true;
        }

        try {
            const response = await this.client.post('/auth/logout', {}, {
                headers: {
                    'X-API-Key': this.apiKey,
                    'Authorization': \`Bearer \${this.sessionToken}\`
                }
            });

            const result = response.data;

            if (result.success) {
                this.sessionToken = null;
            }

            return result.success;

        } catch (error) {
            return false;
        }
    }

    async getUserInfo() {
        if (!this.sessionToken) {
            return null;
        }

        try {
            const response = await this.client.get('/auth/user', {
                headers: {
                    'X-API-Key': this.apiKey,
                    'Authorization': \`Bearer \${this.sessionToken}\`
                }
            });

            const result = response.data;
            return result.success ? result.user : null;

        } catch (error) {
            return null;
        }
    }
}

module.exports = AuthClient;

// Example Usage:
/*
const AuthClient = require('./auth-client');

async function main() {
    const auth = new AuthClient();
    
    // Login example
    const result = await auth.login('username', 'password');
    
    if (result.success) {
        console.log('${app.loginSuccessMessage}');
        
        // Verify session
        const isValid = await auth.verifySession();
        if (isValid) {
            console.log('Session is valid');
            
            // Get user info
            const userInfo = await auth.getUserInfo();
            if (userInfo) {
                console.log(\`Welcome, \${userInfo.username}!\`);
            }
        }
        
        // Logout
        await auth.logout();
        console.log('Logged out successfully');
    } else {
        console.log(\`Login failed: \${result.message}\`);
    }
}

main().catch(console.error);
*/`
    },
    {
      language: "cpp",
      title: "C++ Implementation",
      description: "C++ authentication client with CURL and JSON support",
      filename: "auth_client.cpp",
      code: `#include <iostream>
#include <string>
#include <curl/curl.h>
#include <json/json.h>
#include <openssl/sha.h>
#include <openssl/evp.h>
#include <sstream>
#include <iomanip>
#include <fstream>

#ifdef _WIN32
#include <windows.h>
#include <wbemidl.h>
#include <comdef.h>
#pragma comment(lib, "wbemuuid.lib")
#else
#include <sys/utsname.h>
#include <unistd.h>
#endif

class AuthClient {
private:
    std::string apiKey;
    std::string baseUrl;
    std::string sessionToken;
    std::string hwid;
    
    struct HTTPResponse {
        std::string data;
        long status_code;
    };

    static size_t WriteCallback(void* contents, size_t size, size_t nmemb, HTTPResponse* response) {
        size_t totalSize = size * nmemb;
        response->data.append(static_cast<char*>(contents), totalSize);
        return totalSize;
    }

    std::string getHardwareId() {
        std::string systemInfo;
        
#ifdef _WIN32
        // Windows implementation
        HKEY hKey;
        char buffer[256];
        DWORD bufferSize = sizeof(buffer);
        
        if (RegOpenKeyEx(HKEY_LOCAL_MACHINE, 
            "HARDWARE\\\\DESCRIPTION\\\\System\\\\CentralProcessor\\\\0", 
            0, KEY_READ, &hKey) == ERROR_SUCCESS) {
            
            if (RegQueryValueEx(hKey, "ProcessorNameString", NULL, NULL, 
                (LPBYTE)buffer, &bufferSize) == ERROR_SUCCESS) {
                systemInfo += buffer;
            }
            RegCloseKey(hKey);
        }
        
        char computerName[MAX_COMPUTERNAME_LENGTH + 1];
        DWORD size = sizeof(computerName);
        if (GetComputerName(computerName, &size)) {
            systemInfo += computerName;
        }
#else
        // Linux/Unix implementation
        struct utsname unameData;
        if (uname(&unameData) == 0) {
            systemInfo += unameData.sysname;
            systemInfo += unameData.machine;
            systemInfo += unameData.nodename;
        }
        
        char hostname[256];
        if (gethostname(hostname, sizeof(hostname)) == 0) {
            systemInfo += hostname;
        }
#endif

        // Generate SHA256 hash
        unsigned char hash[SHA256_DIGEST_LENGTH];
        SHA256_CTX sha256;
        SHA256_Init(&sha256);
        SHA256_Update(&sha256, systemInfo.c_str(), systemInfo.length());
        SHA256_Final(hash, &sha256);

        std::stringstream ss;
        for (int i = 0; i < SHA256_DIGEST_LENGTH; i++) {
            ss << std::hex << std::setw(2) << std::setfill('0') << static_cast<int>(hash[i]);
        }
        
        return ss.str();
    }

    std::string getPublicIp() {
        CURL* curl;
        HTTPResponse response;
        
        curl = curl_easy_init();
        if (curl) {
            curl_easy_setopt(curl, CURLOPT_URL, "https://api.ipify.org");
            curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
            curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response);
            curl_easy_setopt(curl, CURLOPT_TIMEOUT, 5L);
            
            CURLcode res = curl_easy_perform(curl);
            curl_easy_cleanup(curl);
            
            if (res == CURLE_OK) {
                return response.data;
            }
        }
        
        return "127.0.0.1";
    }

    HTTPResponse makeRequest(const std::string& url, const std::string& method, 
                           const std::string& postData = "", 
                           const std::vector<std::string>& headers = {}) {
        CURL* curl;
        HTTPResponse response;
        
        curl = curl_easy_init();
        if (curl) {
            curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
            curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, WriteCallback);
            curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response);
            curl_easy_setopt(curl, CURLOPT_TIMEOUT, 10L);
            
            struct curl_slist* headerList = nullptr;
            
            // Add default headers
            headerList = curl_slist_append(headerList, "Content-Type: application/json");
            headerList = curl_slist_append(headerList, ("X-API-Key: " + apiKey).c_str());
            
            // Add custom headers
            for (const auto& header : headers) {
                headerList = curl_slist_append(headerList, header.c_str());
            }
            
            curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headerList);
            
            if (method == "POST") {
                curl_easy_setopt(curl, CURLOPT_POSTFIELDS, postData.c_str());
            }
            
            CURLcode res = curl_easy_perform(curl);
            
            if (res == CURLE_OK) {
                curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &response.status_code);
            }
            
            curl_slist_free_all(headerList);
            curl_easy_cleanup(curl);
        }
        
        return response;
    }

public:
    AuthClient() {
        apiKey = "${app.apiKey}";
        baseUrl = "${baseUrl}/api";
        hwid = getHardwareId();
        curl_global_init(CURL_GLOBAL_DEFAULT);
    }

    ~AuthClient() {
        curl_global_cleanup();
    }

    Json::Value login(const std::string& username, const std::string& password, 
                     const std::string& version = "1.0.0") {
        Json::Value loginData;
        loginData["username"] = username;
        loginData["password"] = password;
        loginData["hwid"] = hwid;
        loginData["version"] = version;
        loginData["ip_address"] = getPublicIp();
        loginData["user_agent"] = "C++ AuthClient/1.0";

        Json::StreamWriterBuilder builder;
        std::string jsonString = Json::writeString(builder, loginData);

        HTTPResponse response = makeRequest(baseUrl + "/auth/login", "POST", jsonString);

        Json::Value result;
        Json::Reader reader;
        
        if (reader.parse(response.data, result)) {
            if (result["success"].asBool() && !result["session_token"].asString().empty()) {
                sessionToken = result["session_token"].asString();
            }
        } else {
            result["success"] = false;
            result["message"] = "Failed to parse response";
        }

        return result;
    }

    Json::Value registerUser(const std::string& username, const std::string& password, 
                           const std::string& email, const std::string& version = "1.0.0") {
        Json::Value registerData;
        registerData["username"] = username;
        registerData["password"] = password;
        registerData["email"] = email;
        registerData["hwid"] = hwid;
        registerData["version"] = version;
        registerData["ip_address"] = getPublicIp();
        registerData["user_agent"] = "C++ AuthClient/1.0";

        Json::StreamWriterBuilder builder;
        std::string jsonString = Json::writeString(builder, registerData);

        HTTPResponse response = makeRequest(baseUrl + "/auth/register", "POST", jsonString);

        Json::Value result;
        Json::Reader reader;
        
        if (!reader.parse(response.data, result)) {
            result["success"] = false;
            result["message"] = "Failed to parse response";
        }

        return result;
    }

    bool verifySession() {
        if (sessionToken.empty()) {
            return false;
        }

        std::vector<std::string> headers = {
            "Authorization: Bearer " + sessionToken
        };

        HTTPResponse response = makeRequest(baseUrl + "/auth/verify", "GET", "", headers);

        Json::Value result;
        Json::Reader reader;
        
        if (reader.parse(response.data, result)) {
            return result["success"].asBool();
        }

        return false;
    }

    bool logout() {
        if (sessionToken.empty()) {
            return true;
        }

        std::vector<std::string> headers = {
            "Authorization: Bearer " + sessionToken
        };

        HTTPResponse response = makeRequest(baseUrl + "/auth/logout", "POST", "", headers);

        Json::Value result;
        Json::Reader reader;
        
        if (reader.parse(response.data, result)) {
            if (result["success"].asBool()) {
                sessionToken.clear();
                return true;
            }
        }

        return false;
    }

    Json::Value getUserInfo() {
        if (sessionToken.empty()) {
            Json::Value result;
            result["success"] = false;
            result["message"] = "No active session";
            return result;
        }

        std::vector<std::string> headers = {
            "Authorization: Bearer " + sessionToken
        };

        HTTPResponse response = makeRequest(baseUrl + "/auth/user", "GET", "", headers);

        Json::Value result;
        Json::Reader reader;
        
        if (!reader.parse(response.data, result)) {
            result["success"] = false;
            result["message"] = "Failed to parse response";
        }

        return result;
    }
};

// Example Usage:
/*
int main() {
    AuthClient auth;
    
    std::string username, password;
    std::cout << "Username: ";
    std::cin >> username;
    std::cout << "Password: ";
    std::cin >> password;
    
    Json::Value result = auth.login(username, password);
    
    if (result["success"].asBool()) {
        std::cout << "${app.loginSuccessMessage}" << std::endl;
        
        // Verify session
        if (auth.verifySession()) {
            std::cout << "Session is valid" << std::endl;
            
            // Get user info
            Json::Value userInfo = auth.getUserInfo();
            if (userInfo["success"].asBool()) {
                std::cout << "Welcome, " << userInfo["user"]["username"].asString() << "!" << std::endl;
            }
        }
        
        // Logout
        auth.logout();
        std::cout << "Logged out successfully" << std::endl;
    } else {
        std::cout << "Login failed: " << result["message"].asString() << std::endl;
    }
    
    return 0;
}

// Compilation instructions:
// Linux: g++ -std=c++11 auth_client.cpp -lcurl -ljsoncpp -lssl -lcrypto -o auth_client
// Windows: Use vcpkg to install curl, jsoncpp, openssl, then compile with MSVC
*/`
    }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
  };

  const downloadCode = (code: string, filename: string) => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: `${filename} has been downloaded`,
    });
  };

  const updateCustomCode = async (language: string, code: string) => {
    try {
      // For now, just update local state since we don't have backend API yet
      setEditingCode({
        ...editingCode,
        [language]: code
      });
      
      toast({
        title: "Code Updated",
        description: "Custom code template saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save custom code template",
        variant: "destructive",
      });
    }
  };

  if (!Array.isArray(applications) || applications.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>No applications found. Create an application first.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const codeTemplates = selectedApp ? generateCodeTemplates(selectedApp) : [];

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>
            Select your application to get customized integration code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Select Application</label>
            <Select onValueChange={(value) => {
              const app = Array.isArray(applications) ? applications.find((a: Application) => a.id.toString() === value) : null;
              setSelectedApp(app || null);
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose your application" />
              </SelectTrigger>
              <SelectContent>
                {applications.map((app: Application) => (
                  <SelectItem key={app.id} value={app.id.toString()}>
                    {app.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedApp && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <label className="text-sm font-medium text-muted-foreground">API Key</label>
                <div className="font-mono text-sm break-all bg-background p-2 rounded border">
                  {selectedApp.apiKey}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Base URL</label>
                <div className="font-mono text-sm break-all bg-background p-2 rounded border">
                  {baseUrl}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedApp && (
        <Card>
          <CardHeader>
            <CardTitle>Integration Code</CardTitle>
            <CardDescription>
              Ready-to-use authentication clients for different programming languages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="csharp" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="csharp">C# WinForms</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="nodejs">Node.js</TabsTrigger>
                <TabsTrigger value="cpp">C++</TabsTrigger>
              </TabsList>

              {codeTemplates.map((template) => (
                <TabsContent key={template.language} value={template.language} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{template.title}</h3>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh]">
                          <DialogHeader>
                            <DialogTitle>Edit {template.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Textarea
                              value={editingCode[template.language] || template.code}
                              onChange={(e) => setEditingCode({
                                ...editingCode,
                                [template.language]: e.target.value
                              })}
                              className="min-h-[400px] font-mono text-sm"
                            />
                            <div className="flex justify-end gap-2">
                              <Button
                                onClick={() => updateCustomCode(template.language, editingCode[template.language] || template.code)}
                              >
                                Save Changes
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(template.code)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadCode(template.code, template.filename)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>

                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-sm">
                      <code>{template.code}</code>
                    </pre>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Authentication</Badge>
                    <Badge variant="secondary">Session Management</Badge>
                    <Badge variant="secondary">HWID Protection</Badge>
                    <Badge variant="secondary">Error Handling</Badge>
                    {template.language === "csharp" && <Badge variant="secondary">WinForms Ready</Badge>}
                    {template.language === "cpp" && <Badge variant="secondary">Cross Platform</Badge>}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}