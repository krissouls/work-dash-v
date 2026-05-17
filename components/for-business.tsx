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
    <section id="business" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-primary">
            For Businesses
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-balance">
            Build your on-demand workforce
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Everything you need to find, hire, and manage temporary workers efficiently.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-primary/50 hover:bg-secondary/50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
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
