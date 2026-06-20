import { questionById, subjectEmoji } from "../game/content";
import type { SubjectKey } from "../types";
import { type useGameState } from "../game/store";

type Game = ReturnType<typeof useGameState>;

// にがて（間違えた問題）の一覧と、まとめて復習するボタン。
export default function WeakReview({
  game,
  onStart,
  onHome,
}: {
  game: Game;
  onStart: () => void;
  onHome: () => void;
}) {
  const { state } = game;
  const ids = Object.keys(state.weak);

  if (ids.length === 0) {
    return (
      <div className="empty-weak">
        <div className="empty-emoji">🎉</div>
        <h2>にがてモンスターはいません！</h2>
        <p>間違えた問題がここに集まります。今のところ、にがてはなし。すばらしい！</p>
        <button className="btn-go" onClick={onHome}>
          ホームへ
        </button>
      </div>
    );
  }

  return (
    <div className="weak">
      <h2 className="view-title">🧟 にがてモンスター（{ids.length}）</h2>
      <p className="view-sub">間違えた問題だけをまとめて復習しよう。2回せいかいでマスター！</p>

      <button className="btn-go big" onClick={onStart}>
        まとめて復習する →
      </button>

      <div className="weak-list">
        {ids.map((id) => {
          const q = questionById(id);
          if (!q) return null;
          const subj = q.subject as SubjectKey;
          return (
            <div key={id} className="weak-item">
              <span className="weak-emoji">{subjectEmoji[subj]}</span>
              <div className="weak-body">
                <div className="weak-title">{q.title}</div>
                <div className="weak-prompt">{q.prompt}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
