import React from 'react';
import { motion } from 'framer-motion';
import { MessageCard as MessageCardType } from '@/types';

interface MessageCardProps {
  card: MessageCardType;
  className?: string;
}

export default function MessageCard({ card, className = '' }: MessageCardProps) {
  return (
    <motion.div
      className={`relative w-80 h-96 bg-white rounded-2xl shadow-xl p-6 flex flex-col justify-center items-center ${className}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 260,
        damping: 20 
      }}
    >
      {/* カードタイプのバッジ */}
      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${
        card.type === 'noise' 
          ? 'bg-orange-100 text-orange-800' 
          : 'bg-blue-100 text-blue-800'
      }`}>
        {card.type === 'noise' ? '🎭 Noise' : '🧠 Reason'}
      </div>

      {/* メインコンテンツ */}
      <div className="text-center">
        <p className="text-lg leading-relaxed text-gray-800 mb-6 font-medium">
          {card.content}
        </p>
      </div>

      {/* 底部の装飾 */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="w-12 h-1 bg-gray-200 rounded-full"></div>
      </div>
    </motion.div>
  );
}
