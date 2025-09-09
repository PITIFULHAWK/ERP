import { Header } from "@/components/layout/header"
import { Hero } from "@/components/sections/hero"
import { AdmissionProcess } from "@/components/sections/admission-process"
import { Statistics } from "@/components/sections/statistics"
import { Footer } from "@/components/layout/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Statistics />
        <AdmissionProcess />
      </main>
      <Footer />
    </div>
  )
}
