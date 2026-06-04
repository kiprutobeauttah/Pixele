"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardFooter } from "@/components/ui/card"
import { Plus, MoreHorizontal, Folder, ImageIcon, Search, Trash2, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface Project {
  id: string
  name: string
  date: string
  thumbnail: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [showSettings, setShowSettings] = useState(false)

  // Load projects from localStorage on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem("pixele-projects")
    const savedAutoSave = localStorage.getItem("pixele-autosave")
    
    if (savedProjects) {
      try {
        setProjects(JSON.parse(savedProjects))
      } catch (error) {
        console.error("Failed to load projects:", error)
        setProjects([])
      }
    }
    
    if (savedAutoSave !== null) {
      setAutoSaveEnabled(JSON.parse(savedAutoSave))
    }
    
    setIsLoading(false)
  }, [])

  // Save projects to localStorage whenever they change
  useEffect(() => {
    if (!isLoading && autoSaveEnabled) {
      localStorage.setItem("pixele-projects", JSON.stringify(projects))
    }
  }, [projects, isLoading, autoSaveEnabled])

  // Save auto-save preference
  useEffect(() => {
    localStorage.setItem("pixele-autosave", JSON.stringify(autoSaveEnabled))
  }, [autoSaveEnabled])

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id))
  }

  const handleNewProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: `Project ${new Date().toLocaleDateString()}`,
      date: new Date().toISOString(),
      thumbnail: ["/sample-1.jpg", "/sample-2.jpg"][Math.floor(Math.random() * 2)],
    }
    setProjects([newProject, ...projects])
  }

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Projects</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)} title="Settings">
            <Settings className="h-5 w-5" />
          </Button>
          <Button onClick={handleNewProject} className="skeu-button">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {showSettings && (
        <Card className="mb-6 p-4 skeu-card">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="autosave-toggle" className="text-sm font-medium">Auto-save to Cache</Label>
              <p className="text-xs text-muted-foreground">Save projects automatically (uses browser memory)</p>
            </div>
            <Switch
              id="autosave-toggle"
              checked={autoSaveEnabled}
              onCheckedChange={setAutoSaveEnabled}
            />
          </div>
          {!autoSaveEnabled && (
            <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-3">
              ⚠️ Auto-save is disabled. Changes won't be saved unless you manually save them.
            </p>
          )}
        </Card>
      )}

      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search projects..."
            className="pl-8 skeu-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="skeu-button">
          <Folder className="h-4 w-4 mr-2" />
          All ({projects.length})
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-6">Create your first project to get started</p>
          <Button onClick={handleNewProject} asChild>
            <Link href="/editor">Start Creating</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <Card key={project.id} className="overflow-hidden skeu-card">
                <div className="aspect-video relative group bg-muted">
                  <img
                    src={project.thumbnail || "/placeholder.svg"}
                    alt={project.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary" asChild className="skeu-button">
                      <Link href={`/editor?project=${project.id}`}>Edit</Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteProject(project.id)}
                      className="skeu-button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardFooter className="p-3 flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium">{project.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {new Date(project.date).toLocaleDateString()}
                    </p>
                  </div>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">No projects match your search</p>
            </div>
          )}

          <Card className="border-dashed flex flex-col items-center justify-center p-6 h-full aspect-[4/3]">
            <Plus className="h-8 w-8 mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">Create New Project</p>
            <Button variant="outline" className="mt-4 skeu-button" onClick={handleNewProject}>
              Start Creating
            </Button>
          </Card>
        </div>
      )}
    </div>
  )
}
