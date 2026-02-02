// TypeIt main game script - Typing version of NameIt

let roundDurationSeconds = 30;

const elements = {
  timeRemaining: document.getElementById("time-remaining"),
  score: document.getElementById("score"),
  scoreDisplayLarge: document.getElementById("score-display-large"),
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
let answerCheckTimeout = null; // For debouncing auto-check
let normalizedAnswersCache = null; // Cache normalized answers for current item

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
  if (elements.scoreDisplayLarge) elements.scoreDisplayLarge.textContent = `Score: ${currentScore}`;
  if (elements.timeRemaining) elements.timeRemaining.textContent = String(timeRemaining);
  if (elements.lastResult) elements.lastResult.textContent = "–";
  if (elements.lastResult) elements.lastResult.classList.remove("status-ok", "status-error");
  if (elements.gameMessage) elements.gameMessage.textContent = "";
  acceptingAnswers = false;

  // Reset the image pool and clear answer cache
  remainingItems = [];
  normalizedAnswersCache = null;

  // Ensure end image is hidden
  if (elements.endPlaceholder) {
    elements.endPlaceholder.classList.add("hidden");
  }
  
  // Hide leaderboard when resetting
  const leaderboardSection = document.getElementById('leaderboard-section');
  if (leaderboardSection) {
    leaderboardSection.style.display = 'none';
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
  
  // Show score display above image
  if (elements.scoreDisplayLarge) {
    elements.scoreDisplayLarge.style.display = "block";
    elements.scoreDisplayLarge.textContent = `Score: ${currentScore}`;
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
  // Calculate actual duration used
  const actualDuration = roundDurationSeconds - timeRemaining;
  
  // Save score to leaderboard (if stopped early, still save the score)
  if (typeof addScoreToLeaderboard === 'function' && currentScore > 0) {
    addScoreToLeaderboard('typeit', currentScore, actualDuration);
  }
  
  // Clear any error messages and set score message
  elements.gameMessage.textContent = "";
  if (elements.scoreDisplayLarge) {
    elements.scoreDisplayLarge.textContent = `Score: ${currentScore}`;
    elements.scoreDisplayLarge.style.display = "block";
  }
  
  // Hide current game image completely
  if (elements.currentImage) {
    elements.currentImage.classList.add("hidden");
    elements.currentImage.classList.remove("visible");
    elements.currentImage.src = "";
  }
  
  // Hide image placeholder to ensure end image shows properly
  if (elements.imagePlaceholder) {
    elements.imagePlaceholder.classList.add("hidden");
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
  // Calculate actual duration used
  const actualDuration = roundDurationSeconds - timeRemaining;
  
  // Save score to leaderboard
  if (typeof addScoreToLeaderboard === 'function') {
    addScoreToLeaderboard('typeit', currentScore, actualDuration);
    
    // Display leaderboard
    const leaderboardSection = document.getElementById('leaderboard-section');
    const leaderboardContent = document.getElementById('leaderboard-content-game');
    if (leaderboardSection && leaderboardContent && typeof displayLeaderboardInGame === 'function') {
      displayLeaderboardInGame('typeit', leaderboardContent);
      leaderboardSection.style.display = 'block';
    }
  }
  
  // Clear any error messages
  elements.gameMessage.textContent = "";
  if (elements.scoreDisplayLarge) {
    elements.scoreDisplayLarge.textContent = `Final Score: ${currentScore}`;
    elements.scoreDisplayLarge.style.display = "block";
  }
  
  // Hide current game image completely
  if (elements.currentImage) {
    elements.currentImage.classList.add("hidden");
    elements.currentImage.classList.remove("visible");
    elements.currentImage.src = "";
  }
  
  // Hide image placeholder to ensure end image shows properly
  if (elements.imagePlaceholder) {
    elements.imagePlaceholder.classList.add("hidden");
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
  // Don't load new images if the round has ended (score message should stay visible)
  if (!acceptingAnswers) {
    return;
  }
  
  if (!Array.isArray(IMAGE_ITEMS) || IMAGE_ITEMS.length === 0) {
    // Don't show error messages - just log to console
    if (acceptingAnswers) {
      console.error("No images configured. Add items in nameit-images.js.");
      elements.gameMessage.textContent = "";
    }
    return;
  }

  const sourceItems =
    activeCategory === "all"
      ? IMAGE_ITEMS
      : IMAGE_ITEMS.filter(
          (item) => item.category === activeCategory && !item._broken
        );

  if (!Array.isArray(sourceItems) || sourceItems.length === 0) {
    // Don't show error messages - just log to console
    if (acceptingAnswers) {
      console.error("No images in this category. Add some in nameit-images.js.");
      elements.gameMessage.textContent = "";
    }
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
  
  // Pre-normalize all answers for this item to speed up checking
  normalizedAnswersCache = currentItem.answers.map(ans => 
    ans && typeof ans === 'string' ? normalizeAnswer(ans) : null
  ).filter(ans => ans !== null);
  
  console.log("Selected:", currentItem.id, "Remaining in pool:", remainingItems.length);

  // Hide placeholder immediately for faster transition
  elements.imagePlaceholder.classList.add("hidden");
  
  // Set image source immediately - browser will cache it
  elements.currentImage.src = currentItem.src;
  elements.currentImage.alt = currentItem.id;
  
  // Optimized image display - check if already loaded (cached)
  if (elements.currentImage.complete && elements.currentImage.naturalWidth > 0) {
    // Image is cached - show instantly
    elements.currentImage.classList.remove("hidden");
    elements.currentImage.classList.add("visible");
    if (elements.loadingIndicator) {
      elements.loadingIndicator.classList.add("hidden");
    }
    // Focus input immediately for fastest gameplay
    if (elements.answerInput) {
      elements.answerInput.focus();
    }
  } else {
    // Image needs to load - show loading indicator briefly
    elements.currentImage.classList.remove("visible");
    elements.currentImage.classList.add("hidden");
    if (elements.loadingIndicator) {
      elements.loadingIndicator.classList.remove("hidden");
    }
    
    // Fast image load handler
    const showImage = () => {
      if (elements.loadingIndicator) {
        elements.loadingIndicator.classList.add("hidden");
      }
      elements.currentImage.classList.remove("hidden");
      elements.currentImage.classList.add("visible");
      // Focus input immediately when image loads
      if (elements.answerInput) {
        elements.answerInput.focus();
      }
    };
    
    elements.currentImage.addEventListener("load", showImage, { once: true });
    elements.currentImage.addEventListener(
      "error",
      () => {
        if (elements.loadingIndicator) {
          elements.loadingIndicator.classList.add("hidden");
        }
        // Mark this item as broken so it will be skipped for the rest of the session
        if (currentItem) {
          currentItem._broken = true;
        }

        // Log error but don't interrupt gameplay
        if (acceptingAnswers) {
          console.error(`Image not found: ${currentItem?.id}`);
        } else {
          console.error(
            `Image not found: ${currentItem?.id} (round ended)`
          );
        }

        // Try another image so the player always sees something
        if (acceptingAnswers) {
          loadNextImage();
        }
      },
      { once: true }
    );
  }
  
  // Input is already cleared in checkAnswer, focus happens in loadNextImage for faster flow
}

function normalizeAnswer(text) {
  if (!text || typeof text !== 'string') return '';
  
  // Optimized normalization - combine operations for speed
  // Normalize Unicode to NFC and convert to lowercase in one pass
  let normalized = String(text).normalize('NFC').toLowerCase();
  
  // Single regex replacement: remove non-alphanumeric (except Finnish letters) and collapse spaces
  normalized = normalized.replace(/[^a-z0-9äöå\u00E4\u00F6\u00E5\u00C4\u00D6\u00C5]+/g, " ").trim();
  
  return normalized;
}

function checkAnswer(inputText) {
  // Fast validation checks
  if (!currentItem || !inputText || typeof inputText !== 'string') return;
  
  const trimmedInput = inputText.trim();
  if (!trimmedInput) return;

  const normInput = normalizeAnswer(trimmedInput);
  if (!normInput || !Array.isArray(currentItem.answers) || currentItem.answers.length === 0) {
    return;
  }
  
  // Ultra-fast exact match check using pre-normalized cache
  let accepted = false;
  if (normalizedAnswersCache) {
    // Use cached normalized answers for instant comparison
    for (let i = 0; i < normalizedAnswersCache.length; i++) {
      if (normalizedAnswersCache[i] === normInput) {
        accepted = true;
        break; // Exit early on first match
      }
    }
  } else {
    // Fallback if cache not available
    for (let i = 0; i < currentItem.answers.length; i++) {
      const ans = currentItem.answers[i];
      if (ans && typeof ans === 'string' && normalizeAnswer(ans) === normInput) {
        accepted = true;
        break;
      }
    }
  }

  // Clear any pending auto-check immediately
  if (answerCheckTimeout) {
    clearTimeout(answerCheckTimeout);
    answerCheckTimeout = null;
  }

  if (accepted) {
    // Clear the input immediately for faster gameplay
    if (elements.answerInput) {
      elements.answerInput.value = "";
    }
    handleCorrectAnswer(trimmedInput);
  } else {
    // Don't show wrong answer immediately - let user continue typing
    // Wrong answer will be shown after the timeout if they stop typing
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
  // Update score immediately
  currentScore += 1;
  elements.score.textContent = String(currentScore);
  if (elements.scoreDisplayLarge) {
    elements.scoreDisplayLarge.textContent = `Score: ${currentScore}`;
  }
  
  // Show green feedback
  elements.lastResult.textContent = `"${answer}"`;
  elements.lastResult.classList.remove("status-error");
  elements.lastResult.classList.add("status-ok");
  elements.gameMessage.textContent = "";

  elements.imageFrame.classList.remove("wrong");
  void elements.imageFrame.offsetWidth;
  elements.imageFrame.classList.add("correct");

  // Play sound asynchronously (don't wait for it)
  playCorrectSound();

  // Ultra-fast transition - minimal delay (10ms), then instantly load next image
  setTimeout(() => {
    loadNextImage();
  }, 10);
}

function handleWrongAnswer(answer) {
  // Only show wrong answer if we're sure it's wrong (not just a partial match)
  elements.lastResult.textContent = `"${answer}"`;
  elements.lastResult.classList.remove("status-ok");
  elements.lastResult.classList.add("status-error");

  elements.imageFrame.classList.remove("correct");
  void elements.imageFrame.offsetWidth;
  elements.imageFrame.classList.add("wrong");

  playBeep("bad");
  
  // Don't clear input - let user continue typing for faster retry
  if (elements.answerInput) {
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

  // Handle text input - check on Enter key and auto-check as user types
  if (elements.answerInput) {
    elements.answerInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && acceptingAnswers && currentItem) {
        e.preventDefault();
        // Clear any pending auto-check
        if (answerCheckTimeout) {
          clearTimeout(answerCheckTimeout);
          answerCheckTimeout = null;
        }
        const inputValue = elements.answerInput.value.trim();
        if (inputValue) {
          checkAnswer(inputValue);
        }
      }
    });
    
    // Auto-check answer as user types (with fast debounce and immediate exact match checking)
    elements.answerInput.addEventListener("input", (e) => {
      const inputValue = e.target.value.trim();
      
      if (acceptingAnswers && currentItem && inputValue) {
        // Update last result display
        elements.lastResult.textContent = `"${inputValue}"`;
        elements.lastResult.classList.remove("status-ok", "status-error");
        
        // Clear any pending check
        if (answerCheckTimeout) {
          clearTimeout(answerCheckTimeout);
          answerCheckTimeout = null;
        }
        
        // Instant check: normalize and compare immediately on every keystroke
        const normInput = normalizeAnswer(inputValue);
        let exactMatch = false;
        
        // Use cached normalized answers for instant comparison
        if (normalizedAnswersCache) {
          for (let i = 0; i < normalizedAnswersCache.length; i++) {
            if (normalizedAnswersCache[i] === normInput) {
              exactMatch = true;
              break;
            }
          }
        }
        
        // Check immediately - no delay at all for exact matches!
        if (exactMatch) {
          checkAnswer(inputValue);
        } else {
          // For partial/wrong matches, clear any pending timeout and set a very short one
          if (answerCheckTimeout) {
            clearTimeout(answerCheckTimeout);
            answerCheckTimeout = null;
          }
          // Minimal delay (30ms) only to avoid showing wrong answer while still typing
          answerCheckTimeout = setTimeout(() => {
            if (acceptingAnswers && currentItem) {
              const finalValue = elements.answerInput.value.trim();
              if (finalValue === inputValue) {
                // Final check - is it a match now?
                const finalNorm = normalizeAnswer(finalValue);
                let isMatch = false;
                if (normalizedAnswersCache) {
                  for (let i = 0; i < normalizedAnswersCache.length; i++) {
                    if (normalizedAnswersCache[i] === finalNorm) {
                      isMatch = true;
                      break;
                    }
                  }
                }
                if (!isMatch && finalValue.length > 0) {
                  // Show wrong answer only if definitely wrong and user stopped typing
                  handleWrongAnswer(finalValue);
                }
              }
            }
          }, 30);
        }
      } else if (!inputValue) {
        elements.lastResult.textContent = "–";
        elements.lastResult.classList.remove("status-ok", "status-error");
        // Clear pending check if input is cleared
        if (answerCheckTimeout) {
          clearTimeout(answerCheckTimeout);
          answerCheckTimeout = null;
        }
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
