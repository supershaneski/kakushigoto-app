import React from 'react';
import classes from './IdleEarningsModal.module.css';
import { useAppStore } from '../stores/appstore';

const IdleEarningsModal: React.FC = () => {
  const { idleEarningsAccumulated, clearIdleEarnings } = useAppStore();

  if (idleEarningsAccumulated <= 0) return null;

  return (
    <div className={classes.overlay}>
      <div className={classes.modal}>
        {/* Animated Gold Chest Icon */}
        <div className={classes.iconArea}>💎</div>

        <h3 className={classes.title}>While You Were Away...</h3>
        <p className={classes.subtitle}>
          Your hidden helpers worked hard and gathered secrets from the card vaults.
        </p>

        {/* Claimable reward cell */}
        <div className={classes.rewardArea}>
          <div className={classes.amount}>
            <span style={{ color: 'var(--accent-gold)' }}>●</span>
            <span>{idleEarningsAccumulated.toLocaleString()}</span>
          </div>
          <div className={classes.rewardLabel}>Meta-Points Earned</div>
        </div>

        {/* Action button */}
        <button className={classes.claimButton} onClick={clearIdleEarnings}>
          Claim Accumulated Secrets
        </button>
      </div>
    </div>
  );
};

export default IdleEarningsModal;
