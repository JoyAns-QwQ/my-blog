'use client'

import Gallery from '../Gallery'
import galleryPhotos from '../gallery-data'

export default function GalleryPage() {
  return (
    <div className="fixed inset-0 overflow-hidden">
    <div className="relative min-h-screen w-full flex items-center justify-center">
      <Gallery photos={galleryPhotos} onClose={() => {}} />
    </div>
    </div>
  )
}