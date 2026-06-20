import { useState } from "react";
import { questions, subjectEmoji } from "../game/content";
import type { GameState, SubjectKey } from "../types";

const SUBJECTS: { key: SubjectKey; label: string }[] = [
  { key: "kanji", label: "漢字" },
  { key: "math", label: "算数" },
  { key: "science", label: "理科" },
  { key: "social", label: "社会" },
];

export default function Dex({ state }: { state: GameState }) {
  const [tab, setTab] = useState<SubjectKey>("kanji");
  const list = questions.filter((q) => q.subject === tab);

  // 漢字は学年ごと、それ以外は単元ごとにまとめる
  const groups: Record<string, typeof list> = {};
  for (const q of list) {
    const key = tab === "kanji" && q.grade ? `小${q.grade}` : q.unit || "その他";
    (groups[key] ||= []).push(q);
  }
  const groupKeys = Object.keys(groups);

  return (
    <div className="dex">
      <h2 className="view-title">📖 ずかん</h2>
      <p className="view-sub">2回せいかいするとマスター（⭐）になるよ。</p>

      <div className="dex-tabs">
        {SUBJECTS.map((s) => (
          <button key={s.key} className={`mode-chip ${tab === s.key ? "on" : ""}`} onClick={() => setTab(s.key)}>
            {subjectEmoji[s.key]} {s.label}
          </button>
        ))}
      </div>

      {groupKeys.map((g) => (
        <div key={g} className="dex-group">
          <div className="dex-group-title">{g}</div>
          <div className="dex-items">
            {groups[g].map((q) => {
              const stat = state.stats[q.id];
              const mastered = stat?.mastered;
              const seen = stat && (stat.correct > 0 || stat.wrong > 0);
              const weak = state.weak[q.id];
              return (
                <div
                  key={q.id}
                  className={`dex-item ${mastered ? "mastered" : seen ? "seen" : "new"} ${weak ? "weak" : ""}`}
                  title={q.title}
                >
                  <span className="dex-mark">{mastered ? "⭐" : weak ? "🧟" : seen ? "・" : "？"}</span>
                  <span className="dex-name">{q.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
