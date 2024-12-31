import { testSignIn } from './test'

export default async function TestPage() {
  const result = await testSignIn()

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Sign In Test Results</h1>
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  )
}
