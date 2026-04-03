'use client'

// ============================================================
// 🏠 Main.tsx — 首页
//
// 结构说明：
// - 图集数据  → app/gallery-data.ts  （改图片在这里）
// - 图集交互  → app/Gallery.tsx      （图集 UI 逻辑在这里）
// - 首页布局  → 本文件               （主页 widget 在这里）
// ============================================================

import { useState, useEffect } from 'react'
import Image from '@/components/Image'
import Link from '@/components/Link'
import siteMetadata from '@/data/siteMetadata'
import { formatDate } from 'pliny/utils/formatDate'
import { motion, AnimatePresence } from 'framer-motion'
import SocialIcon from '@/components/social-icons'
import Gallery from './Gallery'
import galleryPhotos from './gallery-data'

// ===== 公共 Widget 容器 =====
const WidgetWrapper = ({
  children,
  className = '',
  delay = 0,
  layoutId = undefined,
  onClick = undefined,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  layoutId?: string
  onClick?: () => void
}) => (
  <motion.div
    layoutId={layoutId}
    onClick={onClick}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-sm border border-white/40 dark:border-gray-700/30 ${className}`}
  >
    {children}
  </motion.div>
)

// ===== 时钟 Widget =====
function ClockWidget() {
  const [mounted, setMounted] = useState(false)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (!mounted) return <div className="h-24" />

  const timeString = now.toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <WidgetWrapper className="flex flex-col items-center justify-center h-full min-h-[120px]">
      <div className="text-4xl font-mono font-bold tracking-tighter text-teal-600 dark:text-teal-400">
        {timeString}
      </div>
      <div className="text-[10px] text-gray-400 mt-1 font-medium">
        {now.toLocaleDateString('zh-CN', { weekday: 'long' })}
      </div>
    </WidgetWrapper>
  )
}

// ===== 侧边导航 Widget =====
function SidebarWidget({ layoutId }: { layoutId: string }) {
  const navLinks = [
    { name: '近期文章', href: '/blog', icon: '📖' },
    { name: '关于网站', href: '/about', icon: '🍃' },
    { name: '标签归档', href: '/tags', icon: '🔖' },
    { name: '开源项目', href: '/projects', icon: '🛠️' },
  ]

  return (
    <WidgetWrapper layoutId={layoutId} className="h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md">
            <Image src="/static/images/avatar.png" alt="avatar" width={48} height={48} />
          </div>
          <div>
            <h2 className="font-bold text-gray-800 dark:text-white">JoyAns</h2>
            <p className="text-[10px] text-teal-500 font-bold uppercase tracking-wider">noobe</p>
          </div>
        </div>
        <nav className="space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all group"
            >
              <span className="group-hover:scale-120 transition-transform">{link.icon}</span>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {link.name}
              </span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="pt-6 border-t border-gray-100 dark:border-gray-700 mt-4 flex gap-4 justify-center">
        <SocialIcon kind="github" href={siteMetadata.github} size={5} />
        <SocialIcon kind="mail" href={`mailto:${siteMetadata.email}`} size={5} />
      </div>
    </WidgetWrapper>
  )
}

// ===== 首页主组件 =====
export default function Home({ posts }: { posts: any[] }) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[90vh] py-12 px-4">

      {/* 状态 A：常规主页 */}
      <AnimatePresence>
        {!isGalleryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-fr"
          >
            {/* 侧边导航 */}
            <div className="md:col-span-3 md:row-span-2">
              <SidebarWidget layoutId="sidebar-morph" />
            </div>

            {/* 图集入口横幅 */}
            <WidgetWrapper
              layoutId="gallery-bg"
              onClick={() => setIsGalleryOpen(true)}
              className="md:col-span-6 p-2 h-full overflow-hidden cursor-pointer group"
            >
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full font-bold text-teal-600 shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-all">
                  Enter Gallery ✨
                </span>
              </div>
              <div className="relative h-full min-h-[120px] w-full rounded-[1.8rem] overflow-hidden group-hover:scale-105 transition-transform duration-500">
                <Image src="/static/images/twitter-card.png" alt="cover" fill className="object-cover" />
              </div>
            </WidgetWrapper>

            {/* 时钟 */}
            <div className="md:col-span-3">
              <ClockWidget />
            </div>

            {/* 欢迎卡片 */}
            <WidgetWrapper className="md:col-span-3 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-teal-50 mb-3 flex items-center justify-center text-2xl shadow-inner">
                👋
              </div>
              <h3 className="font-bold text-gray-800 dark:text-white">Hellow!</h3>
              <p className="text-xs text-gray-500 mt-1">Welcome</p>
            </WidgetWrapper>

            {/* 最新文章 */}
            <WidgetWrapper className="md:col-span-6 flex flex-col justify-center">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Latest Release
                </h4>
                <Link href="/blog" className="text-[10px] text-teal-500 hover:underline">
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {posts.slice(0, 2).map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-200 group-hover:text-teal-500 transition-colors truncate mr-4">
                        {post.title}
                      </span>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">
                        {formatDate(post.date, siteMetadata.locale)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </WidgetWrapper>

            {/* 简介引言 */}
            <WidgetWrapper className="md:col-span-3 bg-teal-500/10 border-none flex items-center justify-center italic text-xs text-teal-700 dark:text-teal-300 text-center p-4">
              "{siteMetadata.description.slice(0, 30)}..."
            </WidgetWrapper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 状态 B：全屏图集 */}
      <AnimatePresence>
        {isGalleryOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden select-none">
            {/* 由横幅变形而来的全屏背景 */}
            <motion.div
              layoutId="gallery-bg"
              className="absolute inset-0 bg-[#eef2f0] dark:bg-gray-900"
            />

            {/* 图集组件（包含返回按钮、散落图片、放大预览） */}
            <Gallery photos={galleryPhotos} onClose={() => setIsGalleryOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
