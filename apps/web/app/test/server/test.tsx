'use server'

export async function testSignIn() {
  try {
    const res = await fetch('http://localhost:3000/api/auth/signin', {
      method: 'POST',
      headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': 'your-csrf-token-here'
          },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    })

    const data = await res.json()

    return {
      status: res.status,
      data,
      headers: {
        csrf: res.headers.get('x-csrf-token'),
        // Add other relevant headers you want to inspect
      }
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 500
    }
  }
}
