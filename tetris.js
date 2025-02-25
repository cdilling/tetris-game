document.addEventListener('DOMContentLoaded', () => {
    // Game configuration
    const ROWS = 20;
    const COLS = 10;
    const BLOCK_SIZE = 30;
    const EMPTY = 'empty';
    
    // Game state variables
    let score = 0;
    let level = 1;
    let lines = 0;
    let gameOver = false;
    let paused = false;
    let board = [];
    let currentPiece = null;
    let nextPiece = null;
    let holdPiece = null;
    let hasHoldPieceBeenUsed = false;
    let ghostPiece = null;
    let dropStart = 0;
    let dropInterval = 1000; // Initial drop speed
    let gameTimerID = null;
    
    // DOM elements
    const gameBoard = document.getElementById('game-board');
    const nextPieceDisplay = document.getElementById('next-piece');
    const holdPieceDisplay = document.getElementById('hold-piece');
    const scoreDisplay = document.getElementById('score');
    const levelDisplay = document.getElementById('level');
    const linesDisplay = document.getElementById('lines');
    const gameOverScreen = document.getElementById('game-over');
    const finalScoreDisplay = document.getElementById('final-score');
    const restartButton = document.getElementById('restart-button');
    const pauseMenu = document.getElementById('pause-menu');
    const resumeButton = document.getElementById('resume-button');
    
    // Tetromino shapes and colors
    const PIECES = [
        // I-piece
        {
            shape: [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ],
            className: 'piece-I',
            type: 'I'
        },
        // J-piece
        {
            shape: [
                [1, 0, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            className: 'piece-J',
            type: 'J'
        },
        // L-piece
        {
            shape: [
                [0, 0, 1],
                [1, 1, 1],
                [0, 0, 0]
            ],
            className: 'piece-L',
            type: 'L'
        },
        // O-piece
        {
            shape: [
                [1, 1],
                [1, 1]
            ],
            className: 'piece-O',
            type: 'O'
        },
        // S-piece
        {
            shape: [
                [0, 1, 1],
                [1, 1, 0],
                [0, 0, 0]
            ],
            className: 'piece-S',
            type: 'S'
        },
        // T-piece
        {
            shape: [
                [0, 1, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            className: 'piece-T',
            type: 'T'
        },
        // Z-piece
        {
            shape: [
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 0]
            ],
            className: 'piece-Z',
            type: 'Z'
        }
    ];
    
    // Initialize the game
    function init() {
        // Create the game board grid
        createBoard();
        
        // Generate the first pieces
        currentPiece = getRandomPiece();
        nextPiece = getRandomPiece();
        
        // Reset game state
        score = 0;
        level = 1;
        lines = 0;
        gameOver = false;
        paused = false;
        holdPiece = null;
        hasHoldPieceBeenUsed = false;
        
        // Update displays
        updateScore();
        
        // Set up keyboard controls
        document.addEventListener('keydown', handleKeyPress);
        
        // Start the game loop
        dropStart = Date.now();
        gameTimerID = requestAnimationFrame(drop);
        
        // Hide game over screen
        gameOverScreen.classList.add('hidden');
        pauseMenu.classList.add('hidden');
    }
    
    // Create the game board grid
    function createBoard() {
        // Clear existing board
        gameBoard.innerHTML = '';
        
        // Initialize the board array
        board = Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));
        
        // Create the cells in the DOM
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.setAttribute('data-row', r);
                cell.setAttribute('data-col', c);
                gameBoard.appendChild(cell);
            }
        }
        
        // Create mini-boards for next and hold pieces
        createMiniBoard(nextPieceDisplay, 4, 4);
        createMiniBoard(holdPieceDisplay, 4, 4);
    }
    
    // Create a mini board for displaying next/hold pieces
    function createMiniBoard(element, rows, cols) {
        element.innerHTML = '';
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                element.appendChild(cell);
            }
        }
    }
    
    // Get a random piece
    function getRandomPiece() {
        const randomIndex = Math.floor(Math.random() * PIECES.length);
        return {
            ...JSON.parse(JSON.stringify(PIECES[randomIndex])),
            row: 0,
            col: Math.floor((COLS - PIECES[randomIndex].shape[0].length) / 2)
        };
    }
    
    // Draw a piece on the board
    function drawPiece(piece, isGhost = false) {
        if (!piece) return;
        
        const { shape, className, row, col } = piece;
        
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    const cellRow = row + r;
                    const cellCol = col + c;
                    
                    // Only draw if within bounds
                    if (cellRow >= 0 && cellRow < ROWS && cellCol >= 0 && cellCol < COLS) {
                        const cellIndex = cellRow * COLS + cellCol;
                        const cell = gameBoard.children[cellIndex];
                        
                        if (isGhost) {
                            cell.classList.add('ghost');
                        } else {
                            cell.classList.add(className);
                        }
                    }
                }
            }
        }
    }
    
    // Clear a piece from the board
    function clearPiece(piece, isGhost = false) {
        if (!piece) return;
        
        const { shape, className, row, col } = piece;
        
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    const cellRow = row + r;
                    const cellCol = col + c;
                    
                    // Only clear if within bounds
                    if (cellRow >= 0 && cellRow < ROWS && cellCol >= 0 && cellCol < COLS) {
                        const cellIndex = cellRow * COLS + cellCol;
                        const cell = gameBoard.children[cellIndex];
                        
                        if (isGhost) {
                            cell.classList.remove('ghost');
                        } else {
                            cell.classList.remove(className);
                        }
                    }
                }
            }
        }
    }
    
    // Draw a piece in the mini-board (next/hold display)
    function drawMiniPiece(piece, element) {
        if (!piece) {
            // Clear the display
            Array.from(element.children).forEach(cell => {
                cell.className = 'cell';
            });
            return;
        }
        
        // Clear the display first
        Array.from(element.children).forEach(cell => {
            cell.className = 'cell';
        });
        
        const { shape, className } = piece;
        
        // Calculate offset for centering
        const offsetRow = Math.floor((4 - shape.length) / 2);
        const offsetCol = Math.floor((4 - shape[0].length) / 2);
        
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    const cellIndex = (offsetRow + r) * 4 + (offsetCol + c);
                    if (cellIndex >= 0 && cellIndex < element.children.length) {
                        element.children[cellIndex].classList.add(className);
                    }
                }
            }
        }
    }
    
    // Check for collision
    function hasCollision(piece) {
        if (!piece) return false;
        
        const { shape, row, col } = piece;
        
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    const cellRow = row + r;
                    const cellCol = col + c;
                    
                    // Check bounds
                    if (cellRow < 0 || cellRow >= ROWS || cellCol < 0 || cellCol >= COLS) {
                        return true;
                    }
                    
                    // Check if the cell is already filled
                    if (cellRow >= 0 && board[cellRow][cellCol] !== EMPTY) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    // Lock the piece in place
    function lockPiece() {
        const { shape, className, row, col, type } = currentPiece;
        
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    const cellRow = row + r;
                    const cellCol = col + c;
                    
                    // Only lock if within bounds and not in the hidden rows
                    if (cellRow >= 0 && cellRow < ROWS && cellCol >= 0 && cellCol < COLS) {
                        board[cellRow][cellCol] = type;
                        
                        // Also update the cell class permanently
                        const cellIndex = cellRow * COLS + cellCol;
                        const cell = gameBoard.children[cellIndex];
                        cell.classList.add(className);
                    }
                }
            }
        }
        
        // Check for completed lines
        checkLines();
        
        // Get the next piece
        currentPiece = nextPiece;
        nextPiece = getRandomPiece();
        
        // Update the next piece display
        drawMiniPiece(nextPiece, nextPieceDisplay);
        
        // Reset hold piece usage flag
        hasHoldPieceBeenUsed = false;
        
        // Check for game over
        if (hasCollision(currentPiece)) {
            gameOver = true;
            finalScoreDisplay.textContent = score;
            gameOverScreen.classList.remove('hidden');
            cancelAnimationFrame(gameTimerID);
        } else {
            // Calculate and draw ghost piece
            calculateGhostPiece();
            drawGhostPiece();
        }
    }
    
    // Move the current piece
    function movePiece(direction) {
        if (gameOver || paused) return;
        
        // Clear the current piece and ghost piece
        clearPiece(currentPiece);
        clearPiece(ghostPiece, true);
        
        // Copy the current piece position
        const newPiece = { ...currentPiece };
        
        // Update position based on direction
        switch (direction) {
            case 'left':
                newPiece.col -= 1;
                break;
            case 'right':
                newPiece.col += 1;
                break;
            case 'down':
                newPiece.row += 1;
                break;
        }
        
        // Check for collision
        if (!hasCollision(newPiece)) {
            currentPiece = newPiece;
            
            // Recalculate ghost piece position
            calculateGhostPiece();
        } else if (direction === 'down') {
            // If collision detected when moving down, lock the piece
            lockPiece();
        }
        
        // Redraw the piece and ghost piece
        drawPiece(currentPiece);
        drawGhostPiece();
    }
    
    // Rotate the current piece
    function rotatePiece() {
        if (gameOver || paused) return;
        
        // Clear the current piece and ghost piece
        clearPiece(currentPiece);
        clearPiece(ghostPiece, true);
        
        // Create a copy of the current piece
        const newPiece = { ...currentPiece, shape: JSON.parse(JSON.stringify(currentPiece.shape)) };
        
        // Skip rotation for O piece (square)
        if (newPiece.type === 'O') {
            return;
        }
        
        // Rotate the piece matrix (90 degrees clockwise)
        const oldShape = newPiece.shape;
        const rows = oldShape.length;
        const cols = oldShape[0].length;
        
        // Create a new rotated shape
        newPiece.shape = Array.from({ length: cols }, () => Array(rows).fill(0));
        
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                newPiece.shape[c][rows - 1 - r] = oldShape[r][c];
            }
        }
        
        // Wall kick logic - try to adjust position if rotation causes collision
        if (!hasCollision(newPiece)) {
            currentPiece = newPiece;
        } else {
            // Try to shift right
            newPiece.col += 1;
            if (!hasCollision(newPiece)) {
                currentPiece = newPiece;
            } else {
                // Try to shift left
                newPiece.col -= 2;
                if (!hasCollision(newPiece)) {
                    currentPiece = newPiece;
                } else {
                    // Try to shift up (needed for I piece sometimes)
                    newPiece.col += 1;
                    newPiece.row -= 1;
                    if (!hasCollision(newPiece)) {
                        currentPiece = newPiece;
                    }
                    // If all fails, don't rotate
                }
            }
        }
        
        // Recalculate ghost piece position
        calculateGhostPiece();
        
        // Redraw the piece and ghost piece
        drawPiece(currentPiece);
        drawGhostPiece();
    }
    
    // Hard drop the current piece
    function hardDrop() {
        if (gameOver || paused) return;
        
        // Clear the current piece and ghost piece
        clearPiece(currentPiece);
        clearPiece(ghostPiece, true);
        
        // Move the piece down until it collides
        while (!hasCollision({ ...currentPiece, row: currentPiece.row + 1 })) {
            currentPiece.row++;
            
            // Add points for each cell dropped
            score += 2;
        }
        
        // Update score display
        updateScore();
        
        // Lock the piece
        lockPiece();
        
        // Reset drop timer
        dropStart = Date.now();
    }
    
    // Hold the current piece
    function holdCurrentPiece() {
        if (gameOver || paused || hasHoldPieceBeenUsed) return;
        
        // Clear the current piece and ghost piece
        clearPiece(currentPiece);
        clearPiece(ghostPiece, true);
        
        if (holdPiece === null) {
            // If no piece is being held, store current piece and get next piece
            holdPiece = {
                ...JSON.parse(JSON.stringify(PIECES.find(p => p.type === currentPiece.type))),
                row: 0,
                col: Math.floor((COLS - currentPiece.shape[0].length) / 2)
            };
            
            currentPiece = nextPiece;
            nextPiece = getRandomPiece();
            drawMiniPiece(nextPiece, nextPieceDisplay);
        } else {
            // Swap current piece with hold piece
            const tempPiece = {
                ...JSON.parse(JSON.stringify(PIECES.find(p => p.type === currentPiece.type))),
                row: 0,
                col: Math.floor((COLS - currentPiece.shape[0].length) / 2)
            };
            
            currentPiece = {
                ...holdPiece,
                row: 0,
                col: Math.floor((COLS - holdPiece.shape[0].length) / 2)
            };
            
            holdPiece = tempPiece;
        }
        
        // Mark hold piece as used for this turn
        hasHoldPieceBeenUsed = true;
        
        // Update hold piece display
        drawMiniPiece(holdPiece, holdPieceDisplay);
        
        // Recalculate ghost piece position
        calculateGhostPiece();
        
        // Draw the current piece and ghost piece
        drawPiece(currentPiece);
        drawGhostPiece();
    }
    
    // Calculate ghost piece position
    function calculateGhostPiece() {
        if (!currentPiece) return;
        
        // Create a copy of the current piece for the ghost
        ghostPiece = { ...JSON.parse(JSON.stringify(currentPiece)) };
        
        // Move the ghost piece down until it collides
        while (!hasCollision({ ...ghostPiece, row: ghostPiece.row + 1 })) {
            ghostPiece.row++;
        }
    }
    
    // Draw the ghost piece
    function drawGhostPiece() {
        if (ghostPiece && ghostPiece.row !== currentPiece.row) {
            drawPiece(ghostPiece, true);
        }
    }
    
    // Check for completed lines
    function checkLines() {
        let linesCleared = 0;
        
        for (let r = ROWS - 1; r >= 0; r--) {
            // Check if this row is full
            const isRowFull = board[r].every(cell => cell !== EMPTY);
            
            if (isRowFull) {
                linesCleared++;
                
                // Remove this row and add a new empty row at the top
                board.splice(r, 1);
                board.unshift(Array(COLS).fill(EMPTY));
                
                // Move r back one to check the new row that moved down
                r++;
                
                // Update the board display
                updateBoardDisplay();
            }
        }
        
        // Update score based on lines cleared
        if (linesCleared > 0) {
            // Original Nintendo scoring system
            const linePoints = [0, 40, 100, 300, 1200];
            score += linePoints[linesCleared] * level;
            
            // Update lines cleared and check for level up
            lines += linesCleared;
            
            // Level up every 10 lines
            const newLevel = Math.floor(lines / 10) + 1;
            if (newLevel > level) {
                level = newLevel;
                // Speed up the game as level increases
                dropInterval = Math.max(100, 1000 - (level - 1) * 50);
            }
            
            // Update displays
            updateScore();
        }
    }
    
    // Update the board display based on the board array
    function updateBoardDisplay() {
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const cellValue = board[r][c];
                const cellIndex = r * COLS + c;
                const cell = gameBoard.children[cellIndex];
                
                // Remove all piece classes
                PIECES.forEach(piece => {
                    cell.classList.remove(piece.className);
                });
                
                // Add the correct class if the cell is filled
                if (cellValue !== EMPTY) {
                    const pieceClass = PIECES.find(p => p.type === cellValue).className;
                    cell.classList.add(pieceClass);
                }
            }
        }
    }
    
    // Update score, level, and lines displays
    function updateScore() {
        scoreDisplay.textContent = score;
        levelDisplay.textContent = level;
        linesDisplay.textContent = lines;
    }
    
    // Toggle pause state
    function togglePause() {
        if (gameOver) return;
        
        paused = !paused;
        
        if (paused) {
            cancelAnimationFrame(gameTimerID);
            pauseMenu.classList.remove('hidden');
        } else {
            dropStart = Date.now();
            gameTimerID = requestAnimationFrame(drop);
            pauseMenu.classList.add('hidden');
        }
    }
    
    // Game loop - handle piece dropping
    function drop() {
        if (gameOver || paused) return;
        
        const now = Date.now();
        const delta = now - dropStart;
        
        if (delta > dropInterval) {
            movePiece('down');
            dropStart = now;
        }
        
        gameTimerID = requestAnimationFrame(drop);
    }
    
    // Handle keyboard input
    function handleKeyPress(event) {
        if (gameOver) return;
        
        // Handle pause
        if (event.key === 'p' || event.key === 'P') {
            togglePause();
            return;
        }
        
        if (paused) return;
        
        switch (event.key) {
            case 'ArrowLeft':
                movePiece('left');
                break;
            case 'ArrowRight':
                movePiece('right');
                break;
            case 'ArrowDown':
                movePiece('down');
                score += 1; // Add points for soft drop
                updateScore();
                break;
            case 'ArrowUp':
                rotatePiece();
                break;
            case ' ':
                hardDrop();
                break;
            case 'c':
            case 'C':
                holdCurrentPiece();
                break;
        }
    }
    
    // Event listeners for buttons
    restartButton.addEventListener('click', init);
    resumeButton.addEventListener('click', togglePause);
    
    // Start the game
    init();
});
