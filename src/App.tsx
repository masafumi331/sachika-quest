import { useState } from "react";
import Hud from "./components/Hud";
import Home from "./components/Home";
import Battle from "./components/Battle";
import WriteCanvas from "./components/WriteCanvas";
import Lessons from "./components/Lessons";
import Dex from "./components/Dex";
import WeakReview from "./components/WeakReview";
import { useGameState } from "./game/store";
import type { Mode } from "./types";

type View = "home" | "battle" | "write" | "lesson" | "dex" | "weak";

export default function App() {
  const game = useGameState();
  const [view, setView] = useState<View>("home");
  const [mode, setMode] = useState<Mode>("daily");

  function startBattle(m: Mode) {
    setMode(m);
    setView("battle");
  }

  const tabs: { key: View; label: string; icon: string }[] = [
    { key: "home", label: "ホーム", icon: "🏠" },
    { key: "weak", label: "にがて", icon: "🧟" },
    { key: "write", label: "書き取り", icon: "✍️" },
    { key: "lesson", label: "型レッスン", icon: "📜" },
    { key: "dex", label: "ずかん", icon: "📖" },
  ];

  return (
    <div className="app">
      <header className="topbar">
        <h1 className="logo" onClick={() => setView("home")}>
          祥花クエスト
        </h1>
        <Hud state={game.state} />
      </header>

      <main className="stage">
        {view === "home" && <Home state={game.state} onStart={startBattle} />}
        {view === "battle" && (
          <Battle game={game} mode={mode} onHome={() => setView("home")} onChangeMode={startBattle} />
        )}
        {view === "write" && <WriteCanvas />}
        {view === "lesson" && <Lessons />}
        {view === "dex" && <Dex state={game.state} />}
        {view === "weak" && (
          <WeakReview game={game} onStart={() => startBattle("weak")} onHome={() => setView("home")} />
        )}
      </main>

      <nav className="tabbar">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`tab ${view === t.key ? "active" : ""}`}
            onClick={() => setView(t.key)}
          >
            <span className="tab-icon">{t.icon}</span>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
