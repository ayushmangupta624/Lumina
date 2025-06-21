import Link from "next/link"

export function Footer() {
  return (
    <footer className="py-12 border-t border-white/5 bg-black">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 max-w-5xl mx-auto">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-4">
              <Link href="/">
                <img
                  src="https://miyagilabs.ai/_next/image?url=%2Flogo200.png&w=32&q=75"
                  width={40}
                  height={40}
                  alt="EduMorph logo"
                  style={{ display: 'inline-block', verticalAlign: 'middle' }}
                />
              </Link>
              <span className="font-bold text-xl">Lumina</span>
            </div>
            <p className="text-white/60 text-sm text-center md:text-left">
              Turn any document into an AI-powered animated explainer and full learning course instantly.
            </p>
          </div>

          <div className="flex gap-16">
            <div>
              <h4 className="font-medium mb-4 text-center md:text-left">Product</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-white/60 hover:text-white text-sm transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/60 hover:text-white text-sm transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/60 hover:text-white text-sm transition-colors">
                    Beta Program
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-4 text-center md:text-left">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-white/60 hover:text-white text-sm transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/60 hover:text-white text-sm transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/60 hover:text-white text-sm transition-colors">
                    Terms & Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 text-center text-white/40 text-sm">
          © {new Date().getFullYear()} Lumina. All rights reserved.
        </div>
      </div>
    </footer>
  )
} 