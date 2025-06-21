import { Button } from "@/components/ui/button"
import { ArrowRight, ExternalLink } from "lucide-react"

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[128px] -z-10"></div>
      <div className="absolute top-40 right-1/3 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] -z-10"></div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-8">
          <div className="inline-flex items-center px-4 py-2 bg-white/5 rounded-full text-sm border border-white/10">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse mr-2"></span>
            <span className="text-blue-400">Now in private beta</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Generate explainer videos
            <span className="block mt-2 bg-gradient-to-r from-blue-400 via-green-400 to-green-400 bg-clip-text text-transparent">
              from any content
            </span>
          </h1>

          <p className="text-xl text-white/60 max-w-2xl">
            Lumina turns textbooks, PDFs, and notes into interactive, multilingual, and engaging learning modules—instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button
              size="lg"
              className="px-8 py-6 bg-[#1f7d48] text-white
              hover:opacity-90 hover:shadow-lg hover:shadow-blue-500/20 transition-all border-0 text-base"
            >
              Create a video
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-6 border-white/10 hover:bg-white/5 text-white/80 hover:text-white transition-colors text-base"
            >
              <ExternalLink className="mr-2 h-4 w-4" /> Watch Demo
            </Button>
          </div>
        </div>

        {/* Hero Visualization */}
        <div className="mt-20 relative mx-auto max-w-5xl">
          <div className="aspect-video relative rounded-xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-sm shadow-2xl shadow-blue-500/5">
            <img
              src="https://pouch.jumpshare.com/preview/Q05W2x-PBo8gB12dxg9HM2KbkCBHG1h7tH9xQTr539RwMTl0L2aahQIZfeBi3LAsZ4a2K2yUPK6KQ0bL33za8PByYvZ6xUbRNJcN7NgRE5M"
              alt="Lumina Product Feature"
              className="rounded-2xl w-full mx-auto"
            />
          </div>
        </div>
      </div>
    </section>
  )
} 