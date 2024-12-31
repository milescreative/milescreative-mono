'use client'

import { useState } from 'react'

export default function TestAuth() {
  const [responses, setResponses] = useState<Record<string, any>>({})

  const testEndpoints = async () => {
    const endpoints = [
      { name: 'Sign In', path: '/api/auth/signin', method: 'POST' },
      { name: 'Sign Up', path: '/api/auth/signup', method: 'POST' },
      { name: 'Sign Out', path: '/api/auth/signout', method: 'GET' }
    ]

    const results: Record<string, any> = {}

    for (const endpoint of endpoints) {
      try {
        const res = await fetch(endpoint.path, {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: endpoint.method === 'POST' ? JSON.stringify({
            email: 'test@example.com',
            password: 'password123'
          }) : undefined
        })
        results[endpoint.name] = await res.json()
      } catch (error) {
        results[endpoint.name] = { error: error instanceof Error ? error.message : 'Unknown error' }
      }
    }

    setResponses(results)
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Endpoint Tester</h1>

      <button
        onClick={testEndpoints}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
      >
        Test All Endpoints
      </button>

      <div className="space-y-4">
        {Object.entries(responses).map(([name, response]) => (
          <div key={name} className="border p-4 rounded">
            <h2 className="font-bold mb-2">{name}</h2>
            <pre className="bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  )
}
