'use client'

import { useState, useEffect, useRef } from 'react'
import Image from '@/components/Image'
import { motion, AnimatePresence, useMotionValue } from 'framer-motion'
import type { GalleryPhoto } from './gallery-data'

// ---------- 单张可拖拽卡片 ----------
interface DraggablePhotoProps {
  photo: GalleryPhoto
  initialX: number
  initialY: number
  initialRotate: number
  zIndex: number
  entryDelay: number
  onBringToFront: () => void
  onOpenPhoto: (photo: GalleryPhoto, rect: DOMRect) => void
}

function DraggablePhoto({
  photo, initialX, initialY, initialRotate, zIndex, entryDelay, onBringToFront, onOpenPhoto,
}: DraggablePhotoProps) {
  const x = useMotionValue(initialX)
  const y = useMotionValue(initialY)
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerDownPos.current = { x: e.clientX, y: e.clientY }
    onBringToFront()
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!pointerDownPos.current) return
    const dx = e.clientX - pointerDownPos.current.x
    const dy = e.clientY - pointerDownPos.current.y
    if (Math.sqrt(dx * dx + dy * dy) < 5) {
      const rect = cardRef.current?.getBoundingClientRect()
      if (rect) onOpenPhoto(photo, rect)
    }
    pointerDownPos.current = null
  }

  return (
    <motion.div
      ref={cardRef}
      drag
      dragMomentum={false}
      style={{ x, y, rotate: initialRotate, zIndex, position: 'absolute', touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      initial={{ opacity: 0, scale: 0, y: initialY + 80 }}
      animate={{ opacity: 1, scale: 1, y: initialY }}
      whileDrag={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22, delay: entryDelay }}
      className="cursor-grab active:cursor-grabbing bg-white p-2 shadow-xl hover:shadow-2xl transition-shadow rounded-sm border border-gray-100 select-none"
    >
      <img
        src={photo.src}
        alt={photo.desc}
        draggable={false}
        className="pointer-events-none w-36 md:w-56 h-auto block"
      />
    </motion.div>
  )
}

// ---------- 放大预览层 ----------
interface PhotoLightboxProps {
  photo: GalleryPhoto
  originRect: DOMRect
  onClose: () => void
}

function PhotoLightbox({ photo, originRect, onClose }: PhotoLightboxProps) {
  const [visible, setVisible] = useState(true)

  const startX = originRect.left + originRect.width / 2 - window.innerWidth / 2
  const startY = originRect.top + originRect.height / 2 - window.innerHeight / 2
  const startScale = Math.max(originRect.width / window.innerWidth, originRect.height / window.innerHeight) * 1.2

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 350)
  }

  return (
    <div
      className="fixed inset-0 z-[1000]"
      style={{ pointerEvents: visible ? 'auto' : 'none' }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 md:p-12 cursor-pointer"
        onClick={handleClose}
      >
        <div
          className="relative flex flex-col md:flex-row items-center gap-6 cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            initial={{ x: startX, y: startY, scale: startScale, opacity: 0 }}
            animate={{ x: 0, y: 0, scale: 1, opacity: visible ? 1 : 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="bg-white p-3 shadow-2xl rounded-sm"
          >
            <img
              src={photo.src}
              alt={photo.desc}
              className="max-w-[80vw] max-h-[70vh] w-auto h-auto block"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: visible ? 1 : 0, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-white text-center md:text-left max-w-xs"
          >
            <h2 className="text-xl font-bold mb-1">{photo.title}</h2>
            <p className="text-sm text-white/70 mb-2">{photo.date}</p>
            <span className="inline-block bg-teal-500/80 text-white text-xs px-3 py-1 rounded-full">
              {photo.desc}
            </span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

// ---------- 图集主组件 ----------
interface GalleryProps {
  photos: GalleryPhoto[]
  onClose: () => void
}

export default function Gallery({ photos, onClose }: GalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null)
  const [selectedRect, setSelectedRect] = useState<DOMRect | null>(null)
  const [highestZ, setHighestZ] = useState(10)
  const [zIndices, setZIndices] = useState<Record<number, number>>({})
  const [positions, setPositions] = useState<Array<{ x: number; y: number; rotate: number }>>([])

  useEffect(() => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    setPositions(
      photos.map(() => ({
        x: (Math.random() * 0.6 - 0.3) * vw,
        y: (Math.random() * 0.6 - 0.3) * vh,
        rotate: Math.random() * 40 - 20,
      }))
    )
    const initZ: Record<number, number> = {}
    photos.forEach((p) => (initZ[p.id] = 1))
    setZIndices(initZ)
  }, [photos])

  const bringToFront = (id: number) => {
    const newZ = highestZ + 1
    setHighestZ(newZ)
    setZIndices((prev) => ({ ...prev, [id]: newZ }))
  }

  const handleOpenPhoto = (photo: GalleryPhoto, rect: DOMRect) => {
    setSelectedRect(rect)
    setSelectedPhoto(photo)
  }

  if (positions.length === 0) return null

  return (
    <>
      <div className="relative w-full h-full flex items-center justify-center">
        {photos.map((photo, index) => (
          <DraggablePhoto
            key={photo.id}
            photo={photo}
            initialX={positions[index].x}
            initialY={positions[index].y}
            initialRotate={positions[index].rotate}
            zIndex={zIndices[photo.id] ?? 1}
            entryDelay={index * 0.08}
            onBringToFront={() => bringToFront(photo.id)}
            onOpenPhoto={handleOpenPhoto}
          />
        ))}
      </div>

      {selectedPhoto && selectedRect && (
        <PhotoLightbox
          key={selectedPhoto.id}
          photo={selectedPhoto}
          originRect={selectedRect}
          onClose={() => {
            setSelectedPhoto(null)
            setSelectedRect(null)
          }}
        />
      )}
    </>
  )
}