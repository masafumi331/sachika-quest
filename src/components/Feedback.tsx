import type { Question } from "../types";

// 回答後のフィードバック。
// 間違えたときは「なぜちがうか・正解とその理由・覚え方・成り立ち・つまずき」を
// やさしい言葉で大きく見せて、理解しやすくする。
export default function Feedback({
  q,
  choice,
  correct,
  onNext,
  isLast,
}: {
  q: Question;
  choice: number;
  correct: boolean;
  onNext: () => void;
  isLast: boolean;
}) {
  return (
    <div className={`feedback ${correct ? "ok" : "ng"}`}>
      {correct ? (
        <div className="fb-head ok">
          <span className="fb-badge">⭕ せいかい！</span>
          <span className="fb-praise">いいね、その調子！</span>
        </div>
      ) : (
        <div className="fb-head ng">
          <span className="fb-badge">❌ おしい！ もう一度かくにん</span>
        </div>
      )}

      {!correct && (
        <div className="fb-answers">
          <div className="fb-yourpick">
            あなたの答え：<b>{q.choices[choice]}</b>
          </div>
          <div className="fb-correct">
            正しい答え：<b>{q.choices[q.answer]}</b>
          </div>
        </div>
      )}

      {/* やさしい解説（間違えたときは大きく目立たせる） */}
      <div className="fb-block fb-explain">
        <div className="fb-label">💡 どうしてそうなるの？</div>
        <p>{q.explain}</p>
      </div>

      {/* 漢字なら成り立ち・部品の意味を見せる */}
      {q.subject === "kanji" && q.origin && (
        <div className="fb-block fb-origin">
          <div className="fb-label">🧩 漢字の成り立ち・部品の意味</div>
          <p>{q.origin}</p>
        </div>
      )}

      <div className="fb-block fb-memory">
        <div className="fb-label">🧠 おぼえ方</div>
        <p>{q.memory}</p>
      </div>

      {/* 間違えたときだけ、つまずきポイントを強調 */}
      {!correct && q.commonMistake && (
        <div className="fb-block fb-mistake">
          <div className="fb-label">⚠️ ここをまちがえやすい</div>
          <p>{q.commonMistake}</p>
        </div>
      )}

      <div className="fb-source">出典：{q.source}</div>

      <button className="btn-next" onClick={onNext}>
        {isLast ? "けっか を見る →" : "つぎの問題へ →"}
      </button>
    </div>
  );
}
