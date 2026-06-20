// 問題・レッスン・モンスターなどコンテンツの読み込みと整形
import kanji from "../data/kanji.json";
import math from "../data/math.json";
import science from "../data/science.json";
import social from "../data/social.json";
import lessonsData from "../data/lessons.json";
import writeData from "../data/writeitems.json";
import type { Lesson, Monster, Question, SubjectKey, WriteItem } from "../types";

export const questions: Question[] = [
  ...(kanji as Question[]),
  ...(math as Question[]),
  ...(science as Question[]),
  ...(social as Question[]),
];

export const lessons: Lesson[] = lessonsData as Lesson[];
export const writeItems: WriteItem[] = writeData as WriteItem[];

export const monsters: Record<string, Monster> = {
  kanji: { name: "漢字オニ", emoji: "👹", hp: 100, color: "#d95757" },
  math: { name: "型あてゴーレム", emoji: "🗿", hp: 100, color: "#5f8df7" },
  science: { name: "理科ドラゴン", emoji: "🐉", hp: 100, color: "#2e9d74" },
  social: { name: "社会ナイト", emoji: "🛡️", hp: 100, color: "#ff9a4a" },
  daily: { name: "総合ボス", emoji: "👾", hp: 140, color: "#8b6ff7" },
  weak: { name: "にがてモンスター", emoji: "🧟", hp: 120, color: "#8b6ff7" },
};

export const subjectLabel: Record<string, string> = {
  daily: "今日の冒険",
  kanji: "漢字の国",
  math: "算数の国",
  science: "理科の国",
  social: "社会の国",
  weak: "にがてモンスター",
};

export const subjectEmoji: Record<SubjectKey, string> = {
  kanji: "✍️",
  math: "🧮",
  science: "🔬",
  social: "🗾",
};

// 漢字を学年（1〜6）でしぼり込む
export function kanjiByGrade(grade: number): Question[] {
  return questions.filter((q) => q.subject === "kanji" && q.grade === grade);
}

export function writeByGrade(grade: number): WriteItem[] {
  return writeItems.filter((w) => w.grade === grade);
}

// 出題に使える漢字の学年一覧
export const kanjiGrades: number[] = Array.from(
  new Set(
    questions
      .filter((q) => q.subject === "kanji" && typeof q.grade === "number")
      .map((q) => q.grade as number),
  ),
).sort((a, b) => a - b);

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sample<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

export function questionById(id: string): Question | undefined {
  return questions.find((q) => q.id === id);
}

// 選択肢の順番をシャッフルし、正解の位置をバラけさせる。
// （データ上の正解が特定の位置に偏っていても、出題ごとにランダムになる）
export function shuffleChoices(q: Question): Question {
  const order = shuffle(q.choices.map((_, i) => i));
  return {
    ...q,
    choices: order.map((i) => q.choices[i]),
    answer: order.indexOf(q.answer),
  };
}
