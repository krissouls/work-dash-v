import { Button } from "@/components/ui/button"
import { MessageCircle, Mail, ArrowRight } from "lucide-react"

export function Contact() {
  return (
    <section id="contact" className="relative py-16 sm:py-24 lg:py-32 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#3533cd]/15 via-[#3533cd]/5 to-transparent" />
      
      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-xs sm:text-sm font-medium uppercase tracking-wider text-[#3533cd]">
              Get in Touch
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl lg:text-5xl font-bold tracking-tight text-balance">
              Ready to get started?
            </h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground">
              Whether you&apos;re looking for workers or searching for gigs, 
              we&apos;re here to help. Reach out and let&apos;s build something great together.
            </p>

            <div className="mt-8 sm:mt-10 space-y-4 sm:space-y-6">
              <a
                href="https://wa.me/1234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 sm:gap-4 rounded-2xl border border-green-500/30 bg-gradient-to-r from-green-500/10 to-green-500/5 p-4 sm:p-6 transition-all hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10 active:scale-[0.98]"
              >
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-green-500/20 text-green-500 shrink-0">
                  <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base">WhatsApp</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Message us for quick support</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
              </a>

              <a
                href="mailto:knsolanki011@gmail.com"
                className="flex items-center gap-3 sm:gap-4 rounded-2xl border border-[#3533cd]/30 bg-gradient-to-r from-[#3533cd]/10 to-[#3533cd]/5 p-4 sm:p-6 transition-all hover:border-[#3533cd]/50 hover:shadow-lg hover:shadow-[#3533cd]/10 active:scale-[0.98]"
              >
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-[#3533cd]/20 text-[#3533cd] shrink-0">
                  <Mail className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base">Email</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">knsolanki011@gmail.com</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
              </a>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            {/* Glow effect behind form */}
            <div className="relative">
              <div className="absolute -inset-4 bg-[#3533cd]/15 rounded-3xl blur-2xl" />
              
              <div className="relative rounded-2xl sm:rounded-3xl border border-[#3533cd]/30 bg-gradient-to-b from-card to-[#3533cd]/5 p-5 sm:p-8 lg:p-12 shadow-xl">
                <h3 className="text-xl sm:text-2xl font-bold">Start your free trial</h3>
                <p className="mt-2 text-sm sm:text-base text-muted-foreground">
                  No credit card required. Get started in minutes.
                </p>
                <form className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Your name"
                      className="w-full rounded-xl border border-[#3533cd]/20 bg-background/50 px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-[#3533cd] focus:ring-2 focus:ring-[#3533cd]/20"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Email address"
                      className="w-full rounded-xl border border-[#3533cd]/20 bg-background/50 px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-[#3533cd] focus:ring-2 focus:ring-[#3533cd]/20"
                    />
                  </div>
                  <div>
                    <select className="w-full rounded-xl border border-[#3533cd]/20 bg-background/50 px-4 py-3 text-sm outline-none transition-all text-muted-foreground focus:border-[#3533cd] focus:ring-2 focus:ring-[#3533cd]/20">
                      <option value="">I&apos;m interested in...</option>
                      <option value="business">Hiring workers</option>
                      <option value="worker">Finding gigs</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <Button className="w-full h-12 text-base bg-[#3533cd] hover:bg-[#3533cd]/90" size="lg">
                    Get Started
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
