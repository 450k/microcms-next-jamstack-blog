// components/h2h-client.tsx
'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

type Match = {
  id: string;
  match_date: string;
  score: string;
  winner: string;
  created_at: string;
};

export function H2HClient({ initialMatches }: { initialMatches: Match[] }) {
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [date, setDate] = useState('');
  const [score, setScore] = useState('');
  const [winner, setWinner] = useState('k450');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // 管理者チェック
  useState(() => {
    fetch('/api/admin/check')
      .then(res => res.json())
      .then(({ isAdmin }) => setIsAdmin(isAdmin));
  });

  const winsA = matches.filter(m => m.winner === 'k450').length;
  const winsB = matches.filter(m => m.winner === 'pb100').length;
  const total = matches.length;
  const pctA = total === 0 ? 50 : Math.round(winsA / total * 100);
  const pctB = total === 0 ? 50 : Math.round(winsB / total * 100);
const playerLeft = winsA >= winsB
  ? { key: 'k450', initial: 'K', wins: winsA, pct: pctA, colorBg: 'bg-blue-100', colorText: 'text-blue-800', colorWin: 'text-blue-700', barColor: 'bg-blue-500', badgeBg: 'bg-blue-50', badgeText: 'text-blue-800' }
  : { key: 'pb100', initial: 'P', wins: winsB, pct: pctB, colorBg: 'bg-orange-100', colorText: 'text-orange-800', colorWin: 'text-orange-700', barColor: 'bg-orange-500', badgeBg: 'bg-orange-50', badgeText: 'text-orange-800' };

const playerRight = winsA >= winsB
  ? { key: 'pb100', initial: 'P', wins: winsB, pct: pctB, colorBg: 'bg-orange-100', colorText: 'text-orange-800', colorWin: 'text-orange-700', barColor: 'bg-orange-500', badgeBg: 'bg-orange-50', badgeText: 'text-orange-800' }
  : { key: 'k450', initial: 'K', wins: winsA, pct: pctA, colorBg: 'bg-blue-100', colorText: 'text-blue-800', colorWin: 'text-blue-700', barColor: 'bg-blue-500', badgeBg: 'bg-blue-50', badgeText: 'text-blue-800' };


  const handleAdd = async () => {
    if (!date.trim() || !score.trim()) {
      setError('対戦日とスコアを入力してください');
      return;
    }
    setError('');
    setLoading(true);

    const { data, error } = await supabase
      .from('matches')
      .insert({ match_date: date, score, winner })
      .select()
      .single();

    if (error) {
      setError('登録に失敗しました');
    } else {
      setMatches([data, ...matches]);
      setDate('');
      setScore('');
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('matches').delete().eq('id', id);
    setMatches(matches.filter(m => m.id !== id));
  };

  return (
    <div className="mx-auto max-w-2xl p-6">

      {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col items-center flex-1">
            <div className={`w-16 h-16 rounded-full ${playerLeft.colorBg} flex items-center justify-center text-xl font-medium ${playerLeft.colorText}`}>
            {playerLeft.initial}
            </div>
            <span className="mt-2 text-lg font-medium">{playerLeft.key}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
            <span className="text-sm text-gray-500">head to head</span>
            <div className="flex items-center gap-4">
            <span className={`text-4xl font-medium ${playerLeft.colorWin}`}>{playerLeft.wins}</span>
            <span className="text-2xl text-gray-300">-</span>
            <span className={`text-4xl font-medium ${playerRight.colorWin}`}>{playerRight.wins}</span>
            </div>
            <span className="text-sm text-gray-500">{total} matches</span>
        </div>
        <div className="flex flex-col items-center flex-1">
            <div className={`w-16 h-16 rounded-full ${playerRight.colorBg} flex items-center justify-center text-xl font-medium ${playerRight.colorText}`}>
            {playerRight.initial}
            </div>
            <span className="mt-2 text-lg font-medium">{playerRight.key}</span>
        </div>
        </div>

        {/* 勝率バー */}
        <div className="mb-6">
        <div className="flex justify-between text-sm mb-1">
            <span className={`font-medium ${playerLeft.colorWin}`}>{total === 0 ? '-' : playerLeft.pct + '%'}</span>
            <span className="text-gray-400 text-xs">勝率</span>
            <span className={`font-medium ${playerRight.colorWin}`}>{total === 0 ? '-' : playerRight.pct + '%'}</span>
        </div>
        <div className="h-3 rounded-full bg-gray-100 overflow-hidden flex">
            <div className={`${playerLeft.barColor} h-full transition-all duration-500`} style={{ width: `${playerLeft.pct}%` }} />
            <div className={`${playerRight.barColor} h-full transition-all duration-500`} style={{ width: `${playerRight.pct}%` }} />
        </div>
        </div>

      {/* 対戦履歴 */}
      <div className="text-xs text-gray-400 mb-3 tracking-wide">対戦履歴</div>
      {matches.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">まだ対戦記録がありません</p>
      ) : (
        <ul className="mb-6">
          {matches.map(m => (
            <li key={m.id} className="flex items-center py-2 border-b border-gray-100 gap-3">
              <span className="text-sm text-gray-400 w-12">{m.match_date}</span>
              <span className="text-base font-medium flex-1 text-center">{m.score}</span>
              <span className={`text-xs px-3 py-1 rounded ${
                    m.winner === playerLeft.key
                        ? `${playerLeft.badgeBg} ${playerLeft.badgeText}`
                        : `${playerRight.badgeBg} ${playerRight.badgeText}`
                    }`}>
                    {m.winner}
                    </span>
              {/* ✅ 管理者のみ削除ボタン表示 */}
              {isAdmin && (
                <button
                  onClick={() => handleDelete(m.id)}
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  削除
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* 入力フォーム（管理者のみ） */}
      {isAdmin && (
        <div className="bg-gray-50 rounded-xl p-4 mt-4">
          <div className="text-xs text-gray-400 mb-3 tracking-wide">対戦結果を入力</div>
          <div className="flex gap-3 flex-wrap items-end mb-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">対戦日</span>
              <input
                type="text"
                placeholder="4/18"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="border rounded p-2 text-sm w-24"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">スコア</span>
              <input
                type="text"
                placeholder="6-4"
                value={score}
                onChange={e => setScore(e.target.value)}
                className="border rounded p-2 text-sm w-24"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">勝者</span>
              <div className="flex gap-3 mt-1">
                <label className="flex items-center gap-1 text-sm cursor-pointer">
                  <input type="radio" name="winner" value="k450" checked={winner === 'k450'} onChange={() => setWinner('k450')} />
                  k450
                </label>
                <label className="flex items-center gap-1 text-sm cursor-pointer">
                  <input type="radio" name="winner" value="pb100" checked={winner === 'pb100'} onChange={() => setWinner('pb100')} />
                  pb100
                </label>
              </div>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <Button onClick={handleAdd} disabled={loading}>
            {loading ? '登録中...' : '追加する'}
          </Button>
        </div>
      )}
    </div>
  );
}