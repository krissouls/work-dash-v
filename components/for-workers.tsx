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
    <section id="workers" className="relative py-16 sm:py-24 lg:py-32 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
          <div>
            <p className="text-xs sm:text-sm font-medium uppercase tracking-wider text-primary">
              For Workers
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl lg:text-5xl font-bold tracking-tight text-balance">
              Find work that fits your life
            </h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground">
              Join thousands of workers who are taking control of their careers. 
              Choose your hours, pick your gigs, and earn on your own terms.
            </p>

            <div className="mt-8 sm:mt-10 grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="flex gap-3 sm:gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <benefit.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base">{benefit.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative order-first lg:order-last">
            <div className="rounded-2xl sm:rounded-3xl border border-border/50 bg-card p-5 sm:p-8 lg:p-12">
              <div className="flex flex-col gap-6 sm:gap-8">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs sm:text-sm text-primary">
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    Live Opportunities
                  </div>
                  <p className="mt-3 sm:mt-4 text-3xl sm:text-4xl font-bold">234</p>
                  <p className="text-sm sm:text-base text-muted-foreground">gigs available near you</p>
                </div>
                <div className="space-y-2.5 sm:space-y-3">
                  {["Event Staff", "Warehouse Helper", "Brand Promoter"].map((gig, i) => (
                    <div
                      key={gig}
                      className="flex items-center justify-between rounded-xl bg-secondary/50 p-3 sm:p-4"
                    >
                      <span className="font-medium text-sm sm:text-base">{gig}</span>
                      <span className="text-sm text-primary font-medium">${20 + i * 5}/hr</span>
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
