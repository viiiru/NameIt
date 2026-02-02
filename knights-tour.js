// Knight's Tour game script
//
// Core idea:
// - Represent the board as a 2D grid (size N x N, N from 5 to 8).
// - Track the knight position, visited squares, legal next moves, and move history.
// - Only allow legal knight moves (L-shape: 2 by 1 or 1 by 2 in any direction).
// - Detect success (all squares visited exactly once) and failure (no legal moves left).

const KT_ELEMENTS = {
  board: document.getElementById("board"),
  moveCount: document.getElementById("move-count"),
  timeElapsed: document.getElementById("time-elapsed"),
  boardSizeSelect: document.getElementById("board-size-select"),
  restartButton: document.getElementById("restart-button"),
  undoButton: document.getElementById("undo-button"),
  hintButton: document.getElementById("hint-button"),
  gameMessage: document.getElementById("game-message"),
};

let ktBoardSize = 8;
let ktKnightPos = null; // { row, col }
let ktVisited = []; // boolean matrix [row][col]
let ktMoveOrder = []; // matrix with move numbers
let ktMoveHistory = []; // stack of { row, col }
let ktGameOver = false;
let ktHasStarted = false;
let ktStartTime = null;
let ktTimerId = null;

// All 8 knight move offsets: (±2, ±1) and (±1, ±2)
const KNIGHT_OFFSETS = [
  { dr: 2, dc: 1 },
  { dr: 1, dc: 2 },
  { dr: -1, dc: 2 },
  { dr: -2, dc: 1 },
  { dr: -2, dc: -1 },
  { dr: -1, dc: -2 },
  { dr: 1, dc: -2 },
  { dr: 2, dc: -1 },
];

function ktInitState() {
  const size = parseInt(KT_ELEMENTS.boardSizeSelect?.value || "8", 10);
  ktBoardSize = Math.min(Math.max(size, 5), 8);

  ktVisited = Array.from({ length: ktBoardSize }, () =>
    Array.from({ length: ktBoardSize }, () => false)
  );
  ktMoveOrder = Array.from({ length: ktBoardSize }, () =>
    Array.from({ length: ktBoardSize }, () => 0)
  );
  ktMoveHistory = [];
  ktGameOver = false;
  ktHasStarted = false;
  ktStartTime = null;

  // Reset timer display and interval
  if (ktTimerId) {
    clearInterval(ktTimerId);
    ktTimerId = null;
  }
  if (KT_ELEMENTS.timeElapsed) {
    KT_ELEMENTS.timeElapsed.textContent = "0";
  }

  // Start from the center-ish square for nicer patterns
  const startRow = Math.floor(ktBoardSize / 2);
  const startCol = Math.floor(ktBoardSize / 2);
  ktKnightPos = { row: startRow, col: startCol };

  ktVisited[startRow][startCol] = true;
  ktMoveOrder[startRow][startCol] = 1;
  ktMoveHistory.push({ row: startRow, col: startCol });

  if (KT_ELEMENTS.moveCount) {
    KT_ELEMENTS.moveCount.textContent = String(1);
  }
  // First visited square counts as move 1 but timer starts on first user move.

  if (KT_ELEMENTS.gameMessage) {
    KT_ELEMENTS.gameMessage.textContent =
      "Goal: Visit every square exactly once with knight moves.";
    KT_ELEMENTS.gameMessage.classList.remove("status-ok", "status-error");
  }
}

function ktIsInside(row, col) {
  return row >= 0 && row < ktBoardSize && col >= 0 && col < ktBoardSize;
}

// Compute all legal knight moves from a given position that go to unvisited squares.
function ktGetLegalMoves(from) {
  if (!from) return [];
  const moves = [];
  for (const { dr, dc } of KNIGHT_OFFSETS) {
    const nr = from.row + dr;
    const nc = from.col + dc;
    if (ktIsInside(nr, nc) && !ktVisited[nr][nc]) {
      moves.push({ row: nr, col: nc });
    }
  }
  return moves;
}

// Perform a single knight move if it is legal.
function ktMakeMove(targetRow, targetCol) {
  if (ktGameOver || !ktKnightPos) return;

  const legalMoves = ktGetLegalMoves(ktKnightPos);
  const isLegal = legalMoves.some(
    (m) => m.row === targetRow && m.col === targetCol
  );
  if (!isLegal) {
    return; // ignore illegal clicks
  }

  // Start timer on the very first move the player makes
  if (!ktHasStarted) {
    ktHasStarted = true;
    ktStartTime = Date.now();
    if (KT_ELEMENTS.timeElapsed) {
      KT_ELEMENTS.timeElapsed.textContent = "0";
    }
    ktTimerId = setInterval(() => {
      if (!ktHasStarted || ktGameOver || !KT_ELEMENTS.timeElapsed) return;
      const seconds = Math.floor((Date.now() - ktStartTime) / 1000);
      KT_ELEMENTS.timeElapsed.textContent = String(seconds);
    }, 1000);
  }

  ktKnightPos = { row: targetRow, col: targetCol };
  ktVisited[targetRow][targetCol] = true;

  const nextMoveNumber = ktMoveHistory.length + 1;
  ktMoveOrder[targetRow][targetCol] = nextMoveNumber;
  ktMoveHistory.push({ row: targetRow, col: targetCol });

  if (KT_ELEMENTS.moveCount) {
    KT_ELEMENTS.moveCount.textContent = String(nextMoveNumber);
  }

  ktRenderBoard();
  ktCheckGameState();
}

// Undo the last move (if possible).
function ktUndoLastMove() {
  if (ktGameOver) return;
  if (ktMoveHistory.length <= 1) {
    return; // Keep at least the starting position
  }

  // Remove last visited square
  const last = ktMoveHistory.pop();
  if (last) {
    ktVisited[last.row][last.col] = false;
    ktMoveOrder[last.row][last.col] = 0;
  }

  // Current position is now the new last in history
  const newCurrent = ktMoveHistory[ktMoveHistory.length - 1];
  ktKnightPos = { row: newCurrent.row, col: newCurrent.col };

  if (KT_ELEMENTS.moveCount) {
    KT_ELEMENTS.moveCount.textContent = String(ktMoveHistory.length);
  }

  if (KT_ELEMENTS.gameMessage) {
    KT_ELEMENTS.gameMessage.textContent =
      "Undo successful. Continue the tour!";
    KT_ELEMENTS.gameMessage.classList.remove("status-ok", "status-error");
  }

  ktRenderBoard();
}

// Check for success (all visited) or failure (no legal moves left).
function ktCheckGameState() {
  const totalSquares = ktBoardSize * ktBoardSize;
  const visitedCount = ktMoveHistory.length;

  const legalMoves = ktGetLegalMoves(ktKnightPos);

  if (visitedCount === totalSquares) {
    ktGameOver = true;
    // Stop timer and compute duration
    let durationSeconds = visitedCount;
    if (ktStartTime) {
      durationSeconds = Math.max(
        1,
        Math.floor((Date.now() - ktStartTime) / 1000)
      );
    }
    if (ktTimerId) {
      clearInterval(ktTimerId);
      ktTimerId = null;
    }
    if (KT_ELEMENTS.gameMessage) {
      KT_ELEMENTS.gameMessage.textContent =
        "Perfect! You completed a full Knight's Tour!";
      KT_ELEMENTS.gameMessage.classList.add("status-ok");
    }

    // Save to shared leaderboard as a puzzle game.
    // Score = number of squares visited (always totalSquares on success),
    // duration = actual time in seconds (lower is better for this game).
    if (typeof addScoreToLeaderboard === "function") {
      addScoreToLeaderboard("knights-tour", visitedCount, durationSeconds);
    }
    return;
  }

  if (legalMoves.length === 0) {
    ktGameOver = true;
    // Stop timer on failure as well
    if (ktTimerId) {
      clearInterval(ktTimerId);
      ktTimerId = null;
    }
    if (KT_ELEMENTS.gameMessage) {
      KT_ELEMENTS.gameMessage.textContent =
        "No legal moves left. Tour failed – try again!";
      KT_ELEMENTS.gameMessage.classList.remove("status-ok");
      KT_ELEMENTS.gameMessage.classList.add("status-error");
    }
  }
}

// Render / update the visual board with current state.
function ktRenderBoard() {
  const board = KT_ELEMENTS.board;
  if (!board) return;

  board.innerHTML = "";
  board.style.gridTemplateColumns = `repeat(${ktBoardSize}, 1fr)`;
  board.style.gridTemplateRows = `repeat(${ktBoardSize}, 1fr)`;

  const legalMoves = ktGameOver ? [] : ktGetLegalMoves(ktKnightPos);
  const hintTargets = new Set();

  // Hint: just choose one legal move (if any) and mark it.
  if (KT_ELEMENTS.hintButton?.dataset.active === "true" && legalMoves.length) {
    const hintMove = legalMoves[0];
    hintTargets.add(`${hintMove.row}-${hintMove.col}`);
  }

  for (let row = 0; row < ktBoardSize; row++) {
    for (let col = 0; col < ktBoardSize; col++) {
      const square = document.createElement("button");
      square.type = "button";
      square.className = "square";

      const isLight = (row + col) % 2 === 0;
      square.classList.add(isLight ? "light" : "dark");

      const isCurrent =
        ktKnightPos && ktKnightPos.row === row && ktKnightPos.col === col;
      const isVisited = ktVisited[row][col];

      if (isVisited) {
        square.classList.add("visited");
      }
      if (isCurrent) {
        square.classList.add("current");
      }

      const isLegalTarget = legalMoves.some(
        (m) => m.row === row && m.col === col
      );
      if (isLegalTarget && !ktGameOver) {
        square.classList.add("legal-move");
        square.addEventListener("click", () => ktMakeMove(row, col));
      }

      if (hintTargets.has(`${row}-${col}`)) {
        square.classList.add("hint");
      }

      // Knight icon on current square
      if (isCurrent) {
        const knightSpan = document.createElement("span");
        knightSpan.className = "knight-icon";
        knightSpan.textContent = "♞";
        square.appendChild(knightSpan);
      }

      // Move number in the corner (if visited)
      if (ktMoveOrder[row][col] > 0) {
        const moveNumber = document.createElement("span");
        moveNumber.className = "move-number";
        moveNumber.textContent = String(ktMoveOrder[row][col]);
        square.appendChild(moveNumber);
      }

      board.appendChild(square);
    }
  }
}

function ktRestart() {
  ktInitState();
  if (KT_ELEMENTS.hintButton) {
    KT_ELEMENTS.hintButton.dataset.active = "false";
  }
  ktRenderBoard();
}

function ktToggleHint() {
  if (!KT_ELEMENTS.hintButton) return;
  const currentlyActive = KT_ELEMENTS.hintButton.dataset.active === "true";
  KT_ELEMENTS.hintButton.dataset.active = currentlyActive ? "false" : "true";
  ktRenderBoard();
}

function ktWireEvents() {
  if (KT_ELEMENTS.boardSizeSelect) {
    KT_ELEMENTS.boardSizeSelect.addEventListener("change", () => {
      ktRestart();
    });
  }

  if (KT_ELEMENTS.restartButton) {
    KT_ELEMENTS.restartButton.addEventListener("click", () => {
      ktRestart();
    });
  }

  if (KT_ELEMENTS.undoButton) {
    KT_ELEMENTS.undoButton.addEventListener("click", () => {
      ktUndoLastMove();
    });
  }

  if (KT_ELEMENTS.hintButton) {
    KT_ELEMENTS.hintButton.addEventListener("click", () => {
      ktToggleHint();
    });
  }
}

function ktInit() {
  ktInitState();
  ktWireEvents();
  ktRenderBoard();
}

window.addEventListener("DOMContentLoaded", ktInit);

