// ゲーム状態（HP・コイン・XP・連続正解・学習記録）の管理とlocalStorage保存
import { useCallback, useEffect, useRef, useState } from "react";
import type { GameState, Question } from "../types";
import { getStat, onCorrect, onWrong } from "./srs";

const STORAGE_KEY = "shokaQuestV2";

// バランス値（既存MVPを継承）
export const REWARD = {
  xp: 12,
  coins: 5,
  hpLoss: 8,
  attack: 30,
  attackStreak: 45, // 連続3以上の強い攻撃
  maxHp: 100,
};

function today(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function defaultState(): GameState {
  return {
    hp: REWARD.maxHp,
    coins: 0,
    xp: 0,
    streak: 0,
    defeated: 0,
    bestStreak: 0,
    stats: {},
    weak: {},
    lastPlayed: today(),
  };
}

function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<GameState>;
    return { ...defaultState(), ...parsed, stats: parsed.stats ?? {}, weak: parsed.weak ?? {} };
  } catch {
    return defaultState();
  }
}

export interface AnswerResult {
  correct: boolean;
  treasure: boolean;     // 連続正解で宝箱
  mastered: boolean;     // この回答でマスターになったか
  monsterDefeated: boolean;
}

export function useGameState() {
  const [state, setState] = useState<GameState>(() => loadState());
  const saveTimer = useRef<number | null>(null);

  // 変更があれば少し待って保存（書き込みすぎ防止）
  useEffect(() => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        /* 保存に失敗しても続行 */
      }
    }, 150);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [state]);

  // 1問の回答を記録し、結果を返す
  const recordAnswer = useCallback(
    (q: Question, choice: number, monsterHpBefore: number): AnswerResult => {
      const now = Date.now();
      const correct = choice === q.answer;
      let result: AnswerResult = {
        correct,
        treasure: false,
        mastered: false,
        monsterDefeated: false,
      };

      setState((prev) => {
        const next: GameState = {
          ...prev,
          stats: { ...prev.stats },
          weak: { ...prev.weak },
          lastPlayed: today(),
        };
        const stat = { ...getStat(next, q.id, now) };

        if (correct) {
          onCorrect(stat, now);
          next.streak = prev.streak + 1;
          next.bestStreak = Math.max(prev.bestStreak, next.streak);
          next.xp = prev.xp + REWARD.xp;
          next.coins = prev.coins + REWARD.coins;
          if (stat.mastered) delete next.weak[q.id];
          result.mastered = stat.mastered && (prev.stats[q.id]?.mastered !== true);
          result.treasure = next.streak > 0 && next.streak % 3 === 0;
          const dmg = next.streak >= 3 ? REWARD.attackStreak : REWARD.attack;
          result.monsterDefeated = monsterHpBefore - dmg <= 0;
        } else {
          onWrong(stat, now);
          next.streak = 0;
          next.hp = Math.max(0, prev.hp - REWARD.hpLoss);
          next.weak[q.id] = { id: q.id, subject: q.subject, lastWrong: now };
        }

        next.stats[q.id] = stat;
        return next;
      });

      return result;
    },
    [],
  );

  // モンスターを倒した数を増やす
  const addDefeated = useCallback(() => {
    setState((prev) => ({ ...prev, defeated: prev.defeated + 1 }));
  }, []);

  // HPを全回復（休けい）
  const healFull = useCallback(() => {
    setState((prev) => ({ ...prev, hp: REWARD.maxHp }));
  }, []);

  // 進捗をリセット（確認のうえで使う）
  const resetAll = useCallback(() => {
    setState(defaultState());
  }, []);

  return { state, recordAnswer, addDefeated, healFull, resetAll };
}
