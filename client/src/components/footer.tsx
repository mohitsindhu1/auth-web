import { Shield, Github, Twitter, MessageCircle, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-white py-12" itemScope itemType="https://schema.org/Organization">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Shield className="h-8 w-8 text-primary mr-2" aria-hidden="true" />
              <span className="text-xl font-bold" itemProp="name">PHANTOM AUTH</span>
            </div>
            <p className="text-gray-400 mb-4" itemProp="description">
              Leading enterprise multi-tenant authentication system. Secure, scalable, and developer-friendly 
              authentication solution for modern applications and SaaS platforms.
            </p>
            <div className="flex space-x-4">
              <a href="https://twitter.com/phantomauth" className="text-gray-400 hover:text-white" aria-label="Twitter" itemProp="sameAs">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://github.com/phantomauth" className="text-gray-400 hover:text-white" aria-label="GitHub" itemProp="sameAs">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://discord.gg/phantomauth" className="text-gray-400 hover:text-white" aria-label="Discord Community">
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Authentication Solutions</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#features" className="hover:text-white">Multi-Tenant Authentication</a></li>
              <li><Link href="/docs" className="hover:text-white">API Documentation</Link></li>
              <li><a href="#integration" className="hover:text-white">Integration Guide</a></li>
              <li><a href="#security" className="hover:text-white">Security Features</a></li>
              <li><a href="#pricing" className="hover:text-white">Enterprise Pricing</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Developer Resources</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/integration" className="hover:text-white">Code Examples</Link></li>
              <li><a href="/api-reference" className="hover:text-white">REST API Reference</a></li>
              <li><a href="/sdk" className="hover:text-white">SDK Downloads</a></li>
              <li><a href="/status" className="hover:text-white">Service Status</a></li>
              <li><a href="/changelog" className="hover:text-white">Changelog</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Support & Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <a href="mailto:support@phantomauth.com" className="hover:text-white" itemProp="email">
                  support@phantomauth.com
                </a>
              </li>
              <li className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <a href="tel:+1-800-PHANTOM" className="hover:text-white" itemProp="telephone">
                  +1-800-PHANTOM
                </a>
              </li>
              <li className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span itemProp="address">Enterprise Support 24/7</span>
              </li>
            </ul>
            
            <div className="mt-4">
              <h5 className="text-sm font-semibold mb-2">Legal</h5>
              <ul className="space-y-1 text-sm text-gray-400">
                <li><a href="/privacy" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-white">Terms of Service</a></li>
                <li><a href="/security" className="hover:text-white">Security Policy</a></li>
                <li><a href="/gdpr" className="hover:text-white">GDPR Compliance</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* SEO Keywords Footer */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <h5 className="text-sm font-semibold mb-2">Popular Keywords</h5>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-gray-700 px-2 py-1 rounded">multi-tenant authentication</span>
                <span className="bg-gray-700 px-2 py-1 rounded">enterprise security</span>
                <span className="bg-gray-700 px-2 py-1 rounded">API authentication</span>
                <span className="bg-gray-700 px-2 py-1 rounded">SaaS authentication</span>
                <span className="bg-gray-700 px-2 py-1 rounded">Google OAuth</span>
                <span className="bg-gray-700 px-2 py-1 rounded">user management</span>
              </div>
            </div>
            <div>
              <h5 className="text-sm font-semibold mb-2">Industries We Serve</h5>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-gray-700 px-2 py-1 rounded">Financial Services</span>
                <span className="bg-gray-700 px-2 py-1 rounded">Healthcare</span>
                <span className="bg-gray-700 px-2 py-1 rounded">Government</span>
                <span className="bg-gray-700 px-2 py-1 rounded">Education</span>
                <span className="bg-gray-700 px-2 py-1 rounded">Technology</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-4 pt-4 text-center text-gray-400">
          <p>&copy; 2025 PHANTOM AUTH. All rights reserved. | Professional Multi-Tenant Authentication System</p>
          <p className="text-xs mt-2">
            Enterprise-grade authentication • Multi-tenant architecture • API security • Real-time monitoring • 24/7 support
          </p>
        </div>
      </div>
    </footer>
  );
}
