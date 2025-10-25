// 排行榜页面

'use client';

import Link from 'next/link';
import RankTable from '@/components/Leaderboard/RankTable';

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FAF8EF] to-[#F0EDE4] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-trae-blue via-trae-red to-trae-purple bg-clip-text text-transparent mb-2">
            🏆 全球排行榜
          </h1>
          <p className="text-gray-600">TRAE 1024 - Top Players</p>
        </div>

        {/* 返回按钮 */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-trae-blue hover:text-trae-purple transition-colors"
          >
            <span>←</span>
            <span>返回游戏</span>
          </Link>
        </div>

        {/* 排行榜表格 */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <RankTable />
        </div>

        {/* 说明 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>排行榜显示前1024名玩家（按移动次数排序，越少越好）</p>
          <p className="mt-1">
            🎯 提示：同时收集TRAE字母并达成1024就有机会上榜,当然1024的个数应该没有限制
          </p>
        </div>
      </div>
    </main>
  );
}
