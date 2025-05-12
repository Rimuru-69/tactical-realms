// Tactical Realms Chess Game

class ChessGame {
    constructor() {
        this.board = [];
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.moveHistory = [];
        this.capturedPieces = {
            white: [],
            black: []
        };
        this.initializeBoard();
        this.setupEventListeners();
    }

    initializeBoard() {
        // Clear existing board
        this.board = Array(8).fill().map(() => Array(8).fill(null));

        // Piece types and their initial positions
        const pieceSetup = {
            white: {
                rook: [[0,0], [0,7]],
                knight: [[0,1], [0,6]],
                bishop: [[0,2], [0,5]],
                queen: [[0,3]],
                king: [[0,4]],
                pawn: [[1,0], [1,1], [1,2], [1,3], [1,4], [1,5], [1,6], [1,7]]
            },
            black: {
                rook: [[7,0], [7,7]],
                knight: [[7,1], [7,6]],
                bishop: [[7,2], [7,5]],
                queen: [[7,3]],
                king: [[7,4]],
                pawn: [[6,0], [6,1], [6,2], [6,3], [6,4], [6,5], [6,6], [6,7]]
            }
        };

        // Place pieces on the board
        Object.keys(pieceSetup).forEach(color => {
            Object.keys(pieceSetup[color]).forEach(type => {
                pieceSetup[color][type].forEach(([row, col]) => {
                    this.board[row][col] = {
                        type: type,
                        color: color,
                        hasMoved: false
                    };
                });
            });
        });

        this.renderBoard();
    }

    renderBoard() {
        const boardElement = document.getElementById('chessboard');
        boardElement.innerHTML = '';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.classList.add('square');
                square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
                square.dataset.row = row;
                square.dataset.col = col;

                const piece = this.board[row][col];
                if (piece) {
                    const pieceElement = document.createElement('div');
                    pieceElement.classList.add('piece');
                    pieceElement.classList.add(`${piece.color}-${piece.type}`);
                    square.appendChild(pieceElement);
                }

                square.addEventListener('click', () => this.handleSquareClick(row, col));
                boardElement.appendChild(square);
            }
        }

        this.updateStatusDisplay();
    }

    handleSquareClick(row, col) {
        const clickedPiece = this.board[row][col];
        
        // If no piece selected previously
        if (!this.selectedPiece) {
            if (clickedPiece && clickedPiece.color === this.currentPlayer) {
                this.selectPiece(row, col);
            }
            return;
        }

        // If clicking the same piece, deselect
        if (this.selectedPiece.row === row && this.selectedPiece.col === col) {
            this.deselectPiece();
            return;
        }

        // Attempt to move
        if (this.isValidMove(this.selectedPiece.row, this.selectedPiece.col, row, col)) {
            this.movePiece(
                this.selectedPiece.row, 
                this.selectedPiece.col, 
                row, 
                col
            );
            this.deselectPiece();
            return;
        }

        // If clicking a piece of the same color, select the new piece
        if (clickedPiece && clickedPiece.color === this.currentPlayer) {
            this.selectPiece(row, col);
            return;
        }

        // If click is invalid, deselect
        this.deselectPiece();
    }

    selectPiece(row, col) {
        const piece = this.board[row][col];
        if (!piece || piece.color !== this.currentPlayer) return;

        // Deselect any previously selected piece
        this.deselectPiece();

        // Highlight the selected piece and square
        const squares = document.querySelectorAll('.square');
        squares.forEach(square => {
            if (square.dataset.row == row && square.dataset.col == col) {
                square.classList.add('highlight-move');
            }
        });

        // Store selected piece info
        this.selectedPiece = { 
            piece: piece, 
            row: row, 
            col: col 
        };

        // Highlight possible moves
        this.highlightPossibleMoves(row, col);
    }

    deselectPiece() {
        if (!this.selectedPiece) return;

        // Remove highlights
        const squares = document.querySelectorAll('.square');
        squares.forEach(square => {
            square.classList.remove('highlight-move', 'highlight-capture');
        });

        this.selectedPiece = null;
    }

    highlightPossibleMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return;

        for (let newRow = 0; newRow < 8; newRow++) {
            for (let newCol = 0; newCol < 8; newCol++) {
                if (this.isValidMove(row, col, newRow, newCol)) {
                    const squares = document.querySelectorAll('.square');
                    squares.forEach(square => {
                        if (square.dataset.row == newRow && square.dataset.col == newCol) {
                            const targetPiece = this.board[newRow][newCol];
                            square.classList.add(targetPiece ? 'highlight-capture' : 'highlight-move');
                        }
                    });
                }
            }
        }
    }

    isValidMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        if (!piece) return false;

        // Prevent moving to a square with a piece of the same color
        const targetPiece = this.board[toRow][toCol];
        if (targetPiece && targetPiece.color === piece.color) return false;

        // Piece-specific move validation
        switch (piece.type) {
            case 'pawn':
                return this.isValidPawnMove(piece, fromRow, fromCol, toRow, toCol);
            case 'rook':
                return this.isValidRookMove(fromRow, fromCol, toRow, toCol);
            case 'knight':
                return this.isValidKnightMove(fromRow, fromCol, toRow, toCol);
            case 'bishop':
                return this.isValidBishopMove(fromRow, fromCol, toRow, toCol);
            case 'queen':
                return this.isValidQueenMove(fromRow, fromCol, toRow, toCol);
            case 'king':
                return this.isValidKingMove(fromRow, fromCol, toRow, toCol);
            default:
                return false;
        }
    }

    isValidPawnMove(piece, fromRow, fromCol, toRow, toCol) {
        const direction = piece.color === 'white' ? 1 : -1;
        const targetPiece = this.board[toRow][toCol];

        // Standard forward move
        if (fromCol === toCol) {
            // One square forward
            if (toRow === fromRow + direction && !targetPiece) {
                return true;
            }
            
            // Initial two-square move
            if (!piece.hasMoved && 
                toRow === fromRow + (2 * direction) && 
                !targetPiece && 
                !this.board[fromRow + direction][fromCol]) {
                return true;
            }
        }

        // Diagonal capture
        if (Math.abs(fromCol - toCol) === 1 && 
            toRow === fromRow + direction && 
            targetPiece && 
            targetPiece.color !== piece.color) {
            return true;
        }

        return false;
    }

    isValidRookMove(fromRow, fromCol, toRow, toCol) {
        // Must move in same row or same column
        if (fromRow !== toRow && fromCol !== toCol) return false;

        // Check for pieces blocking the path
        const rowStep = fromRow === toRow ? 0 : (toRow > fromRow ? 1 : -1);
        const colStep = fromCol === toCol ? 0 : (toCol > fromCol ? 1 : -1);

        let checkRow = fromRow + rowStep;
        let checkCol = fromCol + colStep;

        while (checkRow !== toRow || checkCol !== toCol) {
            if (this.board[checkRow][checkCol]) return false;
            checkRow += rowStep;
            checkCol += colStep;
        }

        return true;
    }

    isValidKnightMove(fromRow, fromCol, toRow, toCol) {
        const rowDiff = Math.abs(fromRow - toRow);
        const colDiff = Math.abs(fromCol - toCol);
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
    }

    isValidBishopMove(fromRow, fromCol, toRow, toCol) {
        // Must move diagonally
        if (Math.abs(fromRow - toRow) !== Math.abs(fromCol - toCol)) return false;

        // Check for pieces blocking the path
        const rowStep = toRow > fromRow ? 1 : -1;
        const colStep = toCol > fromCol ? 1 : -1;

        let checkRow = fromRow + rowStep;
        let checkCol = fromCol + colStep;

        while (checkRow !== toRow && checkCol !== toCol) {
            if (this.board[checkRow][checkCol]) return false;
            checkRow += rowStep;
            checkCol += colStep;
        }

        return true;
    }

    isValidQueenMove(fromRow, fromCol, toRow, toCol) {
        // Queen moves like a rook or bishop
        return this.isValidRookMove(fromRow, fromCol, toRow, toCol) || 
               this.isValidBishopMove(fromRow, fromCol, toRow, toCol);
    }

    isValidKingMove(fromRow, fromCol, toRow, toCol) {
        const rowDiff = Math.abs(fromRow - toRow);
        const colDiff = Math.abs(fromCol - toCol);

        // Can move one square in any direction
        return rowDiff <= 1 && colDiff <= 1;
    }

    movePiece(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const targetPiece = this.board[toRow][toCol];

        // Record move for history and undo functionality
        this.moveHistory.push({
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: { ...piece },
            capturedPiece: targetPiece ? { ...targetPiece } : null
        });

        // Handle piece capture
        if (targetPiece) {
            this.capturedPieces[targetPiece.color].push(targetPiece);
            this.updateCapturedPiecesDisplay();
        }

        // Move the piece
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;

        // Mark piece as moved
        piece.hasMoved = true;

        // Switch turns
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';

        // Re-render the board
        this.renderBoard();

        // Check for checkmate or other game-ending conditions
        this.checkGameStatus();
    }

    updateCapturedPiecesDisplay() {
        const whiteCapturedContainer = document.getElementById('white-captured-container');
        const blackCapturedContainer = document.getElementById('black-captured-container');

        // Clear existing captured pieces displays
        whiteCapturedContainer.innerHTML = '';
        blackCapturedContainer.innerHTML = '';

        // Add captured pieces to their respective containers
        this.capturedPieces.white.forEach(piece => {
            const pieceElement = document.createElement('div');
            pieceElement.classList.add('piece', `black-${piece.type}`);
            whiteCapturedContainer.appendChild(pieceElement);
        });

        this.capturedPieces.black.forEach(piece => {
            const pieceElement = document.createElement('div');
            pieceElement.classList.add('piece', `white-${piece.type}`);
            blackCapturedContainer.appendChild(pieceElement);
        });
    }

    checkGameStatus() {
        // Basic implementation of checking for checkmate
        const isInCheck = this.isPlayerInCheck(this.currentPlayer);
        
        if (isInCheck && !this.hasValidMoves(this.currentPlayer)) {
            this.endGame(this.currentPlayer === 'white' ? 'Black' : 'White');
        }

        this.updateStatusDisplay();
    }

    isPlayerInCheck(player) {
        // Find the king's position
        let kingRow = -1, kingCol = -1;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.type === 'king' && piece.color === player) {
                    kingRow = row;
                    kingCol = col;
                    break;
                }
            }
            if (kingRow !== -1) break;
        }

        // Check if any opponent piece can capture the king
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color !== player) {
                    if (this.isValidMove(row, col, kingRow, kingCol)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    hasValidMoves(player) {
        // Check if the player has any valid moves
        for (let fromRow = 0; fromRow < 8; fromRow++) {
            for (let fromCol = 0; fromCol < 8; fromCol++) {
                const piece = this.board[fromRow][fromCol];
                if (piece && piece.color === player) {
                    for (let toRow = 0; toRow < 8; toRow++) {
                        for (let toCol = 0; toCol < 8; toCol++) {
                            if (this.isValidMove(fromRow, fromCol, toRow, toCol)) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    }

    endGame(winner) {
        const modal = document.getElementById('game-over-modal');
        const messageElement = document.getElementById('game-over-message');
        
        messageElement.textContent = `${winner} Wins!`;
        modal.style.display = 'flex';

        // Highlight the checkmate piece
        const squares = document.querySelectorAll('.square');
        squares.forEach(square => {
            const piece = square.querySelector('.piece');
            if (piece) {
                piece.classList.add('checkmate-piece');
            }
        });
    }

    updateStatusDisplay() {
        const turnDisplay = document.querySelector('.player-turn');
        const statusDisplay = document.querySelector('.game-status');

        turnDisplay.textContent = `${this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1)}'s Turn`;
        
        const isInCheck = this.isPlayerInCheck(this.currentPlayer);
        statusDisplay.textContent = isInCheck ? 'Check!' : '';
    }

    setupEventListeners() {
        const restartBtn = document.getElementById('restart-btn');
        const playAgainBtn = document.getElementById('play-again-btn');
        const redoBtn = document.getElementById('redo-btn');
        const gameOverModal = document.getElementById('game-over-modal');

        restartBtn.addEventListener('click', () => this.restartGame());
        playAgainBtn.addEventListener('click', () => {
            gameOverModal.style.display = 'none';
            this.restartGame();
        });

        redoBtn.addEventListener('click', () => this.redoMove());
    }

    restartGame() {
        // Reset game state
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.moveHistory = [];
        this.capturedPieces = {
            white: [],
            black: []
        };

        // Reinitialize the board
        this.initializeBoard();

        // Reset UI elements
        const redoBtn = document.getElementById('redo-btn');
        redoBtn.disabled = true;

        const gameOverModal = document.getElementById('game-over-modal');
        gameOverModal.style.display = 'none';

        // Clear captured pieces display
        const whiteCapturedContainer = document.getElementById('white-captured-container');
        const blackCapturedContainer = document.getElementById('black-captured-container');
        whiteCapturedContainer.innerHTML = '';
        blackCapturedContainer.innerHTML = '';
    }

    redoMove() {
        if (this.moveHistory.length === 0) return;

        const lastMove = this.moveHistory.pop();
        
        // Restore the piece to its original position
        this.board[lastMove.from.row][lastMove.from.col] = lastMove.piece;
        
        // Restore the captured piece if there was one
        if (lastMove.capturedPiece) {
            this.board[lastMove.to.row][lastMove.to.col] = lastMove.capturedPiece;
            // Remove from captured pieces
            const capturedPieces = this.capturedPieces[lastMove.capturedPiece.color];
            const index = capturedPieces.findIndex(p => 
                p.type === lastMove.capturedPiece.type
            );
            if (index !== -1) {
                capturedPieces.splice(index, 1);
            }
        } else {
            this.board[lastMove.to.row][lastMove.to.col] = null;
        }

        // Revert turn
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';

        // Re-render the board
        this.renderBoard();

        // Disable redo button if no more moves to redo
        const redoBtn = document.getElementById('redo-btn');
        redoBtn.disabled = this.moveHistory.length === 0;
    }
}

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chessGame = new ChessGame();
});

export default ChessGame;