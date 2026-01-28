// Main page JavaScript for Fun Games

// Check if microphone permission was already granted
const MIC_PERMISSION_KEY = 'funGames_micPermission';
const PLAYER_NAME_KEY = 'funGames_playerName';

function displayLeaderboard(gameType = 'nameit') {
  const LEADERBOARD_KEY = 'funGames_leaderboard';
  try {
    const stored = localStorage.getItem(LEADERBOARD_KEY);
    const leaderboard = stored ? JSON.parse(stored) : { nameit: [], typeit: [] };
    const gameScores = leaderboard[gameType] || [];
    const container = document.getElementById('leaderboard-content');
    
    if (!container) return;
    
    if (gameScores.length === 0) {
      container.innerHTML = '<p class="leaderboard-empty">No scores yet. Be the first to play!</p>';
      return;
    }
    
    let html = '<div class="leaderboard-list">';
    gameScores.forEach((entry, index) => {
      const rank = index + 1;
      const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
      html += `
        <div class="leaderboard-item">
          <span class="leaderboard-rank">${medal}</span>
          <span class="leaderboard-name">${escapeHtml(entry.name)}</span>
          <span class="leaderboard-score">${entry.score} pts</span>
          <span class="leaderboard-time">${entry.duration}s</span>
          <span class="leaderboard-rate">${entry.scorePerSecond} pts/s</span>
        </div>
      `;
    });
    html += '</div>';
    container.innerHTML = html;
  } catch (error) {
    console.error('Failed to display leaderboard:', error);
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Load and display saved player name
    const nameInput = document.getElementById('player-name-input');
    const saveNameButton = document.getElementById('save-name-button');
    const nameSavedIndicator = document.getElementById('name-saved-indicator');
    
    function savePlayerName() {
      if (!nameInput) {
        console.warn('Name input not found');
        return false;
      }
      const name = nameInput.value.trim();
      if (name) {
        try {
          localStorage.setItem(PLAYER_NAME_KEY, name);
          console.log('Name saved:', name);
          // Show saved indicator
          if (nameSavedIndicator) {
            nameSavedIndicator.textContent = 'Name saved!';
            nameSavedIndicator.style.display = 'inline';
            setTimeout(() => {
              nameSavedIndicator.style.display = 'none';
            }, 2000);
          } else {
            console.warn('Name saved indicator not found');
          }
          return true;
        } catch (error) {
          console.error('Failed to save player name:', error);
          alert('Failed to save name: ' + error.message);
        }
      } else {
        console.warn('Name is empty');
        if (nameSavedIndicator) {
          nameSavedIndicator.textContent = 'Please enter a name';
          nameSavedIndicator.style.display = 'inline';
          nameSavedIndicator.style.color = '#f97316';
          setTimeout(() => {
            nameSavedIndicator.style.display = 'none';
            nameSavedIndicator.style.color = '#22c55e';
          }, 2000);
        }
      }
      return false;
    }
    
    if (nameInput) {
      try {
        const savedName = localStorage.getItem(PLAYER_NAME_KEY);
        if (savedName) {
          nameInput.value = savedName;
        }
      } catch (error) {
        console.error('Failed to load player name:', error);
      }
      
      // Save on blur
      nameInput.addEventListener('blur', () => {
        savePlayerName();
      });
      
      // Save on Enter key
      nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          savePlayerName();
          nameInput.blur();
        }
      });
    }
    
    // Save button click handler
    if (saveNameButton) {
      saveNameButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        savePlayerName();
        if (nameInput) {
          nameInput.blur();
        }
      });
    }
    
    // Initialize leaderboard tabs
    try {
      const leaderboardTabs = document.querySelectorAll('.leaderboard-tab');
      leaderboardTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          leaderboardTabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          const gameType = tab.dataset.game;
          displayLeaderboard(gameType);
        });
      });
      
      // Display initial leaderboard
      displayLeaderboard('nameit');
    } catch (error) {
      console.error('Failed to initialize leaderboard:', error);
    }
    
    // Initialize game cards and buttons
    const gameCards = document.querySelectorAll('.game-card');
    
    if (gameCards.length === 0) {
      console.error('No game cards found!');
    }
    
    gameCards.forEach((card, index) => {
      const playButton = card.querySelector('.play-button');
      const gameName = card.dataset.game;
      
      if (!playButton) {
        console.error(`Game card ${index} missing play button:`, card);
        return;
      }
      
      if (!gameName) {
        console.error(`Game card ${index} missing data-game attribute:`, card);
        return;
      }
      
      console.log(`Setting up game card: ${gameName}`);
      
      // Button click handler - attach directly to button
      playButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log(`Play button clicked for: ${gameName}`);
        handleGameClick(gameName);
      });
      
      // Make entire card clickable (but not if clicking button)
      card.addEventListener('click', (e) => {
        // Don't trigger if clicking the button or its children
        if (e.target === playButton || e.target.closest('.play-button')) {
          return; // Button handler will take care of it
        }
        console.log(`Card clicked for: ${gameName}`);
        handleGameClick(gameName);
      });
    });
  } catch (error) {
    console.error('Error initializing page:', error);
  }
});

function handleGameClick(gameName) {
  console.log('handleGameClick called with:', gameName);
  try {
    if (gameName === 'nameit') {
      console.log('Starting Name It game...');
      startNameItGame();
    } else if (gameName === 'typeit') {
      console.log('Navigating to Type It...');
      window.location.href = 'typeit.html';
    } else if (gameName === 'equation-pyramid') {
      console.log('Navigating to Equation Pyramid...');
      window.location.href = 'equation-pyramid.html';
    } else {
      console.warn('Unknown game:', gameName);
      alert('Unknown game: ' + gameName);
    }
  } catch (error) {
    console.error('Error handling game click:', error);
    alert('Error: ' + error.message);
  }
}

function startNameItGame() {
  // Check if permission was already granted
  const permissionStatus = localStorage.getItem(MIC_PERMISSION_KEY);
  
  if (permissionStatus === 'granted') {
    // Permission already granted, go directly to game
    window.location.href = 'nameit.html';
  } else {
    // Ask for permission first
    requestMicrophonePermission();
  }
}

function requestMicrophonePermission() {
  // Show permission modal
  const modal = createPermissionModal();
  document.body.appendChild(modal);
  modal.classList.add('active');
  
  // Handle allow button
  const allowButton = modal.querySelector('.modal-button.allow');
  allowButton.addEventListener('click', async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Permission granted - stop the stream (we just needed permission)
      stream.getTracks().forEach(track => track.stop());
      
      // Save permission status
      localStorage.setItem(MIC_PERMISSION_KEY, 'granted');
      
      // Close modal and go to game
      modal.classList.remove('active');
      setTimeout(() => {
        modal.remove();
        window.location.href = 'nameit.html';
      }, 300);
      
    } catch (error) {
      // Permission denied
      console.error('Microphone permission denied:', error);
      
      // Update modal to show error
      const modalMessage = modal.querySelector('.modal-message');
      modalMessage.textContent = 'Microphone permission is required to play Name It. Please allow access and try again.';
      modalMessage.style.color = '#f97316';
      
      // Change allow button to retry
      allowButton.textContent = 'Try Again';
      allowButton.onclick = () => {
        modal.remove();
        requestMicrophonePermission();
      };
    }
  });
  
  // Handle cancel button
  const cancelButton = modal.querySelector('.modal-button.cancel');
  cancelButton.addEventListener('click', () => {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.remove();
    }, 300);
  });
}

function createPermissionModal() {
  const modal = document.createElement('div');
  modal.className = 'permission-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h2 class="modal-title">Microphone Permission Needed</h2>
      <p class="modal-message">
        Name It uses your microphone to recognize the words you say. 
        Please allow microphone access to play the game.
      </p>
      <div class="modal-buttons">
        <button class="modal-button allow">Allow</button>
        <button class="modal-button cancel">Cancel</button>
      </div>
    </div>
  `;
  return modal;
}
