// NameIt main game script

let roundDurationSeconds = 30;

const elements = {
  timeRemaining: document.getElementById("time-remaining"),
  score: document.getElementById("score"),
  lastResult: document.getElementById("last-result"),
  imageFrame: document.getElementById("image-frame"),
  currentImage: document.getElementById("current-image"),
  imagePlaceholder: document.getElementById("image-placeholder"),
  endPlaceholder: document.getElementById("end-placeholder"),
  startButton: document.getElementById("start-button"),
  stopButton: document.getElementById("stop-button"),
  speakButton: document.getElementById("speak-button"),
  speechStatus: document.getElementById("speech-status"),
  gameMessage: document.getElementById("game-message"),
  libraryList: document.getElementById("library-list"),
  categorySelect: document.getElementById("category-select"),
  durationSelect: document.getElementById("duration-select"),
  soundToggleButton: document.getElementById("sound-toggle-button"),
};

let currentItem = null;
let currentScore = 0;
let timeRemaining = 30; // Will be updated from duration selector
let roundTimerId = null;
let acceptingAnswers = false;
let isListening = false;
let correctSound = null;
let remainingItems = [];
let activeCategory = "all";
let backgroundMusic = null;
let endMusic = null;
let isMuted = false;

// Web Speech API setup (Chrome / Edge; Safari uses webkitSpeechRecognition)
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition || null;
let recognition = null;

function initSpeechRecognition() {
  if (!SpeechRecognition) {
    elements.speechStatus.textContent =
      "Speech: not available in this browser. Try Chrome or Edge.";
    elements.speechStatus.classList.add("status-error");
    elements.speakButton.disabled = true;
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 3;
  recognition.continuous = false;

  recognition.onstart = () => {
    isListening = true;
    elements.speechStatus.textContent = "Speech: listening…";
    elements.speechStatus.classList.remove("status-error");
    elements.speechStatus.classList.add("status-ok");
  };

  recognition.onerror = (event) => {
    isListening = false;
    
    // Handle permission denied errors more gracefully
    if (event.error === "not-allowed" || event.error === "service-not-allowed") {
      elements.speechStatus.textContent = "Microphone permission needed. Please allow access.";
      elements.speechStatus.classList.remove("status-ok");
      elements.speechStatus.classList.add("status-error");
    } else {
      elements.speechStatus.textContent = `Speech error: ${event.error}`;
      elements.speechStatus.classList.remove("status-ok");
      elements.speechStatus.classList.add("status-error");
    }
  };

  recognition.onend = () => {
    isListening = false;
    if (acceptingAnswers) {
      elements.speechStatus.textContent = "Speech: ready";
      elements.speechStatus.classList.add("status-ok");
    } else {
      elements.speechStatus.textContent = "Speech: idle";
      elements.speechStatus.classList.remove("status-ok");
    }
  };

  recognition.onresult = (event) => {
    if (!acceptingAnswers || !currentItem) return;

    const transcript = Array.from(event.results)
      .map((res) => res[0]?.transcript || "")
      .join(" ")
      .trim()
      .toLowerCase();

    checkAnswer(transcript);
  };

  // Only set status to ready, don't enable button until user starts a round
  // This prevents premature permission requests
  elements.speechStatus.textContent = "Speech: ready (click Start to play)";
  elements.speechStatus.classList.add("status-ok");
  elements.speakButton.disabled = false;
}

function resetGameState() {
  // Get the selected duration from the dropdown
  if (elements.durationSelect) {
    const selectedValue = elements.durationSelect.value;
    roundDurationSeconds = parseInt(selectedValue, 10);
    if (isNaN(roundDurationSeconds) || roundDurationSeconds <= 0) {
      roundDurationSeconds = 30; // fallback to 30 if invalid
    }
  } else {
    roundDurationSeconds = 30; // fallback if element doesn't exist
  }
  
  currentScore = 0;
  timeRemaining = roundDurationSeconds;
  if (elements.score) elements.score.textContent = String(currentScore);
  if (elements.timeRemaining) elements.timeRemaining.textContent = String(timeRemaining);
  if (elements.lastResult) elements.lastResult.textContent = "–";
  if (elements.gameMessage) elements.gameMessage.textContent = "";
  acceptingAnswers = false;

  // Reset the image pool for a fresh random shuffle each round
  remainingItems = [];

  // Ensure end image is hidden when resetting
  if (elements.endPlaceholder) {
    elements.endPlaceholder.classList.add("hidden");
  }

  // Hide stop button when resetting
  if (elements.stopButton) {
    elements.stopButton.style.display = "none";
  }

  if (roundTimerId) {
    clearInterval(roundTimerId);
    roundTimerId = null;
  }
}

function startRound() {
  resetGameState();
  acceptingAnswers = true;
  if (elements.startButton) {
    elements.startButton.textContent = "Playing…";
    elements.startButton.disabled = true;
  }
  // Show stop button, hide start button text
  if (elements.stopButton) {
    elements.stopButton.style.display = "inline-flex";
  }
  // Disable duration selector during play
  if (elements.durationSelect) {
    elements.durationSelect.disabled = true;
  }
  if (elements.speakButton) {
    elements.speakButton.disabled = !recognition;
  }

  // Hide the start image placeholder and end image immediately when game starts
  if (elements.imagePlaceholder) {
    elements.imagePlaceholder.classList.add("hidden");
  }
  if (elements.endPlaceholder) {
    elements.endPlaceholder.classList.add("hidden");
  }

  // Stop end music if it's playing and resume background music
  if (endMusic) {
    endMusic.pause();
    endMusic.currentTime = 0;
  }
  
  setBackgroundVolume("playing");
  ensureBackgroundMusicPlaying();

  loadNextImage();

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
  // Stop the game immediately (same as endRound but with different message)
  acceptingAnswers = false;
  if (roundTimerId) {
    clearInterval(roundTimerId);
    roundTimerId = null;
  }

  if (recognition && isListening) {
    recognition.stop();
  }

  elements.startButton.disabled = false;
  elements.startButton.textContent = "Start Round";
  // Hide stop button, show start button
  if (elements.stopButton) {
    elements.stopButton.style.display = "none";
  }
  // Re-enable duration selector
  if (elements.durationSelect) {
    elements.durationSelect.disabled = false;
  }
  elements.speakButton.disabled = true;
  elements.gameMessage.textContent = `Game stopped. Your score: ${currentScore}`;
  
  // Hide current game image completely before showing end picture
  if (elements.currentImage) {
    elements.currentImage.classList.add("hidden");
    elements.currentImage.classList.remove("visible");
    elements.currentImage.src = ""; // Clear the image source
  }
  
  // Show end picture
  if (elements.endPlaceholder) {
    elements.endPlaceholder.classList.remove("hidden");
  }

  // Stop all background music and play end music
  if (backgroundMusic) {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
  }
  
  if (endMusic && !isMuted) {
    try {
      endMusic.currentTime = 0;
      endMusic.play().catch(() => {
        // If play fails, ignore silently
      });
    } catch {
      // Ignore errors
    }
  }
}

function endRound() {
  acceptingAnswers = false;
  if (roundTimerId) {
    clearInterval(roundTimerId);
    roundTimerId = null;
  }

  if (recognition && isListening) {
    recognition.stop();
  }

  elements.startButton.disabled = false;
  elements.startButton.textContent = "Play Again";
  // Hide stop button, show start button
  if (elements.stopButton) {
    elements.stopButton.style.display = "none";
  }
  // Re-enable duration selector after round ends
  if (elements.durationSelect) {
    elements.durationSelect.disabled = false;
  }
  elements.speakButton.disabled = true;
  elements.gameMessage.textContent = `Time! Your score: ${currentScore}`;
  
  // Hide current game image completely before showing end picture
  if (elements.currentImage) {
    elements.currentImage.classList.add("hidden");
    elements.currentImage.classList.remove("visible");
    elements.currentImage.src = ""; // Clear the image source
  }
  
  // Show end picture
  if (elements.endPlaceholder) {
    elements.endPlaceholder.classList.remove("hidden");
  }

  // Stop all background music and play end music
  if (backgroundMusic) {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
  }
  
  if (endMusic && !isMuted) {
    try {
      endMusic.currentTime = 0;
      endMusic.play().catch(() => {
        // If play fails, ignore silently
      });
    } catch {
      // Ignore errors
    }
  }
}

function loadNextImage() {
  if (!Array.isArray(IMAGE_ITEMS) || IMAGE_ITEMS.length === 0) {
    elements.gameMessage.textContent =
      "No images configured. Add items in images.js.";
    return;
  }

  // Build the source list based on the active category.
  const sourceItems =
    activeCategory === "all"
      ? IMAGE_ITEMS
      : IMAGE_ITEMS.filter((item) => item.category === activeCategory);

  if (!Array.isArray(sourceItems) || sourceItems.length === 0) {
    elements.gameMessage.textContent =
      "No images in this category. Add some in images.js.";
    return;
  }

  // Ensure we have a pool of images for this round where each appears once
  // before any repeats. When the pool is empty, refill it from the source list.
  if (!Array.isArray(remainingItems) || remainingItems.length === 0) {
    // Shuffle the array for true randomness when refilling
    remainingItems = [...sourceItems];
    // Fisher-Yates shuffle algorithm for true randomness
    for (let i = remainingItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remainingItems[i], remainingItems[j]] = [remainingItems[j], remainingItems[i]];
    }
  }

  // Pick a random index from the remaining pool to avoid predictable order.
  const randomIndex = Math.floor(Math.random() * remainingItems.length);
  currentItem = remainingItems[randomIndex];
  // Remove the used item so it won't appear again until the pool refills.
  remainingItems.splice(randomIndex, 1);

  elements.currentImage.classList.remove("visible");
  elements.currentImage.classList.add("hidden");

  // small delay to allow animation reset
  setTimeout(() => {
    elements.currentImage.src = currentItem.src;
    elements.currentImage.alt = currentItem.id;
    elements.imagePlaceholder.classList.add("hidden");
    elements.currentImage.classList.remove("hidden");
    elements.currentImage.classList.add("visible");
  }, 80);
}

function normalizeAnswer(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function checkAnswer(recognizedText) {
  if (!currentItem) return;

  const normRecognized = normalizeAnswer(recognizedText);
  const accepted = currentItem.answers.some(
    (ans) => normalizeAnswer(ans) === normRecognized
  );

  if (accepted) {
    handleCorrectAnswer(recognizedText);
  } else {
    handleWrongAnswer(recognizedText);
  }
}

function playBeep(type) {
  if (isMuted) return;

  // Tiny Web Audio cue (no external files)
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
  } catch {
    // fail silently if Web Audio not available
  }
}

function playCorrectSound() {
  if (isMuted) return;

  // If a custom sound file is configured and loaded, use that.
  if (correctSound) {
    try {
      // Rewind to start in case the sound is triggered rapidly.
      correctSound.currentTime = 0;
      correctSound.play().catch(() => {
        // If play fails (e.g., browser policy), fall back to beep.
        playBeep("ok");
      });
      return;
    } catch {
      // Fall through to beep if anything goes wrong.
    }
  }
  // Fallback: simple synthesized beep.
  playBeep("ok");
}

function setBackgroundVolume(mode) {
  if (!backgroundMusic) return;

  if (isMuted) {
    backgroundMusic.volume = 0;
    return;
  }

  if (mode === "playing") {
    backgroundMusic.volume = 0.25; // softer during the game
  } else {
    backgroundMusic.volume = 0.8; // louder before/after rounds
  }
}

function ensureBackgroundMusicPlaying() {
  if (!backgroundMusic || isMuted) return;
  if (backgroundMusic.paused) {
    backgroundMusic.play().catch(() => {
      // Some browsers block autoplay; user will need to interact first.
    });
  }
}

function toggleMute() {
  isMuted = !isMuted;

  if (elements.soundToggleButton) {
    elements.soundToggleButton.textContent = isMuted ? "Sound: Off" : "Sound: On";
  }

  if (isMuted) {
    // Silence everything.
    if (backgroundMusic) {
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0;
    }
    if (endMusic) {
      endMusic.pause();
      endMusic.currentTime = 0;
    }
  } else {
    // Restore background music at appropriate volume (but not end music - it only plays when round ends).
    setBackgroundVolume(acceptingAnswers ? "playing" : "idle");
    ensureBackgroundMusicPlaying();
  }
}

function handleCorrectAnswer(transcript) {
  currentScore += 1;
  elements.score.textContent = String(currentScore);
  elements.lastResult.textContent = `✔ "${transcript}"`;
  elements.lastResult.classList.remove("status-error");
  elements.lastResult.classList.add("status-ok");
  elements.gameMessage.textContent = "";

  elements.imageFrame.classList.remove("wrong");
  void elements.imageFrame.offsetWidth; // force reflow to restart animation
  elements.imageFrame.classList.add("correct");

  playCorrectSound();

  // Immediately move to next image
  loadNextImage();
}

function handleWrongAnswer(transcript) {
  elements.lastResult.textContent = `✖ "${transcript}"`;
  elements.lastResult.classList.remove("status-ok");
  elements.lastResult.classList.add("status-error");

  elements.imageFrame.classList.remove("correct");
  void elements.imageFrame.offsetWidth;
  elements.imageFrame.classList.add("wrong");

  playBeep("bad");
}

function beginListening() {
  if (!recognition || !acceptingAnswers || isListening) return;

  try {
    recognition.start();
  } catch {
    // starting twice can throw; ignore
  }
}

function stopListening() {
  if (!recognition || !isListening) return;
  try {
    recognition.stop();
  } catch {
    // ignore
  }
}

function renderLibraryList() {
  if (!elements.libraryList) return;
  elements.libraryList.innerHTML = "";
  if (!Array.isArray(IMAGE_ITEMS)) return;

  IMAGE_ITEMS.forEach((item) => {
    const li = document.createElement("li");
    li.className = "library-item";

    const label = document.createElement("span");
    label.className = "library-label";
    label.textContent = item.id;

    const answers = document.createElement("span");
    answers.className = "library-answer";
    const categoryLabel = item.category ? ` [${item.category}]` : "";
    answers.textContent = (item.answers || []).join(", ") + categoryLabel;

    li.appendChild(label);
    li.appendChild(answers);
    elements.libraryList.appendChild(li);
  });
}

function initCategorySelect() {
  const select = elements.categorySelect;
  if (!select || !Array.isArray(IMAGE_ITEMS)) return;

  // Find unique categories from the image list.
  const categories = Array.from(
    new Set(
      IMAGE_ITEMS
        .map((item) => item.category)
        .filter((cat) => typeof cat === "string" && cat.trim().length > 0)
    )
  ).sort();

  // Clear any existing dynamic options (keep "All").
  while (select.options.length > 1) {
    select.remove(1);
  }

  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    select.appendChild(option);
  });

  select.value = "all";
  activeCategory = "all";

  select.addEventListener("change", () => {
    activeCategory = select.value;
    // Reset remaining pool so the next round uses the correct category set.
    remainingItems = [];
  });
}

function wireEvents() {
  if (!elements.startButton) {
    console.error("Start button not found!");
    return;
  }
  
  elements.startButton.addEventListener("click", () => {
    startRound();
  });

  // Stop button to end game early
  if (elements.stopButton) {
    elements.stopButton.addEventListener("click", () => {
      stopGame();
    });
  }

  // Support both click (tap) and press/hold semantics:
  // - mouse/touch down starts listening
  // - mouse/touch up stops listening
  elements.speakButton.addEventListener("mousedown", beginListening);
  elements.speakButton.addEventListener("mouseup", stopListening);
  elements.speakButton.addEventListener("mouseleave", stopListening);

  elements.speakButton.addEventListener("touchstart", (e) => {
    e.preventDefault();
    beginListening();
  });
  elements.speakButton.addEventListener("touchend", (e) => {
    e.preventDefault();
    stopListening();
  });

  // Fallback: simple click triggers a single listen if press/hold
  // isn't used (e.g., screen readers)
  elements.speakButton.addEventListener("click", () => {
    if (!isListening) {
      beginListening();
    }
  });

  if (elements.soundToggleButton) {
    elements.soundToggleButton.addEventListener("click", () => {
      toggleMute();
    });
  }

  // Update time display when duration changes (but only if not playing)
  if (elements.durationSelect) {
    elements.durationSelect.addEventListener("change", () => {
      if (!acceptingAnswers) {
        roundDurationSeconds = parseInt(elements.durationSelect.value, 10) || 30;
        timeRemaining = roundDurationSeconds;
        elements.timeRemaining.textContent = String(timeRemaining);
      }
    });
  }
}

function init() {
  resetGameState();
  initSpeechRecognition();
  renderLibraryList();
  wireEvents();
  initCategorySelect();

  // Try to load a custom "level up" sound if the file exists.
  // Your sound file is expected at: audio/level-up.mp3.wav
  try {
    correctSound = new Audio("audio/level-up.mp3.wav");
  } catch {
    correctSound = null;
  }

  // Background start music (louder when idle, softer during play).
  try {
    backgroundMusic = new Audio("audio_startmusic/audio_startmusic.wav");
    backgroundMusic.loop = true;
    setBackgroundVolume("idle");
    // We don't auto-play here because some browsers block it.
    // Once the player clicks Start, ensureBackgroundMusicPlaying() is called.
  } catch {
    backgroundMusic = null;
  }

  // End music (plays when time is up).
  try {
    endMusic = new Audio("audio_endmusic/end music.wav");
  } catch {
    endMusic = null;
  }
}

window.addEventListener("DOMContentLoaded", init);

