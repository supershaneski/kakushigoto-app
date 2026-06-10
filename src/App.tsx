import React, { useEffect, useState } from 'react';
import './App.css';
import { useAppStore } from './stores/appstore';
import BackgroundParticles from './components/BackgroundParticles';
import IdleEarningsModal from './components/IdleEarningsModal';
import UpgradeDrawer from './components/UpgradeDrawer';
import TugOfWar from './components/TugOfWar';
import GameCard from './components/GameCard';

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
}

const App: React.FC = () => {
  const {
    metaPoints,
    upgrades,
    localCoinsHuman,
    localCoinsComputer,
    matchState,
    matchResult,
    roundNumber,
    cards,
    currentTurn,
    roundLog,
    startNewMatch,
    playerSelectCard,
    checkOfflineEarnings,
    incrementTaps,
    updateTimestamp,
  } = useAppStore();

  const [isShopOpen, setIsShopOpen] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [textId, setTextId] = useState(0);

  // --- Background Listeners & Timers ---
  
  // 1. Mount checks
  useEffect(() => {
    checkOfflineEarnings();
  }, []);

  // 2. Passive Income ticks every 100ms for high-dopamine smooth numbers scrolling
  useEffect(() => {
    const passiveRate = upgrades.passiveIncome.level * upgrades.passiveIncome.valuePerLevel;
    if (passiveRate <= 0) return;

    const interval = setInterval(() => {
      // 10 ticks per second, so add rate / 10
      incrementTaps(passiveRate / 10);
    }, 100);

    return () => clearInterval(interval);
  }, [upgrades.passiveIncome.level]);

  // 3. Keep persistent saved timestamp fresh every 3s to support accurate offline duration
  useEffect(() => {
    const timestampInterval = setInterval(() => {
      updateTimestamp();
    }, 3000);

    return () => clearInterval(timestampInterval);
  }, []);

  // --- Screen tap dopamine particles ---
  const handleArenaClick = (e: React.MouseEvent) => {
    // Only trigger if clicked outside card active buttons to avoid double indicators
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('.floatingShopBtn')) {
      return;
    }

    const value = 1 + upgrades.clickPower.level * upgrades.clickPower.valuePerLevel;
    const newText: FloatingText = {
      id: textId,
      x: e.clientX,
      y: e.clientY - 25,
      text: `+${value.toFixed(0)} MP`,
    };

    setFloatingTexts((prev) => [...prev, newText]);
    setTextId((prev) => prev + 1);

    // Add click count and manual points to store
    incrementTaps();

    // Fade out text after 1s
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((t) => t.id !== newText.id));
    }, 1000);
  };

  return (
    <div className="appContainer" onClick={handleArenaClick} style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Ambient drifting lights */}
      <BackgroundParticles />

      {/* Offline Idle Earnings popup */}
      <IdleEarningsModal />

      {/* Permanent shop drawer */}
      <UpgradeDrawer isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} />

      {/* --- HEADER --- */}
      <header className="header">
        <div className="logoArea">
          <span className="logoTitle glow-purple">カク4510</span>
          <span className="logoSubtitle">Kakushigoto</span>
        </div>

        <div className="currencyBox" onClick={(e) => e.stopPropagation()}>
          <span className="currencyVal">{Math.floor(metaPoints).toLocaleString()}</span>
          <span className="coinSym">●</span>
        </div>
      </header>

      {/* --- DUEL ARENA WORKSPACE --- */}
      <main className="arena">
        {/* State A: Start Game Splash */}
        {matchState === 'setup' && (
          <div className="panelCenter glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="zenSymbol">🌀</div>
            <h2 className="panelTitle glow-purple">Reveal the Secrets</h2>
            <p className="panelDesc">
              A zero-strategy, one-handed card flip battle. Reveal 4, 5, or 10. Win duels, unlock archives, and let passive secrets compound.
            </p>
            <button className="btn-primary animate-pulse-glow" onClick={startNewMatch}>
              Enter the Duel
            </button>
          </div>
        )}

        {/* State B: Active Duel Card Board */}
        {(matchState === 'playing' || matchState === 'round_resolving') && (
          <div className="boardArea">
            {/* Visual Coin Pools & Sliding balance bead */}
            <TugOfWar humanCoins={localCoinsHuman} computerCoins={localCoinsComputer} />

            <div className="roundIndicator">
              Round {roundNumber}
            </div>

            {/* Three active duel cards */}
            <div className="cardsRow" onClick={(e) => e.stopPropagation()}>
              {cards.map((card) => (
                <GameCard
                  key={card.id}
                  card={card}
                  disabled={currentTurn !== 'human'}
                  onClick={() => playerSelectCard(card.id)}
                />
              ))}
            </div>

            {/* Realtime Action status console log */}
            <div className="consoleBox" onClick={(e) => e.stopPropagation()}>
              <span key={roundLog} className="logMessage">
                {roundLog}
              </span>
            </div>
          </div>
        )}

        {/* State C: Match Conclusion Victories / Defeats */}
        {matchState === 'match_over' && (
          <div className="panelCenter glass-panel" onClick={(e) => e.stopPropagation()}>
            {matchResult === 'victory' ? (
              <>
                <div className="zenSymbol" style={{ borderStyle: 'solid', borderColor: 'var(--accent-cyan)' }}>🏆</div>
                <h2 className="duelResultText victoryTitle">Match Won</h2>
                <p className="panelDesc">
                  Brilliant. You successfully drained the computer's coins and unlocked deeper vault archives.
                </p>
              </>
            ) : (
              <>
                <div className="zenSymbol" style={{ borderStyle: 'solid', borderColor: 'var(--accent-red)' }}>💀</div>
                <h2 className="duelResultText defeatTitle">Match Lost</h2>
                <p className="panelDesc">
                  Drained. The computer out-revealed your cards. Don't worry, every loss leaves compounding secrets behind.
                </p>
              </>
            )}

            <button className="btn-primary" onClick={startNewMatch}>
              Duel Again
            </button>
          </div>
        )}
      </main>

      {/* --- FOOTER UPGRADE SHOP BUTTON --- */}
      <footer className="footerBar">
        <button
          className="floatingShopBtn"
          onClick={(e) => {
            e.stopPropagation();
            setIsShopOpen(true);
          }}
        >
          <span className="floatingShopIcon">📂</span>
          <span>Upgrades & Stats</span>
        </button>
      </footer>

      {/* --- DRIFTING DOPAMINE NUMBERS OVERLAY --- */}
      {floatingTexts.map((text) => (
        <span
          key={text.id}
          className="floating-number"
          style={{ left: `${text.x}px`, top: `${text.y}px` }}
        >
          {text.text}
        </span>
      ))}
    </div>
  );
};

export default App;
