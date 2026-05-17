import Link from "next/link"

const footerLinks = {
  Product: ["Features", "Pricing", "Enterprise", "Security"],
  Company: ["About", "Careers", "Blog", "Press"],
  Resources: ["Help Center", "Partners", "API Docs", "Status"],
  Legal: ["Privacy", "Terms", "Cookie Policy"],
}

export function Footer() {
  return (
    <footer className="border-t border-border/50">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid gap-8 py-10 sm:py-12 grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 lg:py-16">
          <div className="col-span-2 sm:col-span-2 lg:col-span-1 mb-4 lg:mb-0">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">W</span>
              </div>
              <span className="text-lg font-semibold text-foreground">WorkDash</span>
            </Link>
            <p className="mt-3 sm:mt-4 text-sm text-muted-foreground max-w-xs">
              Connecting businesses with reliable on-demand workers.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold">{category}</h3>
              <ul className="mt-3 sm:mt-4 space-y-2.5 sm:space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border/50 py-6 sm:py-8 sm:flex-row">
          <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            &copy; {new Date().getFullYear()} WorkDash. All rights reserved.
          </p>
          <div className="flex gap-4 sm:gap-6">
            <Link href="#" className="text-xs sm:text-sm text-muted-foreground transition-colors hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="#" className="text-xs sm:text-sm text-muted-foreground transition-colors hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
