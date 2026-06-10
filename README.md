# **Game: カク4510 (Kakushigoto)**

## **1. Core Promise**  
A zero‑strategy, one‑handed idle clicker that delivers instant, satisfying tap‑reveal interactions. Every tap produces feedback, progress, and momentum. The game always responds immediately and pleasantly.

---

## **2. Emotional Outcome**  
Calm, low‑effort satisfaction. The player feels rewarded for simply tapping, with no stress, no failure pressure, and a soothing, repetitive rhythm.

---

## **3. Game Title & Naming Rationale**  
**Kakushigoto (かくしごと)** means “hidden work.”  
Japanese number‑wordplay transforms **kaku‑shi‑go‑to → kaku‑4‑5‑10 → カク4510**, matching the game’s hidden cards: **4, 5, 10**.  
The title reflects the theme: hidden numbers and small secrets revealed by tapping.

---

## **4. Game Overview**

A fast, one‑handed tap‑reveal game built for short sessions (commutes, waiting, boredom). Each round is a quick duel between the human and computer.

### **Core Loop**
1. Player taps one of three face‑down cards.  
2. Card reveals **4**, **5**, or **10**.  
3. Round resolves instantly.  
4. Player continues into the next round.

---

### **Mechanics**
- Three hidden cards: **4**, **5**, **10**.  
- Human picks first:  
  - **10 → human wins**  
  - **4 → human loses**  
  - **5 → computer picks from remaining two cards**  
- Higher number wins. No ties.

---

### **Scoring & Progression**

#### **Local Match Score (per run)**  
A simple tug‑of‑war or coin‑transfer system:  
- Win round → gain local points  
- Lose round → lose local points  
- Match ends when one side reaches zero

#### **Meta‑Progression (permanent)**  
After each match (win or lose), the player earns **meta‑points**:  
- Persist across sessions  
- Never decrease  
- Represent long‑term compounding progress  
- May unlock small passive bonuses (optional)

---

## **5. Scope Boundaries**
- No strategy (no decks, combos, tactics)  
- No competitive systems (no PvP, leaderboards)  
- No complex economy  
- No narrative or quests in v1

---

## **6. Signature Constraint**  

Every round is expressed through exactly three face‑down cards and a single tap‑to‑reveal flip animation.

All interaction follows this rule:
- **Three cards are always shown face‑down** for selection.  
- **Player taps one card** → it flips to reveal **4 / 5 / 10**.  
- **Instant‑win/lose (10 or 4):**  
  - The selected card flips back to reset the board.  
- **If 5 is revealed:**  
  - The computer auto‑selects one of the two remaining cards using simple RNG (e.g., Math.random()).
  - That card flips to reveal its number.  
  - Both cards flip back to reset.

---

## **7. User Journey**
1. Tap card  
2. Immediate feedback (animation, sound, progress)  
3. Continue tapping or idle  
4. See visible progress (round result, meta‑gain)

---

## **8. Technical Foundations**

### **Stack**
- Vite + React (SPA)  
- TypeScript  
- Zustand + persist (localStorage)  
- No backend (all local)

### **Architecture**
- Single Card component drives all interaction  
- Tap → update state → animate → persist  
- Idle progression via timestamp deltas on resume

### **State**
Zustand store holds:  
- card level  
- tap count  
- thresholds  
- idle timestamps  
- animation flags  
- local match score  
- meta‑points

### **Assets**
- Card fronts/back and small UI elements generated via LLM during development  
- Bundled statically; no runtime generation
