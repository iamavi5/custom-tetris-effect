import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Grid from './components/grid';
import Scoreboard from './components/scoreboard';
import Shapes from './components/shapes';
import Modal from './components/modal';

const BLOCK_SIZE = 30;
const COLS = 12;
const ROWS = 20;
const COLORS = [
  '#FF0D72', // Pink
  '#0DC2FF', // Light Blue
  '#0DFF72', // Bright Green
  '#F538FF', // Purple
  '#FF8E0D', // Orange
  '#FFE138', // Yellow
  '#FF355E', // Ruby Red
  '#66FF66', // Neon Green
  '#FF6EFF', // Pink Purple
  '#00FFFF', // Cyan
  '#FF9966', // Peach
  '#AA00FF'  // Violet
];
const SHAPES = [
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[0, 1, 0], [1, 1, 1]], // T
  [[1, 1, 0], [0, 1, 1]], // Z
  [[0, 1, 1], [1, 1, 0]], // S
  [[1, 0, 0], [1, 1, 1]], // L
  [[0, 0, 1], [1, 1, 1]]  // J
];

const App = () => {
  const [grid, setGrid] = useState(() =>
    Array(ROWS).fill().map(() => Array(COLS).fill(0))
  );
  const [currentPiece, setCurrentPiece] = useState({
    x: Math.floor(COLS / 2),
    y: 0,
    shape: [],
    color: ''
  });
  const [nextPiece, setNextPiece] = useState(getRandomPiece());
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);

  function getRandomPiece() {
    const randomShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    return {
      shape: randomShape,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    };
  }

  const newPiece = useCallback(() => {
    const newCurrent = {
      ...nextPiece,
      x: Math.floor(COLS / 2) - Math.floor(nextPiece.shape[0].length / 2),
      y: 0
    };

    setNextPiece(getRandomPiece());

    if (checkCollision(newCurrent)) {
      setGameOver(true);
      return currentPiece;
    }

    return newCurrent;
  }, [COLS, currentPiece, nextPiece]);

  const checkCollision = (piece) => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.x + x;
          const newY = piece.y + y;

          if (newX < 0 || newX >= COLS || newY >= ROWS) return true;
          if (newY >= 0 && grid[newY][newX]) return true;
        }
      }
    }
    return false;
  };

  const lockPiece = useCallback(() => {
    const newGrid = grid.map(row => [...row]);

    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x]) {
          if (currentPiece.y + y < 0) {
            setGameOver(true);
            return;
          }
          newGrid[currentPiece.y + y][currentPiece.x + x] = currentPiece.color;
        }
      }
    }

    let linesCleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
      if (newGrid[y].every(cell => cell !== 0)) {
        newGrid.splice(y, 1);
        newGrid.unshift(Array(COLS).fill(0));
        linesCleared++;
        y++;
      }
    }

    setGrid(newGrid);

    if (linesCleared > 0) {
      const points = linesCleared === 4 ? 800 : linesCleared * 100;
      setScore(prev => prev + points * level);
      if (Math.floor((score + points) / 1000) > Math.floor(score / 1000)) {
        setLevel(prev => prev + 1);
      }
    }

    setCurrentPiece(newPiece());
  }, [currentPiece, grid, level, newPiece, score]);

  const rotatePiece = () => {
    const newPiece = {
      ...currentPiece,
      shape: currentPiece.shape[0].map((_, i) =>
        currentPiece.shape.map(row => row[i]).reverse()
      )
    };

    if (!checkCollision(newPiece)) {
      setCurrentPiece(newPiece);
    }
  };

  useEffect(() => {
    if (gameOver) return;

    const moveDown = () => {
      setCurrentPiece(prev => {
        const newPiece = { ...prev, y: prev.y + 1 };
        if (checkCollision(newPiece)) {
          lockPiece();
          return prev;
        }
        return newPiece;
      });
    };

    const speed = Math.max(100, 1000 - (level * 100));
    const gameInterval = setInterval(moveDown, speed);
    return () => clearInterval(gameInterval);
  }, [gameOver, lockPiece, level]);

  useEffect(() => {
    if (gameOver) return;

    const handleKeyDown = (e) => {
      if (!currentPiece.shape.length) return;

      switch (e.key) {
        case 'ArrowLeft':
          setCurrentPiece(prev => ({ ...prev, x: prev.x - 1 }));
          if (checkCollision({ ...currentPiece, x: currentPiece.x - 1 })) {
            setCurrentPiece(prev => ({ ...prev, x: prev.x + 1 }));
          }
          break;

        case 'ArrowRight':
          setCurrentPiece(prev => ({ ...prev, x: prev.x + 1 }));
          if (checkCollision({ ...currentPiece, x: currentPiece.x + 1 })) {
            setCurrentPiece(prev => ({ ...prev, x: prev.x - 1 }));
          }
          break;

        case 'ArrowDown':
          setCurrentPiece(prev => ({ ...prev, y: prev.y + 1 }));
          if (checkCollision({ ...currentPiece, y: currentPiece.y + 1 })) {
            setCurrentPiece(prev => ({ ...prev, y: prev.y - 1 }));
            lockPiece();
          }
          break;

        case 'ArrowUp':
          rotatePiece();
          break;

        case ' ':
          let dropY = currentPiece.y;
          while (!checkCollision({ ...currentPiece, y: dropY + 1 })) {
            dropY++;
          }

          // Create new grid with piece locked at bottom
          const newGrid = grid.map(row => [...row]);
          for (let y = 0; y < currentPiece.shape.length; y++) {
            for (let x = 0; x < currentPiece.shape[y].length; x++) {
              if (currentPiece.shape[y][x]) {
                newGrid[dropY + y][currentPiece.x + x] = currentPiece.color;
              }
            }
          }

          // Clear any completed lines
          let linesCleared = 0;
          for (let y = ROWS - 1; y >= 0; y--) {
            if (newGrid[y].every(cell => cell !== 0)) {
              newGrid.splice(y, 1);
              newGrid.unshift(Array(COLS).fill(0));
              linesCleared++;
              y++; // Re-check same row
            }
          }

          // Update all states atomically
          setGrid(newGrid);
          if (linesCleared > 0) {
            const points = linesCleared === 4 ? 800 : linesCleared * 100;
            setScore(prev => prev + points * level);
            if (Math.floor((score + points) / 1000) > Math.floor(score / 1000)) {
              setLevel(prev => prev + 1);
            }
          }
          setCurrentPiece(newPiece());
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, currentPiece, lockPiece]);

  // Initialize game
  useEffect(() => {
    setCurrentPiece({
      ...nextPiece,
      x: Math.floor(COLS / 2) - Math.floor(nextPiece.shape[0].length / 2),
      y: 0
    });
    setNextPiece(getRandomPiece());
  }, []);

  const resetGame = useCallback(() => {
    setGrid(Array(ROWS).fill().map(() => Array(COLS).fill(0)));
    const newNextPiece = getRandomPiece();
    setNextPiece(newNextPiece);
    setCurrentPiece({
      ...newNextPiece,
      x: Math.floor(COLS / 2) - Math.floor(newNextPiece.shape[0].length / 2),
      y: 0
    });
    setGameOver(false);
    setScore(0);
    setLevel(1);
  }, []);

  const dummyClick = () => {
    console.log('Just Clicked')
    // Todo :  Go to home Page
  }

  return (
    <>
    {gameOver &&
    <Modal
      headingText="Game Over"
      descriptionText="The game is over want to start a new one ?"
      primaryAction={resetGame}
      secondaryAction={dummyClick}
      primaryButtonText="Yes"
      secondaryButtonText="Get Lost!"
    />}
    {!gameOver && <div className="app-container">
      <Scoreboard score={score} level={level} gameOver={gameOver} resetGame={resetGame} />
      <Grid grid={grid} currentPiece={currentPiece} blockSize={BLOCK_SIZE} cols={COLS} rows={ROWS} />
      <Shapes nextPiece={nextPiece} blockSize={BLOCK_SIZE} />
    </div>}
    </>
  );
};

export default App;