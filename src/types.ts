// 祥花クエスト 型定義

export type SubjectKey = "kanji" | "math" | "science" | "social";

// 出題モード（タブ）
export type Mode = SubjectKey | "daily" | "weak";

export interface Question {
  id: string;
  subject: SubjectKey;
  unit: string;          // 単元名（教材ベース）
  difficulty: 1 | 2 | 3; // 難易度
  type: string;          // 読み/型/公式/用語 など
  prompt: string;        // 問題文
  choices: string[];     // 5択
  answer: number;        // 正解のindex
  title: string;         // 見出しキーワード
  memory: string;        // 覚え方
  explain: string;       // 解説
  commonMistake?: string; // よくある間違い（任意）
  source: string;        // 出典（教材+ページ）
  grade?: number;        // 学年（漢字のみ：1〜6）
  origin?: string;       // 成り立ち・部品の意味（漢字のみ。間違えたとき詳しく見せる）
}

// 漢字書き取りのお題
export interface WriteItem {
  id: string;
  grade: number;    // 学年（1〜6）
  char: string;     // 書く漢字
  reading: string;  // 読み
  word: string;     // 用例（熟語）
  hint: string;     // 覚え方/部品ヒント
  source: string;
}

// 型・公式レッスン
export interface Lesson {
  id: string;
  subject: string;
  title: string;
  lead: string;
  speech: string;
  signals: string[];
  formula: string;
  trap: string;
}

export interface Monster {
  name: string;
  emoji: string;
  hp: number;
  color: string;
}

// 1問ごとの学習記録（SRS用）
export interface QuestionStat {
  correct: number;
  wrong: number;
  mastered: boolean;
  box: number;          // Leitnerの箱（0〜5）。大きいほど定着
  nextReview: number;   // 次に出題してよい時刻(epoch ms)
  lastSeen: number;
}

// にがて登録
export interface WeakEntry {
  id: string;
  subject: SubjectKey;
  lastWrong: number;
}

export interface GameState {
  hp: number;
  coins: number;
  xp: number;
  streak: number;
  defeated: number;
  bestStreak: number;
  stats: Record<string, QuestionStat>;
  weak: Record<string, WeakEntry>;
  lastPlayed: string; // YYYY-MM-DD
}
