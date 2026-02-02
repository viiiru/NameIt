// Equation Pyramid game script

let timeRemaining = 60;
let currentScore = 0;
let roundTimerId = null;
let acceptingAnswers = false;
let currentPuzzle = null;
let correctSound = null;
let backgroundMusic = null;
let endMusic = null;
let isMuted = false;
let currentDifficulty = "medium";
let selectedOperations = []; // Track selected operations for click-based gameplay
let roundStartTime = null; // Track when round started
const ROUND_DURATION_SECONDS = 60;

const elements = {
  timeRemaining: document.getElementById("time-remaining"),
  score: document.getElementById("score"),
  targetValue: document.getElementById("target-value"),
  pyramidDisplay: document.getElementById("pyramid-display"),
  lastResult: document.getElementById("last-result"),
  startButton: document.getElementById("start-button"),
  stopButton: document.getElementById("stop-button"),
  clearButton: document.getElementById("clear-button"),
  submitButton: document.getElementById("submit-button"),
  selectedOperations: document.getElementById("selected-operations"),
  calculatedResult: document.getElementById("calculated-result"),
  gameMessage: document.getElementById("game-message"),
  soundToggleButton: document.getElementById("sound-toggle-button"),
  difficultySelect: document.getElementById("difficulty-select"),
};

// Get current difficulty from the selector
function getCurrentDifficulty() {
  if (elements.difficultySelect) {
    const value = elements.difficultySelect.value;
    if (value === "easy" || value === "medium" || value === "hard") {
      return value;
    }
  }
  return currentDifficulty || "medium";
}

// Generate a random pyramid puzzle based on difficulty
function generatePuzzle(difficulty = getCurrentDifficulty()) {
  // Configure ranges per difficulty
  let operations = ["+", "-", "x", "/"];
  let numOperationsMin, numOperationsMax, useOpsMin, useOpsMax, startMax, targetMax;

  if (difficulty === "easy") {
    operations = ["+", "-"];
    numOperationsMin = 6;
    numOperationsMax = 8;
    useOpsMin = 3;
    useOpsMax = 4;
    startMax = 20;
    targetMax = 200;
  } else if (difficulty === "hard") {
    numOperationsMin = 10;
    numOperationsMax = 14;
    useOpsMin = 5;
    useOpsMax = 7;
    startMax = 40;
    targetMax = 2000;
  } else {
    // medium (default)
    numOperationsMin = 8;
    numOperationsMax = 12;
    useOpsMin = 3;
    useOpsMax = 6;
    startMax = 30;
    targetMax = 1000;
  }

  const numOperations =
    numOperationsMin + Math.floor(Math.random() * (numOperationsMax - numOperationsMin + 1));
  
  const puzzleOps = [];
  for (let i = 0; i < numOperations; i++) {
    const op = operations[Math.floor(Math.random() * operations.length)];
    let num;

    if (op === "+") {
      num = 1 + Math.floor(Math.random() * 20); // 1-20
    } else if (op === "-") {
      num = 1 + Math.floor(Math.random() * 15); // 1-15
    } else if (op === "x") {
      num = 2 + Math.floor(Math.random() * 9); // 2-10
    } else {
      // '/'
      num = 2 + Math.floor(Math.random() * 9); // 2-10
    }

    puzzleOps.push({ op, num });
  }
  
  // Generate a target that's reachable using some of these operations
  // Start with a random number
  let startNum = 1 + Math.floor(Math.random() * startMax);
  
  // Use a random subset of operations to calculate target
  const numOpsToUse =
    useOpsMin + Math.floor(Math.random() * (useOpsMax - useOpsMin + 1));
  const shuffledOps = [...puzzleOps].sort(() => Math.random() - 0.5);
  const opsToUse = shuffledOps.slice(0, Math.min(numOpsToUse, puzzleOps.length));
  
  let result = startNum;
  const solutionSteps = [{ type: 'start', value: startNum }];
  opsToUse.forEach(({ op, num }) => {
    if (op === "+") {
      result += num;
    } else if (op === "-") {
      result -= num;
    } else if (op === "x") {
      result *= num;
    } else {
      // '/'
      result = Math.round(result / num);
    }
    solutionSteps.push({ type: 'operation', op, num });
  });
  
  // Ensure target is positive and reasonable
  if (result <= 0 || result > targetMax) {
    return generatePuzzle(difficulty); // Regenerate if invalid
  }
  
  return {
    operations: puzzleOps, // All operations available
    target: result,
    startNumber: startNum,
    // One example of a correct solution path (what the player "should" pick)
    solutionSteps,
    solutionDisplay: solutionSteps
      .map(step =>
        step.type === 'start'
          ? String(step.value)
          : `${step.op}${step.num}`
      )
      .join(', '),
    // Player can use any combination of operations to reach target
  };
}

// Calculate result from user input
function calculateResult(input) {
  try {
    // Parse input like "5, +1, /4, x3" or "5 +1 /4 x3"
    const parts = input.split(',').map(s => s.trim()).filter(s => s);
    if (parts.length === 0) return null;
    
    // First part should be starting number
    let start = parseFloat(parts[0]);
    if (isNaN(start)) return null;
    
    let result = start;
    
    // Process operations
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      const match = part.match(/^([+\-x/])(\d+)$/);
      if (!match) return null;
      
      const op = match[1];
      const num = parseFloat(match[2]);
      
      if (op === '+') {
        result += num;
      } else if (op === '-') {
        result -= num;
      } else if (op === 'x') {
        result *= num;
      } else if (op === '/') {
        if (num === 0) return null;
        result = Math.round(result / num);
      }
    }
    
    return result;
  } catch {
    return null;
  }
}

// Display pyramid
function displayPyramid(puzzle) {
  if (!elements.pyramidDisplay) return;
  
  elements.pyramidDisplay.innerHTML = '';
  
  // Display operations in pyramid shape
  const rows = [];
  let currentRow = [];
  let itemsPerRow = 1;
  let itemCount = 0;
  
  // Add start number (clickable)
  const startRow = document.createElement('div');
  startRow.className = 'pyramid-row';
  const startCell = document.createElement('div');
  startCell.className = 'pyramid-cell pyramid-cell-clickable';
  startCell.textContent = puzzle.startNumber;
  startCell.dataset.type = 'start';
  startCell.dataset.value = puzzle.startNumber;
  startCell.addEventListener('click', () => handleCellClick(startCell, 'start', puzzle.startNumber));
  startRow.appendChild(startCell);
  elements.pyramidDisplay.appendChild(startRow);
  
  // Add operations in pyramid rows
  for (let i = 0; i < puzzle.operations.length; i++) {
    if (currentRow.length === 0) {
      currentRow = document.createElement('div');
      currentRow.className = 'pyramid-row';
    }
    
    const cell = document.createElement('div');
    cell.className = 'pyramid-cell pyramid-cell-clickable';
    const { op, num } = puzzle.operations[i];
    cell.textContent = `${op}${num}`;
    cell.dataset.type = 'operation';
    cell.dataset.op = op;
    cell.dataset.num = num;
    cell.dataset.index = i;
    cell.addEventListener('click', () => handleCellClick(cell, 'operation', { op, num }));
    currentRow.appendChild(cell);
    itemCount++;
    
    // Add row when full or at end
    if (itemCount >= itemsPerRow || i === puzzle.operations.length - 1) {
      elements.pyramidDisplay.appendChild(currentRow);
      rows.push(currentRow);
      currentRow = [];
      itemCount = 0;
      itemsPerRow = Math.min(itemsPerRow + 1, 4); // Max 4 items per row
    }
  }
  
  // Display target
  const targetRow = document.createElement('div');
  targetRow.className = 'pyramid-row';
  const targetCell = document.createElement('div');
  targetCell.className = 'pyramid-cell pyramid-target';
  targetCell.textContent = `Target: ${puzzle.target}`;
  targetRow.appendChild(targetCell);
  elements.pyramidDisplay.appendChild(targetRow);
}

function resetGameState() {
  currentScore = 0;
  timeRemaining = 60;
  selectedOperations = [];
  roundStartTime = null; // Reset start time
  if (elements.score) elements.score.textContent = String(currentScore);
  if (elements.timeRemaining) elements.timeRemaining.textContent = String(timeRemaining);
  if (elements.lastResult) elements.lastResult.textContent = "–";
  if (elements.lastResult) elements.lastResult.classList.remove("status-ok", "status-error");
  if (elements.gameMessage) elements.gameMessage.textContent = "";
  if (elements.selectedOperations) elements.selectedOperations.textContent = "–";
  if (elements.calculatedResult) elements.calculatedResult.textContent = "–";
  acceptingAnswers = false;
  
  // Hide leaderboard when starting new round
  const leaderboardDisplay = document.getElementById('leaderboard-display');
  if (leaderboardDisplay) {
    leaderboardDisplay.style.display = 'none';
  }
  
  if (elements.stopButton) {
    elements.stopButton.style.display = "none";
  }
  if (elements.clearButton) {
    elements.clearButton.style.display = "none";
  }
  if (elements.submitButton) {
    elements.submitButton.style.display = "none";
  }

  // Ensure difficulty selector is enabled when not in a round
  if (elements.difficultySelect) {
    elements.difficultySelect.disabled = false;
  }
  
  if (roundTimerId) {
    clearInterval(roundTimerId);
    roundTimerId = null;
  }
  
  currentPuzzle = null;
  elements.pyramidDisplay.innerHTML = '';
}

function startRound() {
  resetGameState();
  acceptingAnswers = true;
  roundStartTime = Date.now(); // Track when round started
  currentDifficulty = getCurrentDifficulty();
  
  if (elements.startButton) {
    elements.startButton.textContent = "Playing…";
    elements.startButton.disabled = true;
  }
  if (elements.stopButton) {
    elements.stopButton.style.display = "inline-flex";
  }
  if (elements.clearButton) {
    elements.clearButton.style.display = "inline-flex";
  }
  if (elements.submitButton) {
    elements.submitButton.style.display = "inline-flex";
  }

  // Lock difficulty during a round so it can't change mid-puzzle
  if (elements.difficultySelect) {
    elements.difficultySelect.disabled = true;
  }
  
  // Generate and display new puzzle
  currentPuzzle = generatePuzzle(currentDifficulty);
  displayPyramid(currentPuzzle);
  if (elements.targetValue) {
    elements.targetValue.textContent = String(currentPuzzle.target);
  }
  
  // Stop end music if playing
  if (endMusic) {
    endMusic.pause();
    endMusic.currentTime = 0;
  }
  
  setBackgroundVolume("playing");
  ensureBackgroundMusicPlaying();
  
  roundTimerId = setInterval(() => {
    timeRemaining -= 1;
    if (elements.timeRemaining) {
      elements.timeRemaining.textContent = String(Math.max(timeRemaining, 0));
    }
    
    if (timeRemaining <= 0) {
      endRound();
    }
  }, 1000);
}

function stopGame() {
  acceptingAnswers = false;
  if (roundTimerId) {
    clearInterval(roundTimerId);
    roundTimerId = null;
  }
  
  // Calculate duration used
  const durationUsed = roundStartTime ? Math.round((Date.now() - roundStartTime) / 1000) : 0;
  const actualDuration = durationUsed > 0 ? durationUsed : ROUND_DURATION_SECONDS - timeRemaining;
  
  // Save score to leaderboard
  if (currentScore > 0 && typeof addScoreToLeaderboard === 'function') {
    try {
      addScoreToLeaderboard('equation-pyramid', currentScore, actualDuration);
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  }
  
  elements.startButton.disabled = false;
  elements.startButton.textContent = "Start Round";
  if (elements.stopButton) {
    elements.stopButton.style.display = "none";
  }
  // Re-enable difficulty selection
  if (elements.difficultySelect) {
    elements.difficultySelect.disabled = false;
  }
  elements.gameMessage.textContent = `Game stopped. Your score: ${currentScore}`;
  
  // Display leaderboard
  const leaderboardDisplay = document.getElementById('leaderboard-display');
  if (leaderboardDisplay && typeof displayLeaderboardInGame === 'function') {
    leaderboardDisplay.style.display = 'block';
    displayLeaderboardInGame('equation-pyramid', leaderboardDisplay);
  }
  
  if (backgroundMusic) {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
  }
  
  if (endMusic && !isMuted) {
    try {
      endMusic.currentTime = 0;
      endMusic.play().catch(() => {});
    } catch {}
  }
}

function endRound() {
  acceptingAnswers = false;
  if (roundTimerId) {
    clearInterval(roundTimerId);
    roundTimerId = null;
  }
  
  // Calculate duration used
  const durationUsed = roundStartTime ? Math.round((Date.now() - roundStartTime) / 1000) : 0;
  const actualDuration = durationUsed > 0 ? durationUsed : ROUND_DURATION_SECONDS;
  
  // Save score to leaderboard
  if (currentScore > 0 && typeof addScoreToLeaderboard === 'function') {
    try {
      addScoreToLeaderboard('equation-pyramid', currentScore, actualDuration);
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  }
  
  elements.startButton.disabled = false;
  elements.startButton.textContent = "Play Again";
  if (elements.stopButton) {
    elements.stopButton.style.display = "none";
  }
  if (elements.clearButton) {
    elements.clearButton.style.display = "none";
  }
  if (elements.submitButton) {
    elements.submitButton.style.display = "none";
  }
  // Re-enable difficulty selection
  if (elements.difficultySelect) {
    elements.difficultySelect.disabled = false;
  }
  // Show score and, if available, one correct solution for learning
  if (currentPuzzle && currentPuzzle.solutionDisplay) {
    elements.gameMessage.textContent =
      `Time! Your score: ${currentScore}. One correct path was: ${currentPuzzle.solutionDisplay}`;
  } else {
    elements.gameMessage.textContent = `Time! Your score: ${currentScore}`;
  }
  
  // Display leaderboard
  const leaderboardDisplay = document.getElementById('leaderboard-display');
  if (leaderboardDisplay && typeof displayLeaderboardInGame === 'function') {
    leaderboardDisplay.style.display = 'block';
    displayLeaderboardInGame('equation-pyramid', leaderboardDisplay);
  }
  
  if (backgroundMusic) {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
  }
  
  if (endMusic && !isMuted) {
    try {
      endMusic.currentTime = 0;
      endMusic.play().catch(() => {});
    } catch {}
  }
}

function handleCellClick(cell, type, value) {
  if (!acceptingAnswers || !currentPuzzle) return;
  
  // Toggle selection
  if (cell.classList.contains('selected')) {
    // Deselect
    cell.classList.remove('selected');
    if (type === 'start') {
      selectedOperations = selectedOperations.filter(op => op.type !== 'start');
    } else {
      const index = selectedOperations.findIndex(op => op.type === 'operation' && op.index === cell.dataset.index);
      if (index !== -1) {
        selectedOperations.splice(index, 1);
      }
    }
  } else {
    // Select
    cell.classList.add('selected');
    if (type === 'start') {
      // Remove any existing start number
      selectedOperations = selectedOperations.filter(op => op.type !== 'start');
      selectedOperations.unshift({ type: 'start', value: value });
    } else {
      selectedOperations.push({ type: 'operation', op: value.op, num: value.num, index: parseInt(cell.dataset.index) });
    }
  }
  
  updateSelectedDisplay();
}

function updateSelectedDisplay() {
  if (!elements.selectedOperations || !elements.calculatedResult) return;
  
  if (selectedOperations.length === 0) {
    elements.selectedOperations.textContent = "–";
    elements.calculatedResult.textContent = "–";
    return;
  }
  
  // Build display string
  const displayParts = [];
  let result = null;
  
  selectedOperations.forEach((op, index) => {
    if (op.type === 'start') {
      displayParts.push(String(op.value));
      result = op.value;
    } else {
      displayParts.push(`${op.op}${op.num}`);
      if (result !== null) {
        if (op.op === '+') {
          result += op.num;
        } else if (op.op === '-') {
          result -= op.num;
        } else if (op.op === 'x') {
          result *= op.num;
        } else if (op.op === '/') {
          result = Math.round(result / op.num);
        }
      }
    }
  });
  
  elements.selectedOperations.textContent = displayParts.join(', ');
  elements.calculatedResult.textContent = result !== null ? String(result) : "–";
}

function checkAnswer() {
  if (!currentPuzzle || selectedOperations.length === 0) return;
  
  // Calculate result from selected operations
  let result = null;
  
  selectedOperations.forEach((op) => {
    if (op.type === 'start') {
      result = op.value;
    } else if (result !== null) {
      if (op.op === '+') {
        result += op.num;
      } else if (op.op === '-') {
        result -= op.num;
      } else if (op.op === 'x') {
        result *= op.num;
      } else if (op.op === '/') {
        result = Math.round(result / op.num);
      }
    }
  });
  
  if (result === null) {
    elements.gameMessage.textContent = "Please select a starting number first.";
    playBeep("bad");
    return;
  }
  
  if (result === currentPuzzle.target) {
    const answerText = selectedOperations.map(op => 
      op.type === 'start' ? String(op.value) : `${op.op}${op.num}`
    ).join(', ');
    handleCorrectAnswer(answerText);
  } else {
    const answerText = selectedOperations.map(op => 
      op.type === 'start' ? String(op.value) : `${op.op}${op.num}`
    ).join(', ');
    handleWrongAnswer(answerText, result);
  }
}

function clearSelection() {
  selectedOperations = [];
  updateSelectedDisplay();
  
  // Remove selected class from all cells
  const cells = document.querySelectorAll('.pyramid-cell-clickable');
  cells.forEach(cell => cell.classList.remove('selected'));
}

function playBeep(type) {
  if (isMuted) return;
  
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = type === "ok" ? 880 : 220;
    gain.gain.value = 0.18;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.18);
  } catch {}
}

function playCorrectSound() {
  if (isMuted) return;
  
  if (correctSound) {
    try {
      correctSound.currentTime = 0;
      correctSound.play().catch(() => {
        playBeep("ok");
      });
      return;
    } catch {
      playBeep("ok");
    }
  }
  playBeep("ok");
}

function setBackgroundVolume(mode) {
  if (!backgroundMusic) return;
  
  if (isMuted) {
    backgroundMusic.volume = 0;
    return;
  }
  
  if (mode === "playing") {
    backgroundMusic.volume = 0.25;
  } else {
    backgroundMusic.volume = 0.8;
  }
}

function ensureBackgroundMusicPlaying() {
  if (!backgroundMusic || isMuted) return;
  if (backgroundMusic.paused) {
    backgroundMusic.play().catch(() => {});
  }
}

function toggleMute() {
  isMuted = !isMuted;
  
  if (elements.soundToggleButton) {
    elements.soundToggleButton.textContent = isMuted ? "Sound: Off" : "Sound: On";
  }
  
  if (isMuted) {
    if (backgroundMusic) {
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0;
    }
    if (endMusic) {
      endMusic.pause();
      endMusic.currentTime = 0;
    }
  } else {
    setBackgroundVolume(acceptingAnswers ? "playing" : "idle");
    ensureBackgroundMusicPlaying();
  }
}

function handleCorrectAnswer(answer) {
  currentScore += 1;
  elements.score.textContent = String(currentScore);
  elements.lastResult.textContent = `"${answer}"`;
  elements.lastResult.classList.remove("status-error");
  elements.lastResult.classList.add("status-ok");
  elements.gameMessage.textContent = "";
  
  playCorrectSound();
  
  // Generate new puzzle after delay
  setTimeout(() => {
    if (acceptingAnswers) {
      currentPuzzle = generatePuzzle();
      displayPyramid(currentPuzzle);
      if (elements.targetValue) {
        elements.targetValue.textContent = String(currentPuzzle.target);
      }
      clearSelection();
      elements.lastResult.textContent = "–";
      elements.lastResult.classList.remove("status-ok", "status-error");
    }
  }, 800);
}

function handleWrongAnswer(answer, calculatedResult) {
  elements.lastResult.textContent = `"${answer}"`;
  elements.lastResult.classList.remove("status-ok");
  elements.lastResult.classList.add("status-error");
  
  if (calculatedResult !== null && currentPuzzle) {
    // Show what the player got, what the target is,
    // and one correct solution path they could have chosen.
    if (currentPuzzle.solutionDisplay) {
      elements.gameMessage.textContent =
        `You got ${calculatedResult}, but target is ${currentPuzzle.target}. ` +
        `One correct path was: ${currentPuzzle.solutionDisplay}`;
    } else {
      elements.gameMessage.textContent =
        `You got ${calculatedResult}, but target is ${currentPuzzle.target}. Try again!`;
    }
  }
  
  playBeep("bad");
  
  // Clear selection for next attempt
  clearSelection();
}

function wireEvents() {
  if (!elements.startButton) {
    console.error("Start button not found!");
    return;
  }
  
  elements.startButton.addEventListener("click", () => {
    startRound();
  });
  
  if (elements.stopButton) {
    elements.stopButton.addEventListener("click", () => {
      stopGame();
    });
  }

  if (elements.clearButton) {
    elements.clearButton.addEventListener("click", () => {
      clearSelection();
    });
  }

  if (elements.submitButton) {
    elements.submitButton.addEventListener("click", () => {
      checkAnswer();
    });
  }
  
  if (elements.soundToggleButton) {
    elements.soundToggleButton.addEventListener("click", () => {
      toggleMute();
    });
  }
}

function init() {
  resetGameState();
  wireEvents();
  
  try {
    correctSound = new Audio("audio/level-up.mp3.wav");
  } catch {
    correctSound = null;
  }
  
  try {
    backgroundMusic = new Audio("audio_start/audio_startmusic.wav");
    backgroundMusic.loop = true;
    setBackgroundVolume("idle");
  } catch {
    backgroundMusic = null;
  }
  
  try {
    endMusic = new Audio("audio_end/end%20music.wav");
  } catch {
    endMusic = null;
  }
}

window.addEventListener("DOMContentLoaded", init);
