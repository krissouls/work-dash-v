import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[128px]" />
        <div className="absolute bottom-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-primary/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="max-w-4xl">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="text-foreground">Find Work.</span>
            <br />
            <span className="text-primary">Hire Fast.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Connecting businesses with reliable on-demand workers. 
            Build your flexible workforce or find gigs that fit your schedule.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button size="lg" className="gap-2">
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-secondary">
              Learn More
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-20 grid grid-cols-2 gap-8 border-t border-border/50 pt-10 lg:grid-cols-4">
          {[
            { value: "10K+", label: "Active Workers" },
            { value: "500+", label: "Businesses" },
            { value: "50K+", label: "Jobs Completed" },
            { value: "4.9", label: "Average Rating" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-bold text-primary">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
