"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Clipboard, Info } from "react-feather"

function LoginPage() {
  const [username, setUsername] = useState("admin")
  const [password, setPassword] = useState("password123")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // In a real app, you would validate credentials against a database
    // For this demo, we'll just simulate a login
    setTimeout(() => {
      setIsLoading(false)
      navigate("/dashboard")
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="w-full shadow-2xl border-0 overflow-hidden bg-white rounded-lg">
          <div className="space-y-1 bg-gray-800 rounded-t-lg text-white pb-8 p-6">
            <div className="flex justify-center mb-4 mt-2">
              <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                <Clipboard className="h-12 w-12" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-center">Complaints Tracker</h2>
            <p className="text-white/90 text-center text-lg">Login to manage and track complaints</p>
          </div>
          <div className="pt-8 px-8">
            <div className="mb-6 bg-blue-50 text-blue-800 border border-blue-200 p-4 rounded-md flex items-start">
              <Info className="h-4 w-4 mt-0.5 mr-2" />
              <p>Use the following demo credentials to login</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid gap-5">
                <div className="grid gap-2">
                  <label htmlFor="username" className="text-base font-medium">
                    User ID
                  </label>
                  <input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="h-11 w-full rounded-md border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="password" className="text-base font-medium">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 w-full rounded-md border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button
                className="w-full mt-8 h-11 text-base bg-blue-600 hover:bg-blue-700 text-white shadow-md rounded-md"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
          <div className="flex justify-center pb-6 px-8 text-sm text-gray-500 mt-6">Complaints Tracker System v1.0</div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage