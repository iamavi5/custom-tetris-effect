import React from 'react';
import './Grid.css';

const Grid = ({ grid, currentPiece, blockSize, cols, rows }) => {
  return (
    <div 
      className="grid-container"
      style={{
        width: cols * blockSize,
        height: rows * blockSize,
        gridTemplateColumns: `repeat(${cols}, ${blockSize}px)`
      }}
    >
      {/* Render grid */}
      {grid.map((row, y) => 
        row.map((cell, x) => (
          <div 
            key={`${y}-${x}`} 
            className="cell"
            style={{
              backgroundColor: cell || 'transparent',
              width: blockSize,
              height: blockSize
            }}
          />
        ))
      )}
      
      {/* Render current piece */}
      {currentPiece.shape?.map((row, y) => 
        row.map((cell, x) => 
          cell ? (
            <div
              key={`piece-${y}-${x}`}
              className="cell"
              style={{
                backgroundColor: currentPiece.color,
                width: blockSize,
                height: blockSize,
                position: 'absolute',
                left: (currentPiece.x + x) * blockSize,
                top: (currentPiece.y + y) * blockSize
              }}
            />
          ) : null
        )
      )}
    </div>
  );
};

export default Grid;