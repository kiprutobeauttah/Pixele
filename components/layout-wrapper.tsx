"use client"

import { usePathname } from "next/navigation"
import { Footer } from "@/components/footer"

export function LayoutWrapper() {
  const pathname = usePathname()
  
  // Hide footer on editor page
  if (pathname?.includes('/editor')) {
    return null
  }
  
  return <Footer />
}
