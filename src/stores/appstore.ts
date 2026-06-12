import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { playTap, playFlip, playCoin, playUpgrade, playVictory, playDefeat } from '../utils/audio'

export interface Upgrade {
  level: number;
  baseCost: number;
  costMultiplier: number;
  valuePerLevel: number;
  name: string;
  description: string;
  icon: string;
}

export interface CardState {
  id: number;
  value: 4 | 5 | 10;
  isFlipped: boolean;
  isSelectedByHuman: boolean;
  isSelectedByComputer: boolean;
}

export interface AppStoreProps {
  // --- Permanent Meta-Progression ---
  metaPoints: number;
  totalTaps: number;
  matchWins: number;
  matchLosses: number;
  cardLevel: number;
  lastSavedTimestamp: number;
  
  // --- Upgrades ---
  upgrades: {
    clickPower: Upgrade;      // Increase meta-points earned per tap
    passiveIncome: Upgrade;   // Meta-points per second (idle)
    matchBonus: Upgrade;      // Extra payout multiplier on match win
    luckFactor: Upgrade;      // Percentage chance to double round earnings
  };

  // --- Local Match (Tug-of-War) ---
  localCoinsHuman: number;      // e.g. starts at 5, max 10
  localCoinsComputer: number;   // e.g. starts at 5, max 10
  matchState: 'setup' | 'playing' | 'round_resolving' | 'match_over';
  matchResult: 'victory' | 'defeat' | null;
  roundNumber: number;
  
  // --- Active Round Cards ---
  cards: CardState[];
  currentTurn: 'human' | 'computer' | 'resolving';
  roundLog: string;
  idleEarningsAccumulated: number;
  isMuted: boolean;
  hasCheckedIdle: boolean;

  // --- Actions ---
  incrementTaps: (points?: number) => void;
  startNewMatch: () => void;
  startNewRound: () => Promise<void>;
  playerSelectCard: (cardId: number) => Promise<void>;
  computerSelectCard: () => Promise<void>;
  resolveRound: (winner: 'human' | 'computer') => void;
  upgradeItem: (key: 'clickPower' | 'passiveIncome' | 'matchBonus' | 'luckFactor') => void;
  checkOfflineEarnings: () => void;
  clearIdleEarnings: () => void;
  updateTimestamp: () => void;
  toggleMute: () => void;
  resetAllData: () => void;
}

const shuffleCards = (): CardState[] => {
  const values: (4 | 5 | 10)[] = [4, 5, 10];
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = values[i];
    values[i] = values[j];
    values[j] = temp;
  }
  return [
    { id: 1, value: values[0], isFlipped: false, isSelectedByHuman: false, isSelectedByComputer: false },
    { id: 2, value: values[1], isFlipped: false, isSelectedByHuman: false, isSelectedByComputer: false },
    { id: 3, value: values[2], isFlipped: false, isSelectedByHuman: false, isSelectedByComputer: false }
  ];
};

const defaultUpgrades = {
  clickPower: {
    level: 0,
    baseCost: 15,
    costMultiplier: 1.4,
    valuePerLevel: 1, // Adds +1 meta-point per tap
    name: 'Tactile Focus',
    description: 'Earn more Meta-Points with every card tap.',
    icon: '👆'
  },
  passiveIncome: {
    level: 0,
    baseCost: 50,
    costMultiplier: 1.45,
    valuePerLevel: 0.2, // Generates 0.2 MP/second passively
    name: 'Hidden Helpers',
    description: 'Enlist hidden workers to gather Meta-Points passively.',
    icon: '🤖'
  },
  matchBonus: {
    level: 0,
    baseCost: 180,
    costMultiplier: 1.6,
    valuePerLevel: 0.25, // +25% payout bonus for match wins
    name: 'High Stakes',
    description: 'Increases the Meta-Point payout upon match victory.',
    icon: '🏆'
  },
  luckFactor: {
    level: 0,
    baseCost: 120,
    costMultiplier: 1.5,
    valuePerLevel: 0.05, // +5% chance to double round win earnings
    name: 'Gilded Fate',
    description: 'Adds a small chance to double your round earnings.',
    icon: '✨'
  }
};

export const useAppStore = create<AppStoreProps>()(
  persist(
    (set, get) => ({
      // Permanent progression
      metaPoints: 0,
      totalTaps: 0,
      matchWins: 0,
      matchLosses: 0,
      cardLevel: 1,
      lastSavedTimestamp: Date.now(),
      isMuted: false,

      // Upgrades
      upgrades: defaultUpgrades,

      // Local Match Score
      localCoinsHuman: 5,
      localCoinsComputer: 5,
      matchState: 'setup',
      matchResult: null,
      roundNumber: 0,

      // Cards State
      cards: [],
      currentTurn: 'human',
      roundLog: 'Welcome to カク4510. Press Start Match to begin!',
      idleEarningsAccumulated: 0,
      hasCheckedIdle: false,

      // Actions
      incrementTaps: (points) => {
        const { upgrades, totalTaps, metaPoints } = get();
        const baseClick = 1;
        const upgradeAddition = upgrades.clickPower.level * upgrades.clickPower.valuePerLevel;
        const addAmount = points !== undefined ? points : (baseClick + upgradeAddition);
        
        if (points === undefined) {
          playTap();
        }

        set({
          totalTaps: totalTaps + 1,
          metaPoints: metaPoints + addAmount,
          lastSavedTimestamp: Date.now()
        });
      },

      startNewMatch: () => {
        set({
          localCoinsHuman: 5,
          localCoinsComputer: 5,
          matchState: 'playing',
          matchResult: null,
          roundNumber: 1,
          roundLog: 'Match started! Choose a card to reveal your fate.',
          currentTurn: 'human',
          cards: shuffleCards(),
          lastSavedTimestamp: Date.now()
        });
      },

      startNewRound: async () => {
        const { localCoinsHuman, localCoinsComputer, roundNumber, cards } = get();
        
        // If match ended, don't start new round
        if (localCoinsHuman <= 0 || localCoinsComputer <= 0) {
          return;
        }

        // 1. Flip current cards back face-down first
        playFlip();
        const flippedDownCards = cards.map(c => ({ ...c, isFlipped: false }));
        set({
          cards: flippedDownCards,
          currentTurn: 'resolving', // prevent early clicks during animation
          roundLog: 'Preparing next round...',
          lastSavedTimestamp: Date.now()
        });

        // 2. Wait for 800ms flip animation to complete
        await new Promise(resolve => setTimeout(resolve, 800));

        // 3. Shuffle cards unseen
        set({
          cards: shuffleCards(),
          currentTurn: 'human',
          roundNumber: roundNumber + 1,
          roundLog: 'New round! Make your choice.',
          lastSavedTimestamp: Date.now()
        });
      },

      playerSelectCard: async (cardId) => {
        const { cards, currentTurn, upgrades, metaPoints } = get();
        if (currentTurn !== 'human') return;

        // Visual click tap reward
        const clickEarn = 1 + upgrades.clickPower.level * upgrades.clickPower.valuePerLevel;
        
        // Find tapped card
        const updatedCards = cards.map(c => 
          c.id === cardId ? { ...c, isFlipped: true, isSelectedByHuman: true } : c
        );
        const selectedCard = updatedCards.find(c => c.id === cardId);
        if (!selectedCard) return;

        playFlip();
        set({ 
          cards: updatedCards,
          currentTurn: 'resolving',
          totalTaps: get().totalTaps + 1,
          metaPoints: metaPoints + clickEarn,
          lastSavedTimestamp: Date.now()
        });

        // Small delay to let card flip transition play
        await new Promise(resolve => setTimeout(resolve, 800));

        if (selectedCard.value === 10) {
          // Instant Win!
          get().resolveRound('human');
        } else if (selectedCard.value === 4) {
          // Instant Loss!
          get().resolveRound('computer');
        } else {
          // It's a 5! Computer takes turn
          set({
            currentTurn: 'computer',
            roundLog: 'You revealed a 5! AI is selecting from the remaining cards...',
            lastSavedTimestamp: Date.now()
          });
          
          // Wait 1.2 seconds for dramatic computer choice
          await new Promise(resolve => setTimeout(resolve, 1200));
          await get().computerSelectCard();
        }
      },

      computerSelectCard: async () => {
        const { cards } = get();
        // Computer picks one of the unflipped cards
        const remainingCards = cards.filter(c => !c.isFlipped);
        if (remainingCards.length === 0) return;

        const randomPickIndex = Math.floor(Math.random() * remainingCards.length);
        const computerCard = remainingCards[randomPickIndex];

        const updatedCards = cards.map(c => 
          c.id === computerCard.id ? { ...c, isFlipped: true, isSelectedByComputer: true } : c
        );

        playFlip();
        set({ 
          cards: updatedCards,
          currentTurn: 'resolving',
          lastSavedTimestamp: Date.now()
        });

        // Small delay to let card flip play
        await new Promise(resolve => setTimeout(resolve, 800));

        // Evaluate outcome:
        // Human has 5. Remaining cards are 4 and 10.
        // If computer gets 10: 10 > 5 -> Computer wins round
        // If computer gets 4: 4 < 5 -> Human wins round
        if (computerCard.value === 10) {
          get().resolveRound('computer');
        } else {
          get().resolveRound('human');
        }
      },

      resolveRound: (winner) => {
        const { localCoinsHuman, localCoinsComputer, upgrades, metaPoints } = get();
        
        let newHumanCoins = localCoinsHuman;
        let newComputerCoins = localCoinsComputer;
        let logMessage = '';
        
        // Payout calculations
        const baseRoundWinMP = 5;
        const baseRoundLoseMP = 1;
        const luckChance = upgrades.luckFactor.level * upgrades.luckFactor.valuePerLevel;
        const isLucky = Math.random() < luckChance;
        const multiplier = isLucky ? 2 : 1;

        let pointsEarned = 0;

        if (winner === 'human') {
          newHumanCoins = Math.min(10, localCoinsHuman + 1);
          newComputerCoins = Math.max(0, localCoinsComputer - 1);
          pointsEarned = Math.floor(baseRoundWinMP * multiplier);
          logMessage = `You won the round! (+${pointsEarned} Meta-Points) ${isLucky ? '✨ LUCKY DOUBLE! ✨' : ''}`;
          playCoin();
        } else {
          newHumanCoins = Math.max(0, localCoinsHuman - 1);
          newComputerCoins = Math.min(10, localCoinsComputer + 1);
          pointsEarned = baseRoundLoseMP;
          logMessage = `AI won the round. (+${pointsEarned} Meta-Point consolation)`;
        }

        const nextMetaPoints = metaPoints + pointsEarned;

        set({
          localCoinsHuman: newHumanCoins,
          localCoinsComputer: newComputerCoins,
          metaPoints: nextMetaPoints,
          roundLog: logMessage,
          lastSavedTimestamp: Date.now()
        });

        // Check Match Ending conditions
        setTimeout(() => {
          const { localCoinsHuman: currentHuman, matchWins, matchLosses, upgrades: currentUpgrades } = get();
          
          if (currentHuman >= 10) {
            // Match Won!
            const baseMatchWinMP = 25;
            const matchWinPayout = Math.floor(baseMatchWinMP * (1 + currentUpgrades.matchBonus.level * currentUpgrades.matchBonus.valuePerLevel));
            
            playVictory();
            set({
              matchState: 'match_over',
              matchResult: 'victory',
              matchWins: matchWins + 1,
              metaPoints: get().metaPoints + matchWinPayout,
              roundLog: `🏆 MATCH VICTORY! You defeated the computer and earned +${matchWinPayout} Meta-Points!`,
              lastSavedTimestamp: Date.now()
            });
          } else if (currentHuman <= 0) {
            // Match Lost
            const baseMatchLoseMP = 8;
            const matchLosePayout = Math.floor(baseMatchLoseMP * (1 + currentUpgrades.matchBonus.level * currentUpgrades.matchBonus.valuePerLevel));

            playDefeat();
            set({
              matchState: 'match_over',
              matchResult: 'defeat',
              matchLosses: matchLosses + 1,
              metaPoints: get().metaPoints + matchLosePayout,
              roundLog: `💀 MATCH DEFEAT! You were defeated by the computer. Consolidation prize: +${matchLosePayout} Meta-Points!`,
              lastSavedTimestamp: Date.now()
            });
          } else {
            // Match continues
            get().startNewRound();
          }
        }, 1200);
      },

      upgradeItem: (key) => {
        const { upgrades, metaPoints } = get();
        const upgrade = upgrades[key];
        const cost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level));

        if (metaPoints >= cost) {
          const updatedUpgrade = {
            ...upgrade,
            level: upgrade.level + 1
          };

          const newUpgrades = {
            ...upgrades,
            [key]: updatedUpgrade
          };

          // If it was the card upgrade, let's bump the cardLevel visually
          let nextCardLevel = get().cardLevel;
          if (key === 'matchBonus') {
            nextCardLevel = updatedUpgrade.level + 1;
          }

          playUpgrade();
          set({
            metaPoints: metaPoints - cost,
            upgrades: newUpgrades,
            cardLevel: nextCardLevel,
            lastSavedTimestamp: Date.now()
          });
        }
      },

      checkOfflineEarnings: () => {
        const { lastSavedTimestamp, upgrades, hasCheckedIdle } = get();
        if (hasCheckedIdle) return;

        const timeDiffSeconds = (Date.now() - lastSavedTimestamp) / 1000;
        const passiveIncomePerSec = upgrades.passiveIncome.level * upgrades.passiveIncome.valuePerLevel;

        // Earn idle points if offline for more than 10 seconds and have income rate
        if (timeDiffSeconds >= 10 && passiveIncomePerSec > 0) {
          // Cap idle earnings at 12 hours (43200 seconds) to prevent economy inflation
          const duration = Math.min(timeDiffSeconds, 43200);
          const earned = Math.floor(duration * passiveIncomePerSec);

          if (earned > 0) {
            set({
              idleEarningsAccumulated: earned,
              metaPoints: get().metaPoints + earned,
            });
          }
        }

        set({ hasCheckedIdle: true, lastSavedTimestamp: Date.now() });
      },

      clearIdleEarnings: () => {
        set({ idleEarningsAccumulated: 0, lastSavedTimestamp: Date.now() });
      },

      updateTimestamp: () => {
        set({ lastSavedTimestamp: Date.now() });
      },

      toggleMute: () => {
        set((state) => ({ isMuted: !state.isMuted, lastSavedTimestamp: Date.now() }));
      },

      resetAllData: () => {
        set({
          metaPoints: 0,
          totalTaps: 0,
          matchWins: 0,
          matchLosses: 0,
          cardLevel: 1,
          isMuted: false,
          lastSavedTimestamp: Date.now(),
          upgrades: defaultUpgrades,
          localCoinsHuman: 5,
          localCoinsComputer: 5,
          matchState: 'setup',
          matchResult: null,
          roundNumber: 0,
          cards: [],
          currentTurn: 'human',
          roundLog: 'Game reset successfully.',
          idleEarningsAccumulated: 0,
          hasCheckedIdle: true
        });
      }
    }),
    {
      name: 'kak4510-store-v1',
      partialize: (state) => ({
        metaPoints: state.metaPoints,
        totalTaps: state.totalTaps,
        matchWins: state.matchWins,
        matchLosses: state.matchLosses,
        cardLevel: state.cardLevel,
        lastSavedTimestamp: state.lastSavedTimestamp,
        upgrades: state.upgrades,
        isMuted: state.isMuted,
      })
    }
  )
)
