import { Briefcase, ShieldCheck, Users, Clock } from "lucide-react"

const features = [
  {
    icon: Briefcase,
    title: "Post Jobs Instantly",
    description: "Create and publish gig listings in minutes. Reach thousands of qualified workers immediately.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Workers",
    description: "Access a curated pool of reliable, background-checked professionals ready to work.",
  },
  {
    icon: Users,
    title: "Flexible Teams",
    description: "Scale your workforce up or down based on demand. No long-term commitments required.",
  },
  {
    icon: Clock,
    title: "Fast Matching",
    description: "Our smart matching system connects you with the right workers within hours, not days.",
  },
]

export function ForBusiness() {
  return (
    <section id="business" className="relative py-16 sm:py-24 lg:py-32 overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#3533cd]/5 via-transparent to-transparent" />
      
      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs sm:text-sm font-medium uppercase tracking-wider text-[#3533cd]">
            For Businesses
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl lg:text-5xl font-bold tracking-tight text-balance">
            Build your on-demand workforce
          </h2>
          <p className="mx-auto mt-3 sm:mt-4 max-w-2xl text-base sm:text-lg text-muted-foreground">
            Everything you need to find, hire, and manage temporary workers efficiently.
          </p>
        </div>

        <div className="mt-10 sm:mt-16 grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-[#3533cd]/20 bg-gradient-to-b from-card to-card/50 p-5 sm:p-6 transition-all hover:border-[#3533cd]/50 hover:shadow-lg hover:shadow-[#3533cd]/10 active:scale-[0.98]"
            >
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-[#3533cd]/10 text-[#3533cd] transition-colors group-hover:bg-[#3533cd] group-hover:text-white">
                <feature.icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="mt-4 text-base sm:text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
