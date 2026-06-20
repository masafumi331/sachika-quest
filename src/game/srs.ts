// かんたんな間隔反復（Leitner方式）
// 間違えた問題の復習を最重要にするためのしくみ。
import type { GameState, Question, QuestionStat } from "../types";

const DAY = 24 * 60 * 60 * 1000;

// 箱ごとの復習間隔（日）。箱が大きいほど、次に出るまでの間隔が長い＝定着。
const INTERVALS_DAYS = [0, 1, 2, 4, 7, 14];

export function emptyStat(now: number): QuestionStat {
  return { correct: 0, wrong: 0, mastered: false, box: 0, nextReview: now, lastSeen: 0 };
}

export function getStat(state: GameState, id: string, now: number): QuestionStat {
  if (!state.stats[id]) state.stats[id] = emptyStat(now);
  return state.stats[id];
}

// 正解時：箱を1つ上げ、次回出題を先にのばす。2回正解でマスター。
export function onCorrect(stat: QuestionStat, now: number): void {
  stat.correct += 1;
  stat.lastSeen = now;
  stat.box = Math.min(stat.box + 1, INTERVALS_DAYS.length - 1);
  stat.nextReview = now + INTERVALS_DAYS[stat.box] * DAY;
  if (stat.correct >= 2) stat.mastered = true;
}

// 間違い時：箱を0にもどし、マスターも解除。すぐ復習対象に。
export function onWrong(stat: QuestionStat, now: number): void {
  stat.wrong += 1;
  stat.lastSeen = now;
  stat.box = 0;
  stat.mastered = false;
  stat.nextReview = now; // すぐ復習できる
}

// 復習の優先度。値が小さいほど「いま出すべき」。
// 1) にがて（間違えた）を最優先　2) 期限が来ているもの　3) まだ解いていないもの
export function reviewPriority(state: GameState, q: Question, now: number): number {
  const stat = state.stats[q.id];
  if (!stat) return 1; // 未学習はふつう
  if (stat.box === 0 && stat.wrong > 0) return -100 + stat.nextReview / 1e13; // にがて最優先
  if (stat.nextReview <= now) return 0 + stat.nextReview / 1e13; // 期限切れ
  if (stat.mastered) return 100; // マスター済みは後回し
  return 10;
}

// にがて（直近で間違えてまだ定着していない）問題のID一覧
export function weakIds(state: GameState): string[] {
  return Object.keys(state.weak);
}
