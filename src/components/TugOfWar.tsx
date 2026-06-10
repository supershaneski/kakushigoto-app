import React, { useEffect, useRef, useState } from 'react';
import classes from './TugOfWar.module.css';

interface TugOfWarProps {
  humanCoins: number;
  computerCoins: number;
}

interface ActiveFlyingCoin {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

const TugOfWar: React.FC<TugOfWarProps> = ({ humanCoins, computerCoins }) => {
  const humanChestRef = useRef<HTMLDivElement>(null);
  const computerChestRef = useRef<HTMLDivElement>(null);
  
  const [flyingCoins, setFlyingCoins] = useState<ActiveFlyingCoin[]>([]);
  const [coinId, setCoinId] = useState(0);

  // Keep track of previous coin counts to know when to trigger the flying coin
  const prevHumanCoinsRef = useRef<number>(humanCoins);
  const prevComputerCoinsRef = useRef<number>(computerCoins);

  useEffect(() => {
    // Only animate if the game is in active playing phase and values shifted
    const isHumanGain = humanCoins > prevHumanCoinsRef.current;
    const isComputerGain = computerCoins > prevComputerCoinsRef.current;

    if (isHumanGain || isComputerGain) {
      const startChest = isHumanGain ? computerChestRef.current : humanChestRef.current;
      const endChest = isHumanGain ? humanChestRef.current : computerChestRef.current;

      if (startChest && endChest) {
        const startRect = startChest.getBoundingClientRect();
        const endRect = endChest.getBoundingClientRect();

        // Find centers of the chests
        const startX = startRect.left + startRect.width / 2 - 9;
        const startY = startRect.top + startRect.height / 2 - 9;
        const endX = endRect.left + endRect.width / 2 - 9;
        const endY = endRect.top + endRect.height / 2 - 9;

        const newCoin: ActiveFlyingCoin = {
          id: coinId,
          startX,
          startY,
          endX,
          endY,
        };

        setFlyingCoins((prev) => [...prev, newCoin]);
        setCoinId((prev) => prev + 1);

        // Remove the coin after the animation ends (800ms)
        setTimeout(() => {
          setFlyingCoins((prev) => prev.filter((c) => c.id !== newCoin.id));
        }, 800);
      }
    }

    prevHumanCoinsRef.current = humanCoins;
    prevComputerCoinsRef.current = computerCoins;
  }, [humanCoins, computerCoins, coinId]);

  // Balance bead percentage (from 0% left, to 100% right. Center is 50%)
  // Coins range from 0 to 10. Human has 5, Computer has 5.
  // Human score = humanCoins. If human has 10 coins, bead is at 100%. If human has 0 coins, bead is at 0%.
  // So bead percentage is simply (humanCoins / 10) * 100
  const beadPercentage = (humanCoins / 10) * 100;

  return (
    <div className={classes.container}>
      {/* Tug of war bar */}
      <div className={classes.balanceTrack}>
        <div className={classes.centerMark} />
        <div className={classes.balanceLine} style={{ right: `${100 - beadPercentage}%`, left: '0' }} />
        <div className={classes.bead} style={{ left: `${beadPercentage}%` }} />
      </div>

      {/* Team Titles */}
      <div className={classes.teamLabels}>
        <span className={classes.labelComputer}>Computer (AI)</span>
        <span className={classes.labelHuman}>You (Player)</span>
      </div>

      {/* Coin Chests */}
      <div className={classes.chestsArea}>
        {/* Computer Chest */}
        <div ref={computerChestRef} className={`${classes.chest} ${classes.chestComputer}`}>
          <span className={classes.chestTitle}>AI Pool</span>
          <div className={classes.coinDisplay}>
            {Array.from({ length: 10 }).map((_, idx) => (
              <div
                key={`comp-coin-${idx}`}
                className={idx < computerCoins ? classes.goldCoin : classes.emptySlot}
              />
            ))}
          </div>
        </div>

        {/* Human Chest */}
        <div ref={humanChestRef} className={`${classes.chest} ${classes.chestHuman}`}>
          <span className={classes.chestTitle}>Your Pool</span>
          <div className={classes.coinDisplay}>
            {Array.from({ length: 10 }).map((_, idx) => (
              <div
                key={`human-coin-${idx}`}
                className={idx < humanCoins ? classes.goldCoin : classes.emptySlot}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Render Flying Coins */}
      {flyingCoins.map((coin) => {
        // Calculate mid arc point for nice physical curve
        const midX = (coin.startX + coin.endX) / 2;
        const midY = Math.min(coin.startY, coin.endY) - 100; // Curve upwards

        return (
          <div
            key={coin.id}
            className={classes.flyingCoin}
            style={{
              '--start-x': `${coin.startX}px`,
              '--start-y': `${coin.startY}px`,
              '--mid-x': `${midX}px`,
              '--mid-y': `${midY}px`,
              '--end-x': `${coin.endX}px`,
              '--end-y': `${coin.endY}px`,
            } as React.CSSProperties}
          />
        );
      })}
    </div>
  );
};

export default TugOfWar;
