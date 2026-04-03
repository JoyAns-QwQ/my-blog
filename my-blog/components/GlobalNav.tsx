'use client'

import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from '@/components/Link'
import SocialIcon from '@/components/social-icons'
import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import Image from '@/components/Image'
import { useEffect, useState } from 'react'

export default function GlobalNav() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // 移动端：无论主页还是其他页面，都显示底部固定导航栏（避免遮挡内容）
  if (isMobile) {
    return (
      <motion.div
        layoutId="global-nav"
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl py-2 px-4 border-t border-gray-200 dark:border-gray-700"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {headerNavLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex flex-col items-center text-xs text-gray-600 dark:text-gray-300 hover:text-teal-500 transition-colors"
          >
            <span className="text-xl">{link.icon || '📄'}</span>
            <span>{link.title}</span>
          </Link>
        ))}
        <SocialIcon kind="github" href={siteMetadata.github} size={5} />
        <SocialIcon kind="mail" href={`mailto:${siteMetadata.email}`} size={5} />
      </motion.div>
    )
  }

  // 桌面端：主页显示竖向侧边栏
  if (isHome) {
    return (
      <motion.div
        layoutId="global-nav"
        className="fixed left-6 top-24 z-40 w-64 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-4 shadow-sm border border-white/40 dark:border-gray-700/30"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl overflow-hidden">
            <Image src="/static/images/avatar.png" alt="avatar" width={40} height={40} />
          </div>
          <div>
            <h2 className="font-bold text-gray-800 dark:text-white">JoyAns</h2>
            <p className="text-[10px] text-teal-500">noobe</p>
          </div>
        </div>
        <nav className="space-y-1">
          {headerNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/50 dark:hover:bg-gray-700/50 transition-all"
            >
              <span className="text-lg">{link.icon || '📄'}</span>
              <span className="text-sm font-medium">{link.title}</span>
            </Link>
          ))}
        </nav>
        <div className="flex gap-4 justify-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <SocialIcon kind="github" href={siteMetadata.github} size={5} />
          <SocialIcon kind="mail" href={`mailto:${siteMetadata.email}`} size={5} />
        </div>
      </motion.div>
    )
  }

  // 桌面端非主页：横向导航栏（与侧边栏共享 layoutId，自动动画）
  return (
    <motion.div
      layoutId="global-nav"
      className="fixed left-6 top-6 z-40 flex items-center gap-6 rounded-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl px-6 py-2 shadow-sm border border-white/40 dark:border-gray-700/30"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {headerNavLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-teal-500 transition-colors"
        >
          {link.title}
        </Link>
      ))}
      <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
      <SocialIcon kind="github" href={siteMetadata.github} size={4} />
      <SocialIcon kind="mail" href={`mailto:${siteMetadata.email}`} size={4} />
    </motion.div>
  )
}