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
    <section id="workers" className="relative py-16 sm:py-24 lg:py-32 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#3533cd]/10 via-[#3533cd]/5 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background" />
      
      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
          <div>
            <p className="text-xs sm:text-sm font-medium uppercase tracking-wider text-[#3533cd]">
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
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#3533cd]/10 text-[#3533cd]">
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
            {/* Glow effect behind card */}
            <div className="absolute -inset-4 bg-[#3533cd]/20 rounded-3xl blur-2xl animate-pulse-glow" />
            
            <div className="relative rounded-2xl sm:rounded-3xl border border-[#3533cd]/30 bg-gradient-to-b from-card to-[#3533cd]/5 p-5 sm:p-8 lg:p-12 shadow-xl shadow-[#3533cd]/10">
              <div className="flex flex-col gap-6 sm:gap-8">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#3533cd]/10 px-3 py-1.5 text-xs sm:text-sm text-[#3533cd]">
                    <span className="h-2 w-2 rounded-full bg-[#3533cd] animate-pulse" />
                    Live Opportunities
                  </div>
                  <p className="mt-3 sm:mt-4 text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#3533cd] to-[#5553ff] bg-clip-text text-transparent">234</p>
                  <p className="text-sm sm:text-base text-muted-foreground">gigs available near you</p>
                </div>
                <div className="space-y-2.5 sm:space-y-3">
                  {["Event Staff", "Warehouse Helper", "Brand Promoter"].map((gig, i) => (
                    <div
                      key={gig}
                      className="flex items-center justify-between rounded-xl bg-[#3533cd]/5 border border-[#3533cd]/10 p-3 sm:p-4 transition-all hover:bg-[#3533cd]/10"
                    >
                      <span className="font-medium text-sm sm:text-base">{gig}</span>
                      <span className="text-sm text-[#3533cd] font-medium">${20 + i * 5}/hr</span>
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
