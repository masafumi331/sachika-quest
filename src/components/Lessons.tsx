import { useState } from "react";
import { lessons } from "../game/content";

// 型・公式・部品の「型レッスン」。問題を解く前のヒント集。
export default function Lessons() {
  const subjects = Array.from(new Set(lessons.map((l) => l.subject)));
  const [filter, setFilter] = useState<string>("ぜんぶ");
  const shown = filter === "ぜんぶ" ? lessons : lessons.filter((l) => l.subject === filter);

  return (
    <div className="lessons">
      <h2 className="view-title">📜 型レッスン</h2>
      <p className="view-sub">問題のパターン・公式・漢字の部品をまとめてチェック。</p>

      <div className="lesson-filter">
        {["ぜんぶ", ...subjects].map((s) => (
          <button key={s} className={`mode-chip ${filter === s ? "on" : ""}`} onClick={() => setFilter(s)}>
            {s}
          </button>
        ))}
      </div>

      <div className="lesson-list">
        {shown.map((l) => (
          <div key={l.id} className="lesson-card">
            <div className="lesson-head">
              <span className="lesson-subj">{l.subject}</span>
              <span className="lesson-title">{l.title}</span>
            </div>
            <p className="lesson-lead">{l.lead}</p>
            <div className="lesson-formula">{l.formula}</div>
            <p className="lesson-speech">💬 {l.speech}</p>
            <div className="lesson-signals">
              {l.signals.map((s, i) => (
                <span key={i} className="signal">
                  {s}
                </span>
              ))}
            </div>
            <p className="lesson-trap">⚠️ {l.trap}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
