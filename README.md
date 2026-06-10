# カク4510 (Kakushigoto)

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-yellow.svg)](https://vite.dev/)
[![Live Demo](https://img.shields.io/badge/Demo-Netlify-cyan.svg)](https://kaku4510.netlify.app/)

A premium, single-page **zero-strategy, one-handed idle clicker game** built with React, TypeScript, Zustand, and Vanilla CSS. 

🔗 **Play the Live Game here**: [https://kaku4510.netlify.app/](https://kaku4510.netlify.app/)

The game name, **Kakushigoto (かくしごと)**, translates to *"hidden work"* or *"secrets"*. Using Japanese number-wordplay (Goroawase), **kaku-shi-go-to** transforms into **kaku-4-5-10**—representing the three hidden card ranks at the center of the game: **4**, **5**, and **10**.

---

## 🎮 Game Concept & Mechanics

The game is designed for calm, low-effort satisfaction in short sessions (commutes, waiting, relaxing breaks).

### The Core Loop
1. **Three Cards** are placed face-down on the board. One card is a **4**, one is a **5**, and one is a **10**.
2. **Player Picks First** by tapping any card:
   - **Reveal 10:** Instant player victory for the round.
   - **Reveal 4:** Instant computer victory for the round.
   - **Reveal 5:** The computer chooses a card from the remaining two face-down cards.
3. **Computer Phase (if 5 is revealed):**
   - The computer auto-selects one of the remaining two cards.
   - **Computer reveals 10:** Computer wins (10 > 5).
   - **Computer reveals 4:** Player wins (5 > 4).

### Score & Meta-Progression
- **Tug-of-War Match Score:** Each round win transfers one gold coin from your opponent's chest to your chest. A match starts at 5-5 and ends immediately when one side reaches **10 coins** (victory) or **0 coins** (defeat).
- **Meta-Points (MP):** Permanent currency earned from playing rounds and winning matches. MP is spent on permanent upgrades that persist across sessions.
- **Offline Idle Income:** Enlist hidden workers to generate Meta-Points passively. When you close the app, your earnings accumulate offline for up to 12 hours.

---

## ✨ Design & Visual Features

- **3D Card Hover Tilt:** Smooth CSS 3D perspective transformations tilt and react to your mouse or touch movements in real-time.
- **Tactile Flipped Animation:** Snappy cubic-bezier card flip transitions with custom neon glowing borders depending on the rank revealed.
- **Chest Coin Transfer:** Floating physical coin paths animate dynamically from one chest to the other on round resolution.
- **Drifting Particles:** Relaxing cyberpunk/synthwave background visual lights drift slowly to set a soothing mood.
- **Drifting Floating Text:** Clicking anywhere on the screen yields manual clicks, popping up floating "+X MP" text indicators.

---

## 🛠️ Technology Stack

- **Framework:** React 19 (SPA)
- **Tooling:** Vite 8 & TypeScript 6
- **State Management:** Zustand (with persistent localStorage middleware)
- **Styling:** CSS Modules & Vanilla CSS variables (with Dark preference defaults)

---

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/supershaneski/kakushigoto-app.git
   cd kakushigoto-app
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
