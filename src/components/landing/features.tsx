import { Button } from "@/components/ui/button"
import Image from "next/image"

export function Features() {
  const features = [
    {
      title: "🎥 Explainer Generator",
      subtitle: "Create Animated Lessons",
      description: "Automatically generate fully narrated, visually engaging explainer videos from your documents, notes, or transcripts.",
      image: "/window.svg",
    },
    {
      title: "📝 Quiz & Assessment Builder",
      subtitle: "Test Understanding",
      description: "Generate interactive quizzes, flashcards, and adaptive practice exercises to reinforce concepts and track student progress.",
      image: "/file.svg",
    },
    {
      title: "🌐 Multilingual Content Engine",
      subtitle: "Reach Every Learner",
      description: "Instantly translate both text and voiceovers into multiple languages, making your educational content globally accessible.",
      image: "/globe.svg",
    },
  ]

  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-16">
          <span className="bg-gradient-to-r from-[#1f7d48] to-green-400 bg-clip-text text-transparent">
            Our tools
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group p-6 rounded-xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/10
              hover:border-blue-500/30 transition-colors duration-300 flex flex-col"
            >
              <div className="h-32 mb-6 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1f7d48]/20 to-green-400/20 flex items-center justify-center">
                  <Image
                    src={feature.image}
                    alt={""}
                    width={60}
                    height={60}
                    className="opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-1">{feature.title}</h3>
              <div className="text-sm text-blue-400 mb-3">{feature.subtitle}</div>
              <p className="text-white/60 mb-6">{feature.description}</p>
              <div className="mt-auto pt-4">
                <Button
                  className="w-full bg-white/5 hover:bg-white/10 text-white border-0
                  group-hover:bg-green-700 transition-all"
                >
                  Learn more
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 