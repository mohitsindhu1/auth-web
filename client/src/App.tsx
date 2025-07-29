import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import AppManagement from "@/pages/app-management";
import Documentation from "@/pages/documentation";
import Webhooks from "@/pages/webhooks";
import Blacklist from "@/pages/blacklist";
import ActivityLogs from "@/pages/activity-logs";
import IntegrationExamples from "@/pages/integration-examples-new";
import CodeEditor from "@/pages/code-editor";
import UserManagement from "@/pages/user-management";
import LicenseKeys from "@/pages/license-keys";
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/app/:id" component={AppManagement} />
          <Route path="/app/:id/licenses" component={LicenseKeys} />
          <Route path="/webhooks" component={Webhooks} />
          <Route path="/blacklist" component={Blacklist} />
          <Route path="/activity-logs" component={ActivityLogs} />
          <Route path="/integration" component={IntegrationExamples} />
          <Route path="/docs" component={Documentation} />
          <Route path="/code-editor" component={CodeEditor} />
          <Route path="/user-management" component={UserManagement} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
