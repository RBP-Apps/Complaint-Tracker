"use client"  

import { useState, useEffect } from "react";
import { Clipboard, Info } from "react-feather";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Using your existing AppScript URL
      const scriptUrl = 'https://script.google.com/macros/s/AKfycbzkBpcYMupYQi6gSURT_tqDfeQrGtbS6DwiRvmjw0s2kAIGmHlkjnVJDddXOy0v6ur7rw/exec';
      
      // Direct authentication from the Login sheet without modifying your app script
      try {
        // Fetch the Google Sheet data for validation
        const sheetUrl = "https://docs.google.com/spreadsheets/d/1Vn295WmY0o6qh03rYzpCISGfMgT5RViXdYyd_ZNQ2p8/gviz/tq?tqx=out:json&sheet=Login";
        const response = await fetch(sheetUrl);
        const text = await response.text();
        
        // Google Sheets API returns a JSON-like string that needs parsing
        // This format is specific to the /gviz/tq endpoint
        const jsonData = JSON.parse(text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1));
        const rows = jsonData.table.rows;
        
        // Check for matching credentials
        let authenticated = false;
        let userPermission = "";
        
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i].c;
          const rowUsername = row && row[0]?.v || "";
          const rowPassword = row && row[1]?.v || "";
          const rowPermission = row && row[2]?.v || "";
          
          if (rowUsername === username && rowPassword === password) {
            authenticated = true;
            userPermission = rowPermission;
            break;
          }
        }
        
        if (authenticated) {
          // Store user permissions and credentials in localStorage
          localStorage.setItem('userPermissions', userPermission); 
          localStorage.setItem('username', username);
          
          // Determine which page to redirect to based on permissions
          let redirectPath = "/dashboard"; // Default redirect path
          
          if (userPermission && userPermission.toLowerCase() !== "all") {
            // Parse permissions
            const permissions = userPermission.split(',').map(p => p.trim().toLowerCase());
            
            // Map of permission keys to their corresponding routes
            const permissionRoutes = {
              "dashboard": "/dashboard",
              "new complaint": "/dashboard/new-complaint",
              "assign complaint": "/dashboard/assign-complaint",
              "tracker": "/dashboard/tracker",
              "verification": "/dashboard/verification",
              "document verification": "/dashboard/document-verification"
            };
            
            // Find the first permission that has a route mapping
            for (const permission of permissions) {
              if (permissionRoutes[permission]) {
                redirectPath = permissionRoutes[permission];
                break;
              }
            }
          }
          
          // Redirect to the appropriate page
          setTimeout(() => {
            setIsLoading(false);
            window.location.href = redirectPath;
          }, 1000);
        } else {
          setError("Invalid credentials. Please try again.");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching Google Sheet:", error);
        setError("Authentication failed. Please try again.");
        setIsLoading(false);
      }
    } catch (err) {
      setError("Authentication failed. Please try again.");
      setIsLoading(false);
    }
  };

  const copyCredentials = () => {
    setUsername("admin");
    setPassword("password123");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">Complaints Tracker</h1>
          <p className="text-gray-600">Login to manage and track complaints</p>
        </div>
        
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="mb-4 flex items-center rounded-md bg-blue-50 p-3 text-sm text-blue-700">
            <Info size={18} className="mr-2 flex-shrink-0" />
            <p>Use your assigned credentials to login</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="mb-1 block text-sm font-medium text-gray-700">
                User ID
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-11 w-full rounded-md border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 w-full rounded-md border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-blue-600 py-3 text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
          
          {/* <div className="flex justify-center">
            <button
              type="button"
              onClick={copyCredentials}
              className="flex items-center text-sm text-gray-500 hover:text-blue-600"
            >
              <Clipboard size={16} className="mr-1" />
              Demo credentials
            </button>
          </div> */}
        </form>
        
        <div className="mt-8 text-center text-xs text-gray-500">
          Complaints Tracker System v1.0
        </div>
      </div>
    </div>
  );
}

export default LoginPage;