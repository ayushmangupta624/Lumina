import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import Link from "next/link"

interface AuthFormProps {
  type: "login" | "register"
  onSubmit: (data: { email: string; password: string; name?: string }) => void
}

export function AuthForm({ type, onSubmit }: AuthFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      <div className="text-center">
        <Link href="/" className="inline-block">
          <img
            src="https://miyagilabs.ai/_next/image?url=%2Flogo200.png&w=32&q=75"
            width={48}
            height={48}
            alt="EduMorph logo"
            className="mx-auto mb-4"
          />
        </Link>
        <h2 className="text-3xl font-bold tracking-tight text-white">
          {type === "login" ? "Welcome back" : "Create an account"}
        </h2>
        <p className="mt-2 text-sm text-white/60">
          {type === "login" ? (
            <>
              Don't have an account?{" "}
              <Link href="/register" className="text-[#1f7d48] hover:text-green-400">
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href="/login" className="text-[#1f7d48] hover:text-green-400">
                Sign in
              </Link>
            </>
          )}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="space-y-4">
          {type === "register" && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white/80">
                Name
              </Label>
              <Input
                id="name"
                type="text"
                required
                className="bg-black/40 border-white/10 text-white placeholder:text-white/40"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/80">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              required
              className="bg-black/40 border-white/10 text-white placeholder:text-white/40"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/80">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              required
              className="bg-black/40 border-white/10 text-white placeholder:text-white/40"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
        </div>

        {type === "login" && (
          <div className="flex items-center justify-end">
            <Link
              href="/forgot-password"
              className="text-sm text-[#1f7d48] hover:text-green-400"
            >
              Forgot your password?
            </Link>
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-[#1f7d48] text-white hover:opacity-100
          transition-all border-0"
        >
          {type === "login" ? "Sign in" : "Create account"}
        </Button>
      </form>
    </div>
  )
} 