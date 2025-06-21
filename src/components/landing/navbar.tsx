import { Button } from "@/components/ui/button"
import Link from "next/link"

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-md bg-black/80">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Link href="/">
              <img
                src="https://miyagilabs.ai/_next/image?url=%2Flogo200.png&w=32&q=75"
                width={40}
                height={40}
                alt="Lumina logo"
                style={{ display: 'inline-block', verticalAlign: 'middle' }}
              />
            </Link>
            <span className="font-bold text-xl">Lumina</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#how-it-works" className="text-sm text-white/60 hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">
              Features
            </a>
          </nav>
          <div className="flex items-center gap-4">
          <Link href={'/login'}>
            <Button
              className="bg-[#1f7d48] text-white hover:opacity-90
              transition-all hover:shadow-lg hover:shadow-blue-500/20 hover:cursor-pointer border-0"
            >
              Join Beta
            </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
} 