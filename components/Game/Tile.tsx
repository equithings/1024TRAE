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
  isLetterEffectTriggered?: boolean; // 是否触发字母效果（全局动画）
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
    512: 'bg-tile-512 text-white',
    1024: 'bg-tile-1024 text-white',
  };
  return colors[value] || '';
}

// 为 >= 2048 (即 >= 2×1024) 的倍数生成莫兰迪风格渐变色
function getMultipleTileGradient(value: number): React.CSSProperties {
  const multiple = Math.floor(value / 1024);

  if (multiple > 1024) {
    // 超过 1024×1024，使用深灰色渐变（只有明暗区别）
    const variation = Math.floor((multiple - 1024) / 100) % 10; // 每100倍循环一次，0-9
    const lightness1 = 28 + variation * 2; // 28-46% 亮度范围（加深）
    const lightness2 = lightness1 - 8; // 渐变终点更深

    return {
      background: `linear-gradient(to bottom right, hsl(220, 18%, ${lightness1}%), hsl(220, 18%, ${lightness2}%))`,
      color: 'white'
    };
  } else {
    // 2×1024 到 1024×1024，使用彩色莫兰迪渐变（加深版）
    // 使用质数23作为乘数，确保色相分布均匀且每个倍数都不同
    const hue = (multiple * 23) % 360;
    const saturation = 45 + (multiple % 7) * 4; // 45-73% 饱和度（提高饱和度）
    const lightness = 42 + (multiple % 5) * 2; // 42-50% 亮度（降低亮度）

    // 渐变的第二个颜色：色相偏移30度，亮度降低
    const hue2 = (hue + 30) % 360;
    const lightness2 = lightness - 10;

    return {
      background: `linear-gradient(to bottom right, hsl(${hue}, ${saturation}%, ${lightness}%), hsl(${hue2}, ${saturation}%, ${lightness2}%))`,
      color: 'white'
    };
  }
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

export default function Tile({ value, position, isNew = false, isMerged = false, isLetterEffectTriggered = false }: TileProps) {
  const isLetterTile = isLetter(value);

  // 判断是否需要动态渐变色（>= 2048 的数字）
  const isMultipleTile = typeof value === 'number' && value >= 2048;

  const className = isLetterTile
    ? getLetterClassName(value)
    : getTileColor(value as number);

  // 为 >= 2048 的数字生成渐变色样式
  const gradientStyle = isMultipleTile ? getMultipleTileGradient(value as number) : undefined;

  const fontSize = getFontSize(value);

  // 字母效果触发时，所有数字方块都弹一下
  const shouldBounce = isMerged || (isLetterEffectTriggered && !isLetterTile);

  return (
    <motion.div
      initial={{ scale: isNew ? 0 : 1 }}
      animate={{
        scale: shouldBounce ? 1.05 : 1,
      }}
      exit={{ scale: 0 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
        duration: 0.15
      }}
      style={gradientStyle} // 使用动态生成的渐变色
      className={`
        absolute inset-0 w-full h-full rounded-lg
        flex items-center justify-center
        font-bold ${isLetterTile ? '' : fontSize} ${isLetterTile || isMultipleTile ? '' : className}
        shadow-lg
        ${isLetterTile ? 'bg-[#32F08C] ring-2 ring-offset-2 ring-white' : ''}
        ${isNew ? 'tile-new' : ''}
        ${shouldBounce ? 'tile-merged' : ''}
      `}
    >
      {/* 字母方块显示文字 */}
      {isLetterTile ? (
        <div className={`${fontSize} font-bold text-white`}>
          {value}
        </div>
      ) : (
        // 数字方块显示：>= 1024 时同时显示具体数字和倍数
        typeof value === 'number' && value >= 1024 ? (
          <div className="flex flex-col items-center justify-center leading-tight">
            <div className="text-lg sm:text-xl font-bold">{value.toLocaleString()}</div>
            <div className="text-xs sm:text-sm opacity-75">
              {(value / 1024).toFixed(3).replace(/\.?0+$/, '')}×1024
            </div>
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
