// Game state
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let gameStarted = false;
let timer = null;
let startTime = null;
let hintsRemaining = 3;
let gamesWon = 0;

// Nature-themed emojis for cards
const natureEmojis = ['🌳', '🌺', '🌻', '🍄', '🦋', '🐝', '🌿', '🍁'];

// Create falling leaves animation
function createFallingLeaves() {
    const container = document.querySelector('.falling-leaves');
    const numberOfLeaves = 20;

    for (let i = 0; i < numberOfLeaves; i++) {
        const leaf = document.createElement('div');
        leaf.className = 'leaf';
        leaf.style.left = `${Math.random() * 100}vw`;
        leaf.style.animationDuration = `${Math.random() * 5 + 5}s`;
        leaf.style.animationDelay = `${Math.random() * 5}s`;
        container.appendChild(leaf);
    }
}

// Initialize game
function initializeGame() {
    const grid = document.getElementById('game-grid');
    grid.innerHTML = '';
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    hintsRemaining = 3;
    gameStarted = false;
    clearInterval(timer);
    document.getElementById('time').textContent = '00:00';
    updateStats();

    // Create card pairs
    const cardPairs = [...natureEmojis, ...natureEmojis];
    shuffleArray(cardPairs);

    // Create card elements
    cardPairs.forEach((emoji, index) => {
        const card = createCard(emoji, index);
        cards.push(card);
        grid.appendChild(card);
    });
}

// Shuffle array (Fisher-Yates algorithm)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Create individual card
function createCard(emoji, index) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <div class="card-inner">
            <div class="card-front">${emoji}</div>
            <div class="card-back"></div>
        </div>
    `;
    card.dataset.index = index;
    card.dataset.value = emoji;
    card.addEventListener('click', () => handleCardClick(card));
    return card;
}

// Handle card click
function handleCardClick(card) {
    if (!gameStarted) {
        startGame();
    }

    if (
        flippedCards.length >= 2 ||
        flippedCards.includes(card) ||
        card.classList.contains('matched')
    ) {
        return;
    }

    flipCard(card);
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        moves++;
        updateStats();
        checkMatch();
    }
}

// Flip card animation
function flipCard(card) {
    card.classList.add('flipped');
}

// Check for match
function checkMatch() {
    const [card1, card2] = flippedCards;
    const match = card1.dataset.value === card2.dataset.value;

    setTimeout(() => {
        if (match) {
            handleMatch(card1, card2);
        } else {
            handleMismatch(card1, card2);
        }
        flippedCards = [];
    }, 1000);
}

// Handle matching cards
function handleMatch(card1, card2) {
    card1.classList.add('matched');
    card2.classList.add('matched');
    matchedPairs++;

    if (matchedPairs === natureEmojis.length) {
        handleWin();
    }
}

// Handle mismatched cards
function handleMismatch(card1, card2) {
    setTimeout(() => {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
    }, 500);
}

// Start game
function startGame() {
    gameStarted = true;
    startTime = Date.now();
    timer = setInterval(updateTimer, 1000);
}

// Update timer
function updateTimer() {
    const currentTime = Date.now();
    const elapsedTime = Math.floor((currentTime - startTime) / 1000);
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    document.getElementById('time').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Update game stats
function updateStats() {
    document.getElementById('moves-count').textContent = moves;
    document.getElementById('hints-count').textContent = hintsRemaining;
}

// Handle win condition
function handleWin() {
    clearInterval(timer);
    gameStarted = false;
    gamesWon++;

    const finalTime = document.getElementById('time').textContent;
    const modal = document.getElementById('win-modal');
    document.getElementById('final-time').textContent = finalTime;
    document.getElementById('final-moves').textContent = moves;

    // Check achievements
    checkAchievements(finalTime, moves);

    modal.style.display = 'block';
}

// Check and award achievements
function checkAchievements(finalTime, moves) {
    const [minutes, seconds] = finalTime.split(':').map(Number);
    const totalSeconds = minutes * 60 + seconds;
    
    // Speed Demon Achievement
    if (totalSeconds < 30) {
        unlockAchievement('speed-demon');
    }

    // Perfect Match Achievement
    if (moves === natureEmojis.length) {
        unlockAchievement('perfect-match');
    }

    // Nature Master Achievement
    if (gamesWon >= 5) {
        unlockAchievement('nature-master');
    }
}

// Unlock achievement
function unlockAchievement(achievementId) {
    const achievement = document.getElementById(achievementId);
    if (achievement.classList.contains('locked')) {
        achievement.classList.remove('locked');
        achievement.classList.add('unlocked');
        document.querySelector('.achievement-earned').classList.remove('hidden');
    }
}

// Handle hint feature
function useHint() {
    if (hintsRemaining <= 0 || !gameStarted || flippedCards.length > 0) {
        return;
    }

    hintsRemaining--;
    updateStats();

    // Find an unmatched pair
    const unmatchedCards = cards.filter(card => !card.classList.contains('matched'));
    const values = new Map();
    let matchingPair;

    for (const card of unmatchedCards) {
        const value = card.dataset.value;
        if (values.has(value)) {
            matchingPair = [values.get(value), card];
            break;
        }
        values.set(value, card);
    }

    if (matchingPair) {
        // Briefly reveal the matching pair
        matchingPair.forEach(card => card.classList.add('flipped'));
        setTimeout(() => {
            matchingPair.forEach(card => card.classList.remove('flipped'));
        }, 1000);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    createFallingLeaves();
    initializeGame();

    // Start button
    document.getElementById('start').addEventListener('click', () => {
        initializeGame();
    });

    // Hint button
    document.getElementById('hint').addEventListener('click', useHint);

    // Play again button in win modal
    document.getElementById('play-again').addEventListener('click', () => {
        document.getElementById('win-modal').style.display = 'none';
        initializeGame();
    });

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('win-modal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});