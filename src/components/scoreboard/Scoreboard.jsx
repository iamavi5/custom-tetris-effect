import React from 'react';
import './Scoreboard.css';

const Scoreboard = ({ score, level, gameOver, resetGame }) => {
  return (
    <div className="scoreboard-container">
      <h2>TETRIS</h2>
      
      <div className="score-section">
        <div className="score-label">SCORE</div>
        <div className="score-value">{score}</div>
      </div>
      
      <div className="level-section">
        <div className="level-label">LEVEL</div>
        <div className="level-value">{level}</div>
      </div>
      
      {gameOver && (
        <div className="game-over-section">
          <div className="game-over-text">GAME OVER</div>
          <button onClick={resetGame} className="restart-button">
            PLAY AGAIN
          </button>
        </div>
      )}
    </div>
  );
};

export default Scoreboard;