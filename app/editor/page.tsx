"use client"

import type React from "react"

import { useState, useRef, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Upload,
  Crop,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Maximize,
  SunMedium,
  Palette,
  Droplets,
  Sparkles,
  Eye,
  Layers,
  Undo,
  Redo,
  Download,
  Save,
  Share2,
  PanelLeft,
  PanelRight,
  Sliders,
  X,
  Check,
} from "lucide-react"

function EditorPageContent() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get("project")

  // State for the image and canvas
  const [image, setImage] = useState<string | null>(null)
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [activeTab, setActiveTab] = useState("basic")
  const [showLayers, setShowLayers] = useState(true)
  const [showTools, setShowTools] = useState(true)
  const [showExport, setShowExport] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")
  const [exportFormat, setExportFormat] = useState("png")
  const [exportQuality, setExportQuality] = useState(90)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [zoom, setZoom] = useState(100)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)

  // Canvas and image references
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Tool states
  const [cropMode, setCropMode] = useState(false)
  const [cropRect, setCropRect] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [cropStart, setCropStart] = useState({ x: 0, y: 0 })
  const [cropAspectRatio, setCropAspectRatio] = useState<number | null>(null)

  // Transform states
  const [rotation, setRotation] = useState(0)
  const [flipHorizontal, setFlipHorizontal] = useState(false)
  const [flipVertical, setFlipVertical] = useState(false)
  const [scale, setScale] = useState(100)
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true)
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)

  // Adjustment states
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [vibrance, setVibrance] = useState(0)
  const [hue, setHue] = useState(0)
  const [grayscale, setGrayscale] = useState(false)
  const [sepia, setSepia] = useState(false)
  const [exposure, setExposure] = useState(100)
  const [highlights, setHighlights] = useState(0)
  const [shadows, setShadows] = useState(0)
  const [sharpness, setSharpness] = useState(0)
  const [blur, setBlur] = useState(0)
  const [invert, setInvert] = useState(false)
  const [vignette, setVignette] = useState(0)

  // Layers state (simplified for demo)
  const [layers, setLayers] = useState([{ id: 1, name: "Background", visible: true, locked: false, active: true }])

  // Load auto-save preference on mount
  useEffect(() => {
    const savedAutoSave = localStorage.getItem("pixele-autosave")
    if (savedAutoSave !== null) {
      setAutoSaveEnabled(JSON.parse(savedAutoSave))
    }
  }, [])

  // Load project from cache on mount
  useEffect(() => {
    if (projectId) {
      const savedProjects = localStorage.getItem("pixele-projects")
      if (savedProjects) {
        try {
          const projects = JSON.parse(savedProjects)
          const project = projects.find((p: any) => p.id === projectId)
          if (project) {
            setImage(project.thumbnail)
            setOriginalImage(project.thumbnail)
            setHistory([project.thumbnail])
            setHistoryIndex(0)

            // Load a smaller version for display
            const img = new Image()
            img.onload = () => {
              imageRef.current = img
              setWidth(img.width)
              setHeight(img.height)
            }
            img.src = project.thumbnail
          }
        } catch (error) {
          console.error("Failed to load project:", error)
        }
      }
    }
  }, [projectId])

  // Auto-save project edits
  useEffect(() => {
    if (!image || !projectId || !autoSaveEnabled) return

    const timer = setTimeout(() => {
      try {
        setSaveStatus("saving")
        const savedProjects = localStorage.getItem("pixele-projects")
        if (savedProjects) {
          const projects = JSON.parse(savedProjects)
          const projectIndex = projects.findIndex((p: any) => p.id === projectId)
          if (projectIndex !== -1) {
            projects[projectIndex].thumbnail = image
            projects[projectIndex].date = new Date().toISOString()
            localStorage.setItem("pixele-projects", JSON.stringify(projects))
            setSaveStatus("saved")
            setTimeout(() => setSaveStatus("idle"), 2000)
          }
        }
      } catch (error) {
        console.error("Failed to save project:", error)
        setSaveStatus("idle")
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [image, projectId, autoSaveEnabled])

  // Apply filter presets
  const applyFilter = (filter: string) => {
    resetAdjustments()

    switch (filter) {
      case "vintage":
        setSepia(true)
        setSaturation(80)
        setContrast(120)
        setVignette(30)
        break
      case "blackAndWhite":
        setGrayscale(true)
        setContrast(120)
        setBrightness(110)
        break
      case "warm":
        setHue(10)
        setSaturation(110)
        setBrightness(105)
        break
      case "cool":
        setHue(-10)
        setSaturation(90)
        setBrightness(100)
        break
      case "sharp":
        setSharpness(50)
        setContrast(110)
        break
      case "soft":
        setBlur(1)
        setBrightness(105)
        setContrast(90)
        break
      default:
        break
    }
  }

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          imageRef.current = img
          const imgSrc = event.target?.result as string
          setImage(imgSrc)
          setOriginalImage(imgSrc)
          setWidth(img.width)
          setHeight(img.height)

          // Reset all adjustments
          resetAdjustments()

          // Add to history
          setHistory([imgSrc])
          setHistoryIndex(0)
        }
        img.src = event.target?.result as string
      }
      reader.readAsDataURL(file)
    }
  }
  // Zoom controls
  const handleZoom = (direction: "in" | "out" | "reset") => {
    if (direction === "in") {
      setZoom((prev) => Math.min(prev + 10, 300))
    } else if (direction === "out") {
      setZoom((prev) => Math.max(prev - 10, 50))
    } else {
      setZoom(100)
    }
  }
  // Reset all adjustments
  const resetAdjustments = () => {
    setRotation(0)
    setFlipHorizontal(false)
    setFlipVertical(false)
    setScale(100)
    setBrightness(100)
    setContrast(100)
    setSaturation(100)
    setVibrance(0)
    setHue(0)
    setGrayscale(false)
    setSepia(false)
    setExposure(100)
    setHighlights(0)
    setShadows(0)
    setSharpness(0)
    setBlur(0)
    setInvert(false)
    setVignette(0)
    setCropMode(false)
    setCropRect({ x: 0, y: 0, width: 0, height: 0 })
  }

  // Right-click context menu
  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }
  const addToHistory = () => {
    if (!canvasRef.current) return

    const newState = canvasRef.current.toDataURL()

    // If we're not at the end of the history, truncate it
    if (historyIndex < history.length - 1) {
      setHistory(history.slice(0, historyIndex + 1))
    }

    setHistory([...history.slice(0, historyIndex + 1), newState])
    setHistoryIndex(historyIndex + 1)
  }

  // Undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setImage(history[newIndex])
    }
  }

  // Redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setImage(history[newIndex])
    }
  }

  // Reset to original
  const resetToOriginal = () => {
    if (originalImage) {
      setImage(originalImage)
      resetAdjustments()
      setHistory([originalImage])
      setHistoryIndex(0)
    }
  }

  // Crop functions
  const toggleCropMode = () => {
    setCropMode(!cropMode)
    if (!cropMode) {
      setCropRect({ x: 0, y: 0, width: 0, height: 0 })
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!cropMode || !canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setCropStart({ x, y })
    setCropRect({ x, y, width: 0, height: 0 })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!cropMode || !canvasRef.current || !cropStart) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    let width = e.clientX - rect.left - cropStart.x
    let height = e.clientY - rect.top - cropStart.y

    // Apply aspect ratio constraint if selected
    if (cropAspectRatio) {
      if (Math.abs(width) > Math.abs(height * cropAspectRatio)) {
        height = width / cropAspectRatio
      } else {
        width = height * cropAspectRatio
      }
    }

    setCropRect({
      x: cropStart.x,
      y: cropStart.y,
      width,
      height,
    })
  }

  const handleMouseUp = () => {
    if (!cropMode) return

    // Normalize negative width/height
    const normalizedRect = {
      x: cropRect.width < 0 ? cropRect.x + cropRect.width : cropRect.x,
      y: cropRect.height < 0 ? cropRect.y + cropRect.height : cropRect.y,
      width: Math.abs(cropRect.width),
      height: Math.abs(cropRect.height),
    }

    setCropRect(normalizedRect)
  }

  const applyCrop = () => {
    if (!canvasRef.current || !imageRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Create a temporary canvas for the cropped image
    const tempCanvas = document.createElement("canvas")
    const tempCtx = tempCanvas.getContext("2d")
    if (!tempCtx) return

    // Set dimensions for the cropped image
    tempCanvas.width = cropRect.width
    tempCanvas.height = cropRect.height

    // Draw the cropped portion to the temporary canvas
    tempCtx.drawImage(
      canvas,
      cropRect.x,
      cropRect.y,
      cropRect.width,
      cropRect.height,
      0,
      0,
      cropRect.width,
      cropRect.height,
    )

    // Create a new image from the cropped canvas
    const newImage = new Image()
    newImage.onload = () => {
      imageRef.current = newImage
      setImage(tempCanvas.toDataURL())
      setWidth(cropRect.width)
      setHeight(cropRect.height)
      setCropMode(false)
      setCropRect({ x: 0, y: 0, width: 0, height: 0 })

      // Add to history
      addToHistory()
    }
    newImage.src = tempCanvas.toDataURL()
  }

  const cancelCrop = () => {
    setCropMode(false)
    setCropRect({ x: 0, y: 0, width: 0, height: 0 })
  }

  // Transform functions
  const rotateImage = (direction: "clockwise" | "counterclockwise") => {
    const degrees = direction === "clockwise" ? 90 : -90
    setRotation((prev) => (prev + degrees) % 360)
  }

  const handleFlipHorizontal = () => {
    setFlipHorizontal(!flipHorizontal)
  }

  const handleFlipVertical = () => {
    setFlipVertical(!flipVertical)
  }

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = Number.parseInt(e.target.value)
    setWidth(newWidth)

    if (maintainAspectRatio && imageRef.current) {
      const aspectRatio = imageRef.current.width / imageRef.current.height
      setHeight(Math.round(newWidth / aspectRatio))
    }
  }

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = Number.parseInt(e.target.value)
    setHeight(newHeight)

    if (maintainAspectRatio && imageRef.current) {
      const aspectRatio = imageRef.current.width / imageRef.current.height
      setWidth(Math.round(newHeight * aspectRatio))
    }
  }

  const applyResize = () => {
    if (!canvasRef.current || !imageRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Create a temporary canvas for the resized image
    const tempCanvas = document.createElement("canvas")
    const tempCtx = tempCanvas.getContext("2d")
    if (!tempCtx) return

    // Set dimensions for the resized image
    tempCanvas.width = width
    tempCanvas.height = height

    // Draw the image with new dimensions
    tempCtx.drawImage(imageRef.current, 0, 0, width, height)

    // Create a new image from the resized canvas
    const newImage = new Image()
    newImage.onload = () => {
      imageRef.current = newImage
      setImage(tempCanvas.toDataURL())

      // Add to history
      addToHistory()
    }
    newImage.src = tempCanvas.toDataURL()
  }

  // Apply adjustments to canvas
  const applyAdjustments = () => {
    if (!canvasRef.current || !imageRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Apply transformations
    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1)

    // Draw image with adjustments
    ctx.filter = `
      brightness(${brightness / 100})
      contrast(${contrast / 100})
      saturate(${saturation / 100})
      hue-rotate(${hue}deg)
      ${grayscale ? "grayscale(1)" : ""}
      ${sepia ? "sepia(1)" : ""}
      ${invert ? "invert(1)" : ""}
      blur(${blur}px)
    `

    ctx.drawImage(
      imageRef.current,
      -imageRef.current.width / 2,
      -imageRef.current.height / 2,
      imageRef.current.width,
      imageRef.current.height,
    )

    // Apply vignette
    if (vignette > 0) {
      const gradient = ctx.createRadialGradient(
        0,
        0,
        Math.min(canvas.width, canvas.height) * 0.4,
        0,
        0,
        Math.min(canvas.width, canvas.height) * 0.7,
      )
      gradient.addColorStop(0, "rgba(0,0,0,0)")
      gradient.addColorStop(1, `rgba(0,0,0,${vignette / 100})`)
      ctx.fillStyle = gradient
      ctx.fillRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height)
    }

    ctx.restore()

    // Draw crop overlay
    if (cropMode && cropRect.width && cropRect.height) {
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 2
      ctx.strokeRect(cropRect.x, cropRect.y, cropRect.width, cropRect.height)

      // Darken outside area
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
      ctx.fillRect(0, 0, canvas.width, cropRect.y) // top
      ctx.fillRect(0, cropRect.y, cropRect.x, cropRect.height) // left
      ctx.fillRect(cropRect.x + cropRect.width, cropRect.y, canvas.width - cropRect.x - cropRect.width, cropRect.height) // right
      ctx.fillRect(0, cropRect.y + cropRect.height, canvas.width, canvas.height - cropRect.y - cropRect.height) // bottom
    }
  }

  // Save edited image
  const saveImage = () => {
    if (!canvasRef.current) return

    const link = document.createElement("a")
    link.download = "edited-image.png"
    link.href = canvasRef.current.toDataURL()
    link.click()
  }

  // Export image with custom format and quality
  const exportImage = (format: string, quality: number) => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    let dataUrl: string

    if (format === "png") {
      dataUrl = canvas.toDataURL("image/png")
    } else if (format === "jpg") {
      dataUrl = canvas.toDataURL("image/jpeg", quality / 100)
    } else if (format === "webp") {
      dataUrl = canvas.toDataURL("image/webp", quality / 100)
    } else {
      dataUrl = canvas.toDataURL()
    }

    const link = document.createElement("a")
    link.download = `pixele-edited.${format}`
    link.href = dataUrl
    link.click()
  }

  // Share image
  const shareImage = async () => {
    if (!canvasRef.current) return

    try {
      const canvas = canvasRef.current
      canvas.toBlob(async (blob) => {
        if (!blob) return

        // Check if Web Share API is available
        if (navigator.share) {
          try {
            await navigator.share({
              title: "Pixele Photo",
              text: "Check out my edited photo!",
              files: [
                new File([blob], "pixele-photo.png", { type: "image/png" })
              ]
            })
          } catch (error) {
            if ((error as Error).name !== "AbortError") {
              console.error("Share error:", error)
            }
          }
        } else {
          // Fallback: copy to clipboard
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ "image/png": blob })
            ])
            alert("Image copied to clipboard!")
          } catch (error) {
            console.error("Clipboard error:", error)
            alert("Unable to share. Please use export instead.")
          }
        }
      })
    } catch (error) {
      console.error("Share error:", error)
    }
  }
  // Apply changes and add to history
  const applyChanges = () => {
    if (!canvasRef.current) return
    addToHistory()
  }

  // Toggle panels
  const toggleLayers = () => {
    setShowLayers(!showLayers)
  }

  const toggleTools = () => {
    setShowTools(!showTools)
  }

  const toggleExport = () => {
    setShowExport(!showExport)
  }

  // Update canvas when image or adjustments change
  useEffect(() => {
    if (!image || !canvasRef.current || !imageRef.current || !containerRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const container = containerRef.current
    // Leave margin for zoom controls and spacing
    const containerWidth = container.clientWidth - 40
    const containerHeight = container.clientHeight - 80

    const img = imageRef.current

    // Determine if we need to rotate dimensions
    const isRotated = rotation % 180 !== 0
    const imgWidth = isRotated ? img.height : img.width
    const imgHeight = isRotated ? img.width : img.height

    // Scale image to fit container while maintaining aspect ratio
    let displayScale = Math.min(containerWidth / imgWidth, containerHeight / imgHeight)
    
    // Ensure minimum scale for visibility
    displayScale = Math.max(displayScale, 0.1)

    canvas.width = imgWidth * displayScale
    canvas.height = imgHeight * displayScale

    // Apply all adjustments
    applyAdjustments()
  }, [
    image,
    rotation,
    flipHorizontal,
    flipVertical,
    brightness,
    contrast,
    saturation,
    vibrance,
    hue,
    grayscale,
    sepia,
    exposure,
    highlights,
    shadows,
    sharpness,
    blur,
    invert,
    vignette,
    cropMode,
    cropRect,
  ])

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Tools Sidebar */}
      {showTools && (
        <div className="w-64 border-r skeu-card overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-bold mb-4">Tools</h2>
            <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="adjust">Adjust</TabsTrigger>
                <TabsTrigger value="filters">Filters</TabsTrigger>
              </TabsList>

              <div className="mt-4">
                {!image && (
                  <div className="text-center py-6">
                    <div className="cursor-pointer w-full">
                      <Button className="w-full skeu-button" asChild>
                        <label htmlFor="file-upload-tools" className="cursor-pointer block">
                          <Upload className="h-4 w-4 mr-2 inline" />
                          Upload Image
                        </label>
                      </Button>
                      <input
                        id="file-upload-tools"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>
                )}

                {image && (
                  <>
                    <TabsContent value="basic" className="space-y-4 mt-0">
                      <div>
                        <h3 className="text-sm font-medium flex items-center">
                          <Upload className="h-4 w-4 mr-2" />
                          Image
                        </h3>
                        <div className="mt-2">
                          <Button className="w-full skeu-button" asChild>
                            <label htmlFor="file-upload-sidebar" className="cursor-pointer block">
                              <Upload className="h-4 w-4 mr-2 inline" />
                              Upload Image
                            </label>
                          </Button>
                          <input
                            id="file-upload-sidebar"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-sm font-medium flex items-center">
                          <Crop className="h-4 w-4 mr-2" />
                          Crop
                        </h3>
                        <div className="mt-2">
                          <Button
                            variant={cropMode ? "default" : "outline"}
                            onClick={toggleCropMode}
                            className="w-full"
                            size="sm"
                          >
                            {cropMode ? "Cancel Crop" : "Start Crop"}
                          </Button>

                          {cropMode && (
                            <div className="mt-2">
                              <Label htmlFor="aspect-ratio" className="text-xs">
                                Aspect Ratio
                              </Label>
                              <Select
                                onValueChange={(value) => {
                                  if (value === "free") {
                                    setCropAspectRatio(null)
                                  } else if (value === "1:1") {
                                    setCropAspectRatio(1)
                                  } else if (value === "4:3") {
                                    setCropAspectRatio(4 / 3)
                                  } else if (value === "16:9") {
                                    setCropAspectRatio(16 / 9)
                                  }
                                }}
                                defaultValue="free"
                              >
                                <SelectTrigger id="aspect-ratio">
                                  <SelectValue placeholder="Select aspect ratio" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="free">Free</SelectItem>
                                  <SelectItem value="1:1">Square (1:1)</SelectItem>
                                  <SelectItem value="4:3">4:3</SelectItem>
                                  <SelectItem value="16:9">16:9</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          {cropMode && (
                            <div className="mt-2 flex gap-2">
                              <Button
                                variant="outline"
                                onClick={cancelCrop}
                                className="w-1/2"
                                size="sm"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={applyCrop}
                                className="w-1/2"
                                size="sm"
                              >
                                Apply
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-sm font-medium flex items-center">
                          <RotateCw className="h-4 w-4 mr-2" />
                          Rotate & Flip
                        </h3>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <Button variant="outline" onClick={() => rotateImage("counterclockwise")} size="sm">
                            <RotateCcw className="h-4 w-4 mr-1" />
                            90° Left
                          </Button>
                          <Button variant="outline" onClick={() => rotateImage("clockwise")} size="sm">
                            <RotateCw className="h-4 w-4 mr-1" />
                            90° Right
                          </Button>
                          <Button variant="outline" onClick={handleFlipHorizontal} size="sm">
                            <FlipHorizontal className="h-4 w-4 mr-1" />
                            Flip H
                          </Button>
                          <Button variant="outline" onClick={handleFlipVertical} size="sm">
                            <FlipVertical className="h-4 w-4 mr-1" />
                            Flip V
                          </Button>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-between items-center">
                            <Label htmlFor="rotation-slider" className="text-xs">
                              Rotation: {rotation}°
                            </Label>
                          </div>
                          <Slider
                            id="rotation-slider"
                            min={0}
                            max={359}
                            step={1}
                            value={[rotation]}
                            onValueChange={(value) => setRotation(value[0])}
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-sm font-medium flex items-center">
                          <Maximize className="h-4 w-4 mr-2" />
                          Resize
                        </h3>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center space-x-2">
                            <Label htmlFor="maintain-aspect" className="text-xs">
                              Maintain aspect ratio
                            </Label>
                            <Switch
                              id="maintain-aspect"
                              checked={maintainAspectRatio}
                              onCheckedChange={setMaintainAspectRatio}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label htmlFor="width" className="text-xs">
                                Width
                              </Label>
                              <Input
                                id="width"
                                type="number"
                                value={width}
                                onChange={handleWidthChange}
                                className="h-8"
                              />
                            </div>
                            <div>
                              <Label htmlFor="height" className="text-xs">
                                Height
                              </Label>
                              <Input
                                id="height"
                                type="number"
                                value={height}
                                onChange={handleHeightChange}
                                className="h-8"
                              />
                            </div>
                          </div>
                          <Button onClick={applyResize} className="w-full" size="sm">
                            Apply Resize
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="adjust" className="space-y-4 mt-0">
                      <div>
                        <h3 className="text-sm font-medium flex items-center">
                          <SunMedium className="h-4 w-4 mr-2" />
                          Brightness / Contrast
                        </h3>
                        <div className="mt-2 space-y-3">
                          <div>
                            <div className="flex justify-between">
                              <Label htmlFor="brightness-slider" className="text-xs">
                                Brightness
                              </Label>
                              <span className="text-xs">{brightness}%</span>
                            </div>
                            <Slider
                              id="brightness-slider"
                              min={0}
                              max={200}
                              step={1}
                              value={[brightness]}
                              onValueChange={(value) => setBrightness(value[0])}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between">
                              <Label htmlFor="contrast-slider" className="text-xs">
                                Contrast
                              </Label>
                              <span className="text-xs">{contrast}%</span>
                            </div>
                            <Slider
                              id="contrast-slider"
                              min={0}
                              max={200}
                              step={1}
                              value={[contrast]}
                              onValueChange={(value) => setContrast(value[0])}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-sm font-medium flex items-center">
                          <Palette className="h-4 w-4 mr-2" />
                          Saturation / Vibrance
                        </h3>
                        <div className="mt-2 space-y-3">
                          <div>
                            <div className="flex justify-between">
                              <Label htmlFor="saturation-slider" className="text-xs">
                                Saturation
                              </Label>
                              <span className="text-xs">{saturation}%</span>
                            </div>
                            <Slider
                              id="saturation-slider"
                              min={0}
                              max={200}
                              step={1}
                              value={[saturation]}
                              onValueChange={(value) => setSaturation(value[0])}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between">
                              <Label htmlFor="vibrance-slider" className="text-xs">
                                Vibrance
                              </Label>
                              <span className="text-xs">{vibrance}%</span>
                            </div>
                            <Slider
                              id="vibrance-slider"
                              min={0}
                              max={100}
                              step={1}
                              value={[vibrance]}
                              onValueChange={(value) => setVibrance(value[0])}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-sm font-medium flex items-center">
                          <Droplets className="h-4 w-4 mr-2" />
                          Hue Shift
                        </h3>
                        <div className="mt-2">
                          <div className="flex justify-between">
                            <Label htmlFor="hue-slider" className="text-xs">
                              Hue
                            </Label>
                            <span className="text-xs">{hue}°</span>
                          </div>
                          <Slider
                            id="hue-slider"
                            min={-180}
                            max={180}
                            step={1}
                            value={[hue]}
                            onValueChange={(value) => setHue(value[0])}
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-sm font-medium flex items-center">
                          <Sparkles className="h-4 w-4 mr-2" />
                          Effects
                        </h3>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="grayscale" className="text-xs">
                              Grayscale
                            </Label>
                            <Switch id="grayscale" checked={grayscale} onCheckedChange={setGrayscale} />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="sepia" className="text-xs">
                              Sepia
                            </Label>
                            <Switch id="sepia" checked={sepia} onCheckedChange={setSepia} />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="invert" className="text-xs">
                              Invert Colors
                            </Label>
                            <Switch id="invert" checked={invert} onCheckedChange={setInvert} />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-sm font-medium flex items-center">
                          <Eye className="h-4 w-4 mr-2" />
                          Sharpness / Blur
                        </h3>
                        <div className="mt-2">
                          <div className="flex justify-between">
                            <Label htmlFor="blur-slider" className="text-xs">
                              Blur
                            </Label>
                            <span className="text-xs">{blur}px</span>
                          </div>
                          <Slider
                            id="blur-slider"
                            min={0}
                            max={10}
                            step={0.1}
                            value={[blur]}
                            onValueChange={(value) => setBlur(value[0])}
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-sm font-medium">Vignette</h3>
                        <div className="mt-2">
                          <div className="flex justify-between">
                            <Label htmlFor="vignette-slider" className="text-xs">
                              Intensity
                            </Label>
                            <span className="text-xs">{vignette}%</span>
                          </div>
                          <Slider
                            id="vignette-slider"
                            min={0}
                            max={100}
                            step={1}
                            value={[vignette]}
                            onValueChange={(value) => setVignette(value[0])}
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <Button onClick={applyChanges} className="w-full mt-2" size="sm">
                        Apply Changes
                      </Button>
                    </TabsContent>

                    <TabsContent value="filters" className="space-y-4 mt-0">
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" onClick={() => applyFilter("vintage")} size="sm">
                          Vintage
                        </Button>
                        <Button variant="outline" onClick={() => applyFilter("blackAndWhite")} size="sm">
                          B&W
                        </Button>
                        <Button variant="outline" onClick={() => applyFilter("warm")} size="sm">
                          Warm
                        </Button>
                        <Button variant="outline" onClick={() => applyFilter("cool")} size="sm">
                          Cool
                        </Button>
                        <Button variant="outline" onClick={() => applyFilter("sharp")} size="sm">
                          Sharp
                        </Button>
                        <Button variant="outline" onClick={() => applyFilter("soft")} size="sm">
                          Soft
                        </Button>
                      </div>
                      <div className="text-center text-xs text-muted-foreground mt-4">More filters coming soon!</div>
                    </TabsContent>
                  </>
                )}
              </div>
            </Tabs>
          </div>
        </div>
      )}

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="h-12 border-b skeu-card flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={toggleTools} title="Toggle Tools Panel">
              <PanelLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleUndo} disabled={historyIndex <= 0} title="Undo">
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              title="Redo"
            >
              <Redo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={resetToOriginal}
              disabled={!originalImage}
              title="Reset to Original"
            >
              <Sliders className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-xs" onClick={toggleExport} disabled={!image}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs"
              disabled={!image || saveStatus !== "idle"}
              onClick={() => saveImage()}
            >
              {saveStatus === "saving" ? (
                <>
                  <span className="h-4 w-4 mr-1 inline-block animate-spin">⟳</span>
                  Saving...
                </>
              ) : saveStatus === "saved" ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </>
              )}
            </Button>
            <Button variant="ghost" size="sm" className="text-xs" onClick={shareImage} disabled={!image}>
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={toggleLayers} title="Toggle Layers Panel">
              <PanelRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-muted flex flex-col items-center justify-center overflow-auto p-4" ref={containerRef}>
          {image && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 flex gap-2 bg-background/90 backdrop-blur p-2 rounded-lg border skeu-card">
              <Button variant="ghost" size="sm" onClick={() => handleZoom("out")} title="Zoom Out" className="text-xs">
                −
              </Button>
              <span className="px-4 py-1 text-xs font-medium">{zoom}%</span>
              <Button variant="ghost" size="sm" onClick={() => handleZoom("in")} title="Zoom In" className="text-xs">
                +
              </Button>
              <div className="w-px bg-border" />
              <Button variant="ghost" size="sm" onClick={() => handleZoom("reset")} title="Reset Zoom" className="text-xs">
                Reset
              </Button>
            </div>
          )}
          <div className="flex-1 flex items-center justify-center w-full overflow-auto">
          {!image ? (
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No image selected</h3>
              <p className="mt-1 text-sm text-muted-foreground">Upload an image to get started</p>
              <div className="mt-6">
                <Button asChild>
                  <label htmlFor="file-upload-canvas" className="cursor-pointer">
                    Upload Image
                  </label>
                </Button>
                <input
                  id="file-upload-canvas"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          ) : (
            <div className="relative flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="border rounded-lg shadow-md skeu-raised max-w-full max-h-full"
                style={{ 
                  transform: `scale(${zoom / 100})`, 
                  transformOrigin: 'center',
                  display: 'block'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onContextMenu={handleContextMenu}
              />

              {cropMode && (
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <Button variant="secondary" onClick={cancelCrop} size="sm">
                    Cancel
                  </Button>
                  <Button onClick={applyCrop} size="sm">
                    Apply Crop
                  </Button>
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Layers Panel */}
      {showLayers && (
        <div className="w-64 border-l skeu-card overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-bold mb-4">Layers</h2>
            <div className="space-y-2">
              {layers.map((layer) => (
                <div
                  key={layer.id}
                  className={`p-2 rounded-md flex items-center justify-between ${layer.active ? "bg-accent" : ""}`}
                >
                  <div className="flex items-center">
                    <Switch
                      checked={layer.visible}
                      onCheckedChange={() => {
                        // Toggle layer visibility
                        setLayers(layers.map((l) => (l.id === layer.id ? { ...l, visible: !l.visible } : l)))
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{layer.name}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Layers className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" className="w-full">
                Add Layer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Export Panel */}
      {showExport && (
        <div className="absolute right-0 top-12 w-64 border-l skeu-card h-[calc(100vh-4rem-3rem)] z-10">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Export</h2>
              <Button variant="ghost" size="icon" onClick={toggleExport} className="h-6 w-6">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="export-format" className="text-sm">
                  Format
                </Label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger id="export-format">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="jpg">JPG</SelectItem>
                    <SelectItem value="webp">WebP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="export-quality" className="text-sm">
                  Quality: {exportQuality}%
                </Label>
                <Slider id="export-quality" min={1} max={100} step={1} value={[exportQuality]} onValueChange={(value) => setExportQuality(value[0])} className="mt-2" />
              </div>
              <div>
                <Label htmlFor="export-size" className="text-sm">
                  Size
                </Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <Label htmlFor="export-width" className="text-xs">
                      Width
                    </Label>
                    <Input id="export-width" type="number" value={width} className="h-8" disabled />
                  </div>
                  <div>
                    <Label htmlFor="export-height" className="text-xs">
                      Height
                    </Label>
                    <Input id="export-height" type="number" value={height} className="h-8" disabled />
                  </div>
                </div>
              </div>
              <Button onClick={() => { exportImage(exportFormat, exportQuality); toggleExport(); }} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
            onContextMenu={(e) => {
              e.preventDefault()
              setContextMenu(null)
            }}
          />
          <div
            className="fixed z-50 bg-background border rounded-lg shadow-lg skeu-card py-1"
            style={{
              left: `${contextMenu.x}px`,
              top: `${contextMenu.y}px`,
            }}
          >
            <button
              onClick={() => {
                applyChanges()
                setContextMenu(null)
              }}
              className="w-full px-4 py-2 text-sm text-left hover:bg-accent flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Apply Changes
            </button>
            <button
              onClick={() => {
                resetToOriginal()
                setContextMenu(null)
              }}
              className="w-full px-4 py-2 text-sm text-left hover:bg-accent flex items-center gap-2"
            >
              <Sliders className="h-4 w-4" />
              Reset to Original
            </button>
            <button
              onClick={() => {
                saveImage()
                setContextMenu(null)
              }}
              className="w-full px-4 py-2 text-sm text-left hover:bg-accent flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Save Image
            </button>
            <div className="border-t my-1" />
            <button
              onClick={() => {
                handleZoom("reset")
                setContextMenu(null)
              }}
              className="w-full px-4 py-2 text-sm text-left hover:bg-accent"
            >
              Reset Zoom
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-[calc(100vh-4rem)]">Loading editor...</div>}>
      <EditorPageContent />
    </Suspense>
  )
}
