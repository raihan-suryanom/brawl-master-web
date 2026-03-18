"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminPasswordGate() {
  const API_BASE_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:7239/api";
  
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check if already authenticated on mount
  useEffect(() => {
    const savedPassword = sessionStorage.getItem("adminPassword");
    if (savedPassword) {
      validatePassword(savedPassword, true);
    } else {
      setIsChecking(false);
    }
  }, []);

  const validatePassword = async (pwd: string, silent = false) => {
    if (!silent) setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/admin/auth/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: pwd }),
      });

      const data = await response.json();

      if (data.valid) {
        sessionStorage.setItem("adminPassword", pwd);
        setIsAuthenticated(true);
        // Hide password form, show content
        const passwordForm = document.getElementById('admin-password-form');
        const adminContent = document.getElementById('admin-content');
        if (passwordForm) passwordForm.style.display = 'none';
        if (adminContent) adminContent.style.display = 'block';
      } else {
        setError(data.message || "Invalid password");
        sessionStorage.removeItem("adminPassword");
        setIsAuthenticated(false);
      }
    } catch (err) {
      setError("Failed to validate password");
      sessionStorage.removeItem("adminPassword");
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
      setIsChecking(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      validatePassword(password);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminPassword");
    setIsAuthenticated(false);
    setPassword("");
    setError("");
    // Show password form, hide content
    const passwordForm = document.getElementById('admin-password-form');
    const adminContent = document.getElementById('admin-content');
    if (passwordForm) passwordForm.style.display = 'block';
    if (adminContent) adminContent.style.display = 'none';
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Checking authentication...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div id="admin-password-form" className="max-w-md mx-auto mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Admin Authentication Required</CardTitle>
            <CardDescription>
              Enter the admin password to access admin functions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Admin Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                  placeholder="Enter password"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
              {error && (
                <div className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={isLoading || !password.trim()}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Validating..." : "Unlock Admin Panel"}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Authenticated - show logout button
  return (
    <div className="flex justify-end mb-4">
      <button
        onClick={handleLogout}
        className="px-4 py-2 text-sm border rounded-lg hover:bg-accent"
      >
        🔒 Lock Admin Panel
      </button>
    </div>
  );
}