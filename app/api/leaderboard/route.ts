// 排行榜 API 路由

import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboard, submitScore } from '@/lib/supabase';

// GET - 获取排行榜
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get('limit') || '30', 10);

  // 限制最多30名
  const actualLimit = Math.min(limit, 30);
  const { data, error } = await getLeaderboard(actualLimit);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ data });
}

// POST - 提交分数
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      playerName,
      score,
      maxTile,
      lettersCollected,
      isVictory,
      playTime,
    } = body;

    // 验证必填字段
    if (!playerName || score === undefined || maxTile === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await submitScore({
      playerName,
      score,
      maxTile,
      lettersCollected: lettersCollected || [],
      isVictory: isVictory || false,
      playTime: playTime || 0,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}