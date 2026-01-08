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

const elements = {
  timeRemaining: document.getElementById("time-remaining"),
  score: document.getElementById("score"),
  targetValue: document.getElementById("target-value"),
  pyramidDisplay: document.getElementById("pyramid-display"),
  lastResult: document.getElementById("last-result"),
  startButton: document.getElementById("start-button"),
  stopButton: document.getElementById("stop-button"),
  answerInput: document.getElementById("answer-input"),
  gameMessage: document.getElementById("game-message"),
  soundToggleButton: document.getElementById("sound-toggle-button"),
};

// Generate a random pyramid puzzle
function generatePuzzle() {
  // Generate operations: +, -, x, /
  const operations = ['+', '-', 'x', '/'];
  const numOperations = 8 + Math.floor(Math.random() * 4); // 8-11 operations
  
  const puzzleOps = [];
  for (let i = 0; i < numOperations; i++) {
    const op = operations[Math.floor(Math.random() * operations.length)];
    let num;
    
    if (op === '+') {
      num = 1 + Math.floor(Math.random() * 20); // 1-20
    } else if (op === '-') {
      num = 1 + Math.floor(Math.random() * 15); // 1-15
    } else if (op === 'x') {
      num = 2 + Math.floor(Math.random() * 8); // 2-9
    } else { // '/'
      num = 2 + Math.floor(Math.random() * 8); // 2-9
    }
    
    puzzleOps.push({ op, num });
  }
  
  // Calculate a valid target by starting with a random number and applying operations
  let startNum = 1 + Math.floor(Math.random() * 20);
  let result = startNum;
  const solution = [startNum];
  
  puzzleOps.forEach(({ op, num }) => {
    if (op === '+') {
      result += num;
      solution.push(`+${num}`);
    } else if (op === '-') {
      result -= num;
      solution.push(`-${num}`);
    } else if (op === 'x') {
      result *= num;
      solution.push(`x${num}`);
    } else { // '/'
      result = Math.round(result / num);
      solution.push(`/${num}`);
    }
  });
  
  // Ensure target is positive and reasonable
  if (result <= 0 || result > 1000) {
    return generatePuzzle(); // Regenerate if invalid
  }
  
  return {
    operations: puzzleOps,
    target: result,
    startNumber: startNum,
    validSolutions: [solution.join(', ')] // Store the solution
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
  
  // Add start number
  const startRow = document.createElement('div');
  startRow.className = 'pyramid-row';
  const startCell = document.createElement('div');
  startCell.className = 'pyramid-cell';
  startCell.textContent = puzzle.startNumber;
  startRow.appendChild(startCell);
  elements.pyramidDisplay.appendChild(startRow);
  
  // Add operations in pyramid rows
  for (let i = 0; i < puzzle.operations.length; i++) {
    if (currentRow.length === 0) {
      currentRow = document.createElement('div');
      currentRow.className = 'pyramid-row';
    }
    
    const cell = document.createElement('div');
    cell.className = 'pyramid-cell';
    const { op, num } = puzzle.operations[i];
    cell.textContent = `${op}${num}`;
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
  if (elements.score) elements.score.textContent = String(currentScore);
  if (elements.timeRemaining) elements.timeRemaining.textContent = String(timeRemaining);
  if (elements.lastResult) elements.lastResult.textContent = "–";
  if (elements.lastResult) elements.lastResult.classList.remove("status-ok", "status-error");
  if (elements.gameMessage) elements.gameMessage.textContent = "";
  acceptingAnswers = false;
  
  if (elements.answerInput) {
    elements.answerInput.value = "";
    elements.answerInput.disabled = true;
  }
  
  if (elements.stopButton) {
    elements.stopButton.style.display = "none";
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
  
  if (elements.startButton) {
    elements.startButton.textContent = "Playing…";
    elements.startButton.disabled = true;
  }
  if (elements.stopButton) {
    elements.stopButton.style.display = "inline-flex";
  }
  if (elements.answerInput) {
    elements.answerInput.disabled = false;
    elements.answerInput.focus();
  }
  
  // Generate and display new puzzle
  currentPuzzle = generatePuzzle();
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
  
  elements.startButton.disabled = false;
  elements.startButton.textContent = "Start Round";
  if (elements.stopButton) {
    elements.stopButton.style.display = "none";
  }
  if (elements.answerInput) {
    elements.answerInput.disabled = true;
  }
  elements.gameMessage.textContent = `Game stopped. Your score: ${currentScore}`;
  
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
  
  elements.startButton.disabled = false;
  elements.startButton.textContent = "Play Again";
  if (elements.stopButton) {
    elements.stopButton.style.display = "none";
  }
  if (elements.answerInput) {
    elements.answerInput.disabled = true;
  }
  elements.gameMessage.textContent = `Time! Your score: ${currentScore}`;
  
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

function checkAnswer(inputText) {
  if (!currentPuzzle || !inputText.trim()) return;
  
  const result = calculateResult(inputText);
  
  if (result === null) {
    // Invalid format
    elements.lastResult.textContent = `"${inputText}"`;
    elements.lastResult.classList.remove("status-ok");
    elements.lastResult.classList.add("status-error");
    elements.gameMessage.textContent = "Invalid format. Use: startNumber, +5, -3, x2, /4";
    playBeep("bad");
    if (elements.answerInput) {
      elements.answerInput.value = "";
      elements.answerInput.focus();
    }
    return;
  }
  
  if (result === currentPuzzle.target) {
    handleCorrectAnswer(inputText.trim());
  } else {
    handleWrongAnswer(inputText.trim(), result);
  }
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
      if (elements.answerInput) {
        elements.answerInput.value = "";
        elements.answerInput.focus();
      }
      elements.lastResult.textContent = "–";
      elements.lastResult.classList.remove("status-ok", "status-error");
    }
  }, 800);
}

function handleWrongAnswer(answer, calculatedResult) {
  elements.lastResult.textContent = `"${answer}"`;
  elements.lastResult.classList.remove("status-ok");
  elements.lastResult.classList.add("status-error");
  
  if (calculatedResult !== null) {
    elements.gameMessage.textContent = `You got ${calculatedResult}, but target is ${currentPuzzle.target}. Try again!`;
  }
  
  playBeep("bad");
  
  if (elements.answerInput) {
    elements.answerInput.value = "";
    elements.answerInput.focus();
  }
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
  
  if (elements.answerInput) {
    elements.answerInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && acceptingAnswers && currentPuzzle) {
        e.preventDefault();
        const inputValue = elements.answerInput.value.trim();
        if (inputValue) {
          checkAnswer(inputValue);
        }
      }
    });
    
    elements.answerInput.addEventListener("input", (e) => {
      if (acceptingAnswers && e.target.value.trim()) {
        elements.lastResult.textContent = `"${e.target.value}"`;
        elements.lastResult.classList.remove("status-ok", "status-error");
      } else if (!e.target.value.trim()) {
        elements.lastResult.textContent = "–";
        elements.lastResult.classList.remove("status-ok", "status-error");
      }
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
