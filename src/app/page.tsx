'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import MessageCard from '@/components/MessageCard';
import { MessageCard as MessageCardType } from '@/types';

export default function Home() {
  const [cards, setCards] = useState<MessageCardType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitX, setExitX] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 初期カード取得
  useEffect(() => {
    fetchInitialCards();
  }, []);

  const fetchInitialCards = async () => {
    setLoading(true);
    setError(null);
    try {
      // 3枚のカードを取得
      const cardPromises = Array(3).fill(null).map(() => 
        fetch('/api/generate-card').then(res => res.json())
      );
      
      const responses = await Promise.all(cardPromises);
      const newCards = responses.map(res => ({
        ...res.card,
        createdAt: new Date(res.card.createdAt)
      }));
      
      setCards(newCards);
    } catch (err) {
      console.error('Failed to fetch cards:', err);
      setError('カードの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const fetchNewCard = async () => {
    try {
      const response = await fetch('/api/generate-card');
      const data = await response.json();
      
      if (data.success) {
        const newCard = {
          ...data.card,
          createdAt: new Date(data.card.createdAt)
        };
        setCards(prev => [...prev, newCard]);
      }
    } catch (err) {
      console.error('Failed to fetch new card:', err);
    }
  };

  const handleDragEnd = async (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    
    if (Math.abs(info.offset.x) > threshold) {
      setExitX(info.offset.x > 0 ? 300 : -300);
      
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        
        // 最後から2枚目になったら新しいカードを取得
        if (currentIndex === cards.length - 2) {
          fetchNewCard();
        }
      }
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="container max-w-6xl">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Noise or Reason
          </h1>
          <p className="text-white/80 text-lg">
            くだらない話から深い洞察まで、今日のカードは何でしょう？
          </p>
        </div>

        {/* カード表示エリア */}
        <div className="flex justify-center relative h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="text-white text-xl">カードを準備中...</div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center">
              <div className="text-white text-xl mb-4">{error}</div>
              <button
                onClick={fetchInitialCards}
                className="px-6 py-2 bg-white/20 rounded-lg text-white hover:bg-white/30 transition"
              >
                再試行
              </button>
            </div>
          ) : cards.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ x: exitX, opacity: 0, transition: { duration: 0.3 } }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                whileDrag={{ scale: 1.05 }}
                style={{ position: 'absolute' }}
              >
                <MessageCard 
                  card={cards[currentIndex]}
                />
              </motion.div>
            </AnimatePresence>
          ) : null}
        </div>

        {/* フッター */}
        <div className="text-center mt-12">
          <p className="text-white/60 text-sm">
            {cards.length > 0 && `スワイプでカードを評価 • ${currentIndex + 1}/${cards.length}`}
          </p>
        </div>
      </div>
    </main>
  );
}
