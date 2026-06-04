import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Paintbrush, Layers, Share2, Zap, ImageIcon, ArrowUpRight } from "lucide-react"

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-background to-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Simple Photo Editing Tools
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Powerful editing tools for everyone. No subscriptions, no complicated features.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/editor">Open Editor</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/templates">Browse Templates</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background" id="features">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Core Tools</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Everything you need for basic photo editing and design.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-12">
            <div className="flex flex-col items-center space-y-2 rounded-lg p-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Paintbrush className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Editing Tools</h3>
              <p className="text-center text-muted-foreground">
                Adjust, enhance, and transform your photos with essential editing tools.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg p-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Layers className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Layer Support</h3>
              <p className="text-center text-muted-foreground">
                Work with layers for complex designs and non-destructive editing.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg p-4">
              <div className="rounded-full bg-primary/10 p-3">
                <ImageIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Templates</h3>
              <p className="text-center text-muted-foreground">
                Start with professionally designed templates for various projects.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg p-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Filters</h3>
              <p className="text-center text-muted-foreground">
                Apply beautiful filters and effects to enhance your images.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg p-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Share2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Easy Sharing</h3>
              <p className="text-center text-muted-foreground">
                Export and share your creations directly to social media.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Projects & Templates Section */}
      <section className="py-20 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Organize Your Work</h2>
              <p className="text-muted-foreground">
                Keep all your projects and edits organized in one place. Access your previous work anytime and build on it.
              </p>
              <Button asChild>
                <Link href="/projects">
                  View My Projects
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="bg-card rounded-lg p-8 border">
              <p className="text-center text-muted-foreground">Projects Gallery Coming Soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Get Started with Pixele
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Start editing your photos right now with our powerful and easy-to-use editor.
              </p>
            </div>
            <Button size="lg" asChild>
              <Link href="/editor">Open Editor</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
