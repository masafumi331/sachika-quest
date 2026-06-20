import { useEffect, useMemo, useState } from "react";
import ChoiceQuestion from "./ChoiceQuestion";
import Feedback from "./Feedback";
import {
  kanjiByGrade,
  kanjiGrades,
  monsters,
  questions,
  sample,
  shuffle,
  shuffleChoices,
  subjectLabel,
} from "../game/content";
import { reviewPriority } from "../game/srs";
import { REWARD, type useGameState } from "../game/store";
import type { Mode, Monster, Question, SubjectKey } from "../types";

type Game = ReturnType<typeof useGameState>;

const SUBJECT_MODES: SubjectKey[] = ["kanji", "math", "science", "social"];

function poolFor(mode: Mode, grade: number | "all", weakIds: string[]): Question[] {
  if (mode === "daily") return questions;
  if (mode === "weak") return questions.filter((q) => weakIds.includes(q.id));
  if (mode === "kanji") return grade === "all" ? questions.filter((q) => q.subject === "kanji") : kanjiByGrade(grade);
  return questions.filter((q) => q.subject === mode);
}

export default function Battle({
  game,
  mode,
  onHome,
  onChangeMode,
}: {
  game: Game;
  mode: Mode;
  onHome: () => void;
  onChangeMode: (m: Mode) => void;
}) {
  const { state } = game;
  // 漢字モードでは学年をえらんでからスタート
  const [grade, setGrade] = useState<number | "all" | null>(mode === "kanji" ? null : "all");

  const [session, setSession] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [answeredChoice, setAnsweredChoice] = useState<number | null>(null);
  const [lastCorrect, setLastCorrect] = useState<boolean>(false);
  const [monster, setMonster] = useState<Monster>(monsters[mode] ?? monsters.daily);
  const [monsterHp, setMonsterHp] = useState<number>((monsters[mode] ?? monsters.daily).hp);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const [flash, setFlash] = useState(false);

  const weakIds = useMemo(() => Object.keys(state.weak), [state.weak]);

  // セッションを作り直す（出題プールから復習優先度＋ランダムで選ぶ）
  function rebuild() {
    const g = grade ?? "all";
    const now = Date.now();
    const pool = poolFor(mode, g, weakIds);
    const n = mode === "daily" ? 12 : 10;
    // にがて・期限切れを優先しつつ、上位を多めにとってからランダムに選んで変化をつける
    const ranked = [...pool].sort((a, b) => reviewPriority(state, a, now) - reviewPriority(state, b, now));
    const head = ranked.slice(0, Math.min(ranked.length, n * 2));
    setSession(shuffle(sample(head, Math.min(n, head.length))).map(shuffleChoices));
    setIndex(0);
    setAnsweredChoice(null);
    setSessionCorrect(0);
    setFinished(false);
    const m = monsters[mode] ?? monsters.daily;
    setMonster(m);
    setMonsterHp(m.hp);
  }

  // セッションを作る（漢字は学年が決まってから／mode・gradeが変わったら作り直す）
  useEffect(() => {
    if (mode === "kanji" && grade === null) return;
    rebuild();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, grade]);

  // ---- 漢字の学年えらび ----
  if (mode === "kanji" && grade === null) {
    return (
      <div className="grade-pick">
        <h2 className="view-title">✍️ 漢字の国｜学年をえらぼう</h2>
        <p className="view-sub">いま勉強したい学年をえらんでね。</p>
        <div className="grade-grid">
          {kanjiGrades.map((g) => (
            <button key={g} className="grade-btn" onClick={() => setGrade(g)}>
              <span className="grade-num">小{g}</span>
              <span className="grade-count">{kanjiByGrade(g).length}問</span>
            </button>
          ))}
          <button className="grade-btn all" onClick={() => setGrade("all")}>
            <span className="grade-num">ぜんぶ</span>
            <span className="grade-count">{questions.filter((q) => q.subject === "kanji").length}問</span>
          </button>
        </div>
        <button className="btn-ghost" onClick={onHome}>
          ← ホームへ
        </button>
      </div>
    );
  }

  // ---- にがてが無いとき ----
  if (mode === "weak" && session.length === 0) {
    return (
      <div className="empty-weak">
        <div className="empty-emoji">🎉</div>
        <h2>にがてモンスターはいません！</h2>
        <p>間違えた問題がここに集まります。今日の冒険に進もう。</p>
        <button className="btn-go" onClick={() => onChangeMode("daily")}>
          今日の冒険へ
        </button>
      </div>
    );
  }

  if (session.length === 0) {
    return <div className="loading">よみこみ中…</div>;
  }

  // ---- 結果画面 ----
  if (finished) {
    const total = session.length;
    return (
      <div className="result">
        <div className="result-emoji">{sessionCorrect === total ? "🏆" : "⚔️"}</div>
        <h2 className="result-title">バトルしゅうりょう！</h2>
        <div className="result-score">
          {sessionCorrect} / {total} せいかい
        </div>
        <div className="result-rewards">
          <span>⭐ +{sessionCorrect * REWARD.xp} けいけんち</span>
          <span>🪙 +{sessionCorrect * REWARD.coins} コイン</span>
        </div>
        <div className="result-actions">
          <button className="btn-go" onClick={rebuild}>
            もう一度
          </button>
          {mode === "kanji" && (
            <button className="btn-ghost" onClick={() => setGrade(null)}>
              学年をかえる
            </button>
          )}
          <button className="btn-ghost" onClick={onHome}>
            ホームへ
          </button>
        </div>
      </div>
    );
  }

  const q = session[index];
  const answered = answeredChoice !== null;
  const monsterPct = Math.max(0, (monsterHp / monster.hp) * 100);

  function handleAnswer(i: number) {
    if (answered) return;
    const before = monsterHp;
    const res = game.recordAnswer(q, i, before);
    setAnsweredChoice(i);
    setLastCorrect(res.correct);
    if (res.correct) {
      setSessionCorrect((c) => c + 1);
      const dmg = state.streak + 1 >= 3 ? REWARD.attackStreak : REWARD.attack;
      const nextHp = Math.max(0, before - dmg);
      setMonsterHp(nextHp);
      setFlash(true);
      window.setTimeout(() => setFlash(false), 350);
      if (res.monsterDefeated) game.addDefeated();
    }
  }

  function handleNext() {
    const isLast = index + 1 >= session.length;
    if (isLast) {
      setFinished(true);
      return;
    }
    // モンスターをたおしていたら次のモンスターが出る
    if (monsterHp <= 0) setMonsterHp(monster.hp);
    setIndex((i) => i + 1);
    setAnsweredChoice(null);
  }

  return (
    <div className="battle">
      <div className="battle-bar">
        <button className="btn-ghost small" onClick={onHome}>
          ← やめる
        </button>
        <div className="battle-progress">
          {index + 1} / {session.length}（{subjectLabel[mode] ?? "バトル"}）
        </div>
      </div>

      <div className={`monster ${flash ? "hit" : ""}`} style={{ color: monster.color }}>
        <div className="monster-emoji">{monsterHp <= 0 ? "💥" : monster.emoji}</div>
        <div className="monster-name">{monster.name}</div>
        <div className="monster-hp">
          <span className="monster-hp-fill" style={{ width: `${monsterPct}%`, background: monster.color }} />
        </div>
      </div>

      <ChoiceQuestion q={q} answeredChoice={answeredChoice} onAnswer={handleAnswer} />

      {answered && (
        <Feedback
          q={q}
          choice={answeredChoice!}
          correct={lastCorrect}
          onNext={handleNext}
          isLast={index + 1 >= session.length}
        />
      )}

      {/* 教科きりかえ（バトル外への近道） */}
      {!answered && (
        <div className="mode-switch">
          {SUBJECT_MODES.map((m) => (
            <button key={m} className={`mode-chip ${mode === m ? "on" : ""}`} onClick={() => onChangeMode(m)}>
              {subjectLabel[m]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
