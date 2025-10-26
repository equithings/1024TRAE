// 排行榜表格组件

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LeaderboardEntry } from '@/types/game';
import { getLeaderboard } from '@/lib/supabase';
import { getCurrentPlayerId } from '@/lib/player-identity';

export default function RankTable() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [showScrollHint, setShowScrollHint] = useState(true); // 滑动提示
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null); // 当前玩家 ID

  useEffect(() => {
    loadLeaderboard();
    // 获取当前玩家 ID（如果存在）
    setCurrentPlayerId(getCurrentPlayerId());
  }, []);

  // 3秒后自动隐藏滑动提示
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowScrollHint(false);
    }, 5000); // 5秒后隐藏

    return () => clearTimeout(timer);
  }, []);

  const loadLeaderboard = async () => {
    const { data } = await getLeaderboard(1024); // 获取前1024名
    setEntries(data);
    setLastUpdate(new Date());
    setLoading(false);
    setRefreshing(false);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadLeaderboard();
  };

  // 处理滚动事件，隐藏提示
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollLeft > 10) {
      setShowScrollHint(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trae-blue mx-auto"></div>
        <p className="mt-4 text-gray-600">加载中...</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">暂无排行榜数据</p>
        <p className="text-sm text-gray-400 mt-2">
          成为第一个上榜的玩家吧！
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* 刷新按钮和更新时间 */}
      <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="text-sm text-gray-600">
          <span>最后更新: {lastUpdate.toLocaleTimeString('zh-CN')}</span>
          <span className="ml-4 text-gray-400">
            共 {entries.length} 名玩家
          </span>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-trae-blue text-white rounded-lg hover:bg-trae-purple transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
          <span>{refreshing ? '刷新中...' : '刷新数据'}</span>
        </button>
      </div>

      {/* 移动端滑动提示 */}
      <AnimatePresence>
        {showScrollHint && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-blue-50 border-l-4 border-blue-400 p-3 mb-4 flex items-center justify-between rounded-r-lg shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span className="text-blue-600 text-sm">👉</span>
              <span className="text-blue-800 text-sm font-medium">向右滑动查看更多</span>
            </div>
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-blue-600 text-lg"
            >
              →
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 表格 */}
      <div className="overflow-x-auto" onScroll={handleScroll}>
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gradient-to-r from-trae-blue to-trae-purple text-white">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">排名</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">玩家</th>
              <th className="px-6 py-4 text-right text-sm font-semibold">移动次数</th>
              <th className="px-6 py-4 text-center text-sm font-semibold">
                最大方块
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold">
                字母收集
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold">
                日期
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => {
              // 检测是否为彩蛋玩家
              const isEasterEgg = entry.letters_collected.length === 1 &&
                                  entry.letters_collected[0] === 'TRAENB4EVER';

              // 检测是否收集了 TRAENB（6个字母）
              const hasTraenb = !isEasterEgg &&
                                entry.letters_collected.length === 6 &&
                                entry.letters_collected.join('') === 'TRAENB';

              // 检测是否收集了 TRAEN（5个字母）
              const hasTraen = !isEasterEgg && !hasTraenb &&
                               entry.letters_collected.length === 5 &&
                               entry.letters_collected.join('') === 'TRAEN';

              // 检测是否为当前玩家的记录
              const isMyRecord = currentPlayerId && entry.player_id === currentPlayerId;

              return (
                <tr
                  key={entry.id}
                  className={`
                    border-b border-gray-200 hover:bg-gray-50 transition-colors
                    ${index < 3 && !isEasterEgg && !hasTraenb && !hasTraen ? 'bg-yellow-50' : ''}
                    ${isEasterEgg ? 'bg-gradient-to-r from-yellow-100 via-pink-100 to-purple-100' : ''}
                    ${hasTraenb ? 'bg-gradient-to-r from-purple-50 via-blue-50 to-green-50' : ''}
                    ${hasTraen ? 'bg-gradient-to-r from-blue-50 to-green-50' : ''}
                    ${isMyRecord ? 'ring-2 ring-trae-blue ring-inset bg-blue-50/30' : ''}
                  `}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {isEasterEgg && <span className="text-2xl mr-2">👑</span>}
                      {hasTraenb && <span className="text-2xl mr-2">💎</span>}
                      {hasTraen && <span className="text-2xl mr-2">⭐</span>}
                      {!isEasterEgg && !hasTraenb && !hasTraen && index === 0 && <span className="text-2xl mr-2">🥇</span>}
                      {!isEasterEgg && !hasTraenb && !hasTraen && index === 1 && <span className="text-2xl mr-2">🥈</span>}
                      {!isEasterEgg && !hasTraenb && !hasTraen && index === 2 && <span className="text-2xl mr-2">🥉</span>}
                      <span className="font-semibold text-gray-700">
                        #{index + 1}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-medium ${
                      isEasterEgg ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-red-600 to-purple-600 font-bold' :
                      hasTraenb ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 font-semibold' :
                      hasTraen ? 'text-blue-700 font-semibold' :
                      'text-gray-800'
                    }`}>
                      {entry.player_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {isEasterEgg ? (
                      <span className="text-lg font-bold text-purple-600">
                        🎁 ???
                      </span>
                    ) : (
                      <span className="text-lg font-bold text-emerald-600">
                        {entry.play_time} 步
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`
                        inline-block px-3 py-1 rounded-full text-sm font-semibold
                        ${
                          isEasterEgg
                            ? 'bg-gradient-to-r from-yellow-200 via-red-200 to-purple-200 text-purple-900'
                            : entry.max_tile >= 1024
                            ? 'bg-yellow-100 text-yellow-800'
                            : entry.max_tile >= 512
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      `}
                    >
                      {isEasterEgg
                        ? '1024×1024'
                        : entry.max_tile >= 1024
                        ? (
                            <div className="flex flex-col items-center justify-center leading-tight">
                              <div className="font-bold">{entry.max_tile.toLocaleString()}</div>
                              <div className="text-xs opacity-75">
                                {(entry.max_tile / 1024).toFixed(3).replace(/\.?0+$/, '')}×1024
                              </div>
                            </div>
                          )
                        : entry.max_tile}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {/* 检测彩蛋字母：TRAENB4EVER */}
                    {isEasterEgg ? (
                      <span className="inline-block px-3 py-1 bg-gradient-to-r from-yellow-400 via-red-400 to-purple-500 text-white rounded-full text-xs font-bold animate-pulse">
                        🎁 TRAENB4EVER
                      </span>
                    ) : hasTraenb ? (
                      <div className="flex justify-center gap-1">
                        {entry.letters_collected.map((letter, i) => (
                          <span
                            key={i}
                            className="inline-block w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded text-xs font-bold flex items-center justify-center shadow-md"
                          >
                            {letter}
                          </span>
                        ))}
                      </div>
                    ) : hasTraen ? (
                      <div className="flex justify-center gap-1">
                        {entry.letters_collected.map((letter, i) => (
                          <span
                            key={i}
                            className="inline-block w-6 h-6 bg-gradient-to-br from-blue-500 to-green-500 text-white rounded text-xs font-bold flex items-center justify-center shadow-sm"
                          >
                            {letter}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="flex justify-center gap-1">
                        {entry.letters_collected.map((letter, i) => (
                          <span
                            key={i}
                            className="inline-block w-6 h-6 bg-trae-blue text-white rounded text-xs font-bold flex items-center justify-center"
                          >
                            {letter}
                          </span>
                        ))}
                        {entry.letters_collected.length === 0 && (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-500">
                    {new Date(entry.created_at).toLocaleDateString('zh-CN')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
