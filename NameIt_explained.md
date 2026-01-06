## NameIt Game – Full Beginner-Friendly Explanation

This file explains **how your NameIt game works**, step by step, in simple language.  
If you keep this file open next to your code, you can follow along and learn.

I will also **update this file whenever we change the code**.

---

## 1. What files you have and what they do

Your project folder `NameIt` now has these important files:

- **`index.html`** – The **page structure** (what appears on screen).
- **`styles.css`** – The **visual design** (colors, sizes, layout).
- **`images.js`** – The **list of pictures** and their correct answers.
- **`script.js`** – The **game brain** (timer, speech recognition, scoring, sounds).
- **Image folders**:
  - `images/` – Picture files for the objects (apple, dog, etc.).
  - `image_first picture/` – The “thinking child” start picture.
- **Sound folders**:
  - `audio/` – Level-up sound for correct answers.
  - `audio_startmusic/` – Background start music for the game.
- **`NameIt_explained.md`** – This explanation file.

You mainly **play with the game** by:

- Opening `index.html` in your browser.
- Adding new pictures in `images/` and updating `images.js`.
- Changing sounds in the `audio` folders.

---

## 2. `index.html` – The page layout

`index.html` is the “skeleton” of your game. It defines:

- Where the **timer** and **score** go.
- Where the **main picture** appears.
- Where the **buttons** (Start, Speak, Sound) are.
- Where the **image library list** is shown.

### 2.1. Head section

At the top of `index.html`:

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NameIt - Voice Vocabulary Game</title>
  <link rel="stylesheet" href="styles.css" />
</head>
```

- `title` – Text for the browser tab.
- `link rel="stylesheet"` – Connects your page to `styles.css` so styles apply.

### 2.2. App wrapper

Your entire game is inside:

```html
<div class="app">
  ...
</div>
```

The `class="app"` is used in `styles.css` to center and size the game.

### 2.3. Header

```html
<header class="header">
  <h1 class="title">NameIt</h1>
  <p class="subtitle">Say what you see. Beat the clock.</p>
</header>
```

- Shows the **game name** and a **short description** at the top.

### 2.4. HUD – Time, Score, Last, Category

Inside `<main class="game">` there is:

```html
<section class="hud">
  <div class="hud-item">
    <span class="hud-label">Time</span>
    <span id="time-remaining" class="hud-value">30</span>
  </div>
  <div class="hud-item">
    <span class="hud-label">Score</span>
    <span id="score" class="hud-value">0</span>
  </div>
  <div class="hud-item">
    <span class="hud-label">Last</span>
    <span id="last-result" class="hud-value hud-value-small">–</span>
  </div>
  <div class="hud-item">
    <span class="hud-label">Category</span>
    <select id="category-select" class="hud-select">
      <option value="all">All</option>
    </select>
  </div>
</section>
```

These `id`s are important because **`script.js` uses them**:

- `time-remaining` – Shows **how many seconds** are left in the 30-second round.
- `score` – Shows **how many correct answers** the player has.
- `last-result` – Shows the **last recognized word** and whether it was correct or wrong.
- `category-select` – A dropdown so player can choose picture sets like **Fruits** or **Animals**.

### 2.5. Image stage (the big square)

```html
<section class="image-stage">
  <div id="image-frame" class="image-frame">
    <img id="current-image" class="image hidden" alt="Object to name" />
    <div id="image-placeholder" class="image-placeholder">
      <img
        id="start-image"
        class="start-image"
        src="image_first picture/thinking child.jpg"
        alt="Child thinking about the answer"
      />
    </div>
  </div>
</section>
```

- `image-frame` – The **square frame** that holds images.
- `current-image` – The **object for the player to name** (apple, dog, etc.). Starts as `hidden`.
- `image-placeholder` – Shows **before** the game starts and **after** a round:
  - `start-image` – Your **“thinking child”** picture, centered both horizontally and vertically and filling most of the square.

When the game begins, `script.js`:

- Hides the `image-placeholder`.
- Shows and updates `current-image` with each new object.

### 2.6. Controls – Start, Speak, Sound

```html
<section class="controls">
  <button id="start-button" class="btn primary">Start 30s Round</button>
  <button id="speak-button" class="btn secondary" disabled>Hold &amp; Speak</button>
  <button id="sound-toggle-button" class="btn secondary">Sound: On</button>
</section>
```

- `start-button` – Starts a 30-second round or lets you **Play Again**.
- `speak-button` – When held, activates **microphone listening** for your answer.
- `sound-toggle-button` – Global **sound on/off**:
  - `Sound: On` → all sounds active.
  - `Sound: Off` → all sounds stopped.

### 2.7. Status messages

```html
<section class="status">
  <div id="speech-status" class="status-line">Speech: idle</div>
  <div id="game-message" class="status-line"></div>
</section>
```

- `speech-status` – Shows microphone status (idle, listening, errors).
- `game-message` – Shows things like **“Time! Your score: 7”**.

### 2.8. Image library view

```html
<section class="library">
  <h2 class="section-title">Image Library</h2>
  <p class="library-help">
    You can extend the game by adding more images. Put your image files in the
    <code>images/</code> folder and register them in <code>images.js</code>.
  </p>
  <ul id="library-list" class="library-list"></ul>
</section>
```

`script.js` fills `library-list` based on `IMAGE_ITEMS` in `images.js`.  
This section is currently **hidden** (not visible on screen) but the code still runs in the background.

### 2.9. Scripts at the bottom

```html
<script src="images.js"></script>
<script src="script.js"></script>
```

- `images.js` is loaded **first**, so `IMAGE_ITEMS` is ready.
- `script.js` is loaded **second** and uses `IMAGE_ITEMS` to run the game.

---

## 3. `styles.css` – How it looks

`styles.css` controls **colors, layout, sizes, and animations**.

Key ideas:

- The body uses a **dark gradient background**.
- `.game` has rounded corners and a glowing card style.
- `.hud` and `.hud-item` style the top bar (Time, Score, Last, Category).
- `.image-frame` defines the **square image area** with a border and glow.
- `.image-frame.correct` and `.image-frame.wrong` add **green/orange pulse animation**.
- `.image` is the **current object** image.
- `.start-image` is the **large thinking child** start picture.
- `.controls` and `.btn` style your **buttons**.
- `.status`, `.library`, `.library-list` style the lower sections.

The main thing for you as a beginner:

- **Classes** (like `.game`, `.btn.primary`) connect to `class="..."` in `index.html`.
- **IDs** (like `#time-remaining`) connect to `id="..."` and are also used in `script.js`.

---

## 4. `images.js` – Your image library

This file defines an array called `IMAGE_ITEMS`:

```javascript
const IMAGE_ITEMS = [
  {
    id: "apple",
    src: "images/apple.jpg",
    answers: ["apple"],
    category: "fruits",
  },
  {
    id: "banana",
    src: "images/banana.jpg",
    answers: ["banana", "a banana"],
    category: "fruits",
  },
  // ... more items ...
];
```

Each object in the array describes **one picture**:

- **`id`** – A simple internal name (no spaces).
- **`src`** – The **path to the image file** (folder + filename).
- **`answers`** – A list of **words you accept as correct**.
- **`category`** – Which dropdown category this picture belongs to (like `"fruits"` or `"animals"`).

### 4.1. How categories work

Examples:

- Fruits:

```javascript
{
  id: "apple",
  src: "images/apple.jpg",
  answers: ["apple"],
  category: "fruits",
}
```

- Animals:

```javascript
{
  id: "dog",
  src: "images/dog.jpg",
  answers: ["dog", "puppy"],
  category: "animals",
}
```

`script.js`:

- Reads all `category` values.
- Builds the **Category dropdown** (Fruits, Animals, etc.).
- When you pick a category, it **only uses images from that category** for the round.

### 4.2. How to add a new picture (summary)

1. Put your image file in the `images/` folder.
2. Add a new object in `IMAGE_ITEMS`:

```javascript
{
  id: "pear",
  src: "images/pear.jpg",
  answers: ["pear"],
  category: "fruits",
}
```

3. Save `images.js` and refresh `index.html` in the browser.

---

## 5. `script.js` – The game brain

This is the most complex file. It:

- Keeps track of **time**, **score**, and the **current image**.
- Uses the **Web Speech API** to recognize what the player says.
- Checks if the spoken word is **correct**.
- Plays **sounds** (beeps, level-up sound, background music).
- Handles **categories** and **one-time-per-round** image use.
- Wires up **buttons** to actions.

### 5.1. Constants and element lookup

```javascript
const ROUND_DURATION_SECONDS = 30;

const elements = {
  timeRemaining: document.getElementById("time-remaining"),
  score: document.getElementById("score"),
  lastResult: document.getElementById("last-result"),
  imageFrame: document.getElementById("image-frame"),
  currentImage: document.getElementById("current-image"),
  imagePlaceholder: document.getElementById("image-placeholder"),
  placeholderText: document.getElementById("placeholder-text"),
  startButton: document.getElementById("start-button"),
  speakButton: document.getElementById("speak-button"),
  speechStatus: document.getElementById("speech-status"),
  gameMessage: document.getElementById("game-message"),
  libraryList: document.getElementById("library-list"),
  categorySelect: document.getElementById("category-select"),
  soundToggleButton: document.getElementById("sound-toggle-button"),
};
```

- `ROUND_DURATION_SECONDS` – Length of each round (30 seconds).
- `elements` – A collection of **references** to important HTML elements (by their `id`).

Because of this, later we can write things like:

- `elements.score.textContent = "5";` to change the score shown on the page.

### 5.2. Game state variables

```javascript
let currentItem = null;
let currentScore = 0;
let timeRemaining = ROUND_DURATION_SECONDS;
let roundTimerId = null;
let acceptingAnswers = false;
let isListening = false;
let correctSound = null;
let remainingItems = [];
let activeCategory = "all";
let backgroundMusic = null;
let isMuted = false;
```

- `currentItem` – The **current picture object** from `IMAGE_ITEMS`.
- `currentScore` – Number of correct answers in the current round.
- `timeRemaining` – Counts down from 30 to 0.
- `roundTimerId` – Holds the `setInterval` timer so we can stop it.
- `acceptingAnswers` – Are we currently in a round and accepting answers?
- `isListening` – Is the microphone currently active?
- `correctSound` – The **level-up audio** for correct answers.
- `remainingItems` – A pool of images left to show in this round (prevents repeats).
- `activeCategory` – The currently selected category.
- `backgroundMusic` – The looping start music.
- `isMuted` – Whether all sounds are turned off.

### 5.3. Speech recognition setup

```javascript
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition || null;
let recognition = null;
```

The browser might expose speech recognition as `SpeechRecognition` or `webkitSpeechRecognition`.  
If neither exists, speech is not available.

`initSpeechRecognition()`:

- Checks if the API exists.
- Creates a `recognition` object.
- Sets language to English (`en-US`).
- Listens to events:
  - `onstart` – Microphone started.
  - `onerror` – Something went wrong.
  - `onend` – Microphone stopped.
  - `onresult` – A speech result was recognized.

When `onresult` fires, it collects the texts and passes them to `checkAnswer(...)`.

### 5.4. Resetting game state

```javascript
function resetGameState() {
  currentScore = 0;
  timeRemaining = ROUND_DURATION_SECONDS;
  elements.score.textContent = String(currentScore);
  elements.timeRemaining.textContent = String(timeRemaining);
  elements.lastResult.textContent = "–";
  elements.gameMessage.textContent = "";
  acceptingAnswers = false;

  if (roundTimerId) {
    clearInterval(roundTimerId);
    roundTimerId = null;
  }
}
```

Called at the **start of each round**:

- Score back to 0.
- Timer back to 30.
- UI text reset.
- Any old timer is cleared.

### 5.5. Starting and ending a round

#### `startRound()`

- Calls `resetGameState()`.
- Sets `acceptingAnswers = true`.
- Disables the Start button and changes its text to `"Playing…"`.
- Enables the Speak button (if there is speech recognition).
- Changes `"Press Start"` to `"Get ready…"`.
- **Turns background music softer** (playing mode).
- Starts the **countdown timer**:
  - Every second, reduces `timeRemaining`.
  - When time hits 0, calls `endRound()`.
- Calls `loadNextImage()` to show the first object.

#### `endRound()`

- Sets `acceptingAnswers = false`.
- Stops the countdown timer.
- Stops recognition if it’s listening.
- Re-enables the Start button and sets text to `"Play Again"`.
- Disables the Speak button.
- Shows a message like `"Time! Your score: 5"`.
- Shows the `image-placeholder` again (`Press Start` + thinking child).
- **Turns background music louder** (idle mode).

### 5.6. Loading the next image (no repeats in a round, category-aware)

```javascript
function loadNextImage() {
  if (!Array.isArray(IMAGE_ITEMS) || IMAGE_ITEMS.length === 0) {
    elements.gameMessage.textContent =
      "No images configured. Add items in images.js.";
    return;
  }

  const sourceItems =
    activeCategory === "all"
      ? IMAGE_ITEMS
      : IMAGE_ITEMS.filter((item) => item.category === activeCategory);

  if (!Array.isArray(sourceItems) || sourceItems.length === 0) {
    elements.gameMessage.textContent =
      "No images in this category. Add some in images.js.";
    return;
  }

  if (!Array.isArray(remainingItems) || remainingItems.length === 0) {
    remainingItems = [...sourceItems];
  }

  const randomIndex = Math.floor(Math.random() * remainingItems.length);
  currentItem = remainingItems[randomIndex];
  remainingItems.splice(randomIndex, 1);

  elements.currentImage.classList.remove("visible");
  elements.currentImage.classList.add("hidden");

  setTimeout(() => {
    elements.currentImage.src = currentItem.src;
    elements.currentImage.alt = currentItem.id;
    elements.imagePlaceholder.classList.add("hidden");
    elements.currentImage.classList.remove("hidden");
    elements.currentImage.classList.add("visible");
  }, 80);
}
```

Logic:

1. Choose `sourceItems`:
   - If category = `all` → use all images.
   - Otherwise → only use images whose `category` matches `activeCategory`.
2. If `remainingItems` is empty:
   - Copy all `sourceItems` into `remainingItems`.
3. Pick a **random index** from `remainingItems`.
4. Set `currentItem` to that object.
5. Remove it from `remainingItems` so it **won’t appear again this round**.
6. Update the `current-image` element after a small delay.

### 5.7. Checking answers

#### Normalizing text

```javascript
function normalizeAnswer(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
```

- Lowercases the text.
- Changes any non-letter-or-digit into spaces.
- Trims leading and trailing spaces.

This makes `"An  APPLE!!!"` become `"an apple"`, so matching is easier.

#### `checkAnswer(recognizedText)`

```javascript
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
```

- Takes the recognized speech.
- Normalizes it.
- Compares to **each** possible answer in `currentItem.answers`.
- If one matches → correct; otherwise → wrong.

### 5.8. Sounds – beeps, correct sound, background music, mute

#### Basic beep

```javascript
function playBeep(type) {
  if (isMuted) return;
  // uses Web Audio API to make a simple tone
}
```

- Plays a short **high beep** for success or **low beep** for wrong.
- If `isMuted` is true, it does nothing.

#### Level-up correct sound

```javascript
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
      // fall through
    }
  }
  playBeep("ok");
}
```

- If `correctSound` is loaded (your `level-up` sound):
  - Rewinds to start.
  - Plays it.
- If something goes wrong:
  - Uses the simple beep instead.

#### Background start music

```javascript
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
      // browser might block autoplay
    });
  }
}
```

- `setBackgroundVolume("idle")` – louder music before/after the round.
- `setBackgroundVolume("playing")` – softer music during play.
- `ensureBackgroundMusicPlaying()` tries to start the music if allowed.

#### Sound toggle (mute button)

```javascript
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
  } else {
    setBackgroundVolume(acceptingAnswers ? "playing" : "idle");
    ensureBackgroundMusicPlaying();
  }
}
```

- Flips `isMuted`.
- Updates the button text.
- If muted:
  - Stops background music and resets its time.
- If unmuted:
  - Sets volume based on whether a round is active.
  - Ensures music is playing again.

### 5.9. Handling correct and wrong answers

#### Correct

```javascript
function handleCorrectAnswer(transcript) {
  currentScore += 1;
  elements.score.textContent = String(currentScore);
  elements.lastResult.textContent = `✔ "${transcript}"`;
  elements.lastResult.classList.remove("status-error");
  elements.lastResult.classList.add("status-ok");
  elements.gameMessage.textContent = "";

  elements.imageFrame.classList.remove("wrong");
  void elements.imageFrame.offsetWidth;
  elements.imageFrame.classList.add("correct");

  playCorrectSound();

  loadNextImage();
}
```

- Increments `currentScore`.
- Updates the score display.
- Shows a checkmark with the spoken text.
- Animates the frame with the green **correct** style.
- Plays the correct sound.
- Immediately loads the **next image**.

#### Wrong

```javascript
function handleWrongAnswer(transcript) {
  elements.lastResult.textContent = `✖ "${transcript}"`;
  elements.lastResult.classList.remove("status-ok");
  elements.lastResult.classList.add("status-error");

  elements.imageFrame.classList.remove("correct");
  void elements.imageFrame.offsetWidth;
  elements.imageFrame.classList.add("wrong");

  playBeep("bad");
}
```

- Shows an X with the spoken text.
- Animates the frame with the orange **wrong** style.
- Plays the low beep.

### 5.10. Listening controls (speak button)

```javascript
function beginListening() { ... }
function stopListening() { ... }
```

- `beginListening()` – Starts speech recognition (if not already listening).
- `stopListening()` – Stops it.

In `wireEvents()`:

- Mouse down / touch start on `speak-button` → start listening.
- Mouse up / touch end / mouse leave → stop listening.
- Click fallback → start listening if not already.

### 5.11. Category dropdown initialization

```javascript
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
```

- Builds the dropdown options from `IMAGE_ITEMS`.
- Sets initial category to `"all"`.
- When you change it:
  - Updates `activeCategory`.
  - Clears `remainingItems` so the next round uses images from the new category.

### 5.12. Event wiring

```javascript
function wireEvents() {
  elements.startButton.addEventListener("click", () => {
    startRound();
  });

  // Speak button press/hold wired here...

  if (elements.soundToggleButton) {
    elements.soundToggleButton.addEventListener("click", () => {
      toggleMute();
    });
  }
}
```

- Connects buttons to their functions:
  - Start button → `startRound()`.
  - Speak button → listening functions.
  - Sound toggle → `toggleMute()`.

### 5.13. Initialization when page loads

```javascript
function init() {
  resetGameState();
  initSpeechRecognition();
  renderLibraryList();
  wireEvents();
  initCategorySelect();

  try {
    correctSound = new Audio("audio/level-up.mp3.wav");
  } catch {
    correctSound = null;
  }

  try {
    backgroundMusic = new Audio("audio_startmusic/audio_startmusic.wav");
    backgroundMusic.loop = true;
    setBackgroundVolume("idle");
  } catch {
    backgroundMusic = null;
  }
}

window.addEventListener("DOMContentLoaded", init);
```

When the document is ready:

- Resets game state.
- Sets up speech recognition.
- Renders the image library list from `IMAGE_ITEMS`.
- Wires button events.
- Builds category dropdown.
- Tries to load:
  - Level-up sound from `audio/level-up.mp3.wav`.
  - Background music from `audio_startmusic/audio_startmusic.wav`.

---

## 6. How the full loop works (summary)

1. You open `index.html`.
2. `images.js` loads and defines `IMAGE_ITEMS`.
3. `script.js` loads, runs `init()`:
   - Connects to the HTML elements.
   - Sets up speech recognition.
   - Builds category dropdown from `IMAGE_ITEMS`.
   - Prepares sounds (level-up, background music).
4. You click **Start 30s Round**:
   - Timer starts at 30.
   - Score set to 0.
   - Background music becomes softer.
   - A random image (from the chosen category) shows.
5. You hold **Hold & Speak** and say the word:
   - Browser listens and returns text.
   - Text is compared to `answers` for the current image.
   - Correct → score up, green pulse, level-up sound, next image.
   - Wrong → orange pulse, error beep, same image stays until answered correctly.
6. After 30 seconds:
   - Round ends.
   - Score shows.
   - Start button says **Play Again**.
   - Placeholder with thinking child appears.
   - Background music gets louder again.

---

## 7. What to do if you get lost

As a total beginner, when you feel lost:

- Re-open this file **`NameIt_explained.md`**.
- Start from section **2** and match the explanation with what you see:
  - In `index.html`, look for the element IDs (`id="..."`).
  - In `script.js`, search for the same names in `document.getElementById`.
- Remember:
  - **HTML** = “What is on the page?”
  - **CSS** = “How does it look?”
  - **JS (`script.js`)** = “What happens when I click / speak / play?”

Whenever we change the game code, I will also **update this explanation** so it stays accurate.

