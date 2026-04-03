'use client'

import { motion } from 'framer-motion'

export default function MagicButton() {
  return (
    <div className="flex justify-center my-8">
      <motion.button
 
        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-8 rounded-full shadow-lg"
        
 
        whileHover={{ 
          scale: 1.1, 
          boxShadow: "0px 0px 15px rgb(168, 85, 247)"
        }}
        whileTap={{ scale: 0.9 }} 
        initial={{ opacity: 0, y: 50 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, type: "spring" }} 
      >
        Click me!
      </motion.button>
    </div>
  )
}