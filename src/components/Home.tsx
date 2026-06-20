import type { GameState, Mode, SubjectKey } from "../types";
import { questions, subjectEmoji } from "../game/content";

const SUBJECTS: { key: SubjectKey; label: string; color: string }[] = [
  { key: "kanji", label: "漢字", color: "#d95757" },
  { key: "math", label: "算数", color: "#5f8df7" },
  { key: "science", label: "理科", color: "#2e9d74" },
  { key: "social", label: "社会", color: "#ff9a4a" },
];

export default function Home({
  state,
  onStart,
}: {
  state: GameState;
  onStart: (m: Mode) => void;
}) {
  const weakCount = Object.keys(state.weak).length;
  const masteredCount = Object.values(state.stats).filter((s) => s.mastered).length;
  const totalCount = questions.length;

  function subjectStat(key: SubjectKey) {
    const subjQs = questions.filter((q) => q.subject === key);
    const mastered = subjQs.filter((q) => state.stats[q.id]?.mastered).length;
    return { total: subjQs.length, mastered };
  }

  return (
    <div className="home">
      <section className="daily-card" style={{ background: "linear-gradient(135deg,#6f7bf7,#8b6ff7)" }}>
        <div className="daily-emoji">👾</div>
        <div className="daily-body">
          <div className="daily-title">今日の冒険</div>
          <div className="daily-sub">4教科をまぜた総合ミッション（全12問）</div>
        </div>
        <button className="btn-go" onClick={() => onStart("daily")}>
          はじめる
        </button>
      </section>

      {weakCount > 0 && (
        <button className="weak-banner" onClick={() => onStart("weak")}>
          🧟 にがてモンスターが <b>{weakCount}</b> たい！ たおしに行く →
        </button>
      )}

      <div className="subject-grid">
        {SUBJECTS.map((s) => {
          const st = subjectStat(s.key);
          const pct = st.total ? Math.round((st.mastered / st.total) * 100) : 0;
          return (
            <button
              key={s.key}
              className="subject-card"
              style={{ borderColor: s.color }}
              onClick={() => onStart(s.key)}
            >
              <div className="subject-emoji">{subjectEmoji[s.key]}</div>
              <div className="subject-name">{s.label}の国</div>
              <div className="subject-meter">
                <span className="subject-meter-fill" style={{ width: `${pct}%`, background: s.color }} />
              </div>
              <div className="subject-count">
                マスター {st.mastered}/{st.total}
              </div>
            </button>
          );
        })}
      </div>

      <div className="home-stats">
        <div className="home-stat">
          <div className="home-stat-num">{masteredCount}</div>
          <div className="home-stat-label">マスターした問題</div>
        </div>
        <div className="home-stat">
          <div className="home-stat-num">{state.defeated}</div>
          <div className="home-stat-label">たおしたモンスター</div>
        </div>
        <div className="home-stat">
          <div className="home-stat-num">{state.bestStreak}</div>
          <div className="home-stat-label">れんぞく正解の記録</div>
        </div>
        <div className="home-stat">
          <div className="home-stat-num">{totalCount}</div>
          <div className="home-stat-label">ぜんぶの問題</div>
        </div>
      </div>
    </div>
  );
}
