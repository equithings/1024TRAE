// 排行榜表格组件

'use client';

import { useEffect, useState } from 'react';
import { LeaderboardEntry } from '@/types/game';
import { getLeaderboard } from '@/lib/supabase';

export default function RankTable() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    const { data } = await getLeaderboard(1024); // 获取前1024名
    setEntries(data);
    setLoading(false);
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
    <div className="overflow-x-auto">
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
          {entries.map((entry, index) => (
            <tr
              key={entry.id}
              className={`
                border-b border-gray-200 hover:bg-gray-50 transition-colors
                ${index < 3 ? 'bg-yellow-50' : ''}
              `}
            >
              <td className="px-6 py-4">
                <div className="flex items-center">
                  {index === 0 && <span className="text-2xl mr-2">🥇</span>}
                  {index === 1 && <span className="text-2xl mr-2">🥈</span>}
                  {index === 2 && <span className="text-2xl mr-2">🥉</span>}
                  <span className="font-semibold text-gray-700">
                    #{index + 1}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="font-medium text-gray-800">
                  {entry.player_name}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <span className="text-lg font-bold text-emerald-600">
                  {entry.play_time} 步
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                <span
                  className={`
                    inline-block px-3 py-1 rounded-full text-sm font-semibold
                    ${
                      entry.max_tile >= 1024
                        ? 'bg-yellow-100 text-yellow-800'
                        : entry.max_tile >= 512
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-gray-100 text-gray-800'
                    }
                  `}
                >
                  {entry.max_tile}
                </span>
              </td>
              <td className="px-6 py-4 text-center">
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
              </td>
              <td className="px-6 py-4 text-right text-sm text-gray-500">
                {new Date(entry.created_at).toLocaleDateString('zh-CN')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
