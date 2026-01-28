// Shared leaderboard functions for all games

const PLAYER_NAME_KEY = 'funGames_playerName';
const LEADERBOARD_KEY = 'funGames_leaderboard';

function getLeaderboard() {
  try {
    const stored = localStorage.getItem(LEADERBOARD_KEY);
    return stored ? JSON.parse(stored) : { nameit: [], typeit: [], 'equation-pyramid': [] };
  } catch {
    return { nameit: [], typeit: [], 'equation-pyramid': [] };
  }
}

function saveLeaderboard(leaderboard) {
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
  } catch (error) {
    console.error('Failed to save leaderboard:', error);
  }
}

function addScoreToLeaderboard(gameType, score, duration) {
  const playerName = localStorage.getItem(PLAYER_NAME_KEY) || 'Anonymous';
  const leaderboard = getLeaderboard();
  
  const entry = {
    name: playerName,
    score: score,
    duration: duration, // in seconds
    date: new Date().toISOString(),
    scorePerSecond: duration > 0 ? parseFloat((score / duration).toFixed(2)) : score
  };
  
  // Add to appropriate game leaderboard
  if (leaderboard[gameType]) {
    leaderboard[gameType].push(entry);
    // Sort by score per second (highest first), then by score, then by duration
    leaderboard[gameType].sort((a, b) => {
      const aSPS = parseFloat(a.scorePerSecond) || 0;
      const bSPS = parseFloat(b.scorePerSecond) || 0;
      if (bSPS !== aSPS) return bSPS - aSPS;
      if (b.score !== a.score) return b.score - a.score;
      return a.duration - b.duration;
    });
    // Keep only top 10
    leaderboard[gameType] = leaderboard[gameType].slice(0, 10);
  }
  
  saveLeaderboard(leaderboard);
  return entry;
}

function displayLeaderboardInGame(gameType, container) {
  if (!container) return;
  
  const leaderboard = getLeaderboard();
  const gameScores = leaderboard[gameType] || [];
  
  if (gameScores.length === 0) {
    container.innerHTML = '<p class="leaderboard-empty">No scores yet. Be the first!</p>';
    return;
  }
  
  let html = '<div class="leaderboard-list-game">';
  gameScores.slice(0, 5).forEach((entry, index) => {
    const rank = index + 1;
    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
    html += `
      <div class="leaderboard-item-game">
        <span class="leaderboard-rank-game">${medal}</span>
        <span class="leaderboard-name-game">${escapeHtml(entry.name)}</span>
        <span class="leaderboard-score-game">${entry.score} pts</span>
        <span class="leaderboard-rate-game">${entry.scorePerSecond} pts/s</span>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
