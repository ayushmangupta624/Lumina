"use client"
import { AuthForm } from "@/components/auth/auth-form"

export default function RegisterPage() {
  const handleSubmit = async (data: { email: string; password: string; name?: string }) => {
 
    if (!data.name) return 
    console.log("Register data:", data)
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">

      <div className="fixed inset-0 bg-noise opacity-[0.02] pointer-events-none"></div>


      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[128px] -z-10"></div>
      <div className="absolute top-40 right-1/3 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] -z-10"></div>

      <div className="w-full max-w-md">
        <AuthForm type="register" onSubmit={handleSubmit} />
      </div>
    </div>
  )
} 