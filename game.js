// Tactical Realms Chess Game - game.js

class ChessGame {
    constructor() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.capturedPieces = {
            white: [],
            black: []
        };
        this.gameOver = false;
    }

    // Initialize the chess board with starting positions
    initializeBoard() {
        const board = Array(8).fill().map(() => Array(8).fill(null));
        
        // Set up white pieces
        board[7][0] = { type: 'rook', color: 'white' };
        board[7][1] = { type: 'knight', color: 'white' };
        board[7][2] = { type: 'bishop', color: 'white' };
        board[7][3] = { type: 'queen', color: 'white' };
        board[7][4] = { type: 'king', color: 'white' };
        board[7][5] = { type: 'bishop', color: 'white' };
        board[7][6] = { type: 'knight', color: 'white' };
        board[7][7] = { type: 'rook', color: 'white' };
        
        // White pawns
        for (let i = 0; i < 8; i++) {
            board[6][i] = { type: 'pawn', color: 'white' };
        }

        // Set up black pieces
        board[0][0] = { type: 'rook', color: 'black' };
        board[0][1] = { type: 'knight', color: 'black' };
        board[0][2] = { type: 'bishop', color: 'black' };
        board[0][3] = { type: 'queen', color: 'black' };
        board[0][4] = { type: 'king', color: 'black' };
        board[0][5] = { type: 'bishop', color: 'black' };
        board[0][6] = { type: 'knight', color: 'black' };
        board[0][7] = { type: 'rook', color: 'black' };
        
        // Black pawns
        for (let i = 0; i < 8; i++) {
            board[1][i] = { type: 'pawn', color: 'black' };
        }

        return board;
    }

    // Validate and move a piece
    movePiece(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        
        // Validate move
        if (!piece || piece.color !== this.currentPlayer) {
            return false;
        }

        // Check if move is valid based on piece type
        const isValidMove = this.validateMove(piece, fromRow, fromCol, toRow, toCol);
        
        if (isValidMove) {
            // Check for capturing
            if (this.board[toRow][toCol]) {
                this.capturedPieces[this.currentPlayer].push(this.board[toRow][toCol]);
            }

            // Move the piece
            this.board[toRow][toCol] = piece;
            this.board[fromRow][fromCol] = null;

            // Check for checkmate or game over conditions
            this.checkGameStatus();

            // Switch turns
            this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';

            return true;
        }

        return false;
    }

    // Validate move based on piece type
    validateMove(piece, fromRow, fromCol, toRow, toCol) {
        // Prevent moving to a square with a piece of the same color
        if (this.board[toRow][toCol] && this.board[toRow][toCol].color === piece.color) {
            return false;
        }

        switch (piece.type) {
            case 'pawn':
                return this.validatePawnMove(piece, fromRow, fromCol, toRow, toCol);
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

    // Pawn movement validation
    validatePawnMove(piece, fromRow, fromCol, toRow, toCol) {
        const direction = piece.color === 'white' ? -1 : 1;
        const startRow = piece.color === 'white' ? 6 : 1;

        // Standard forward move
        if (fromCol === toCol && !this.board[toRow][toCol]) {
            // First move can be two squares
            if (fromRow === startRow && toRow === fromRow + 2 * direction) {
                return !this.board[fromRow + direction][fromCol];
            }
            // Normal one-square move
            return toRow === fromRow + direction;
        }

        // Capture diagonally
        if (Math.abs(fromCol - toCol) === 1 && 
            toRow === fromRow + direction && 
            this.board[toRow][toCol] && 
            this.board[toRow][toCol].color !== piece.color) {
            return true;
        }

        return false;
    }

    // Rook movement validation
    validateRookMove(fromRow, fromCol, toRow, toCol) {
        // Must move in same row or same column
        if (fromRow !== toRow && fromCol !== toCol) {
            return false;
        }

        // Check for blocking pieces
        return this.isPathClear(fromRow, fromCol, toRow, toCol);
    }

    // Knight movement validation
    validateKnightMove(fromRow, fromCol, toRow, toCol) {
        const rowDiff = Math.abs(fromRow - toRow);
        const colDiff = Math.abs(fromCol - toCol);
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
    }

    // Bishop movement validation
    validateBishopMove(fromRow, fromCol, toRow, toCol) {
        // Must move diagonally
        if (Math.abs(fromRow - toRow) !== Math.abs(fromCol - toCol)) {
            return false;
        }

        // Check for blocking pieces
        return this.isPathClear(fromRow, fromCol, toRow, toCol);
    }

    // Queen movement validation
    validateQueenMove(fromRow, fromCol, toRow, toCol) {
        // Queen moves like a rook or bishop
        return this.validateRookMove(fromRow, fromCol, toRow, toCol) || 
               this.validateBishopMove(fromRow, fromCol, toRow, toCol);
    }

    // King movement validation
    validateKingMove(fromRow, fromCol, toRow, toCol) {
        const rowDiff = Math.abs(fromRow - toRow);
        const colDiff = Math.abs(fromCol - toCol);
        return rowDiff <= 1 && colDiff <= 1;
    }

    // Check if path between start and end is clear
    isPathClear(fromRow, fromCol, toRow, toCol) {
        const rowStep = fromRow === toRow ? 0 : (toRow > fromRow ? 1 : -1);
        const colStep = fromCol === toCol ? 0 : (toCol > fromCol ? 1 : -1);

        let currentRow = fromRow + rowStep;
        let currentCol = fromCol + colStep;

        while (currentRow !== toRow || currentCol !== toCol) {
            if (this.board[currentRow][currentCol]) {
                return false;
            }
            currentRow += rowStep;
            currentCol += colStep;
        }

        return true;
    }

    // Check game status for checkmate or other end conditions
    checkGameStatus() {
        const kingInCheck = this.isKingInCheck(this.currentPlayer);
        
        if (kingInCheck && !this.canEscapeCheck()) {
            this.gameOver = true;
            console.log(`Checkmate! ${this.currentPlayer === 'white' ? 'Black' : 'White'} wins!`);
        }
    }

    // Find the king's position
    findKing(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.type === 'king' && piece.color === color) {
                    return { row, col };
                }
            }
        }
        return null;
    }

    // Check if the king is in check
    isKingInCheck(color) {
        const king = this.findKing(color);
        if (!king) return false;

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color !== color) {
                    if (this.validateMove(piece, row, col, king.row, king.col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // Check if the current player can escape check
    canEscapeCheck() {
        // This is a simplified check - a full implementation would try all possible moves
        return false;
    }

    // Restart the game
    restartGame() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.capturedPieces = { white: [], black: [] };
        this.gameOver = false;
    }
}

// Export the game for potential module usage
export default ChessGame;