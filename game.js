class ChessGame {
    constructor() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.moveCount = 0;
        this.capturedPieces = {
            white: [],
            black: []
        };
        this.initializeBoard();
        this.addEventListeners();
    }

    initializeBoard() {
        const boardElement = document.getElementById('chessboard');
        boardElement.innerHTML = ''; // Clear existing board

        // Create 8x8 board
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.classList.add('board-square');
                square.classList.add((row + col) % 2 === 0 ? 'white' : 'black');
                square.dataset.row = row;
                square.dataset.col = col;

                // Place initial pieces
                const piece = this.getPieceAtPosition(row, col);
                if (piece) {
                    this.createPieceElement(square, piece);
                }

                boardElement.appendChild(square);
            }
        }
    }

    getPieceAtPosition(row, col) {
        // Initial piece placement logic
        const pieceOrder = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
        
        if (row === 0) {
            return { type: pieceOrder[col], color: 'black' };
        }
        if (row === 1) {
            return { type: 'pawn', color: 'black' };
        }
        if (row === 6) {
            return { type: 'pawn', color: 'white' };
        }
        if (row === 7) {
            return { type: pieceOrder[col], color: 'white' };
        }
        return null;
    }

    createPieceElement(square, piece) {
        const pieceElement = document.createElement('div');
        pieceElement.classList.add('chess-piece', `${piece.color}-${piece.type}`);
        pieceElement.dataset.type = piece.type;
        pieceElement.dataset.color = piece.color;
        square.appendChild(pieceElement);
    }

    addEventListeners() {
        const boardElement = document.getElementById('chessboard');
        boardElement.addEventListener('click', this.handleSquareClick.bind(this));

        const restartButton = document.getElementById('restart-game');
        restartButton.addEventListener('click', this.restartGame.bind(this));

        const modalRestartButton = document.getElementById('modal-restart');
        modalRestartButton.addEventListener('click', this.restartGame.bind(this));
    }

    handleSquareClick(event) {
        const square = event.target.closest('.board-square');
        if (!square) return;

        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        const pieceElement = square.querySelector('.chess-piece');

        // If no piece was previously selected
        if (!this.selectedPiece) {
            if (pieceElement && pieceElement.dataset.color === this.currentPlayer) {
                this.selectPiece(square, pieceElement);
            }
            return;
        }

        // If a piece was already selected
        if (this.isValidMove(this.selectedPiece, row, col)) {
            this.movePiece(this.selectedPiece, square);
        }

        // Clear selection
        this.clearSelection();
    }

    selectPiece(square, pieceElement) {
        this.selectedPiece = {
            element: pieceElement,
            square: square,
            row: parseInt(square.dataset.row),
            col: parseInt(square.dataset.col)
        };
        square.classList.add('highlight');
        this.showValidMoves();
    }

    showValidMoves() {
        // Placeholder for move validation logic
        const boardElement = document.getElementById('chessboard');
        const squares = boardElement.querySelectorAll('.board-square');
        squares.forEach(square => {
            const row = parseInt(square.dataset.row);
            const col = parseInt(square.dataset.col);
            if (this.isValidMove(this.selectedPiece, row, col)) {
                square.classList.add('valid-move');
            }
        });
    }

    isValidMove(selectedPiece, toRow, toCol) {
        // Basic move validation logic
        // This is a placeholder and should be expanded
        const fromRow = selectedPiece.row;
        const fromCol = selectedPiece.col;
        const piece = selectedPiece.element.dataset;

        // Prevent moving to a square with a piece of the same color
        const targetSquare = document.querySelector(
            `.board-square[data-row="${toRow}"][data-col="${toCol}"]`
        );
        const targetPiece = targetSquare.querySelector('.chess-piece');
        if (targetPiece && targetPiece.dataset.color === piece.color) {
            return false;
        }

        // Implement specific piece movement rules
        switch(piece.type) {
            case 'pawn':
                return this.validatePawnMove(piece.color, fromRow, fromCol, toRow, toCol);
            case 'rook':
                return this.validateRookMove(fromRow, fromCol, toRow, toCol);
            case 'knight':
                return this.validateKnightMove(fromRow, fromCol, toRow, toCol);
            case 'bishop':
                return this.validateBishopMove(fromRow, fromCol, toRow, toCol);
            case 'queen':
                return this.validateQueenMove(fromRow, fromCol, toRow, toCol);
            case 'king':
                return this.validateKingMove(fromRow, fromCol, toRow, toCol);
            default:
                return false;
        }
    }

    movePiece(selectedPiece, targetSquare) {
        const targetPiece = targetSquare.querySelector('.chess-piece');
        
        // Capture piece if exists
        if (targetPiece) {
            this.capturePiece(targetPiece);
            targetSquare.removeChild(targetPiece);
        }

        // Move the piece
        targetSquare.appendChild(selectedPiece.element);
        
        // Update move count and player turn
        this.moveCount++;
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        
        // Update game stats
        this.updateGameStats();
    }

    capturePiece(piece) {
        const color = piece.dataset.color;
        const type = piece.dataset.type;
        this.capturedPieces[color].push({ type, color });
        this.updateCapturedPiecesDisplay();
    }

    updateCapturedPiecesDisplay() {
        const whiteCapturedElement = document.querySelector('#captured-pieces-white .pieces-list');
        const blackCapturedElement = document.querySelector('#captured-pieces-black .pieces-list');
        
        whiteCapturedElement.innerHTML = this.capturedPieces.white
            .map(piece => `<div class="captured-piece ${piece.color}-${piece.type}"></div>`)
            .join('');
        
        blackCapturedElement.innerHTML = this.capturedPieces.black
            .map(piece => `<div class="captured-piece ${piece.color}-${piece.type}"></div>`)
            .join('');
    }

    clearSelection() {
        const boardElement = document.getElementById('chessboard');
        boardElement.querySelectorAll('.highlight, .valid-move').forEach(el => {
            el.classList.remove('highlight', 'valid-move');
        });
        this.selectedPiece = null;
    }

    updateGameStats() {
        const turnElement = document.getElementById('game-turn');
        const moveCountElement = document.getElementById('move-count');
        
        turnElement.textContent = `Current Turn: ${this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1)}`;
        moveCountElement.textContent = `Moves: ${this.moveCount}`;
    }

    restartGame() {
        // Reset game state
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.moveCount = 0;
        this.capturedPieces = {
            white: [],
            black: []
        };

        // Reinitialize board and update displays
        this.initializeBoard();
        this.updateGameStats();
        this.updateCapturedPiecesDisplay();

        // Hide modal if it's open
        const modal = document.getElementById('modal');
        modal.style.display = 'none';
    }

    // Piece movement validation methods (basic implementations)
    validatePawnMove(color, fromRow, fromCol, toRow, toCol) {
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;

        // Basic pawn movement logic
        if (fromCol === toCol) {
            // Move forward one square
            if (toRow === fromRow + direction) {
                return true;
            }
            // First move can be two squares
            if (fromRow === startRow && toRow === fromRow + 2 * direction) {
                return true;
            }
        }
        
        // Capture diagonally
        if (Math.abs(fromCol - toCol) === 1 && toRow === fromRow + direction) {
            const targetSquare = document.querySelector(
                `.board-square[data-row="${toRow}"][data-col="${toCol}"]`
            );
            const targetPiece = targetSquare.querySelector('.chess-piece');
            return targetPiece && targetPiece.dataset.color !== color;
        }

        return false;
    }

    // Add other piece movement validation methods
    validateRookMove(fromRow, fromCol, toRow, toCol) {
        return fromRow === toRow || fromCol === toCol;
    }

    validateKnightMove(fromRow, fromCol, toRow, toCol) {
        const rowDiff = Math.abs(fromRow - toRow);
        const colDiff = Math.abs(fromCol - toCol);
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
    }

    validateBishopMove(fromRow, fromCol, toRow, toCol) {
        return Math.abs(fromRow - toRow) === Math.abs(fromCol - toCol);
    }

    validateQueenMove(fromRow, fromCol, toRow, toCol) {
        return this.validateRookMove(fromRow, fromCol, toRow, toCol) || 
               this.validateBishopMove(fromRow, fromCol, toRow, toCol);
    }

    validateKingMove(fromRow, fromCol, toRow, toCol) {
        const rowDiff = Math.abs(fromRow - toRow);
        const colDiff = Math.abs(fromCol - toCol);
        return rowDiff <= 1 && colDiff <= 1;
    }
}

// Initialize the game when the script loads
document.addEventListener('DOMContentLoaded', () => {
    window.chessGame = new ChessGame();
});

export default ChessGame;