import React, { useRef, useState } from 'react';
import classes from './card.module.css';
import type { CardState } from '../stores/appstore';

interface GameCardProps {
  card: CardState;
  disabled: boolean;
  onClick: () => void;
}

const GameCard: React.FC<GameCardProps> = ({ card, disabled, onClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || card.isFlipped) return;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left; // x coordinate within element
    const y = e.clientY - rect.top;  // y coordinate within element

    // Calculate rotation angles based on cursor position (-15deg to 15deg)
    const px = (x / rect.width) * 100;
    const py = (y / rect.height) * 100;
    
    const rx = ((py - 50) / 50) * -15; // rotate around X axis
    const ry = ((px - 50) / 50) * 15;  // rotate around Y axis

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.05, 1.05, 1.05)`,
      transition: 'none', // Disable transitions during movement for responsiveness
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)', // Smooth snapback
    });
  };

  const handleClick = () => {
    if (!disabled && !card.isFlipped) {
      onClick();
    }
  };

  // Card glyphs and labels
  const getCardDetails = () => {
    switch (card.value) {
      case 4:
        return {
          glyph: '💀',
          title: 'The Trap',
          frontClass: classes.frontFour,
          glyphClass: classes.glyphFour,
          textClass: classes.textFour,
          titleClass: classes.titleFour,
        };
      case 5:
        return {
          glyph: '🌀',
          title: 'The Pivot',
          frontClass: classes.frontFive,
          glyphClass: classes.glyphFive,
          textClass: classes.textFive,
          titleClass: classes.titleFive,
        };
      case 10:
        return {
          glyph: '👑',
          title: 'The Secret',
          frontClass: classes.frontTen,
          glyphClass: classes.glyphTen,
          textClass: classes.textTen,
          titleClass: classes.titleTen,
        };
    }
  };

  const details = getCardDetails();

  return (
    <div
      ref={containerRef}
      className={`${classes.cardContainer} ${disabled || card.isFlipped ? classes.disabled : ''}`}
      style={tiltStyle}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div className={`${classes.cardInner} ${card.isFlipped ? classes.flipped : ''}`}>
        
        {/* --- Back of the card (Visible initially) --- */}
        <div className={`${classes.cardFace} ${classes.cardBack}`}>
          <div className={classes.glowGlint} />
          <div className={classes.backPattern}>
            <div className={classes.backLogo}>
              <span>カク</span>
              <span className={classes.backSubtitle}>4510</span>
            </div>
          </div>
        </div>

        {/* --- Front of the card (Revealed on flip) --- */}
        <div className={`${classes.cardFace} ${classes.cardFront} ${details.frontClass}`}>
          <div className={classes.glowGlint} />
          <span className={`${classes.glyph} ${details.glyphClass}`}>
            {details.glyph}
          </span>
          <span className={`${classes.valueText} ${details.textClass}`}>
            {card.value}
          </span>
          <span className={`${classes.cardTitle} ${details.titleClass}`}>
            {details.title}
          </span>

          {/* Target Indicators */}
          {card.isSelectedByHuman && (
            <div className={`${classes.badge} ${classes.humanBadge}`}>
              YOU
            </div>
          )}
          {card.isSelectedByComputer && (
            <div className={`${classes.badge} ${classes.computerBadge}`}>
              AI
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default GameCard;
