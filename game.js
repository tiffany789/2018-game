
const gameContainer = document.querySelector('.game-container');
const gridContainer = document.querySelector('.grid-container');
const scoreElement = document.querySelector('.score');
const highScoreElement = document.querySelector('.high-score');
const restartButton = document.getElementById('restart-button');
const toggleHistoryBtn = document.getElementById('toggle-history');
const historyContent = document.getElementById('history-content');
const gamesPlayedElement = document.getElementById('games-played');
const bestScoreDisplayElement = document.getElementById('best-score-display');
const averageScoreElement = document.getElementById('average-score');

const gridSize = 4;

// Get responsive tile dimensions based on screen size
function getTileDimensions() {
    const screenWidth = window.innerWidth;
    
    if (screenWidth <= 380) {
        return {
            tileWidth: 62,
            tileGap: 6,
            containerPadding: 6
        };
    } else if (screenWidth <= 520) {
        return {
            tileWidth: 70,
            tileGap: 8,
            containerPadding: 8
        };
    } else {
        return {
            tileWidth: 97.5,
            tileGap: 10,
            containerPadding: 10
        };
    }
}

let score = 0;
let gameBoard = [];
let hasWon = false;
let gameStats = {
    gamesPlayed: 0,
    totalScore: 0,
    highScore: 0
};

// Initialize game
function initGame() {
    gameBoard = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
    addRandomTile();
    addRandomTile();
    
    score = 0;
    scoreElement.textContent = score;
    hasWon = false;
    
    // Load high score from localStorage
    const savedHighScore = localStorage.getItem('2048-high-score');
    if (savedHighScore) {
        highScoreElement.textContent = savedHighScore;
        gameStats.highScore = parseInt(savedHighScore);
    }
    
    // Load game statistics
    loadGameStats();
    updateHistoryDisplay();

    updateBoard();
}

// Load game statistics from localStorage
function loadGameStats() {
    const savedStats = localStorage.getItem('2048-game-stats');
    if (savedStats) {
        gameStats = JSON.parse(savedStats);
    }
}

// Save game statistics to localStorage
function saveGameStats() {
    localStorage.setItem('2048-game-stats', JSON.stringify(gameStats));
}

// Update history display
function updateHistoryDisplay() {
    gamesPlayedElement.textContent = gameStats.gamesPlayed;
    bestScoreDisplayElement.textContent = gameStats.highScore;
    const averageScore = gameStats.gamesPlayed > 0 ? Math.round(gameStats.totalScore / gameStats.gamesPlayed) : 0;
    averageScoreElement.textContent = averageScore;
}

// Record game completion
function recordGameCompletion() {
    gameStats.gamesPlayed++;
    gameStats.totalScore += score;
    if (score > gameStats.highScore) {
        gameStats.highScore = score;
    }
    saveGameStats();
    updateHistoryDisplay();
}

// Add a random tile (2 or 4) to an empty cell
function addRandomTile() {
    const emptyCells = [];
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (gameBoard[i][j] === 0) {
                emptyCells.push({ row: i, col: j });
            }
        }
    }

    if (emptyCells.length === 0) return false;

    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    gameBoard[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
    return true;
}

// Update the visual board
function updateBoard() {
    // Use requestAnimationFrame to ensure smooth rendering
    requestAnimationFrame(() => {
        // Clear existing tiles
        const tiles = document.querySelectorAll('.tile');
        tiles.forEach(tile => tile.remove());

        // Create new tiles
        gameBoard.forEach((row, rowIndex) => {
            row.forEach((value, colIndex) => {
                if (value !== 0) {
                    createTile(value, rowIndex, colIndex);
                }
            });
        });
    });
}

// Create a tile element with animation
function createTile(value, row, col, direction = null) {
    const tile = document.createElement('div');
    tile.className = `tile tile-${value}`;
    tile.textContent = value;

    // 精确像素对齐：查找对应的grid-cell
    const cellRows = gridContainer.querySelectorAll('.grid-row');
    let positioned = false;
    
    if (cellRows[row]) {
        const cells = cellRows[row].querySelectorAll('.grid-cell');
        
        if (cells[col]) {
            const cell = cells[col];
            const containerRect = gridContainer.getBoundingClientRect();
            const cellRect = cell.getBoundingClientRect();
            const x = cellRect.left - containerRect.left;
            const y = cellRect.top - containerRect.top;
            // 直接设置绝对位置
            tile.style.position = 'absolute';
            tile.style.left = x + 'px';
            tile.style.top = y + 'px';
            tile.style.transform = 'none';
            positioned = true;
        }
    }
    if (!positioned) {
        // fallback: 数学定位，保证tile不会丢失
        const dimensions = getTileDimensions();
        const x = dimensions.containerPadding + col * (dimensions.tileWidth + dimensions.tileGap);
        const y = dimensions.containerPadding + row * (dimensions.tileWidth + dimensions.tileGap);
        // 直接设置绝对位置
        tile.style.position = 'absolute';
        tile.style.left = x + 'px';
        tile.style.top = y + 'px';
        tile.style.transform = 'none';
    }
    tile.style.display = 'block'; // 防止被隐藏
    gridContainer.appendChild(tile);

    // Add appropriate animation based on direction
    if (direction) {
        tile.classList.add(`slide-${direction}`);
        setTimeout(() => {
            tile.classList.add('active');
        }, 10);
    } else {
        // Add appear animation for new tiles
        setTimeout(() => {
            tile.classList.add('appear');
            tile.classList.add('active');
        }, 10);
    }

    // Add merge animation if value is doubled
    if (value > 2 && value <= 2048) {
        setTimeout(() => {
            tile.classList.add('merge');
            setTimeout(() => {
                tile.classList.remove('merge');
            }, 200);
        }, 100);
    }
}

// Handle tile movement
function moveTiles(direction) {
    let moved = false;
    let merged = false;
    
    // Create temporary board for movement
    const tempBoard = JSON.parse(JSON.stringify(gameBoard));
    
    // Track which tiles have already merged to prevent double merging
    const mergedTiles = Array(gridSize).fill().map(() => Array(gridSize).fill(false));
    
    // Move tiles based on direction
    switch(direction) {
        case 'up':
            for (let col = 0; col < gridSize; col++) {
                let writePos = 0;
                for (let row = 0; row < gridSize; row++) {
                    if (tempBoard[row][col] !== 0) {
                        if (writePos > 0 && tempBoard[writePos - 1][col] === tempBoard[row][col] && !mergedTiles[writePos - 1][col]) {
                            // Merge with previous tile
                            tempBoard[writePos - 1][col] *= 2;
                            tempBoard[row][col] = 0;
                            const points = tempBoard[writePos - 1][col];
                            score += points;
                            mergedTiles[writePos - 1][col] = true;
                            merged = true;
                            moved = true;
                            
                            // Update score display
                            scoreElement.textContent = score;
                            
                            // Update high score if needed
                            const currentHighScore = parseInt(highScoreElement.textContent) || 0;
                            if (score > currentHighScore) {
                                highScoreElement.textContent = score;
                                localStorage.setItem('2048-high-score', score.toString());
                                
                                // Add visual feedback
                                highScoreElement.classList.add('updated');
                                setTimeout(() => {
                                    highScoreElement.classList.remove('updated');
                                }, 500);
                            }
                        } else {
                            // Move tile to write position
                            if (writePos !== row) {
                                tempBoard[writePos][col] = tempBoard[row][col];
                                tempBoard[row][col] = 0;
                                moved = true;
                            }
                            writePos++;
                        }
                    }
                }
            }
            break;
            
        case 'down':
            for (let col = 0; col < gridSize; col++) {
                let writePos = gridSize - 1;
                for (let row = gridSize - 1; row >= 0; row--) {
                    if (tempBoard[row][col] !== 0) {
                        if (writePos < gridSize - 1 && tempBoard[writePos + 1][col] === tempBoard[row][col] && !mergedTiles[writePos + 1][col]) {
                            // Merge with previous tile
                            tempBoard[writePos + 1][col] *= 2;
                            tempBoard[row][col] = 0;
                            score += tempBoard[writePos + 1][col];
                            mergedTiles[writePos + 1][col] = true;
                            merged = true;
                            moved = true;
                        } else {
                            // Move tile to write position
                            if (writePos !== row) {
                                tempBoard[writePos][col] = tempBoard[row][col];
                                tempBoard[row][col] = 0;
                                moved = true;
                            }
                            writePos--;
                        }
                    }
                }
            }
            break;
            
        case 'left':
            for (let row = 0; row < gridSize; row++) {
                let writePos = 0;
                for (let col = 0; col < gridSize; col++) {
                    if (tempBoard[row][col] !== 0) {
                        if (writePos > 0 && tempBoard[row][writePos - 1] === tempBoard[row][col] && !mergedTiles[row][writePos - 1]) {
                            // Merge with previous tile
                            tempBoard[row][writePos - 1] *= 2;
                            tempBoard[row][col] = 0;
                            score += tempBoard[row][writePos - 1];
                            mergedTiles[row][writePos - 1] = true;
                            merged = true;
                            moved = true;
                        } else {
                            // Move tile to write position
                            if (writePos !== col) {
                                tempBoard[row][writePos] = tempBoard[row][col];
                                tempBoard[row][col] = 0;
                                moved = true;
                            }
                            writePos++;
                        }
                    }
                }
            }
            break;
            
        case 'right':
            for (let row = 0; row < gridSize; row++) {
                let writePos = gridSize - 1;
                for (let col = gridSize - 1; col >= 0; col--) {
                    if (tempBoard[row][col] !== 0) {
                        if (writePos < gridSize - 1 && tempBoard[row][writePos + 1] === tempBoard[row][col] && !mergedTiles[row][writePos + 1]) {
                            // Merge with previous tile
                            tempBoard[row][writePos + 1] *= 2;
                            tempBoard[row][col] = 0;
                            score += tempBoard[row][writePos + 1];
                            mergedTiles[row][writePos + 1] = true;
                            merged = true;
                            moved = true;
                        } else {
                            // Move tile to write position
                            if (writePos !== col) {
                                tempBoard[row][writePos] = tempBoard[row][col];
                                tempBoard[row][col] = 0;
                                moved = true;
                            }
                            writePos--;
                        }
                    }
                }
            }
            break;
    }
    
    if (moved) {
        gameBoard = tempBoard;
        updateBoard();
        scoreElement.textContent = score;
        
        if (merged) {
            // Add new tile after merge animation
            setTimeout(() => addRandomTile(), 200);
        } else {
            addRandomTile();
        }
        
        checkGameOver();
        checkWin();
    }
}

// Check if game is over
function checkGameOver() {
    // First check if there are any empty cells
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (gameBoard[i][j] === 0) return;
        }
    }

    // Check if any adjacent cells can be merged
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize - 1; j++) {
            if (gameBoard[i][j] === gameBoard[i][j + 1]) return;
            if (gameBoard[j][i] === gameBoard[j + 1][i]) return;
        }
    }

    // Show game over message with animation
    const gameMessage = document.createElement('div');
    gameMessage.className = 'game-message';
    gameMessage.innerHTML = `
        <div class="game-message-text">Game Over!</div>
        <button class="retry-button">Try Again</button>
    `;
    gameContainer.appendChild(gameMessage);
    
    // Add fade-in animation
    gameMessage.style.opacity = '0';
    setTimeout(() => {
        gameMessage.style.opacity = '1';
    }, 10);
    
    // Disable further moves
    document.removeEventListener('keydown', handleKeyPress);
    document.removeEventListener('touchstart', handleTouchStart);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
    
    // Add retry button handler
    const retryButton = gameMessage.querySelector('.retry-button');
    retryButton.addEventListener('click', () => {
        gameMessage.remove();
        initGame();
    });
}

// Check if player has won
function checkWin() {
    if (hasWon) return;

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (gameBoard[i][j] >= 2048) {
                // Show win message with animation
                const gameMessage = document.createElement('div');
                gameMessage.className = 'game-message';
                gameMessage.innerHTML = `
                    <div class="game-message-text">You won!</div>
                    <button class="retry-button">New Game</button>
                `;
                gameContainer.appendChild(gameMessage);
                
                // Add celebration animation
                const tiles = document.querySelectorAll('.tile');
                tiles.forEach(tile => {
                    tile.style.transform = `translate(${tile.style.transform}) rotate(360deg)`;
                    tile.style.transition = 'transform 2s ease-in-out';
                });
                
                // Add fade-in animation
                gameMessage.style.opacity = '0';
                setTimeout(() => {
                    gameMessage.style.opacity = '1';
                }, 10);
                
                // Disable further moves
                document.removeEventListener('keydown', handleKeyPress);
                document.removeEventListener('touchstart', handleTouchStart);
                document.removeEventListener('touchmove', handleTouchMove);
                document.removeEventListener('touchend', handleTouchEnd);
                
                // Add retry button handler
                const retryButton = gameMessage.querySelector('.retry-button');
                retryButton.addEventListener('click', () => {
                    gameMessage.remove();
                    initGame();
                });
                
                hasWon = true;
            }
        }
    }
}

// Event listeners
restartButton.addEventListener('click', () => {
    const gameMessage = document.querySelector('.game-message');
    if (gameMessage.style.display === 'block') {
        gameMessage.style.display = 'none';
    }
    // Record game completion before restarting
    if (score > 0) {
        recordGameCompletion();
    }
    initGame();
});

// History panel toggle
toggleHistoryBtn.addEventListener('click', () => {
    historyContent.classList.toggle('collapsed');
    const isCollapsed = historyContent.classList.contains('collapsed');
    toggleHistoryBtn.textContent = isCollapsed ? '📈' : '📊';
});

// Keyboard controls
document.addEventListener('keydown', handleKeyPress);

// Touch controls for mobile devices
let touchStartX = null;
let touchStartY = null;
let touchMoved = false;

// Prevent default touch behaviors on the game container
gridContainer.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchMoved = false;
}, { passive: false });

gridContainer.addEventListener('touchmove', (e) => {
    e.preventDefault();
    touchMoved = true;
}, { passive: false });

gridContainer.addEventListener('touchend', (e) => {
    e.preventDefault();
    
    if (!touchMoved || touchStartX === null || touchStartY === null) {
        touchStartX = null;
        touchStartY = null;
        return;
    }
    
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    
    // Minimum swipe distance
    const minSwipeDistance = 30;
    
    // Determine swipe direction
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > minSwipeDistance) {
        // Horizontal swipe
        if (dx > 0) {
            moveTiles('right');
        } else {
            moveTiles('left');
        }
    } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > minSwipeDistance) {
        // Vertical swipe
        if (dy > 0) {
            moveTiles('down');
        } else {
            moveTiles('up');
        }
    }
    
    // Reset touch state
    touchStartX = null;
    touchStartY = null;
    touchMoved = false;
}, { passive: false });

function handleKeyPress(e) {
    switch(e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
            moveTiles('up');
            break;
        case 'arrowdown':
        case 's':
            moveTiles('down');
            break;
        case 'arrowleft':
        case 'a':
            moveTiles('left');
            break;
        case 'arrowright':
        case 'd':
            moveTiles('right');
            break;
    }
}

// Initialize game
initGame();
