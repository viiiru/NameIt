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
  loadingIndicator: document.getElementById("loading-indicator"),
  startButton: document.getElementById("start-button"),
  stopButton: document.getElementById("stop-button"),
  skipButton: document.getElementById("skip-button"),
  quitButton: document.getElementById("quit-button"),
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
let recognitionTimeoutId = null; // Timeout to force-stop recognition if it takes too long

// Web Speech API setup (Chrome / Edge; Safari uses webkitSpeechRecognition)
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition || null;
let recognition = null;

function initSpeechRecognition() {
  if (!SpeechRecognition) {
    console.warn("Speech recognition not available in this browser. Try Chrome or Edge.");
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = true; // Enable interim results for faster feedback
  recognition.maxAlternatives = 1; // Reduce to 1 for faster processing
  recognition.continuous = false;
  // Make recognition stop faster by reducing silence timeout
  // Note: Some browsers may not support this, but it helps when available

  recognition.onstart = () => {
    isListening = true;
    
    // Set a timeout to force-stop recognition if it takes too long (5 seconds max)
    // This prevents the game from hanging if recognition doesn't respond
    if (recognitionTimeoutId) {
      clearTimeout(recognitionTimeoutId);
    }
    recognitionTimeoutId = setTimeout(() => {
      if (isListening && recognition) {
        try {
          recognition.stop();
        } catch {
          // Ignore errors
        }
      }
    }, 5000); // Force stop after 5 seconds (longer to allow user to speak)
  };

  recognition.onerror = (event) => {
    isListening = false;
    console.error("Recognition error:", event.error);
    
    // Handle permission denied errors more gracefully
    if (event.error === "not-allowed" || event.error === "service-not-allowed") {
      // Try to request permission again
      checkMicrophonePermission();
    }
  };

  recognition.onend = () => {
    isListening = false;
    // Clear any pending timeout
    if (recognitionTimeoutId) {
      clearTimeout(recognitionTimeoutId);
      recognitionTimeoutId = null;
    }

    // If the round is still active and we're expecting answers,
    // automatically start listening again so the player can try more words.
    if (acceptingAnswers && currentItem && timeRemaining > 0) {
      setTimeout(() => {
        if (!isListening) {
          beginListening();
        }
      }, 200);
    }
  };

  recognition.onresult = (event) => {
    if (!acceptingAnswers || !currentItem) {
      console.log("Recognition result ignored - not accepting answers or no current item");
      return;
    }

    console.log("Recognition result received:", event.results.length, "results");

    // Process ALL results, including interim ones, for fastest response
    // Check the most recent result first (last in array)
    for (let i = event.results.length - 1; i >= 0; i--) {
      const result = event.results[i];
      const transcript = result[0]?.transcript || "";
      
      if (!transcript.trim()) continue;
      
      console.log("Processing transcript:", transcript, "isFinal:", result.isFinal);
      
      // Keep original transcript for display, normalize for comparison
      const originalTranscript = transcript.trim();
      const normalizedTranscript = originalTranscript.toLowerCase();
      
      // Check if this matches the answer - process immediately for speed (even interim results)
      const normRecognized = normalizeAnswer(normalizedTranscript);
      const accepted = currentItem.answers.some(
        (ans) => normalizeAnswer(ans) === normRecognized
      );
      
      // If we found a match (even in interim results), process it immediately
      if (accepted) {
        // Clear timeout since we got a result
        if (recognitionTimeoutId) {
          clearTimeout(recognitionTimeoutId);
          recognitionTimeoutId = null;
        }
        
        // Stop recognition immediately to prevent further processing
        if (isListening) {
          try {
            recognition.stop();
          } catch {
            // Ignore if already stopping
          }
        }
        
        // Process the answer immediately (use original transcript for display)
        handleCorrectAnswer(originalTranscript);
        return; // Exit early - we found a match
      }
      
      // Show interim results in "Last" field for real-time feedback (only if no match yet)
      if (!result.isFinal) {
        elements.lastResult.textContent = `"${originalTranscript}"...`;
        elements.lastResult.classList.remove("status-ok", "status-error");
      }
      
      // If this is a final result (not interim), process it even if no match yet
      // This handles cases where the word was said but doesn't match
      if (result.isFinal) {
        // Clear timeout since we got a result
        if (recognitionTimeoutId) {
          clearTimeout(recognitionTimeoutId);
          recognitionTimeoutId = null;
        }
        
        // Stop listening after final result
        if (isListening) {
          try {
            recognition.stop();
          } catch {
            // Ignore if already stopping
          }
        }
        
        // Check answer (will handle wrong answer - use original transcript for display)
        checkAnswer(originalTranscript);
        return; // Processed final result, exit
      }
    }
  };

  // Speech recognition initialized
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
  
  // Hide leaderboard when resetting
  const leaderboardSection = document.getElementById('leaderboard-section');
  if (leaderboardSection) {
    leaderboardSection.style.display = 'none';
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
  
  // Hide start controls group, show game controls group
  const startControlsGroup = document.querySelector('.start-controls-group');
  const gameControlsGroup = document.querySelector('.game-controls-group');
  const soundButtonFixed = document.getElementById('sound-toggle-button-fixed');
  const soundButtonInline = document.getElementById('sound-toggle-button');
  
  if (startControlsGroup) {
    startControlsGroup.style.display = "none";
  }
  if (gameControlsGroup) {
    gameControlsGroup.style.display = "flex";
  }
  if (soundButtonFixed) {
    soundButtonFixed.style.display = "inline-flex";
  }
  if (soundButtonInline) {
    soundButtonInline.style.display = "none";
  }
  
  // Disable duration selector during play
  if (elements.durationSelect) {
    elements.durationSelect.disabled = true;
  }
  
  // Auto-start recording when round starts
  if (recognition && acceptingAnswers) {
    beginListening();
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

  // Show start controls group, hide game controls group
  const startControlsGroup = document.querySelector('.start-controls-group');
  const gameControlsGroup = document.querySelector('.game-controls-group');
  const soundButtonFixed = document.getElementById('sound-toggle-button-fixed');
  const soundButtonInline = document.getElementById('sound-toggle-button');
  
  if (startControlsGroup) {
    startControlsGroup.style.display = "flex";
  }
  if (gameControlsGroup) {
    gameControlsGroup.style.display = "none";
  }
  if (soundButtonFixed) {
    soundButtonFixed.style.display = "none";
  }
  if (soundButtonInline) {
    soundButtonInline.style.display = "inline-flex";
  }
  
  if (elements.startButton) {
    elements.startButton.disabled = false;
    elements.startButton.textContent = "Start Round";
  }
  // Re-enable duration selector
  if (elements.durationSelect) {
    elements.durationSelect.disabled = false;
  }
  
  // Hide skip button
  if (elements.skipButton) {
    elements.skipButton.style.display = "none";
  }
  
  // Calculate actual duration used
  const actualDuration = roundDurationSeconds - timeRemaining;
  
  // Save score to leaderboard (if stopped early, still save the score)
  if (typeof addScoreToLeaderboard === 'function' && currentScore > 0) {
    addScoreToLeaderboard('nameit', currentScore, actualDuration);
    
    // Display leaderboard
    const leaderboardSection = document.getElementById('leaderboard-section');
    const leaderboardContent = document.getElementById('leaderboard-content-game');
    if (leaderboardSection && leaderboardContent && typeof displayLeaderboardInGame === 'function') {
      displayLeaderboardInGame('nameit', leaderboardContent);
      leaderboardSection.style.display = 'block';
    }
  }
  
  elements.gameMessage.textContent = `Game stopped. Your score this round: ${currentScore}`;
  
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

  // Show start controls group, hide game controls group
  const startControlsGroup = document.querySelector('.start-controls-group');
  const gameControlsGroup = document.querySelector('.game-controls-group');
  const soundButtonFixed = document.getElementById('sound-toggle-button-fixed');
  const soundButtonInline = document.getElementById('sound-toggle-button');
  
  if (startControlsGroup) {
    startControlsGroup.style.display = "flex";
  }
  if (gameControlsGroup) {
    gameControlsGroup.style.display = "none";
  }
  if (soundButtonFixed) {
    soundButtonFixed.style.display = "none";
  }
  if (soundButtonInline) {
    soundButtonInline.style.display = "inline-flex";
  }
  
  if (elements.startButton) {
    elements.startButton.disabled = false;
    elements.startButton.textContent = "Play Again";
  }
  // Re-enable duration selector after round ends
  if (elements.durationSelect) {
    elements.durationSelect.disabled = false;
  }
  
  // Hide skip button
  if (elements.skipButton) {
    elements.skipButton.style.display = "none";
  }
  
  // Calculate actual duration used
  const actualDuration = roundDurationSeconds - timeRemaining;
  
  // Save score to leaderboard
  if (typeof addScoreToLeaderboard === 'function') {
    addScoreToLeaderboard('nameit', currentScore, actualDuration);
    
    // Display leaderboard
    const leaderboardSection = document.getElementById('leaderboard-section');
    const leaderboardContent = document.getElementById('leaderboard-content-game');
    if (leaderboardSection && leaderboardContent && typeof displayLeaderboardInGame === 'function') {
      displayLeaderboardInGame('nameit', leaderboardContent);
      leaderboardSection.style.display = 'block';
    }
  }
  
  elements.gameMessage.textContent = `Time! You scored ${currentScore} points this round.`;
  
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
      : IMAGE_ITEMS.filter(
          (item) => item.category === activeCategory && !item._broken
        );

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

  // Pick a random index from the remaining pool
  // This ensures each image appears once before any repeats, with true randomness
  const randomIndex = Math.floor(Math.random() * remainingItems.length);
  currentItem = remainingItems[randomIndex];
  // Remove the used item so it won't appear again until the pool refills.
  remainingItems.splice(randomIndex, 1);
  
  // Debug: Log which image was selected (check browser console F12 to see)
  console.log("Selected:", currentItem.id, "Remaining in pool:", remainingItems.length, "Total available:", sourceItems.length);

  // Set image source immediately - browser cache will make it instant if preloaded
  // Use encodeURI to handle any special characters in paths
  elements.currentImage.src = encodeURI(currentItem.src);
  elements.currentImage.alt = currentItem.id;
  
  // Check if image is already loaded (cached) - if so, show immediately
  if (elements.currentImage.complete && elements.currentImage.naturalWidth > 0) {
    // Image was cached and ready - show instantly
    elements.imagePlaceholder.classList.add("hidden");
    elements.currentImage.classList.remove("hidden");
    elements.currentImage.classList.add("visible");
    if (elements.loadingIndicator) {
      elements.loadingIndicator.classList.add("hidden");
    }
  } else {
    // Image needs to load - show loading indicator
    elements.currentImage.classList.remove("visible");
    elements.currentImage.classList.add("hidden");
    if (elements.loadingIndicator) {
      elements.loadingIndicator.classList.remove("hidden");
    }
    
    // When image loads, show it immediately
    const showImage = () => {
      if (elements.loadingIndicator) {
        elements.loadingIndicator.classList.add("hidden");
      }
      elements.imagePlaceholder.classList.add("hidden");
      elements.currentImage.classList.remove("hidden");
      elements.currentImage.classList.add("visible");
      
      // Restart recording after image is shown
      if (recognition && acceptingAnswers && !isListening) {
        setTimeout(() => {
          beginListening();
        }, 200);
      }
    };
    
    // Use load event for when image finishes loading
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
        console.error(`Image not found: ${currentItem?.id}`);

        // Try to load another image so the game doesn't get stuck on a missing file
        if (acceptingAnswers && timeRemaining > 0) {
          loadNextImage();
        }
      },
      { once: true }
    );
  }
}

function normalizeAnswer(text) {
  if (!text || typeof text !== 'string') return '';
  
  // Normalize text for comparison, preserving Finnish characters (ä, ö, å)
  // Normalize Unicode to NFC (canonical composed form) to handle different representations
  let normalized = String(text).normalize('NFC');
  
  // Convert to lowercase
  normalized = normalized.toLowerCase();
  
  // Replace non-alphanumeric characters (except Finnish letters ä, ö, å) with spaces
  // Use both Unicode escapes AND literal characters to ensure compatibility
  normalized = normalized.replace(/[^a-z0-9äöå\u00E4\u00F6\u00E5\u00C4\u00D6\u00C5]+/g, " ");
  
  // Trim and collapse multiple spaces to single space
  normalized = normalized.replace(/\s+/g, " ").trim();
  
  return normalized;
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

  const soundButtonInline = document.getElementById("sound-toggle-button");
  const soundButtonFixed = document.getElementById("sound-toggle-button-fixed");
  const label = isMuted ? "Sound: Off" : "Sound: On";

  // Update both sound buttons so they stay in sync on all devices
  if (elements.soundToggleButton) {
    elements.soundToggleButton.textContent = label;
  }
  if (soundButtonFixed) {
    soundButtonFixed.textContent = label;
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
  elements.lastResult.textContent = `"${transcript}"`;
  elements.lastResult.classList.remove("status-error");
  elements.lastResult.classList.add("status-ok");
  elements.gameMessage.textContent = "";

  elements.imageFrame.classList.remove("wrong");
  void elements.imageFrame.offsetWidth; // force reflow to restart animation
  elements.imageFrame.classList.add("correct");

  playCorrectSound();

  // Stop recognition immediately to prepare for next image
  if (recognition && isListening) {
    try {
      recognition.stop();
    } catch {
      // Ignore if already stopping
    }
  }

  // Wait a moment to show the green word, then move to next image
  setTimeout(() => {
    loadNextImage();
    // Restart recording after loading next image
    if (recognition && acceptingAnswers) {
      setTimeout(() => {
        beginListening();
      }, 100);
    }
  }, 800); // 800ms delay so user can see the green word
}

function handleWrongAnswer(transcript) {
  elements.lastResult.textContent = `"${transcript}"`;
  elements.lastResult.classList.remove("status-ok");
  elements.lastResult.classList.add("status-error");

  elements.imageFrame.classList.remove("correct");
  void elements.imageFrame.offsetWidth;
  elements.imageFrame.classList.add("wrong");

  playBeep("bad");
  
  // Restart recording for next attempt
  if (recognition && acceptingAnswers && !isListening) {
    setTimeout(() => {
      beginListening();
    }, 300);
  }
}

function beginListening() {
  if (!recognition || !acceptingAnswers) {
    console.log("Cannot start listening - recognition:", !!recognition, "acceptingAnswers:", acceptingAnswers);
    return;
  }
  
  // If already listening, don't restart (prevents delays)
  if (isListening) {
    console.log("Already listening, skipping restart");
    return;
  }

  // Clear any pending timeout when user manually starts
  if (recognitionTimeoutId) {
    clearTimeout(recognitionTimeoutId);
    recognitionTimeoutId = null;
  }

  try {
    console.log("Starting speech recognition...");
    // Start recognition immediately - browser handles cleanup internally
    recognition.start();
  } catch (e) {
    console.log("Error starting recognition:", e);
    // If already started, try stopping first then starting again
    if (e.message && e.message.includes("already started")) {
      try {
        recognition.stop();
        setTimeout(() => {
          try {
            recognition.start();
          } catch {
            // Ignore second error
          }
        }, 100);
      } catch {
        // Ignore stop error
      }
    }
  }
}

function stopListening() {
  if (!recognition || !isListening) return;
  
  // Clear any pending timeout
  if (recognitionTimeoutId) {
    clearTimeout(recognitionTimeoutId);
    recognitionTimeoutId = null;
  }
  
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

  // Skip button to skip current word without penalty
  if (elements.skipButton) {
    elements.skipButton.addEventListener("click", () => {
      skipWord();
    });
  }

  // Quit button to quit game and return to menu
  if (elements.quitButton) {
    elements.quitButton.addEventListener("click", () => {
      quitGame();
    });
  }

  // Add sound button listeners for both inline and fixed buttons
  const soundButtonInline = document.getElementById("sound-toggle-button");
  const soundButtonFixed = document.getElementById("sound-toggle-button-fixed");

  if (soundButtonInline) {
    soundButtonInline.addEventListener("click", () => {
      toggleMute();
    });
  }

  if (soundButtonFixed) {
    soundButtonFixed.addEventListener("click", () => {
      toggleMute();
    });
  }

  // Allow changing round duration before a round starts
  if (elements.durationSelect) {
    elements.durationSelect.addEventListener("change", () => {
      if (!acceptingAnswers) {
        roundDurationSeconds =
          parseInt(elements.durationSelect.value, 10) || 30;
        timeRemaining = roundDurationSeconds;
        elements.timeRemaining.textContent = String(timeRemaining);
      }
    });
  }
}

function skipWord() {
  if (!acceptingAnswers || !currentItem) return;
  
  // Stop current recognition
  if (recognition && isListening) {
    try {
      recognition.stop();
    } catch (e) {
      // Ignore errors if already stopping
    }
  }
  
  // Clear any pending timeout
  if (recognitionTimeoutId) {
    clearTimeout(recognitionTimeoutId);
    recognitionTimeoutId = null;
  }
  
  // Show skipped message
  elements.lastResult.textContent = "Skipped";
  elements.lastResult.classList.remove("status-ok", "status-error");
  elements.gameMessage.textContent = "";
  
  // Reset image frame animation
  elements.imageFrame.classList.remove("correct", "wrong");
  
  // Load next image immediately
  loadNextImage();
}


function preloadImages() {
  // Preload all images aggressively for faster gameplay
  if (!Array.isArray(IMAGE_ITEMS)) return;
  
  // Preload images with higher priority
  IMAGE_ITEMS.forEach((item) => {
    const img = new Image();
    // Force browser to cache by setting src immediately
    img.src = item.src;
    // Use decode() if available for better performance
    if (img.decode) {
      img.decode().catch(() => {
        // Fallback if decode() fails - image.src already set above
      });
    }
  });
  
  // Also preload start and end images
  const startImg = new Image();
  startImg.src = "assets/thinking%20child.jpg";
  const endImg = new Image();
  endImg.src = "assets/endpicture.jpg";
}

function init() {
  resetGameState();
  
  // Check and request microphone permission on page load
  checkMicrophonePermission();
  
  initSpeechRecognition();
  renderLibraryList();
  wireEvents();
  initCategorySelect();
  
  // Preload images in background (non-blocking)
  preloadImages();

  // Try to load a custom "level up" sound if the file exists.
  // Your sound file is expected at: audio/level-up.mp3.wav
  try {
    correctSound = new Audio("audio/level-up.mp3.wav");
  } catch {
    correctSound = null;
  }

  // Background start music (louder when idle, softer during play).
  try {
    backgroundMusic = new Audio("audio_start/audio_startmusic.wav");
    backgroundMusic.loop = true;
    setBackgroundVolume("idle");
    // We don't auto-play here because some browsers block it.
    // Once the player clicks Start, ensureBackgroundMusicPlaying() is called.
  } catch {
    backgroundMusic = null;
  }

  // End music (plays when time is up).
  try {
    endMusic = new Audio("audio_end/end%20music.wav");
  } catch {
    endMusic = null;
  }
  
  // Preload images in background (non-blocking) for faster gameplay
  // (already called earlier in init, but keeping here for clarity)
}

// Check microphone permission when page loads
async function checkMicrophonePermission() {
  try {
    // Check if we can access the microphone
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Permission granted - stop the stream (we just needed permission)
    stream.getTracks().forEach(track => track.stop());
    console.log("Microphone permission granted");
  } catch (error) {
    console.error("Microphone permission error:", error);
  }
}

function quitGame() {
  // Stop the game and return to main menu
  if (roundTimerId) {
    clearInterval(roundTimerId);
    roundTimerId = null;
  }
  
  if (recognition && isListening) {
    recognition.stop();
  }
  
  // Stop all music
  if (backgroundMusic) {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
  }
  if (endMusic) {
    endMusic.pause();
    endMusic.currentTime = 0;
  }
  
  // Go back to main menu
  window.location.href = 'index.html';
}

window.addEventListener("DOMContentLoaded", init);

