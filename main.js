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
  // Load and display saved player name
  const nameInput = document.getElementById('player-name-input');
  if (nameInput) {
    const savedName = localStorage.getItem(PLAYER_NAME_KEY);
    if (savedName) {
      nameInput.value = savedName;
    }
    nameInput.addEventListener('blur', () => {
      const name = nameInput.value.trim();
      if (name) {
        localStorage.setItem(PLAYER_NAME_KEY, name);
      }
    });
    nameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        nameInput.blur();
      }
    });
  }
  
  // Initialize leaderboard tabs
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
  
  const gameCards = document.querySelectorAll('.game-card');
  
  gameCards.forEach(card => {
    const playButton = card.querySelector('.play-button');
    const gameName = card.dataset.game;
    
    // Make entire card clickable
    card.addEventListener('click', (e) => {
      // Don't trigger if clicking the button directly (it has its own handler)
      if (e.target !== playButton) {
        handleGameClick(gameName);
      }
    });
    
    // Button click handler
    playButton.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent card click
      handleGameClick(gameName);
    });
  });
});

function handleGameClick(gameName) {
  if (gameName === 'nameit') {
    startNameItGame();
  } else if (gameName === 'typeit') {
    window.location.href = 'typeit.html';
  } else if (gameName === 'equation-pyramid') {
    window.location.href = 'equation-pyramid.html';
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
