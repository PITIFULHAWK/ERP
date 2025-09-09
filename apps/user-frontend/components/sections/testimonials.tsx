import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote } from "lucide-react"

export function Testimonials() {
  const testimonials = [
    {
      name: "Priya Sharma",
      course: "Computer Science Engineering",
      university: "Tech University",
      rating: 5,
      content:
        "The application process was incredibly smooth and transparent. I could track every step of my admission and the support team was always helpful.",
    },
    {
      name: "Rahul Patel",
      course: "MBA",
      university: "Business School",
      rating: 5,
      content:
        "EduERP made it so easy to compare different universities and courses. The detailed information helped me make the right choice for my career.",
    },
    {
      name: "Ananya Singh",
      course: "MBBS",
      university: "Medical College",
      rating: 5,
      content:
        "From application to enrollment, everything was handled professionally. The document upload system saved me so much time and hassle.",
    },
  ]

  return (
    <section className="py-16 bg-card/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Student Success Stories</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hear from students who successfully navigated their admission journey with EduERP
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="relative">
              <CardContent className="p-6">
                <Quote className="h-8 w-8 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground mb-6 text-pretty">"{testimonial.content}"</p>

                <div className="flex items-center gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                  ))}
                </div>

                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.course}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.university}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
