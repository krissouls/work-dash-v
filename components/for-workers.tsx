import { Calendar, Zap, DollarSign, MapPin } from "lucide-react"

const benefits = [
  {
    icon: Calendar,
    title: "Flexible Schedule",
    description: "Choose gigs that fit your life. Work when you want, where you want.",
  },
  {
    icon: Zap,
    title: "Easy Apply",
    description: "Apply to jobs with a single tap. No lengthy applications or interviews.",
  },
  {
    icon: DollarSign,
    title: "Earn More",
    description: "Competitive pay with fast payouts. Get paid quickly for your work.",
  },
  {
    icon: MapPin,
    title: "Work Nearby",
    description: "Find opportunities in your area. Reduce commute time and costs.",
  },
]

export function ForWorkers() {
  return (
    <section id="workers" className="relative py-24 lg:py-32 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-primary">
              For Workers
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-balance">
              Find work that fits your life
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join thousands of workers who are taking control of their careers. 
              Choose your hours, pick your gigs, and earn on your own terms.
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <benefit.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{benefit.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square rounded-3xl border border-border/50 bg-card p-8 lg:p-12">
              <div className="flex h-full flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    Live Opportunities
                  </div>
                  <p className="mt-4 text-4xl font-bold">234</p>
                  <p className="text-muted-foreground">gigs available near you</p>
                </div>
                <div className="space-y-3">
                  {["Event Staff", "Warehouse Helper", "Brand Promoter"].map((gig, i) => (
                    <div
                      key={gig}
                      className="flex items-center justify-between rounded-xl bg-secondary/50 p-4"
                    >
                      <span className="font-medium">{gig}</span>
                      <span className="text-sm text-primary">${20 + i * 5}/hr</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
