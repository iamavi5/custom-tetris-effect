import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Grid from './components/grid/GameGrid';
import Scoreboard from './components/scoreboard/Scoreboard';
import Shapes from './components/shapes/Shapes';

const BLOCK_SIZE = 30;
const COLS = 12;
const ROWS = 20;
const COLORS = [
  '#FF0D72', '#0DC2FF', '#0DFF72',
  '#F538FF', '#FF8E0D', '#FFE138'
];

// Tetromino shapes
const SHAPES = [
  [[1, 1, 1, 1]],
  [[1, 1], [1, 1]],
  [[0, 1, 0], [1, 1, 1]],
  [[1, 1, 0], [0, 1, 1]],
  [[0, 1, 1], [1, 1, 0]],
  [[1, 0, 0], [1, 1, 1]],
  [[0, 0, 1], [1, 1, 1]]
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
  
  const [nextPiece, setNextPiece] = useState({
    shape: [],
    color: ''
  });
  
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);

  // Initialize new pieces
  const getRandomPiece = useCallback(() => {
    const randomShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    return {
      shape: randomShape,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    };
  }, []);

  // const newPiece = useCallback(() => {
  //   const newPiece = {
  //     ...nextPiece,
  //     x: Math.floor(COLS / 2) - Math.floor(nextPiece.shape[0]?.length / 2) || 0,
  //     y: 0
  //   };

  //   // Set next piece
  //   setNextPiece(getRandomPiece());

  //   // Check if game over
  //   if (checkCollision(newPiece)) {
  //     setGameOver(true);
  //     return currentPiece; // Return current piece to prevent state update
  //   }

  //   return newPiece;
  // }, [currentPiece, getRandomPiece, nextPiece]);
  const newPiece = useCallback(() => {
    // First set the current piece to the next piece we already have
    const newCurrent = {
      ...nextPiece,
      x: Math.floor(COLS / 2) - Math.floor(nextPiece.shape[0]?.length / 2) || 0,
      y: 0
    };
    
    // Then generate a new next piece
    const newNextPiece = getRandomPiece();
    setNextPiece(newNextPiece);
    
    if (checkCollision(newCurrent)) {
      setGameOver(true);
      return currentPiece;
    }
    
    return newCurrent;
  }, [currentPiece, getRandomPiece, nextPiece]);

  // Check for collisions
  const checkCollision = (piece) => {
    if (!piece.shape) return true;

    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x] !== 0) {
          const newX = piece.x + x;
          const newY = piece.y + y;

          if (newX < 0 || newX >= COLS || newY >= ROWS) {
            return true;
          }

          if (newY >= 0 && grid[newY][newX]) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Lock the piece in place
  const lockPiece = useCallback(() => {
    const newGrid = [...grid];

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

    setGrid(newGrid);
    clearLines(newGrid);
    setCurrentPiece(newPiece());
  }, [currentPiece, grid, newPiece]);

  // Clear completed lines
  const clearLines = (gridToClear) => {
    let linesCleared = 0;

    for (let y = ROWS - 1; y >= 0; y--) {
      if (gridToClear[y].every(cell => cell !== 0)) {
        gridToClear.splice(y, 1);
        gridToClear.unshift(Array(COLS).fill(0));
        linesCleared++;
        y++;
      }
    }

    if (linesCleared > 0) {
      const points = linesCleared === 4 ? 800 : linesCleared * 100;
      setScore(prev => prev + points * level);

      // Level up every 10 lines (adjust as needed)
      if (Math.floor((score + points) / 1000) > Math.floor(score / 1000)) {
        setLevel(prev => prev + 1);
      }

      setGrid([...gridToClear]);
    }
  };

  // Rotate the piece
  const rotatePiece = () => {
    if (!currentPiece.shape.length) return;

    const newPiece = { ...currentPiece };

    // Transpose matrix
    newPiece.shape = newPiece.shape[0].map((_, i) =>
      newPiece.shape.map(row => row[i])
    );

    // Reverse each row to get a 90 degree rotation
    newPiece.shape.forEach(row => row.reverse());

    if (!checkCollision(newPiece)) {
      setCurrentPiece(newPiece);
    }
  };

  // Game loop
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

    const speed = Math.max(100, 1000 - (level * 100)); // Increase speed with level
    const gameInterval = setInterval(moveDown, speed);
    return () => clearInterval(gameInterval);
  }, [gameOver, lockPiece, level]);

  // Handle keyboard input
  useEffect(() => {
    if (gameOver) return;

    const handleKeyDown = (e) => {
      if (!currentPiece.shape.length) return;
      console.log('Current key =>', e)
      switch (e.key) {
        case 'ArrowLeft':
          setCurrentPiece(prev => {
            const newPiece = { ...prev, x: prev.x - 1 };
            return checkCollision(newPiece) ? prev : newPiece;
          });
          break;
        case 'ArrowRight':
          setCurrentPiece(prev => {
            const newPiece = { ...prev, x: prev.x + 1 };
            return checkCollision(newPiece) ? prev : newPiece;
          });
          break;
        case 'ArrowDown':
          setCurrentPiece(prev => {
            const newPiece = { ...prev, y: prev.y + 1 };
            return checkCollision(newPiece) ? prev : newPiece;
          });
          break;
        case 'ArrowUp':
          rotatePiece();
          break;
        case ' ':
          setCurrentPiece(prev => {
            let newY = prev.y;
            while (!checkCollision({...prev, y: newY + 1})) {
              newY++;
            }
            return {...prev, y: newY};
          });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, currentPiece.shape.length, lockPiece]);

  // Initialize game
  useEffect(() => {
    const initialNextPiece = getRandomPiece();
    setNextPiece(initialNextPiece);
    setCurrentPiece({
      ...initialNextPiece,
      x: Math.floor(COLS / 2) - Math.floor(initialNextPiece.shape[0].length / 2),
      y: 0
    });
  }, [COLS, getRandomPiece]);

  // Reset game
  const resetGame = () => {
    setGrid(Array(ROWS).fill().map(() => Array(COLS).fill(0)));
    const initialNextPiece = getRandomPiece();
    setNextPiece(initialNextPiece);
    setCurrentPiece({
      ...initialNextPiece,
      x: Math.floor(COLS / 2) - Math.floor(initialNextPiece.shape[0].length / 2),
      y: 0
    });
    setGameOver(false);
    setScore(0);
    setLevel(1);
  };

  return (
    <div className="app-container">
      <Scoreboard
        score={score}
        level={level}
        gameOver={gameOver}
        resetGame={resetGame}
      />

      <Grid
        grid={grid}
        currentPiece={currentPiece}
        blockSize={BLOCK_SIZE}
        cols={COLS}
        rows={ROWS}
      />

      <Shapes
        nextPiece={nextPiece}
        blockSize={BLOCK_SIZE}
      />
    </div>
  );
};

export default App;