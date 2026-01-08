// Main page JavaScript for Fun Games

// Check if microphone permission was already granted
const MIC_PERMISSION_KEY = 'funGames_micPermission';

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
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
