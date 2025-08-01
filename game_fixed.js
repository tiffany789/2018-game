// 2048 Game V2.0 - Fixed Version
console.log('=== 2048 Game Script Starting ===');

// Constants
const GRID_SIZE = 5;

// DOM Elements
let gameContainer, gridContainer, scoreElement, highScoreElement, restartButton, audioToggleButton, voiceDisplay;

// Audio Settings
let audioEnabled = false; // 默认关闭声音
let backgroundMusic = null;

// Game State
let gameBoard = [];
let score = 0;
let best = 0;
let hasWon = false;

// Encouragement phrases for high merges (more emotional and expressive)
const encouragementPhrases = [
    { text: 'Woohoo! Amazing!', emotion: 'excited' },
    { text: 'Oh my gosh! Incredible!', emotion: 'surprised' },
    { text: 'You\'re absolutely crushing it!', emotion: 'enthusiastic' },
    { text: 'Holy cow! That was epic!', emotion: 'amazed' },
    { text: 'Fantastic work, superstar!', emotion: 'proud' },
    { text: 'Boom! You\'re on fire!', emotion: 'energetic' },
    { text: 'Outstanding! Keep it rolling!', emotion: 'encouraging' },
    { text: 'Whoa! That was spectacular!', emotion: 'impressed' },
    { text: 'Yes! You\'re a legend!', emotion: 'celebratory' },
    { text: 'Unbelievable! Pure genius!', emotion: 'admiring' },
    { text: 'Sweet! You\'re unstoppable!', emotion: 'confident' },
    { text: 'Magnificent! Simply brilliant!', emotion: 'delighted' },
    { text: 'Awesome sauce! Keep going!', emotion: 'playful' },
    { text: 'Phenomenal! You rock!', emotion: 'excited' },
    { text: 'Bravo! That was masterful!', emotion: 'appreciative' }
];

// Load high score from localStorage
function loadHighScore() {
    console.log('Loading high score from localStorage...');
    try {
        const savedHighScore = localStorage.getItem('2048-high-score');
        if (savedHighScore) {
            best = parseInt(savedHighScore, 10) || 0;
            console.log('High score loaded:', best);
        } else {
            best = 0;
            console.log('No saved high score found, using default: 0');
        }
        
        // Update display
        if (highScoreElement) {
            highScoreElement.textContent = best;
        }
    } catch (e) {
        console.error('Error loading high score:', e);
        best = 0;
    }
}

// Save high score to localStorage
function saveHighScore() {
    console.log('Saving high score:', best);
    try {
        localStorage.setItem('2048-high-score', best.toString());
        console.log('High score saved successfully');
    } catch (e) {
        console.error('Error saving high score:', e);
    }
}

// Initialize DOM elements
function initDOMElements() {
    console.log('Initializing DOM elements...');
    
    gameContainer = document.querySelector('.game-container');
    gridContainer = document.querySelector('.grid-container');
    scoreElement = document.querySelector('.score');
    highScoreElement = document.querySelector('.high-score');
    restartButton = document.getElementById('restart-button');
    audioToggleButton = document.getElementById('audio-toggle');
    voiceDisplay = document.getElementById('voice-display');
    
    console.log('DOM elements:', {
        gameContainer: !!gameContainer,
        gridContainer: !!gridContainer,
        scoreElement: !!scoreElement,
        highScoreElement: !!highScoreElement,
        restartButton: !!restartButton,
        audioToggleButton: !!audioToggleButton,
        voiceDisplay: !!voiceDisplay
    });
    
    return gameContainer && gridContainer && scoreElement && highScoreElement && restartButton && audioToggleButton && voiceDisplay;
}

// Initialize background music
function initBackgroundMusic() {
    if (backgroundMusic) {
        return backgroundMusic;
    }
    
    try {
        // Create audio element for background music
        backgroundMusic = new Audio('欢快 活泼 愉快 轻松自然 by 蜡笔小嘉-完整版.mp3');
        backgroundMusic.loop = true; // Enable looping
        backgroundMusic.volume = 0.5; // Set initial volume to 50%
        console.log('Background music initialized');
        
        // Add error handling
        backgroundMusic.addEventListener('error', (e) => {
            console.error('Background music error:', e);
        });
        
        // Add load success handling
        backgroundMusic.addEventListener('canplaythrough', () => {
            console.log('Background music loaded successfully');
        });
        
        return backgroundMusic;
    } catch (e) {
        console.warn('Audio not supported:', e);
        backgroundMusic = null;
        return null;
    }
}

// Play background music
function playBackgroundMusic() {
    if (!audioEnabled) {
        console.log('Audio disabled, not playing background music');
        return;
    }
    
    const music = initBackgroundMusic();
    if (!music) {
        console.warn('Background music not available');
        return;
    }
    
    try {
        // Play or resume music
        const playPromise = music.play();
        
        // Handle play promise (required for modern browsers)
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log('Background music playing');
                })
                .catch(error => {
                    // Auto-play was prevented, will need user interaction
                    console.warn('Auto-play prevented, waiting for user interaction:', error);
                });
        }
    } catch (e) {
        console.warn('Failed to play background music:', e);
    }
}

// Pause background music
function pauseBackgroundMusic() {
    if (backgroundMusic) {
        backgroundMusic.pause();
        console.log('Background music paused');
    }
}

// Speak encouragement phrase with enhanced emotion
function speakEncouragement() {
    if (!audioEnabled) {
        console.log('Audio disabled, skipping voice encouragement');
        return;
    }
    
    // Select random encouragement phrase
    const randomIndex = Math.floor(Math.random() * encouragementPhrases.length);
    const phrase = encouragementPhrases[randomIndex];
    
    // Display the phrase in fixed position
    if (voiceDisplay) {
        voiceDisplay.textContent = phrase.text;
        voiceDisplay.classList.add('show');
        
        // Hide after 4 seconds (longer display time)
        setTimeout(() => {
            voiceDisplay.classList.remove('show');
        }, 4000);
    }
    
    // Use speech synthesis with enhanced emotion parameters
    try {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(phrase.text);
            
            // Enhanced voice parameters based on emotion
            switch (phrase.emotion) {
                case 'excited':
                case 'energetic':
                    utterance.rate = 1.2;
                    utterance.pitch = 1.3;
                    utterance.volume = 0.9;
                    break;
                case 'surprised':
                case 'amazed':
                    utterance.rate = 0.9;
                    utterance.pitch = 1.4;
                    utterance.volume = 0.8;
                    break;
                case 'proud':
                case 'confident':
                    utterance.rate = 1.0;
                    utterance.pitch = 1.1;
                    utterance.volume = 0.9;
                    break;
                case 'encouraging':
                case 'celebratory':
                    utterance.rate = 1.1;
                    utterance.pitch = 1.2;
                    utterance.volume = 0.8;
                    break;
                default:
                    utterance.rate = 1.0;
                    utterance.pitch = 1.2;
                    utterance.volume = 0.8;
            }
            
            // Mobile-specific adjustments
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                utterance.rate = Math.max(0.8, utterance.rate - 0.2); // Slower on mobile
                utterance.volume = Math.min(1.0, utterance.volume + 0.1); // Louder on mobile
                
                // Force speech synthesis on mobile
                setTimeout(() => {
                    try {
                        window.speechSynthesis.speak(utterance);
                        console.log('Mobile speech synthesis triggered:', phrase.text);
                    } catch (e) {
                        console.warn('Mobile speech synthesis failed:', e);
                    }
                }, 100);
            } else {
                // Desktop speech synthesis
                window.speechSynthesis.speak(utterance);
                console.log('Desktop speech synthesis triggered:', phrase.text);
            }
            
            // Add event listeners for debugging
            utterance.onstart = () => {
                console.log('Speech started:', phrase.text);
            };
            
            utterance.onend = () => {
                console.log('Speech ended:', phrase.text);
            };
            
            utterance.onerror = (event) => {
                console.error('Speech error:', event.error, phrase.text);
            };
            
        } else {
            console.warn('Speech synthesis not supported in this browser');
        }
    } catch (e) {
        console.error('Error in speech synthesis:', e);
    }
}

// Show visual encouragement display
function showVoiceDisplay(text) {
    if (!voiceDisplay) return;
    
    voiceDisplay.textContent = text;
    voiceDisplay.classList.remove('hide');
    voiceDisplay.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        voiceDisplay.classList.remove('show');
        voiceDisplay.classList.add('hide');
        
        // Clear text after animation
        setTimeout(() => {
            voiceDisplay.textContent = '';
            voiceDisplay.classList.remove('hide');
        }, 500);
    }, 3000);
}

// Toggle audio on/off
function toggleAudio() {
    audioEnabled = !audioEnabled;
    
    if (audioToggleButton) {
        if (audioEnabled) {
            audioToggleButton.textContent = '🔊';
            audioToggleButton.classList.remove('audio-off');
            audioToggleButton.classList.add('audio-on');
            audioToggleButton.title = 'Sound ON - Click to turn off';
            playBackgroundMusic(); // Start playing music when enabled
        } else {
            audioToggleButton.textContent = '🔇';
            audioToggleButton.classList.remove('audio-on');
            audioToggleButton.classList.add('audio-off');
            audioToggleButton.title = 'Sound OFF - Click to turn on';
            pauseBackgroundMusic(); // Pause music when disabled
        }
    }
    
    console.log(`Audio ${audioEnabled ? 'enabled' : 'disabled'}`);
}

// Add a random tile (2 or 4) to an empty cell
function addRandomTile() {
    console.log('Adding random tile...');
    
    // 检查gameBoard是否正确初始化
    if (!gameBoard || !Array.isArray(gameBoard) || gameBoard.length === 0) {
        console.error('ERROR: gameBoard not properly initialized:', gameBoard);
        return false;
    }
    
    const emptyCells = [];
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (gameBoard[i][j] === 0) {
                emptyCells.push({ row: i, col: j });
            }
        }
    }
    
    console.log(`Found ${emptyCells.length} empty cells`);
    console.log('Empty cells:', JSON.stringify(emptyCells));
    
    if (emptyCells.length === 0) {
        console.log('No empty cells available');
        return false;
    }
    
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newValue = Math.random() < 0.9 ? 2 : 4;
    
    console.log(`Adding value ${newValue} at position [${randomCell.row}, ${randomCell.col}]`);
    gameBoard[randomCell.row][randomCell.col] = newValue;
    console.log(`Added tile ${newValue} at [${randomCell.row}, ${randomCell.col}]`);
    console.log('Updated gameBoard:', JSON.stringify(gameBoard));
    
    return true;
}

// Create a tile element
function createTile(value, row, col) {
    console.log(`Creating tile: value=${value}, row=${row}, col=${col}`);
    
    try {
        // 检查参数
        if (value === undefined || row === undefined || col === undefined) {
            console.error('ERROR: Invalid parameters for createTile:', { value, row, col });
            return null;
        }
        
        // 检查gridContainer
        if (!gridContainer) {
            console.error('ERROR: gridContainer is not defined');
            gridContainer = document.querySelector('.grid-container');
            if (!gridContainer) {
                console.error('CRITICAL ERROR: Could not find grid-container even after retry');
                return null;
            }
            console.log('Grid container found on retry');
        }
        
        // 动态计算tile位置，确保在所有设备上100%对齐到grid-cell中央
        function getTileDimensions() {
            // 获取实际的grid-cell尺寸
            const gridCells = document.querySelectorAll('.grid-cell');
            if (gridCells && gridCells.length > 0) {
                // 直接使用实际渲染的grid-cell尺寸
                const cellRect = gridCells[0].getBoundingClientRect();
                const containerRect = gridContainer.getBoundingClientRect();
                
                const tileSize = cellRect.width;
                const gap = 8; // 固定间距
                const padding = 8; // 固定padding
                
                console.log(`Using actual grid-cell dimensions: tileSize=${tileSize}, cellRect:`, cellRect);
                return { tileSize, gap, padding, isMobile: window.innerWidth <= 768 };
            } else {
                // 备用计算方法
                const isMobile = window.innerWidth <= 768;
                if (isMobile) {
                    const containerSize = Math.min(window.innerWidth * 0.9, 400);
                    const tileSize = (containerSize - 16) / 5 - 6.4;
                    console.log(`Fallback mobile dimensions: containerSize=${containerSize}, tileSize=${tileSize}`);
                    return { tileSize, gap: 8, padding: 8, isMobile: true };
                } else {
                    return { tileSize: 76.8, gap: 8, padding: 8, isMobile: false };
                }
            }
        }
        
        const dimensions = getTileDimensions();
        const { tileSize, gap, padding, isMobile } = dimensions;
        
        // 使用动态计算的尺寸进行精确定位
        const finalX = padding + col * (tileSize + gap);
        const finalY = padding + row * (tileSize + gap);
        
        console.log(`Calculated position for [${row}, ${col}] with tileSize=${tileSize}: x=${finalX}, y=${finalY}`);
        
        // 验证位置是否在合理范围内
        const maxX = padding + (GRID_SIZE - 1) * (tileSize + gap);
        const maxY = padding + (GRID_SIZE - 1) * (tileSize + gap);
        
        if (finalX < padding || finalX > maxX || finalY < padding || finalY > maxY) {
            console.warn(`Position out of bounds for [${row}, ${col}]: x=${finalX}, y=${finalY}`);
        }
        
        // 创建tile元素
        const tile = document.createElement('div');
        tile.className = `tile tile-${value}`;
        tile.textContent = value;
        tile.setAttribute('data-value', value);
        tile.setAttribute('data-row', row);
        tile.setAttribute('data-col', col);
        
        // 动态计算字体大小
        const fontSize = isMobile ? Math.max(tileSize / 3, 16) : 28;
        
        // 设置样式 - 使用精确的位置值和优化的视觉效果
        tile.style.cssText = `
            position: absolute !important;
            left: ${finalX}px !important;
            top: ${finalY}px !important;
            width: ${tileSize}px !important;
            height: ${tileSize}px !important;
            background-color: ${getTileColor(value)} !important;
            color: ${value <= 4 ? '#776e65' : '#f9f6f2'} !important;
            border-radius: 6px !important;
            font-size: ${fontSize}px !important;
            font-weight: bold !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            text-align: center !important;
            line-height: 1 !important;
            z-index: 10 !important;
            transition: transform 0.15s ease, opacity 0.15s ease !important;
            box-sizing: border-box !important;
            box-shadow: 0 2px 6px rgba(0,0,0,0.15) !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-font-smoothing: antialiased !important;
            -moz-osx-font-smoothing: grayscale !important;
        `;
        
        // 添加到网格容器
        gridContainer.appendChild(tile);
        console.log('Tile created and added to grid:', tile);
        
        // 强制渲染
        setTimeout(() => {
            console.log('Forcing tile visibility');
            tile.style.opacity = '0';
            tile.offsetHeight; // 触发重排
            tile.style.opacity = '1';
        }, 10);
        
        return tile;
    } catch (e) {
        console.error('ERROR: Failed to create tile:', e);
        return null;
    }
}

// Get tile background color
function getTileColor(value) {
    const colors = {
        2: '#eee4da',
        4: '#ede0c8',
        8: '#f2b179',
        16: '#f59563',
        32: '#f67c5f',
        64: '#f65e3b',
        128: '#edcf72',
        256: '#edcc61',
        512: '#edc850',
        1024: '#edc53f',
        2048: '#edc22e'
    };
    return colors[value] || '#3c3a32';
}

// Update the visual board
function updateBoard() {
    console.log('Updating board display...');
    console.log('Current gameBoard:', JSON.stringify(gameBoard));
    
    // 检查gridContainer是否存在
    if (!gridContainer) {
        console.error('ERROR: gridContainer is not defined');
        return;
    }
    
    // 检查gameBoard是否正确初始化
    if (!gameBoard || !Array.isArray(gameBoard) || gameBoard.length === 0) {
        console.error('ERROR: gameBoard not properly initialized:', gameBoard);
        return;
    }
    
    // Remove all existing tiles
    const existingTiles = gridContainer.querySelectorAll('.tile');
    existingTiles.forEach(tile => tile.remove());
    console.log(`Removed ${existingTiles.length} existing tiles`);
    
    // Create new tiles
    let tileCount = 0;
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (gameBoard[row][col] !== 0) {
                console.log(`Creating tile for value ${gameBoard[row][col]} at [${row}, ${col}]`);
                const tile = createTile(gameBoard[row][col], row, col);
                if (tile) {
                    tileCount++;
                } else {
                    console.error(`Failed to create tile for value ${gameBoard[row][col]} at [${row}, ${col}]`);
                }
            }
        }
    }
    console.log(`Created ${tileCount} new tiles`);
    
    // 强制重绘
    setTimeout(() => {
        console.log('Forcing repaint...');
        gridContainer.style.display = 'none';
        gridContainer.offsetHeight; // 触发重排
        gridContainer.style.display = '';
    }, 50);
}

// Move tiles in a direction
function moveTiles(direction) {
    console.log(`Moving tiles: ${direction}`);
    
    let moved = false;
    const newBoard = JSON.parse(JSON.stringify(gameBoard));
    
    // Process each line based on direction
    for (let i = 0; i < GRID_SIZE; i++) {
        let line = [];
        
        // Extract line based on direction
        if (direction === 'left' || direction === 'right') {
            line = newBoard[i].slice();
        } else {
            for (let j = 0; j < GRID_SIZE; j++) {
                line.push(newBoard[j][i]);
            }
        }
        
        // Reverse line if moving right or down
        if (direction === 'right' || direction === 'down') {
            line.reverse();
        }
        
        // Process line (slide and merge)
        const processedLine = processLine(line);
        
        // Check if line changed
        if (JSON.stringify(line) !== JSON.stringify(processedLine)) {
            moved = true;
        }
        
        // Reverse back if needed
        if (direction === 'right' || direction === 'down') {
            processedLine.reverse();
        }
        
        // Put line back to board
        if (direction === 'left' || direction === 'right') {
            newBoard[i] = processedLine;
        } else {
            for (let j = 0; j < GRID_SIZE; j++) {
                newBoard[j][i] = processedLine[j];
            }
        }
    }
    
    if (moved) {
        console.log('Tiles moved, updating game state');
        gameBoard = newBoard;
        
        // Update score display
        scoreElement.textContent = score;
        console.log('Updated score to:', score);
        
        updateBoard();
        
        // Add new tile
        setTimeout(() => {
            addRandomTile();
            updateBoard();
        }, 150);
    } else {
        console.log('No tiles moved');
    }
}

// Process a line (slide and merge)
function processLine(line) {
    // Remove zeros
    const filtered = line.filter(val => val !== 0);
    
    // Merge adjacent equal values
    for (let i = 0; i < filtered.length - 1; i++) {
        if (filtered[i] === filtered[i + 1]) {
            const mergedValue = filtered[i] * 2;
            filtered[i] = mergedValue;
            score += mergedValue;
            filtered[i + 1] = 0;
            
            console.log(`Merged tiles: ${filtered[i]/2} + ${filtered[i]/2} = ${mergedValue}`);
            
            // Merged tiles notification (no sound effect, using background music instead)
            console.log(`Merged value: ${mergedValue}`);
            
            // Voice encouragement for 128 and above
            if (mergedValue >= 128) {
                console.log(`High value merge detected: ${mergedValue}, playing voice encouragement`);
                setTimeout(() => {
                    speakEncouragement();
                }, 300);
            }
        }
    }
    
    // Remove zeros again
    const merged = filtered.filter(val => val !== 0);
    
    // Fill with zeros
    while (merged.length < GRID_SIZE) {
        merged.push(0);
    }
    
    return merged;
}

// Handle keyboard input
function handleKeyPress(e) {
    console.log('Key pressed:', e.key);
    
    switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            e.preventDefault();
            moveTiles('up');
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            e.preventDefault();
            moveTiles('down');
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            e.preventDefault();
            moveTiles('left');
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            e.preventDefault();
            moveTiles('right');
            break;
    }
}

// Initialize game
function initGame() {
    console.log('Initializing game...');
    
    // 初始化前先检查游戏元素
    if (!gameContainer || !gridContainer || !scoreElement || !highScoreElement || !restartButton) {
        console.error('ERROR: Game elements not properly initialized');
        console.log('Re-initializing DOM elements...');
        if (!initDOMElements()) {
            console.error('CRITICAL ERROR: Failed to initialize game elements');
            alert('Failed to initialize game. Please refresh the page.');
            return;
        }
    }
    
    console.log('Game elements check passed');
    
    // Reset game state
    gameBoard = [];
    score = 0;
    hasWon = false;
    
    console.log('Creating empty game board...');
    // Create empty game board
    for (let i = 0; i < GRID_SIZE; i++) {
        gameBoard[i] = [];
        for (let j = 0; j < GRID_SIZE; j++) {
            gameBoard[i][j] = 0;
        }
    }
    console.log('Empty game board created:', JSON.stringify(gameBoard));
    
    // Load high score from local storage
    loadHighScore();
    
    // Update score display
    scoreElement.textContent = score;
    
    // 清除所有现有的tile
    const existingTiles = document.querySelectorAll('.tile');
    existingTiles.forEach(tile => {
        console.log('Removing existing tile:', tile);
        tile.remove();
    });
    console.log(`Removed ${existingTiles.length} existing tiles`);
    
    // 添加初始随机数字
    console.log('Adding initial random tiles...');
    const added1 = addRandomTile();
    console.log('First random tile added:', added1);
    const added2 = addRandomTile();
    console.log('Second random tile added:', added2);
    
    // 更新游戏板显示
    console.log('Updating board display...');
    updateBoard();
    
    // Initialize and play background music if audio is enabled
    if (audioEnabled) {
        // Start background music with a slight delay to ensure DOM is fully loaded
        setTimeout(() => {
            playBackgroundMusic();
        }, 500);
    }
    
    console.log('Game initialized successfully');
}

// Start the game
function startGame() {
    console.log('Starting 2048 Game V2.0...');
    
    // 确保 DOM 元素初始化
    if (!initDOMElements()) {
        console.error('Failed to initialize DOM elements');
        return;
    }
    
    // 输出 DOM 元素状态以便调试
    console.log('DOM elements:', {
        gameContainer: !!gameContainer,
        gridContainer: !!gridContainer,
        scoreElement: !!scoreElement,
        highScoreElement: !!highScoreElement,
        restartButton: !!restartButton
    });
    
    // 检查网格容器
    if (!gridContainer) {
        console.error('Grid container not found!');
        return;
    }
    
    // Add event listeners
    document.addEventListener('keydown', handleKeyPress);
    
    // 全局触摸事件处理
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    
    // 使用document而非gameArea来确保触摸事件能被捕获
    document.addEventListener('touchstart', function(e) {
        console.log('Touch start detected');
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, false);
    
    document.addEventListener('touchmove', function(e) {
        // 防止页面滚动
        e.preventDefault();
    }, { passive: false });
    
    document.addEventListener('touchend', function(e) {
        console.log('Touch end detected');
        touchEndX = e.changedTouches[0].clientX;
        touchEndY = e.changedTouches[0].clientY;
        handleSwipe();
    }, false);
    
    function handleSwipe() {
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        const minSwipeDistance = 30;
        
        console.log(`Swipe detected: deltaX=${deltaX}, deltaY=${deltaY}`);
        
        if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
            console.log('Swipe too short, ignoring');
            return; // 滑动距离太短，忽略
        }
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // 水平滑动
            if (deltaX > 0) {
                console.log('Swipe RIGHT detected, moving tiles');
                moveTiles('right');
            } else {
                console.log('Swipe LEFT detected, moving tiles');
                moveTiles('left');
            }
        } else {
            // 垂直滑动
            if (deltaY > 0) {
                console.log('Swipe DOWN detected, moving tiles');
                moveTiles('down');
            } else {
                console.log('Swipe UP detected, moving tiles');
                moveTiles('up');
            }
        }
    }
    
    if (restartButton) {
        restartButton.addEventListener('click', () => {
            console.log('Restart button clicked');
            initGame();
        });
    }
    
    if (audioToggleButton) {
        audioToggleButton.addEventListener('click', () => {
            console.log('Audio toggle button clicked');
            toggleAudio();
        });
    }
    
    // 清除所有现有的tile
    const existingTiles = document.querySelectorAll('.tile');
    existingTiles.forEach(tile => {
        console.log('Removing existing tile:', tile);
        tile.remove();
    });
    console.log(`Removed ${existingTiles.length} existing tiles`);
    
    // 延迟初始化游戏，确保 DOM 完全加载
    setTimeout(() => {
        // Initialize game
        initGame();
        console.log('Game started successfully');
    }, 100);
}

// Wait for DOM to load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startGame);
} else {
    startGame();
}

console.log('=== 2048 Game Script Loaded ===');
