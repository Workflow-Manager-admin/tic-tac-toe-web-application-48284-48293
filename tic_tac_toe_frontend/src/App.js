import React, { useState, useEffect } from "react";
import "./App.css";

/**
 * Utility to calculate the winner of the board.
 * Returns 'X' or 'O' if there's a winner, or null otherwise.
 */
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6],            // diags
  ];
  for (let [a, b, c] of lines) {
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return squares[a];
    }
  }
  return null;
}

/**
 * Utility to determine if all squares are filled and there is no winner.
 */
function isDraw(squares) {
  return squares.every(Boolean) && !calculateWinner(squares);
}

/**
 * Square component for board cell.
 */
function Square({ value, onClick, highlight }) {
  return (
    <button
      className="ttt-square"
      onClick={onClick}
      style={highlight ? { background: "var(--ttt-accent-opaque)" } : undefined}
      aria-label={value ? `Cell marked ${value}` : "Empty cell"}
    >
      {value}
    </button>
  );
}

/**
 * Main Board component.
 */
function Board({ squares, onSquareClick, winningLine }) {
  function renderSquare(i) {
    const highlight =
      Array.isArray(winningLine) && winningLine.includes(i);
    return (
      <Square
        key={i}
        value={squares[i]}
        onClick={() => onSquareClick(i)}
        highlight={highlight}
      />
    );
  }
  // 3x3 Grid
  return (
    <div className="ttt-board">
      {[0, 1, 2].map(row => (
        <div key={row} className="ttt-board-row">
          {[0, 1, 2].map(col => renderSquare(row * 3 + col))}
        </div>
      ))}
    </div>
  );
}

/**
 * Finds the winning line (array of 3 indices) if there's a winner.
 */
function findWinningLine(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (let line of lines) {
    const [a, b, c] = line;
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[b] === squares[c]
    ) {
      return line;
    }
  }
  return null;
}

// PUBLIC_INTERFACE
function App() {
  // State: history of board states, move index, xIsNext
  const [history, setHistory] = useState([
    { squares: Array(9).fill(null), move: null }
  ]);
  const [stepNumber, setStepNumber] = useState(0);
  const xIsNext = stepNumber % 2 === 0;

  // Theme management
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  // Theme colors as CSS vars
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--ttt-primary', "#0070f3");
    root.style.setProperty('--ttt-accent', "#ff5722");
    root.style.setProperty('--ttt-accent-opaque', "rgba(255, 87, 34, 0.18)");
    root.style.setProperty('--ttt-secondary', "#21c87a");
  }, []);

  // Current board state
  const current = history[stepNumber];
  const winner = calculateWinner(current.squares);
  const winningLine = findWinningLine(current.squares);

  // Status message
  let status;
  if (winner) {
    status = (
      <span>
        <span className="ttt-highlight">{winner}</span> wins! 🎉
      </span>
    );
  } else if (isDraw(current.squares)) {
    status = <span>Draw game! 🤝</span>;
  } else {
    status = (
      <span>
        Next Player:{" "}
        <span
          className="ttt-highlight"
          style={{
            color: xIsNext
              ? "var(--ttt-primary)"
              : "var(--ttt-secondary)",
          }}
        >
          {xIsNext ? "X" : "O"}
        </span>
      </span>
    );
  }

  // PUBLIC_INTERFACE
  function handleClick(i) {
    const truncHistory = history.slice(0, stepNumber + 1);
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return; // Don't allow move if game is over or cell filled
    }
    squares[i] = xIsNext ? "X" : "O";
    setHistory(truncHistory.concat([
      { squares, move: i }
    ]));
    setStepNumber(truncHistory.length);
  }

  // PUBLIC_INTERFACE
  function jumpTo(step) {
    setStepNumber(step);
  }

  // PUBLIC_INTERFACE
  function restartGame() {
    setHistory([{ squares: Array(9).fill(null), move: null }]);
    setStepNumber(0);
  }

  // Move description (row, col)
  function moveToLabel(move, step) {
    if (move == null) {
      return "Go to game start";
    }
    const row = Math.floor(move / 3) + 1;
    const col = (move % 3) + 1;
    return `Move #${step}: (${col}, ${row})`;
  }

  return (
    <div className="App ttt-app-bg">
      <header className="ttt-header">
        <h1 className="ttt-title">Tic Tac Toe</h1>
        <button
          className="theme-toggle ttt-theme-toggle"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
      </header>
      <main>
        <section className="ttt-status-controls">
          <div className="ttt-status">{status}</div>
          <div>
            <button className="ttt-btn ttt-btn-restart" onClick={restartGame}>
              Restart Game
            </button>
          </div>
        </section>
        <Board
          squares={current.squares}
          onSquareClick={winner || isDraw(current.squares) ? () => {} : handleClick}
          winningLine={winningLine}
        />
        <section className="ttt-history-section">
          <h2 className="ttt-history-title">Move History</h2>
          <ol className="ttt-history-list">
            {history.map((step, move) => {
              const desc = moveToLabel(step.move, move);
              return (
                <li key={move}>
                  <button
                    className={
                      "ttt-btn ttt-history-btn" +
                      (move === stepNumber ? " ttt-btn-current" : "")
                    }
                    onClick={() => jumpTo(move)}
                    aria-current={move === stepNumber}
                  >
                    {desc}
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
        <footer className="ttt-footer" style={{ marginTop: 32, color: "var(--ttt-accent)" }}>
          <span>Modern minimal React Tic Tac Toe &mdash; By Kavia</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
