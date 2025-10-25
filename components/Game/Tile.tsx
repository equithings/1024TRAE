// 游戏方块组件

'use client';

import { motion } from 'framer-motion';
import { TileValue } from '@/types/game';
import { isLetter, getLetterClassName } from '@/lib/letter-system';

interface TileProps {
  value: TileValue;
  position: { row: number; col: number };
  isNew?: boolean; // 是否是新生成的方块
  isMerged?: boolean; // 是否刚刚合并过
}

// 获取数字方块的颜色类名
function getTileColor(value: number): string {
  const colors: Record<number, string> = {
    2: 'bg-tile-2 text-gray-700',
    4: 'bg-tile-4 text-gray-700',
    8: 'bg-tile-8 text-white',
    16: 'bg-tile-16 text-white',
    32: 'bg-tile-32 text-white',
    64: 'bg-tile-64 text-white',
    128: 'bg-tile-128 text-white',
    256: 'bg-tile-256 text-white',
    512: 'bg-gradient-to-br from-tile-512 to-yellow-600 text-white',
    1024: 'bg-gradient-to-br from-tile-1024 to-yellow-700 text-white',
    2048: 'bg-gradient-to-br from-yellow-500 to-yellow-700 text-white',
  };
  return colors[value] || 'bg-gray-600 text-white';
}

// 获取字体大小类名（4x4网格优化）
function getFontSize(value: TileValue): string {
  if (typeof value === 'string') return 'text-4xl sm:text-5xl'; // 字母
  if (value >= 1024) return 'text-2xl sm:text-3xl';
  if (value >= 512) return 'text-3xl sm:text-4xl';
  if (value >= 128) return 'text-3xl sm:text-4xl';
  if (value >= 16) return 'text-4xl sm:text-5xl';
  return 'text-5xl sm:text-6xl';
}

export default function Tile({ value, position, isNew = false, isMerged = false }: TileProps) {
  const isLetterTile = isLetter(value);
  
  const className = isLetterTile
    ? getLetterClassName(value)
    : getTileColor(value as number);
  
  const fontSize = getFontSize(value);

  return (
    <motion.div
      initial={{ scale: isNew ? 0 : 1 }}
      animate={{ 
        scale: isMerged ? 1.05 : 1,
      }}
      exit={{ scale: 0 }}
      transition={{ 
        type: 'spring', 
        stiffness: 300, 
        damping: 20,
        duration: 0.15
      }}
      className={`
        absolute inset-0 w-full h-full rounded-lg
        flex items-center justify-center
        font-bold ${isLetterTile ? '' : fontSize} ${isLetterTile ? '' : className}
        shadow-lg
        ${isLetterTile ? 'bg-[#32F08C] ring-2 ring-offset-2 ring-white' : ''}
        ${isNew ? 'tile-new' : ''}
        ${isMerged ? 'tile-merged' : ''}
      `}
    >
      {/* 字母方块显示文字 */}
      {isLetterTile ? (
        <div className={`${fontSize} font-bold text-white`}>
          {value}
        </div>
      ) : (
        // 数字方块显示：超过1024显示为 x×1024
        typeof value === 'number' && value > 1024 ? (
          <div className="flex flex-col items-center justify-center leading-tight">
            <div className="text-2xl sm:text-3xl">{(value / 1024).toFixed(3).replace(/\.?0+$/, '')}</div>
            <div className="text-xs sm:text-sm opacity-90">×1024</div>
          </div>
        ) : (
          value
        )
      )}
      
      {/* 新方块高亮效果 */}
      {isNew && (
        <motion.div
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 bg-white rounded-lg"
        />
      )}
    </motion.div>
  );
}
