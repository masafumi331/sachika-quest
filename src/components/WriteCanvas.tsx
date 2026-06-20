import { useEffect, useRef, useState } from "react";
import { kanjiGrades, writeByGrade } from "../game/content";
import type { WriteItem } from "../types";

// 漢字の書き取り。手本をうすく表示し、その上を指（またはマウス）でなぞる。
// 自己採点（かけた／もう一回）で進む。将来、手書き認識APIに差しかえやすいよう
// 「描く部分」と「採点部分」を分けている。
export default function WriteCanvas() {
  const [grade, setGrade] = useState<number | null>(null);
  const [items, setItems] = useState<WriteItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [showGuide, setShowGuide] = useState(true);
  const [done, setDone] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  const item = items[idx];

  // キャンバスを初期化（手本を描く）
  function clearCanvas() {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, cv.width, cv.height);
    // 中央の十字ガイド
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cv.width / 2, 0);
    ctx.lineTo(cv.width / 2, cv.height);
    ctx.moveTo(0, cv.height / 2);
    ctx.lineTo(cv.width, cv.height / 2);
    ctx.stroke();
    // 手本の漢字（うすく）
    if (showGuide && item) {
      ctx.fillStyle = "rgba(60,70,120,0.16)";
      ctx.font = `${cv.height * 0.72}px 'Yu Mincho','Hiragino Mincho ProN',serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(item.char, cv.width / 2, cv.height / 2 + 4);
    }
  }

  useEffect(() => {
    clearCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, showGuide, item]);

  function pos(e: React.PointerEvent) {
    const cv = canvasRef.current!;
    const r = cv.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * cv.width,
      y: ((e.clientY - r.top) / r.height) * cv.height,
    };
  }

  function down(e: React.PointerEvent) {
    e.preventDefault();
    drawing.current = true;
    last.current = pos(e);
    (e.target as Element).setPointerCapture(e.pointerId);
  }
  function move(e: React.PointerEvent) {
    if (!drawing.current) return;
    const cv = canvasRef.current!;
    const ctx = cv.getContext("2d")!;
    const p = pos(e);
    ctx.strokeStyle = "#1f2440";
    ctx.lineWidth = Math.max(6, cv.width * 0.022);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(last.current!.x, last.current!.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  }
  function up() {
    drawing.current = false;
    last.current = null;
  }

  function next(success: boolean) {
    if (success) setDone((d) => d + 1);
    setIdx((i) => (i + 1) % items.length);
  }

  // ---- 学年えらび ----
  if (grade === null) {
    return (
      <div className="grade-pick">
        <h2 className="view-title">✍️ 書き取りダンジョン｜学年をえらぼう</h2>
        <p className="view-sub">手本をなぞって、漢字を書く練習をしよう。</p>
        <div className="grade-grid">
          {kanjiGrades.map((g) => {
            const c = writeByGrade(g).length;
            if (c === 0) return null;
            return (
              <button
                key={g}
                className="grade-btn"
                onClick={() => {
                  setGrade(g);
                  setItems(writeByGrade(g));
                  setIdx(0);
                  setDone(0);
                }}
              >
                <span className="grade-num">小{g}</span>
                <span className="grade-count">{c}字</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (!item) return <div className="loading">この学年の書き取りは準備中です。</div>;

  return (
    <div className="write">
      <div className="battle-bar">
        <button className="btn-ghost small" onClick={() => setGrade(null)}>
          ← 学年をかえる
        </button>
        <div className="battle-progress">
          小{grade}｜{idx + 1} / {items.length}（かけた {done}）
        </div>
      </div>

      <div className="write-info">
        <div className="write-reading">{item.reading}</div>
        <div className="write-word">{item.word}</div>
        <div className="write-hint">🧩 {item.hint}</div>
      </div>

      <canvas
        ref={canvasRef}
        className="write-canvas"
        width={360}
        height={360}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerLeave={up}
      />

      <div className="write-tools">
        <button className="btn-ghost" onClick={clearCanvas}>
          けす
        </button>
        <button className="btn-ghost" onClick={() => setShowGuide((s) => !s)}>
          {showGuide ? "手本をかくす" : "手本を見る"}
        </button>
      </div>

      <div className="write-grade">
        <button className="btn-ng" onClick={() => next(false)}>
          もう一回
        </button>
        <button className="btn-go" onClick={() => next(true)}>
          かけた！ つぎへ
        </button>
      </div>
    </div>
  );
}
