"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section id="home" className="relative min-h-[100svh] flex items-center pt-16 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#3533cd]/20 via-background to-[#3533cd]/10 animate-gradient" />
      
      {/* Floating gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 h-[300px] w-[300px] sm:h-[500px] sm:w-[500px] rounded-full bg-[#3533cd]/30 blur-[100px] sm:blur-[128px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 left-1/4 h-[250px] w-[250px] sm:h-[400px] sm:w-[400px] rounded-full bg-[#3533cd]/20 blur-[80px] sm:blur-[100px] animate-float" />
        <div className="absolute top-1/2 left-1/2 h-[200px] w-[200px] sm:h-[350px] sm:w-[350px] rounded-full bg-[#5553ff]/15 blur-[60px] sm:blur-[90px] animate-float-delayed" />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#3533cd 1px, transparent 1px), linear-gradient(90deg, #3533cd 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 py-12 sm:py-24 lg:py-32 w-full">
        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl">
            <span className="text-foreground">Find Work.</span>
            <br />
            <span className="bg-gradient-to-r from-[#3533cd] via-[#5553ff] to-[#7775ff] bg-clip-text text-transparent">Hire Fast.</span>
          </h1>
          <p className="mt-4 sm:mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-muted-foreground">
            Connecting businesses with reliable on-demand workers. 
            Build your flexible workforce or find gigs that fit your schedule.
          </p>
          <div className="mt-8 sm:mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button size="lg" className="gap-2 h-12 text-base w-full sm:w-auto bg-[#3533cd] hover:bg-[#3533cd]/90">
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-[#3533cd]/50 text-foreground hover:bg-[#3533cd]/10 hover:border-[#3533cd] h-12 text-base w-full sm:w-auto">
              Learn More
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-12 sm:mt-20 grid grid-cols-2 gap-6 sm:gap-8 border-t border-[#3533cd]/20 pt-8 sm:pt-10 lg:grid-cols-4">
          {[
            { value: "10K+", label: "Active Workers" },
            { value: "500+", label: "Businesses" },
            { value: "50K+", label: "Jobs Completed" },
            { value: "4.9", label: "Average Rating" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#3533cd] to-[#5553ff] bg-clip-text text-transparent">{stat.value}</p>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
