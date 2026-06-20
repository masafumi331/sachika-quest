import type { GameState } from "../types";
import { REWARD } from "../game/store";

export default function Hud({ state }: { state: GameState }) {
  const hpPct = Math.max(0, Math.min(100, (state.hp / REWARD.maxHp) * 100));
  return (
    <div className="hud">
      <div className="hud-hp" title="たいりょく">
        <span className="hud-ico">❤️</span>
        <span className="hud-bar">
          <span className="hud-bar-fill" style={{ width: `${hpPct}%` }} />
        </span>
      </div>
      <div className="hud-item" title="コイン">
        🪙 <b>{state.coins}</b>
      </div>
      <div className="hud-item" title="けいけんち">
        ⭐ <b>{state.xp}</b>
      </div>
      <div className="hud-item" title="れんぞく正解">
        🔥 <b>{state.streak}</b>
      </div>
    </div>
  );
}
