export function Stats() {
  const stats = [
    {
      number: "78%",
      label: "Students excel with video learning",
    },
    {
      number: "10%",
      label: "Textbook Retention",
    },
    {
      number: "85%",
      label: "Video retention",
    },
  ]

  return (
    <section className="py-20 border-t border-white/5 bg-black/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#1f7d48] to-green-400 bg-clip-text text-transparent mb-2">
                {stat.number}
              </span>
              <span className="text-white/60">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 