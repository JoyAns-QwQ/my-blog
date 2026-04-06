'use client'

import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion' 
import Link from '@/components/Link'
import SocialIcon from '@/components/social-icons'
import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'

export default function GlobalNav() {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <AnimatePresence>
      {!isHome && (
        <motion.div
          className="fixed right-3 top-3 sm:right-6 sm:top-6 z-[1001]"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, transition: { duration: 0.15 } }} // 离开时外层容器快速淡出
        >
          {/* 🔮 飞行的纯背景层：只负责变形，不包含文字，所以不会被挤压 */}
          <motion.div
            layoutId="nav-widget-box"
            className="absolute inset-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-full shadow-sm border border-white/40 dark:border-gray-700/30"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />

          {/* 📝 相对定位的内容层：撑开容器大小 */}
          <div className="relative z-10 flex items-center gap-2 sm:gap-6 px-3 sm:px-6 py-2">
            {headerNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-teal-500 transition-colors"
              >
                <span className="text-base">{link.icon}</span>
                <span className="hidden sm:inline">{link.title}</span>
              </Link>
            ))}
            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
            <SocialIcon kind="github" href={siteMetadata.github} size={4} />
            <SocialIcon kind="mail" href={`mailto:${siteMetadata.email}`} size={4} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}