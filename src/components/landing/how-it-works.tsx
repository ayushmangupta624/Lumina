import { ArrowRight } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Upload your source material",
      description:
        "Submit textbooks, PDFs, lecture notes, or video transcripts. EduMorph intelligently analyzes and extracts key learning content.",
      image: "/placeholder.svg?height=120&width=120&text=1",
    },
    {
      step: "02",
      title: "Generate animated explainer videos",
      description:
        "Our AI automatically creates fully narrated, visually engaging animated videos that explain complex topics using dynamic visuals, voiceovers, and multilingual support.",
      image: "/placeholder.svg?height=120&width=120&text=2",
    },
    {
      step: "03",
      title: "Create personalized courses & assessments",
      description:
        "EduMorph auto-generates complete learning modules, including interactive quizzes, adaptive practice, and personalized learning paths—all built directly from the generated video content.",
      image: "/placeholder.svg?height=120&width=120&text=3",
    },
  ]

  return (
    <section id="how-it-works" className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-radial from-purple-500/5 via-transparent to-transparent"></div>

      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            A new paradigm for
            <span className="block mt-2 bg-gradient-to-r from-[#1f7d48] to-green-400 bg-clip-text text-transparent">
              educational content
            </span>
          </h2>
          <p className="text-white/60">
            Unlike traditional educational tools that rely on static materials, EduMorph transforms existing resources into interactive, adaptive, and multilingual learning experiences—automatically.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((item, i) => (
            <div key={i} className="relative">
              <div className="p-8 h-full rounded-xl bg-white/[0.03] backdrop-blur-sm border border-white/10 hover:border-blue-500/30 transition-all duration-300">
                <div className="text-blue-400 font-mono mb-6 text-sm">{item.step}</div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-white/60">{item.description}</p>
              </div>
              {i < 2 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform translate-x-1/2 text-white/20">
                  <ArrowRight size={24} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 