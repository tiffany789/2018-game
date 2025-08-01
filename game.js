
const gameContainer = document.querySelector('.game-container');
const gridContainer = document.querySelector('.grid-container');
const scoreElement = document.querySelector('.score');
const highScoreElement = document.querySelector('.high-score');
const restartButton = document.getElementById('restart-button');

const gridSize = 5;

// Audio system for sound effects
let audioContext = null;

// Initialize audio context on first user interaction
function initAudioContext() {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('Audio context initialized successfully');
        } catch (e) {
            console.warn('Failed to initialize audio context:', e);
        }
    }
    return audioContext;
}

// Encouragement phrases for high scores
const encouragementPhrases = [
    'Great job!',
    'Nice work!',
    'Keep it up!',
    'You\'ve got this!',
    'Well done!',
    'Awesome!',
    'Perfect!',
    'Excellent!',
    'Keep going!',
    'You\'re on fire!'
];

// Create merge sound effect
function createMergeSound() {
    const context = initAudioContext();
    if (!context) {
        console.warn('Audio context not available for merge sound');
        return;
    }
    
    try {
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        
        oscillator.frequency.setValueAtTime(800, context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, context.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
        
        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.1);
    } catch (e) {
        console.warn('Failed to create merge sound:', e);
    }
}

// Speak encouragement phrase
function speakEncouragement() {
    if ('speechSynthesis' in window) {
        const phrase = encouragementPhrases[Math.floor(Math.random() * encouragementPhrases.length)];
        const utterance = new SpeechSynthesisUtterance(phrase);
        utterance.rate = 1.2;
        utterance.pitch = 1.1;
        utterance.volume = 0.7;
        speechSynthesis.speak(utterance);
    }
}

// Get responsive tile dimensions based on screen size
function getTileDimensions() {
    const screenWidth = window.innerWidth;
    console.log(`Getting tile dimensions for screen width: ${screenWidth}px`);
    
    // Calculate dimensions based on grid size (5x5)
    if (screenWidth <= 380) {
        const dimensions = {
            tileWidth: 58,
            tileGap: 5,
            containerPadding: 5
        };
        console.log('Using small screen dimensions:', dimensions);
        return dimensions;
    } else if (screenWidth <= 520) {
        const dimensions = {
            tileWidth: 62,
            tileGap: 6,
            containerPadding: 6
        };
        console.log('Using medium screen dimensions:', dimensions);
        return dimensions;
    } else {
        const dimensions = {
            tileWidth: 76.8,
            tileGap: 8,
            containerPadding: 8
        };
        console.log('Using large screen dimensions:', dimensions);
        return dimensions;
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
    console.log(`Initializing game with gridSize: ${gridSize}x${gridSize}`);
    gameBoard = Array(gridSize).fill().map(() => Array(gridSize).fill(0));
    
    // Verify gameBoard dimensions
    console.log(`gameBoard dimensions: ${gameBoard.length}x${gameBoard[0].length}`);
    console.log('Initial gameBoard state:', JSON.stringify(gameBoard));
    
    // Add initial tiles
    console.log('Adding initial random tiles');
    const firstTile = addRandomTile();
    console.log('First initial tile added:', firstTile);
    const secondTile = addRandomTile();
    console.log('Second initial tile added:', secondTile);
    
    console.log('gameBoard after adding initial tiles:', JSON.stringify(gameBoard));
    
    score = 0;
    scoreElement.textContent = score;
    hasWon = false;
    
    // Load high score from localStorage
    const savedHighScore = localStorage.getItem('2048-high-score');
    if (savedHighScore) {
        const highScore = parseInt(savedHighScore);
        highScoreElement.textContent = highScore;
        console.log(`Loaded high score from localStorage: ${highScore}`);
    }

    // Verify grid container structure
    const gridRows = gridContainer.querySelectorAll('.grid-row');
    console.log(`Grid container has ${gridRows.length} rows`);
    
    for (let i = 0; i < gridRows.length; i++) {
        const cells = gridRows[i].querySelectorAll('.grid-cell');
        console.log(`Row ${i} has ${cells.length} cells`);
    }

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
    // Verify gameBoard is properly initialized
    if (!gameBoard || !Array.isArray(gameBoard) || gameBoard.length !== gridSize) {
        console.error('Invalid gameBoard structure:', gameBoard);
        return false;
    }
    
    const emptyCells = [];
    for (let i = 0; i < gridSize; i++) {
        if (!Array.isArray(gameBoard[i]) || gameBoard[i].length !== gridSize) {
            console.error(`Invalid row at index ${i}:`, gameBoard[i]);
            continue;
        }
        
        for (let j = 0; j < gridSize; j++) {
            if (gameBoard[i][j] === 0) {
                emptyCells.push({ row: i, col: j });
            }
        }
    }

    console.log(`Found ${emptyCells.length} empty cells for new tile`);
    
    if (emptyCells.length === 0) {
        console.log('No empty cells available for new tile');
        return false;
    }

    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newValue = Math.random() < 0.9 ? 2 : 4;
    console.log(`Adding new tile with value ${newValue} at position [${randomCell.row}, ${randomCell.col}]`);
    
    // Update the gameBoard with the new tile
    gameBoard[randomCell.row][randomCell.col] = newValue;
    
    // Verify the tile was added correctly
    if (gameBoard[randomCell.row][randomCell.col] !== newValue) {
        console.error('Failed to add new tile to gameBoard!');
        return false;
    }
    
    console.log('New gameBoard state after adding tile:', JSON.stringify(gameBoard));
    return true;
}

// Update the visual board with ultra-smooth rendering
function updateBoard() {
    console.log('Updating board with current gameBoard state:', JSON.stringify(gameBoard));
    
    // Use triple requestAnimationFrame for maximum smoothness
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                // Get existing tiles for smooth transition
                const existingTiles = document.querySelectorAll('.tile');
                console.log(`Found ${existingTiles.length} existing tiles on the board`);
                const existingPositions = new Map();
                
                // Record existing tile positions
                existingTiles.forEach(tile => {
                    const value = tile.textContent;
                    const rect = tile.getBoundingClientRect();
                    existingPositions.set(value, { x: rect.left, y: rect.top, element: tile });
                });

                // Fade out existing tiles smoothly
                existingTiles.forEach(tile => {
                    tile.style.transition = 'opacity 0.05s ease-out';
                    tile.style.opacity = '0';
                });

                // Remove old tiles after fade
                setTimeout(() => {
                    existingTiles.forEach(tile => tile.remove());
                    console.log('Removed old tiles');
                }, 60);

                // Create new tiles with smooth appearance
                setTimeout(() => {
                    console.log('Creating new tiles based on gameBoard state');
                    let tileCount = 0;
                    
                    gameBoard.forEach((row, rowIndex) => {
                        row.forEach((value, colIndex) => {
                            if (value !== 0) {
                                console.log(`Creating tile with value ${value} at position [${rowIndex}, ${colIndex}]`);
                                tileCount++;
                                const tile = createTile(value, rowIndex, colIndex);
                                if (tile) {
                                    // Ultra-smooth appearance
                                    tile.style.opacity = '0';
                                    tile.style.transform = 'scale(0.95) translateZ(0)';
                                    
                                    requestAnimationFrame(() => {
                                        tile.style.transition = 'all 0.08s cubic-bezier(0.23, 1, 0.32, 1)';
                                        tile.style.opacity = '1';
                                        tile.style.transform = 'scale(1) translateZ(0)';
                                    });
                                } else {
                                    console.error(`Failed to create tile at [${rowIndex}, ${colIndex}]`);
                                }
                            }
                        });
                    });
                    console.log(`Created ${tileCount} new tiles`);
                }, 30);
            });
        });
    });
}

// Create a tile element with animation
function createTile(value, row, col, direction = null) {
    console.log(`Creating tile with value ${value} at row ${row}, col ${col}`);
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
            console.log(`Positioned tile at [${row}, ${col}] using cell coordinates: x=${x}, y=${y}`);
        } else {
            console.error(`No cell found at row ${row}, col ${col}`);
        }
    } else {
        console.error(`No row found at index ${row}`);
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
        console.log(`Fallback positioning for tile at [${row}, ${col}]: x=${x}, y=${y}`);
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
    
    return tile; // Return the created tile element
}

// Handle tile movement
function moveTiles(direction) {
    console.log('=== moveTiles called with direction:', direction, '===');
    console.log('Current gameBoard state:', JSON.stringify(gameBoard));
    
    let moved = false;
    let merged = false;
    
    // Create temporary board for movement
    const tempBoard = JSON.parse(JSON.stringify(gameBoard));
    console.log('Created temporary board for movement calculations');
    
    // Helper function to move and merge a line
    function processLine(line) {
        console.log('Processing line:', JSON.stringify(line));
        
        // Remove zeros
        const filtered = line.filter(val => val !== 0);
        console.log('After removing zeros:', JSON.stringify(filtered));
        
        const missing = gridSize - filtered.length;
        const zeros = Array(missing).fill(0);
        
        // Check if any movement will occur (non-zero tiles moving to new positions)
        if (JSON.stringify(filtered.concat(zeros)) !== JSON.stringify(line)) {
            moved = true;
            console.log('Movement detected in this line');
        }
        
        // Merge adjacent equal values
        for (let i = 0; i < filtered.length - 1; i++) {
            if (filtered[i] === filtered[i + 1] && filtered[i] !== 0) {
                console.log(`Merging ${filtered[i]} with ${filtered[i+1]} at position ${i}`);
                filtered[i] *= 2;
                score += filtered[i];
                filtered[i + 1] = 0;
                merged = true;
                moved = true; // Ensure moved is set to true when merging occurs
                
                // Play merge sound effect
                try {
                    createMergeSound();
                } catch (e) {
                    console.error('Failed to create merge sound:', e);
                }
                
                // Check if this is the highest tile on the board and speak encouragement
                if (filtered[i] >= 512) {
                    // Find current max value on board
                    let maxValue = 0;
                    for (let r = 0; r < gridSize; r++) {
                        for (let c = 0; c < gridSize; c++) {
                            if (gameBoard[r][c] > maxValue) {
                                maxValue = gameBoard[r][c];
                            }
                        }
                    }
                    
                    // If this merge creates the new highest value, speak encouragement
                    if (filtered[i] >= maxValue) {
                        setTimeout(() => {
                            try {
                                speakEncouragement();
                            } catch (e) {
                                console.error('Failed to speak encouragement:', e);
                            }
                        }, 500);
                    }
                }
            }
        }
        
        // Remove zeros again after merging
        const afterMerge = filtered.filter(val => val !== 0);
        console.log('After merging and removing zeros:', JSON.stringify(afterMerge));
        
        const finalMissing = gridSize - afterMerge.length;
        const finalZeros = Array(finalMissing).fill(0);
        
        const result = afterMerge.concat(finalZeros);
        console.log('Final processed line:', JSON.stringify(result));
        return result;
    }
    
    // Move tiles based on direction
    switch(direction) {
        case 'up':
            for (let col = 0; col < gridSize; col++) {
                const column = [];
                for (let row = 0; row < gridSize; row++) {
                    column.push(tempBoard[row][col]);
                }
                const newColumn = processLine(column);
                for (let row = 0; row < gridSize; row++) {
                    if (tempBoard[row][col] !== newColumn[row]) {
                        moved = true;
                    }
                    tempBoard[row][col] = newColumn[row];
                }
            }
            break;
            
        case 'down':
            for (let col = 0; col < gridSize; col++) {
                const column = [];
                for (let row = 0; row < gridSize; row++) {
                    column.push(tempBoard[row][col]);
                }
                const newColumn = processLine(column.reverse()).reverse();
                for (let row = 0; row < gridSize; row++) {
                    if (tempBoard[row][col] !== newColumn[row]) {
                        moved = true;
                    }
                    tempBoard[row][col] = newColumn[row];
                }
            }
            break;
            
        case 'left':
            for (let row = 0; row < gridSize; row++) {
                const rowData = tempBoard[row].slice();
                const newRow = processLine(rowData);
                for (let col = 0; col < gridSize; col++) {
                    if (tempBoard[row][col] !== newRow[col]) {
                        moved = true;
                    }
                    tempBoard[row][col] = newRow[col];
                }
            }
            break;
            
        case 'right':
            for (let row = 0; row < gridSize; row++) {
                const rowData = tempBoard[row].slice();
                const newRow = processLine(rowData.reverse()).reverse();
                for (let col = 0; col < gridSize; col++) {
                    if (tempBoard[row][col] !== newRow[col]) {
                        moved = true;
                    }
                    tempBoard[row][col] = newRow[col];
                }
            }
            break;
    }
    
    if (moved) {
        console.log('Tiles moved! Direction:', direction);
        // Update the game board with the new state
        gameBoard = JSON.parse(JSON.stringify(tempBoard)); // Deep copy to ensure no reference issues
        console.log('Updated gameBoard after move:', JSON.stringify(gameBoard));
        
        // Update the visual board
        updateBoard();
        
        // Update score display
        scoreElement.textContent = score;
        console.log('Updated score:', score);
        
        // Check and update high score after every move
        const currentHighScore = parseInt(highScoreElement.textContent) || 0;
        if (score > currentHighScore) {
            // Update both high score displays
            highScoreElement.textContent = score;
            bestScoreDisplayElement.textContent = score;
            
            // Update game stats
            gameStats.highScore = score;
            localStorage.setItem('2048-high-score', score.toString());
            saveGameStats();
            
            // Add visual feedback
            highScoreElement.classList.add('updated');
            setTimeout(() => {
                highScoreElement.classList.remove('updated');
            }, 500);
        }
        
        if (merged) {
            // Add new tile after merge animation
            console.log('Merged tiles, adding new tile with delay');
            setTimeout(() => {
                const added = addRandomTile();
                console.log('Added new tile after merge:', added);
                if (added) {
                    console.log('Updating board after adding new tile (merged)');
                    updateBoard();
                }
            }, 200);
        } else {
            console.log('No merges, adding new tile immediately');
            const added = addRandomTile();
            console.log('Added new tile:', added);
            if (added) {
                console.log('Updating board after adding new tile (no merge)');
                updateBoard();
            }
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

// Touch controls for mobile devices with ultra-smooth optimization
let touchStartX = null;
let touchStartY = null;
let touchMoved = false;
let isProcessingTouch = false;

// Prevent default touch behaviors on the game container
gridContainer.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (isProcessingTouch) return;
    
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchMoved = false;
    
    // Add visual feedback for touch start
    gridContainer.style.transform = 'scale(0.98)';
}, { passive: false });

gridContainer.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (isProcessingTouch) return;
    touchMoved = true;
}, { passive: false });

gridContainer.addEventListener('touchend', (e) => {
    e.preventDefault();
    
    // Reset visual feedback immediately
    gridContainer.style.transform = 'scale(1)';
    
    if (isProcessingTouch || !touchMoved || touchStartX === null || touchStartY === null) {
        touchStartX = null;
        touchStartY = null;
        isProcessingTouch = false;
        return;
    }
    
    isProcessingTouch = true;
    
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    
    // Minimum swipe distance (reduced for better responsiveness)
    const minSwipeDistance = 25;
    
    // Use requestAnimationFrame for smooth gesture processing
    requestAnimationFrame(() => {
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
        
        // Reset touch state after processing
        setTimeout(() => {
            touchStartX = null;
            touchStartY = null;
            touchMoved = false;
            isProcessingTouch = false;
        }, 100);
    });
}, { passive: false });

function handleKeyPress(e) {
    console.log('Key pressed:', e.key, 'Code:', e.code);
    
    // Prevent default behavior for arrow keys and WASD
    const validKeys = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'];
    if (validKeys.includes(e.key.toLowerCase())) {
        e.preventDefault();
        console.log('Valid game key detected, calling moveTiles');
    }
    
    switch(e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
            console.log('Moving UP');
            moveTiles('up');
            break;
        case 'arrowdown':
        case 's':
            console.log('Moving DOWN');
            moveTiles('down');
            break;
        case 'arrowleft':
        case 'a':
            console.log('Moving LEFT');
            moveTiles('left');
            break;
        case 'arrowright':
        case 'd':
            console.log('Moving RIGHT');
            moveTiles('right');
            break;
        default:
            console.log('Key not recognized for game movement');
    }
}

// Debug: Check if script is loading
console.log('=== 2048 Game Script Loading ===');
console.log('DOM elements found:');
console.log('gameContainer:', gameContainer);
console.log('gridContainer:', gridContainer);
console.log('scoreElement:', scoreElement);
console.log('highScoreElement:', highScoreElement);
console.log('restartButton:', restartButton);

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM fully loaded, initializing game...');
        initGame();
    });
} else {
    console.log('DOM already loaded, initializing game immediately...');
    initGame();
}
