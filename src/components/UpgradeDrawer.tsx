import React from 'react';
import classes from './UpgradeDrawer.module.css';
import { useAppStore } from '../stores/appstore';
import type { Upgrade } from '../stores/appstore';

interface UpgradeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const UpgradeDrawer: React.FC<UpgradeDrawerProps> = ({ isOpen, onClose }) => {
  const {
    metaPoints,
    totalTaps,
    matchWins,
    matchLosses,
    cardLevel,
    upgrades,
    upgradeItem,
    resetAllData,
  } = useAppStore();

  const getCost = (upgrade: Upgrade) => {
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level));
  };

  const getEffectText = (key: string, upgrade: Upgrade) => {
    const nextLevel = upgrade.level + 1;
    const currentVal = upgrade.level * upgrade.valuePerLevel;
    const nextVal = nextLevel * upgrade.valuePerLevel;

    switch (key) {
      case 'clickPower':
        return `Current: +${currentVal + 1} MP/tap ➔ Next: +${nextVal + 1} MP/tap`;
      case 'passiveIncome':
        return `Current: +${currentVal.toFixed(1)} MP/s ➔ Next: +${nextVal.toFixed(1)} MP/s`;
      case 'matchBonus':
        return `Current: +${(currentVal * 100).toFixed(0)}% Win Payout ➔ Next: +${(nextVal * 100).toFixed(0)}%`;
      case 'luckFactor':
        return `Current: +${(currentVal * 100).toFixed(0)}% Double Win ➔ Next: +${(nextVal * 100).toFixed(0)}%`;
      default:
        return '';
    }
  };

  const handleReset = () => {
    const confirm = window.confirm(
      'Are you absolutely sure you want to reset ALL your secrets, upgrades, and meta-points? This cannot be undone!'
    );
    if (confirm) {
      resetAllData();
      onClose();
    }
  };

  return (
    <>
      {/* Overlay Background */}
      <div
        className={`${classes.overlay} ${isOpen ? classes.overlayOpen : ''}`}
        onClick={onClose}
      />

      {/* Main Drawer Canvas */}
      <div className={`${classes.drawer} ${isOpen ? classes.drawerOpen : ''}`}>
        <div className={classes.handleBar} />
        
        {/* Header */}
        <div className={classes.header}>
          <div className={classes.titleSection}>
            <span className={classes.title}>Upgrades & Archives</span>
            <span className={classes.balanceLabel}>
              {metaPoints.toLocaleString()} MP (Meta-Points)
            </span>
          </div>
          <button className={classes.closeButton} onClick={onClose}>
            Close
          </button>
        </div>

        {/* Scrollable Contents */}
        <div className={classes.content}>
          {/* Section 1: Permanent Stats */}
          <span className={classes.sectionTitle}>Permanent Records</span>
          <div className={classes.statsGrid}>
            <div className={classes.statItem}>
              <span className={classes.statLabel}>Total Card Taps</span>
              <span className={classes.statValue}>{totalTaps.toLocaleString()}</span>
            </div>
            <div className={classes.statItem}>
              <span className={classes.statLabel}>Card Luxury Rank</span>
              <span className={classes.statValue}>LV. {cardLevel}</span>
            </div>
            <div className={classes.statItem}>
              <span className={classes.statLabel}>Match Victories</span>
              <span className={classes.statValue} style={{ color: 'var(--accent-cyan)' }}>
                {matchWins} Wins
              </span>
            </div>
            <div className={classes.statItem}>
              <span className={classes.statLabel}>Match Defeats</span>
              <span className={classes.statValue} style={{ color: 'var(--accent-red)' }}>
                {matchLosses} Losses
              </span>
            </div>
          </div>

          {/* Section 2: Shop Upgrades */}
          <span className={classes.sectionTitle}>Compounding Passive Secrets</span>
          <div className={classes.upgradeList}>
            {Object.entries(upgrades).map(([key, upgrade]) => {
              const cost = getCost(upgrade);
              const canAfford = metaPoints >= cost;

              return (
                <div key={key} className={classes.upgradeRow}>
                  <div className={classes.upgradeIcon}>{upgrade.icon}</div>
                  
                  <div className={classes.upgradeInfo}>
                    <div className={classes.rowHeader}>
                      <span className={classes.name}>{upgrade.name}</span>
                      <span className={classes.level}>Lvl {upgrade.level}</span>
                    </div>
                    <span className={classes.desc}>{upgrade.description}</span>
                    <span className={classes.effect}>{getEffectText(key, upgrade)}</span>
                  </div>

                  <button
                    className={classes.buyButton}
                    disabled={!canAfford}
                    onClick={() => upgradeItem(key as any)}
                  >
                    <span className={classes.buyLabel}>Buy</span>
                    <span className={classes.buyCost}>
                      <span className={canAfford ? classes.coinSym : classes.coinSymDisabled}>
                        ●
                      </span>
                      {cost.toLocaleString()}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Section 3: Safe Reset */}
          <div className={classes.resetSection}>
            <button className={classes.resetButton} onClick={handleReset}>
              Erase Saved Secrets (Hard Reset)
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpgradeDrawer;
