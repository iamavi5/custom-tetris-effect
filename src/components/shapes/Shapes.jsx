import React from 'react';
import './Shapes.css';

const Shapes = ({ nextPiece, blockSize }) => {
  return (
    <div className="shapes-container">
      <h3>NEXT</h3>
      
      <div 
        className="next-piece-container"
        style={{
          width: 5 * blockSize,
          height: 5 * blockSize
        }}
      >
        {nextPiece.shape?.map((row, y) => 
          row.map((cell, x) => 
            cell ? (
              <div
                key={`next-${y}-${x}`}
                className="next-cell"
                style={{
                  backgroundColor: nextPiece.color,
                  width: blockSize,
                  height: blockSize,
                  position: 'absolute',
                  left: (x + 1) * blockSize,
                  top: (y + 1) * blockSize
                }}
              />
            ) : null
          )
        )}
      </div>
    </div>
  );
};

export default Shapes;