import { PartyPopper, Package, Megaphone, UtensilsCrossed, Camera, Truck } from "lucide-react"

const gigs = [
  {
    icon: PartyPopper,
    title: "Event Staff",
    description: "Concerts, weddings, corporate events",
    rate: "$20-35/hr",
    openings: 45,
  },
  {
    icon: Package,
    title: "Warehouse Helpers",
    description: "Packing, loading, sorting",
    rate: "$18-25/hr",
    openings: 78,
  },
  {
    icon: Megaphone,
    title: "Promoters",
    description: "Brand promotion and marketing",
    rate: "$22-40/hr",
    openings: 32,
  },
  {
    icon: UtensilsCrossed,
    title: "Food Service",
    description: "Catering, bartending, serving",
    rate: "$18-30/hr",
    openings: 56,
  },
  {
    icon: Camera,
    title: "Event Photography",
    description: "Photo and video assistance",
    rate: "$25-45/hr",
    openings: 18,
  },
  {
    icon: Truck,
    title: "Delivery & Moving",
    description: "Local delivery and moving help",
    rate: "$20-35/hr",
    openings: 64,
  },
]

export function PopularGigs() {
  return (
    <section className="relative py-16 sm:py-24 lg:py-32 overflow-hidden">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 h-[400px] w-[400px] rounded-full bg-[#3533cd]/10 blur-[120px] animate-float" />
        <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-[#5553ff]/10 blur-[100px] animate-float-delayed" />
      </div>
      
      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs sm:text-sm font-medium uppercase tracking-wider text-[#3533cd]">
            Popular Categories
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl lg:text-5xl font-bold tracking-tight text-balance">
            Explore top gig categories
          </h2>
          <p className="mx-auto mt-3 sm:mt-4 max-w-2xl text-base sm:text-lg text-muted-foreground">
            Find opportunities across a wide range of industries and skill levels.
          </p>
        </div>

        <div className="mt-10 sm:mt-16 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {gigs.map((gig) => (
            <div
              key={gig.title}
              className="group relative overflow-hidden rounded-2xl border border-[#3533cd]/20 bg-gradient-to-b from-card to-[#3533cd]/5 p-5 sm:p-6 transition-all hover:border-[#3533cd]/50 hover:shadow-lg hover:shadow-[#3533cd]/10 active:scale-[0.98]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-[#3533cd]/10 text-[#3533cd] shrink-0 group-hover:bg-[#3533cd] group-hover:text-white transition-colors">
                  <gig.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <span className="rounded-full bg-[#3533cd]/10 px-2.5 py-1 text-xs font-medium text-[#3533cd] whitespace-nowrap">
                  {gig.openings} openings
                </span>
              </div>
              <h3 className="mt-4 text-base sm:text-lg font-semibold">{gig.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{gig.description}</p>
              <div className="mt-4 flex items-center justify-between border-t border-[#3533cd]/10 pt-4">
                <span className="text-base sm:text-lg font-semibold bg-gradient-to-r from-[#3533cd] to-[#5553ff] bg-clip-text text-transparent">{gig.rate}</span>
                <button className="text-sm text-muted-foreground transition-colors hover:text-[#3533cd] active:text-[#3533cd]/80 py-1">
                  View all &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
