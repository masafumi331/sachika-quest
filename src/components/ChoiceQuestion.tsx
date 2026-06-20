import type { Question } from "../types";

// 5択の問題。回答後は正解を緑、選んだ誤答を赤で示す。
export default function ChoiceQuestion({
  q,
  answeredChoice,
  onAnswer,
}: {
  q: Question;
  answeredChoice: number | null;
  onAnswer: (i: number) => void;
}) {
  const answered = answeredChoice !== null;
  return (
    <div className="question">
      <div className="q-tag">{q.unit || q.type}</div>
      <div className="q-text">{q.prompt}</div>
      <div className="choices">
        {q.choices.map((c, i) => {
          let cls = "choice";
          if (answered) {
            if (i === q.answer) cls += " correct";
            else if (i === answeredChoice) cls += " wrong";
            else cls += " dim";
          }
          return (
            <button
              key={i}
              className={cls}
              disabled={answered}
              onClick={() => onAnswer(i)}
            >
              <span className="choice-num">{i + 1}</span>
              <span className="choice-text">{c}</span>
              {answered && i === q.answer && <span className="choice-mark">⭕</span>}
              {answered && i === answeredChoice && i !== q.answer && (
                <span className="choice-mark">❌</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
