// TypeIt main game script - Typing version of NameIt

let roundDurationSeconds = 30;

const elements = {
  timeRemaining: document.getElementById("time-remaining"),
  score: document.getElementById("score"),
  lastResult: document.getElementById("last-result"),
  imageFrame: document.getElementById("image-frame"),
  currentImage: document.getElementById("current-image"),
  imagePlaceholder: document.getElementById("image-placeholder"),
  endPlaceholder: document.getElementById("end-placeholder"),
  loadingIndicator: document.getElementById("loading-indicator"),
  startButton: document.getElementById("start-button"),
  stopButton: document.getElementById("stop-button"),
  answerInput: document.getElementById("answer-input"),
  gameMessage: document.getElementById("game-message"),
  libraryList: document.getElementById("library-list"),
  categorySelect: document.getElementById("category-select"),
  durationSelect: document.getElementById("duration-select"),
  soundToggleButton: document.getElementById("sound-toggle-button"),
};

let currentItem = null;
let currentScore = 0;
let timeRemaining = 30;
let roundTimerId = null;
let acceptingAnswers = false;
let correctSound = null;
let remainingItems = [];
let activeCategory = "all";
let backgroundMusic = null;
let endMusic = null;
let isMuted = false;

function resetGameState() {
  // Get the selected duration from the dropdown
  if (elements.durationSelect) {
    const selectedValue = elements.durationSelect.value;
    roundDurationSeconds = parseInt(selectedValue, 10);
    if (isNaN(roundDurationSeconds) || roundDurationSeconds <= 0) {
      roundDurationSeconds = 30;
    }
  } else {
    roundDurationSeconds = 30;
  }
  
  currentScore = 0;
  timeRemaining = roundDurationSeconds;
  if (elements.score) elements.score.textContent = String(currentScore);
  if (elements.timeRemaining) elements.timeRemaining.textContent = String(timeRemaining);
  if (elements.lastResult) elements.lastResult.textContent = "–";
  if (elements.lastResult) elements.lastResult.classList.remove("status-ok", "status-error");
  if (elements.gameMessage) elements.gameMessage.textContent = "";
  acceptingAnswers = false;

  // Reset the image pool
  remainingItems = [];

  // Ensure end image is hidden
  if (elements.endPlaceholder) {
    elements.endPlaceholder.classList.add("hidden");
  }

  // Hide stop button
  if (elements.stopButton) {
    elements.stopButton.style.display = "none";
  }

  // Clear and disable input
  if (elements.answerInput) {
    elements.answerInput.value = "";
    elements.answerInput.disabled = true;
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
  if (elements.stopButton) {
    elements.stopButton.style.display = "inline-flex";
  }
  if (elements.durationSelect) {
    elements.durationSelect.disabled = true;
  }
  if (elements.answerInput) {
    elements.answerInput.disabled = false;
    elements.answerInput.focus();
  }

  // Hide start image and end image
  if (elements.imagePlaceholder) {
    elements.imagePlaceholder.classList.add("hidden");
  }
  if (elements.endPlaceholder) {
    elements.endPlaceholder.classList.add("hidden");
  }

  // Stop end music if playing and resume background music
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
  if (elements.durationSelect) {
    elements.durationSelect.disabled = false;
  }
  if (elements.answerInput) {
    elements.answerInput.disabled = true;
  }
  elements.gameMessage.textContent = `Game stopped. Your score: ${currentScore}`;
  
  // Hide current game image
  if (elements.currentImage) {
    elements.currentImage.classList.add("hidden");
    elements.currentImage.classList.remove("visible");
    elements.currentImage.src = "";
  }
  
  // Show end picture
  if (elements.endPlaceholder) {
    elements.endPlaceholder.classList.remove("hidden");
  }

  // Stop all music and play end music
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
  if (elements.durationSelect) {
    elements.durationSelect.disabled = false;
  }
  if (elements.answerInput) {
    elements.answerInput.disabled = true;
  }
  elements.gameMessage.textContent = `Time! Your score: ${currentScore}`;
  
  // Hide current game image
  if (elements.currentImage) {
    elements.currentImage.classList.add("hidden");
    elements.currentImage.classList.remove("visible");
    elements.currentImage.src = "";
  }
  
  // Show end picture
  if (elements.endPlaceholder) {
    elements.endPlaceholder.classList.remove("hidden");
  }

  // Stop all music and play end music
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

function loadNextImage() {
  if (!Array.isArray(IMAGE_ITEMS) || IMAGE_ITEMS.length === 0) {
    elements.gameMessage.textContent = "No images configured. Add items in nameit-images.js.";
    return;
  }

  const sourceItems =
    activeCategory === "all"
      ? IMAGE_ITEMS
      : IMAGE_ITEMS.filter((item) => item.category === activeCategory);

  if (!Array.isArray(sourceItems) || sourceItems.length === 0) {
    elements.gameMessage.textContent = "No images in this category. Add some in nameit-images.js.";
    return;
  }

  if (!Array.isArray(remainingItems) || remainingItems.length === 0) {
    remainingItems = [...sourceItems];
    // Fisher-Yates shuffle
    for (let i = remainingItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remainingItems[i], remainingItems[j]] = [remainingItems[j], remainingItems[i]];
    }
  }

  const randomIndex = Math.floor(Math.random() * remainingItems.length);
  currentItem = remainingItems[randomIndex];
  remainingItems.splice(randomIndex, 1);
  
  console.log("Selected:", currentItem.id, "Remaining in pool:", remainingItems.length);

  elements.currentImage.src = currentItem.src;
  elements.currentImage.alt = currentItem.id;
  
  if (elements.currentImage.complete && elements.currentImage.naturalWidth > 0) {
    elements.imagePlaceholder.classList.add("hidden");
    elements.currentImage.classList.remove("hidden");
    elements.currentImage.classList.add("visible");
    if (elements.loadingIndicator) {
      elements.loadingIndicator.classList.add("hidden");
    }
  } else {
    elements.currentImage.classList.remove("visible");
    elements.currentImage.classList.add("hidden");
    if (elements.loadingIndicator) {
      elements.loadingIndicator.classList.remove("hidden");
    }
    
    const showImage = () => {
      if (elements.loadingIndicator) {
        elements.loadingIndicator.classList.add("hidden");
      }
      elements.imagePlaceholder.classList.add("hidden");
      elements.currentImage.classList.remove("hidden");
      elements.currentImage.classList.add("visible");
    };
    
    elements.currentImage.addEventListener("load", showImage, { once: true });
    elements.currentImage.addEventListener("error", () => {
      if (elements.loadingIndicator) {
        elements.loadingIndicator.classList.add("hidden");
      }
      if (elements.gameMessage) {
        elements.gameMessage.textContent = `Image not found: ${currentItem.id}`;
      }
    }, { once: true });
  }
  
  // Clear input and focus for next answer
  if (elements.answerInput) {
    elements.answerInput.value = "";
    elements.answerInput.focus();
  }
}

function normalizeAnswer(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function checkAnswer(inputText) {
  if (!currentItem || !inputText.trim()) return;

  const normInput = normalizeAnswer(inputText);
  const accepted = currentItem.answers.some(
    (ans) => normalizeAnswer(ans) === normInput
  );

  if (accepted) {
    handleCorrectAnswer(inputText.trim());
  } else {
    handleWrongAnswer(inputText.trim());
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

  elements.imageFrame.classList.remove("wrong");
  void elements.imageFrame.offsetWidth;
  elements.imageFrame.classList.add("correct");

  playCorrectSound();

  // Wait to show green word, then move to next image
  setTimeout(() => {
    loadNextImage();
  }, 800);
}

function handleWrongAnswer(answer) {
  elements.lastResult.textContent = `"${answer}"`;
  elements.lastResult.classList.remove("status-ok");
  elements.lastResult.classList.add("status-error");

  elements.imageFrame.classList.remove("correct");
  void elements.imageFrame.offsetWidth;
  elements.imageFrame.classList.add("wrong");

  playBeep("bad");
  
  // Clear input for retry
  if (elements.answerInput) {
    elements.answerInput.value = "";
    elements.answerInput.focus();
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

  const categories = Array.from(
    new Set(
      IMAGE_ITEMS
        .map((item) => item.category)
        .filter((cat) => typeof cat === "string" && cat.trim().length > 0)
    )
  ).sort();

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

  if (elements.stopButton) {
    elements.stopButton.addEventListener("click", () => {
      stopGame();
    });
  }

  // Handle text input - check on Enter key
  if (elements.answerInput) {
    elements.answerInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && acceptingAnswers && currentItem) {
        e.preventDefault();
        const inputValue = elements.answerInput.value.trim();
        if (inputValue) {
          checkAnswer(inputValue);
        }
      }
    });
    
    // Also update last result as user types (for real-time feedback)
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

function preloadImages() {
  if (!Array.isArray(IMAGE_ITEMS)) return;
  
  IMAGE_ITEMS.forEach((item) => {
    const img = new Image();
    img.src = item.src;
    if (img.decode) {
      img.decode().catch(() => {
        img.src = item.src;
      });
    } else {
      img.src = item.src;
    }
  });
  
  const startImg = new Image();
  startImg.src = "assets/thinking%20child.jpg";
  const endImg = new Image();
  endImg.src = "assets/endpicture.jpg";
}

function init() {
  resetGameState();
  renderLibraryList();
  wireEvents();
  initCategorySelect();
  
  preloadImages();

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
