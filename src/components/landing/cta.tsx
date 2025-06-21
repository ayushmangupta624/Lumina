import { Button } from "@/components/ui/button"

export function CTA() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-[#1f7d48]/10 via-transparent to-transparent"></div>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="p-12 rounded-xl bg-gradient-to-br from-black/40 to-black/80 border border-white/10 backdrop-blur-sm text-center">
            <h2 className="text-4xl font-bold mb-6">
              10x your educational content creation
              <span className="block mt-2 bg-gradient-to-r from-[#1f7d48] to-green-400 bg-clip-text text-transparent">
                with AI-powered explainer generation
              </span>
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto mb-8">
              Join forward-thinking educators already transforming how they create and deliver learning experiences.
            </p>
            <Button
              size="lg"
              className="px-12 py-6 bg-gradient-to-r from-[#1f7d48] to-green-500 text-white
              hover:opacity-90 hover:shadow-lg hover:shadow-blue-500/20 transition-all border-0 text-base"
            >
              Create a video
            </Button>
            <p className="mt-4 text-white/40 text-sm">No credit card required • Limited spots available</p>
          </div>
        </div>
      </div>
    </section>
  )
} 