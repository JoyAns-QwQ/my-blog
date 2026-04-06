'use client'

import { useState, useEffect } from 'react'
import Image from '@/components/Image'
import Link from '@/components/Link'
import siteMetadata from '@/data/siteMetadata'
import { formatDate } from 'pliny/utils/formatDate'
import { motion } from 'framer-motion'
import headerNavLinks from '@/data/headerNavLinks'
import SocialIcon from '@/components/social-icons'
import { useRouter } from 'next/navigation'

// ===== 公共 Widget 容器（普通卡片使用） =====
const WidgetWrapper = ({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className={`h-full w-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-sm border border-white/40 dark:border-gray-700/30 ${className}`}
  >
    {children}
  </motion.div>
)

// ===== 时钟 Widget（可点击，跳转到时间工具页）=====
function ClockWidget() {
  const [mounted, setMounted] = useState(false)
  const [now, setNow] = useState(new Date())
  const [hovered, setHovered] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const timeString = mounted
    ? now.toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' })
    : '--:--'
  const weekday = mounted ? now.toLocaleDateString('zh-CN', { weekday: 'long' }) : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => router.push('/tools')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="h-full w-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-sm border border-white/40 dark:border-gray-700/30 cursor-pointer relative overflow-hidden group"
      style={{ transition: 'box-shadow 0.2s' }}
    >
      {/* Hover 时的光晕背景 */}
      <motion.div
        className="absolute inset-0 bg-teal-400/10 dark:bg-teal-500/10 rounded-[2.5rem]"
        initial={{ opacity: 0 }}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />

      {/* 内容 */}
      <div className="relative z-10 flex flex-row items-center justify-between h-full">
        <div className="flex flex-col">
          <div className="text-4xl font-mono font-bold tracking-tighter text-teal-600 dark:text-teal-400">
            {timeString}
          </div>
          {/* Hover 时显示提示文字 */}
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 4 }}
            transition={{ duration: 0.15 }}
            className="text-[10px] text-teal-400 font-medium mt-1"
          >
            Enter Stopwatch ⏱
          </motion.div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="text-xs text-gray-400 font-medium">{weekday}</div>
          {/* 小图标 hover 时出现 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.7 }}
            transition={{ duration: 0.15 }}
            className="text-teal-400 text-sm"
          >
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

// ===== 导航 Widget（核心修改区） =====
function NavWidget() {
  return (
    <div className="relative h-full w-full">
      {/* 🔮 飞行的纯背景层：参数和 GlobalNav 严格一致 */}
      <motion.div
        layoutId="nav-widget-box"
        className="absolute inset-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-[2.5rem] shadow-sm border border-white/40 dark:border-gray-700/30"
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />

      {/* 📝 相对定位的内容层：背景飞到位后，文字内容优雅淡入 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="relative z-10 flex flex-col justify-between h-full p-6"
      >
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
              <Image src="/static/images/avatar.png" alt="avatar" width={40} height={40} />
            </div>
            <div>
              <h2 className="font-bold text-gray-800 dark:text-white">JoyAns</h2>
              <p className="text-[10px] text-teal-500 font-bold uppercase tracking-wider">NOOBE</p>
            </div>
          </div>
          <nav className="grid grid-cols-2 gap-1">
            {headerNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 p-2 rounded-2xl hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all group"
              >
                <span className="group-hover:scale-110 transition-transform text-sm">{link.icon}</span>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {link.title}
                </span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex gap-4 justify-center mt-4">
          <SocialIcon kind="github" href={siteMetadata.github} size={5} />
          <SocialIcon kind="mail" href={`mailto:${siteMetadata.email}`} size={5} />
        </div>
      </motion.div>
    </div>
  )
}

// ===== 首页主组件 =====
export default function Home({ posts }: { posts: any[] }) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[90vh] py-12 px-4">

      {/* ===== 移动端布局（md 以下）===== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col gap-4 w-full max-w-sm md:hidden"
      >
        {/* 时钟（可点击） */}
        <ClockWidget />

        {/* Nav */}
        <NavWidget />

        {/* 最新文章 */}
        <WidgetWrapper className="flex flex-col justify-center">
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

        {/* Gallery 大图 */}
        <Link href="/gallery" className="block w-full h-52">
          <WidgetWrapper className="!p-2 overflow-hidden cursor-pointer group relative">
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem]">
              <span className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full font-bold text-teal-600 shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-all">
                Enter Gallery ✨
              </span>
            </div>
            <div className="relative h-full w-full rounded-[1.8rem] overflow-hidden group-hover:scale-105 transition-transform duration-500">
              <Image src="/static/images/gallery-card.png" alt="cover" fill className="object-cover" />
            </div>
          </WidgetWrapper>
        </Link>

        {/* 欢迎 + 引言 */}
        <div className="grid grid-cols-2 gap-4">
          <WidgetWrapper className="flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-teal-50 mb-2 flex items-center justify-center text-xl shadow-inner">
              👋
            </div>
            <h3 className="font-bold text-gray-800 dark:text-white text-sm">Hellow!</h3>
            <p className="text-xs text-gray-500 mt-1">Welcome</p>
          </WidgetWrapper>
          <WidgetWrapper className="bg-teal-500/10 border-none flex items-center justify-center italic text-xs text-teal-700 dark:text-teal-300 text-center">
            "{siteMetadata.description.slice(0, 30)}..."
          </WidgetWrapper>
        </div>
      </motion.div>

      {/* ===== 桌面端布局（md 以上）===== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="hidden md:grid grid-cols-12 gap-4 auto-rows-fr"
        style={{ minWidth: '900px' }}
      >
        {/* 最新文章 - 第一行左，占9列 */}
        <WidgetWrapper className="col-span-9 flex flex-col justify-center">
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

        {/* 时钟 - 第一行右，占3列（可点击） */}
        <div className="col-span-3">
          <ClockWidget />
        </div>

        {/* 导航 Widget - 第二行左，占3列跨2行 */}
        <div className="col-span-3 row-span-2">
          <NavWidget />
        </div>

        {/* 欢迎卡片 - 第二行中，占3列 */}
        <WidgetWrapper className="col-span-3 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-teal-50 mb-3 flex items-center justify-center text-2xl shadow-inner">
            👋
          </div>
          <h3 className="font-bold text-gray-800 dark:text-white">Hellow!</h3>
          <p className="text-xs text-gray-500 mt-1">Welcome</p>
        </WidgetWrapper>

        {/* 图集 - 第二行右，占6列跨2行 */}
        <Link href="/gallery" className="col-span-6 row-span-2 block h-full w-full">
          <WidgetWrapper className="!p-2 h-full overflow-hidden cursor-pointer group relative">
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem]">
              <span className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full font-bold text-teal-600 shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-all">
                Enter Gallery ✨
              </span>
            </div>
            <div className="relative h-full min-h-[120px] w-full rounded-[1.8rem] overflow-hidden group-hover:scale-105 transition-transform duration-500">
              <Image src="/static/images/gallery-card.png" alt="cover" fill className="object-cover" />
            </div>
          </WidgetWrapper>
        </Link>

        {/* 引言 - 第三行中，占3列 */}
        <WidgetWrapper className="col-span-3 bg-teal-500/10 border-none flex items-center justify-center italic text-xs text-teal-700 dark:text-teal-300 text-center p-4">
          "{siteMetadata.description.slice(0, 30)}..."
        </WidgetWrapper>
      </motion.div>

    </div>
  )
}
