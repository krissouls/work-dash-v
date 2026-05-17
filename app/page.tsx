import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { ForBusiness } from "@/components/for-business"
import { ForWorkers } from "@/components/for-workers"
import { PopularGigs } from "@/components/popular-gigs"
import { Contact } from "@/components/contact"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <ForBusiness />
      <ForWorkers />
      <PopularGigs />
      <Contact />
      <Footer />
      <WhatsAppButton />
    </main>
  )
}
