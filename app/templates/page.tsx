import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardFooter } from "@/components/ui/card"
import { Sparkles, ImageIcon } from "lucide-react"

export default function TemplatesPage() {
  // Just 2 templates
  const templates = [
    {
      id: 1,
      name: "Instagram Post",
      category: "social",
      description: "Perfect for Instagram feed posts (1080x1080px)",
      thumbnail: "/pixele1.png",
    },
    {
      id: 2,
      name: "Website Banner",
      category: "web",
      description: "Full-width banner for websites (1920x400px)",
      thumbnail: "/pixele2.png",
    },
  ]

  return (
    <div className="container py-10">
      <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Templates</h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            Start creating with professionally designed templates
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {templates.map((template) => (
          <Card key={template.id} className="overflow-hidden skeu-card hover:skeu-raised transition-all duration-200">
            <div className="aspect-video relative group bg-muted overflow-hidden">
              <img
                src={template.thumbnail}
                alt={template.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button size="lg" asChild className="skeu-button">
                  <Link href={`/editor?template=${template.id}`}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Use Template
                  </Link>
                </Button>
              </div>
            </div>
            <CardFooter className="flex flex-col items-start p-4 space-y-3">
              <div>
                <h3 className="font-bold text-lg">{template.name}</h3>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ImageIcon className="h-4 w-4" />
                <span>Ready to customize</span>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-muted-foreground mb-4">Want to create from scratch?</p>
        <Button size="lg" asChild className="skeu-button">
          <Link href="/editor">Open Blank Canvas</Link>
        </Button>
      </div>
    </div>
  )
}
