import { Button } from "@/components/ui/button"
import { MessageCircle, Mail, ArrowRight } from "lucide-react"

export function Contact() {
  return (
    <section id="contact" className="relative py-24 lg:py-32 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-primary">
              Get in Touch
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-balance">
              Ready to get started?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Whether you&apos;re looking for workers or searching for gigs, 
              we&apos;re here to help. Reach out and let&apos;s build something great together.
            </p>

            <div className="mt-10 space-y-6">
              <a
                href="https://wa.me/1234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-primary/50 hover:bg-secondary/50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">WhatsApp</h3>
                  <p className="text-sm text-muted-foreground">Message us for quick support</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </a>

              <a
                href="mailto:knsolanki011@gmail.com"
                className="flex items-center gap-4 rounded-2xl border border-border/50 bg-card p-6 transition-all hover:border-primary/50 hover:bg-secondary/50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Mail className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Email</h3>
                  <p className="text-sm text-muted-foreground">knsolanki011@gmail.com</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </a>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="rounded-3xl border border-border/50 bg-card p-8 lg:p-12">
              <h3 className="text-2xl font-bold">Start your free trial</h3>
              <p className="mt-2 text-muted-foreground">
                No credit card required. Get started in minutes.
              </p>
              <form className="mt-8 space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Your name"
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email address"
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <select className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none transition-colors text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary">
                    <option value="">I&apos;m interested in...</option>
                    <option value="business">Hiring workers</option>
                    <option value="worker">Finding gigs</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <Button className="w-full" size="lg">
                  Get Started
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
