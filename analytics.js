class StratagemGame {
    constructor() {
        this.board = [];
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.resources = {
            white: 100,
            black: 100
        };
        this.turn = 1;
        this.initializeBoard();
        this.setupEventListeners();
    }

    initializeBoard() {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = '';
        this.board = [];

        // Create 8x8 grid
        for (let row = 0; row < 8; row++) {
            this.board[row] = [];
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                // Initial piece placement (simplified chess-like setup)
                if (row === 1) {
                    this.createPiece(cell, 'white', 'pawn');
                } else if (row === 6) {
                    this.createPiece(cell, 'black', 'pawn');
                } else if ((row === 0 || row === 7) && (col === 0 || col === 7)) {
                    this.createPiece(cell, row === 0 ? 'white' : 'black', 'rook');
                } else if ((row === 0 || row === 7) && (col === 1 || col === 6)) {
                    this.createPiece(cell, row === 0 ? 'white' : 'black', 'knight');
                }

                cell.addEventListener('click', () => this.handleCellClick(cell));
                gameBoard.appendChild(cell);
                this.board[row][col] = cell;
            }
        }
    }

    createPiece(cell, color, type) {
        const piece = document.createElement('div');
        piece.classList.add('piece', color, type);
        piece.dataset.color = color;
        piece.dataset.type = type;
        cell.appendChild(piece);
    }

    handleCellClick(cell) {
        const piece = cell.querySelector('.piece');
        
        if (this.selectedPiece) {
            // Try to move the selected piece
            if (this.isValidMove(this.selectedPiece.parentElement, cell)) {
                this.movePiece(this.selectedPiece.parentElement, cell);
                this.selectedPiece = null;
                this.endTurn();
            } else {
                // Deselect if clicked on an invalid move
                this.selectedPiece.parentElement.classList.remove('selected');
                this.selectedPiece = null;
            }
        } else if (piece && piece.dataset.color === this.currentPlayer) {
            // Select the piece
            cell.classList.add('selected');
            this.selectedPiece = piece;
        }
    }

    isValidMove(fromCell, toCell) {
        // Basic movement validation (very simplified)
        const fromRow = parseInt(fromCell.dataset.row);
        const fromCol = parseInt(fromCell.dataset.col);
        const toRow = parseInt(toCell.dataset.row);
        const toCol = parseInt(toCell.dataset.col);

        const piece = fromCell.querySelector('.piece');
        if (!piece) return false;

        // Different basic move rules for different piece types
        switch(piece.dataset.type) {
            case 'pawn':
                return this.validatePawnMove(fromRow, fromCol, toRow, toCol, piece.dataset.color);
            case 'rook':
                return this.validateRookMove(fromRow, fromCol, toRow, toCol);
            case 'knight':
                return this.validateKnightMove(fromRow, fromCol, toRow, toCol);
            default:
                return false;
        }
    }

    validatePawnMove(fromRow, fromCol, toRow, toCol, color) {
        const direction = color === 'white' ? 1 : -1;
        return (toCol === fromCol && toRow === fromRow + direction);
    }

    validateRookMove(fromRow, fromCol, toRow, toCol) {
        return fromRow === toRow || fromCol === toCol;
    }

    validateKnightMove(fromRow, fromCol, toRow, toCol) {
        const rowDiff = Math.abs(fromRow - toRow);
        const colDiff = Math.abs(fromCol - toCol);
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
    }

    movePiece(fromCell, toCell) {
        // Move the piece visually
        const piece = fromCell.querySelector('.piece');
        fromCell.innerHTML = '';
        
        // Remove any existing piece in the destination cell
        toCell.innerHTML = '';
        toCell.appendChild(piece);

        // Record the move in analytics
        gameAnalytics.recordMove(
            piece.dataset.type, 
            `${fromCell.dataset.row},${fromCell.dataset.col}`, 
            `${toCell.dataset.row},${toCell.dataset.col}`
        );

        // Deselect the cell
        fromCell.classList.remove('selected');
    }

    endTurn() {
        // Switch players
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        
        // Increment turn and update UI
        this.turn++;
        document.getElementById('turn-counter').textContent = `Turn: ${this.turn}`;

        // Record turn in analytics
        gameAnalytics.recordTurn();

        // Potentially add AI move here in future
        this.checkGameConditions();
    }

    checkGameConditions() {
        // Placeholder for win/lose conditions
        // Could check for checkmate, resources, etc.
    }

    setupEventListeners() {
        const startGameBtn = document.getElementById('startGameBtn');
        const analyzeBtn = document.getElementById('analyzeBtn');

        startGameBtn.addEventListener('click', () => this.resetGame());
        analyzeBtn.addEventListener('click', () => gameAnalytics.generateAnalyticsReport());
    }

    resetGame() {
        // Reset the board
        this.initializeBoard();
        
        // Reset game state
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.turn = 1;
        
        // Reset resources
        this.resources = {
            white: 100,
            black: 100
        };

        // Reset analytics
        gameAnalytics.resetAnalytics();

        // Update UI
        document.getElementById('turn-counter').textContent = 'Turn: 1';
    }
}

// Initialize the game when the page loads

document.addEventListener('DOMContentLoaded', () => {
    // Create a new game instance
    window.game = new StratagemGame();
});