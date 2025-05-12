// Tactical Realms Chess Analytics

class ChessAnalytics {
    constructor(game) {
        this.game = game;
        this.moves = [];
        this.capturedPieces = {
            white: [],
            black: []
        };
        this.startTime = null;
        this.endTime = null;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // If the game instance is available, hook into its methods
        if (this.game) {
            const originalMovePiece = this.game.movePiece;
            this.game.movePiece = (...args) => {
                const result = originalMovePiece.apply(this.game, args);
                this.recordMove({
                    from: { row: args[0], col: args[1] },
                    to: { row: args[2], col: args[3] },
                    piece: this.game.board[args[2]][args[3]]
                });
                return result;
            };

            const originalEndGame = this.game.endGame;
            this.game.endGame = (winner) => {
                this.recordGameEnd(winner);
                return originalEndGame.call(this.game, winner);
            };
        }

        // Start tracking game time when the game begins
        this.startGame();
    }

    startGame() {
        this.startTime = new Date();
        this.moves = [];
        this.capturedPieces = {
            white: [],
            black: []
        };
    }

    recordMove(moveData) {
        if (!moveData.piece) return;

        this.moves.push({
            piece: moveData.piece.type,
            color: moveData.piece.color,
            from: moveData.from,
            to: moveData.to,
            timestamp: new Date()
        });

        // Check if this was a capture move
        const targetSquare = this.game.board[moveData.to.row][moveData.to.col];
        if (targetSquare && targetSquare.color !== moveData.piece.color) {
            this.recordCapture(targetSquare);
        }
    }

    recordCapture(piece) {
        this.capturedPieces[piece.color === 'white' ? 'black' : 'white'].push(piece);
    }

    recordGameEnd(winner) {
        this.endTime = new Date();
        
        // Generate game summary
        const summary = this.generateGameSummary(winner);
        
        // Optional: Send analytics to server or local storage
        this.saveGameAnalytics(summary);
    }

    generateGameSummary(winner) {
        return {
            winner: winner,
            duration: this.calculateGameDuration(),
            totalMoves: this.moves.length,
            capturedPieces: this.capturedPieces,
            moves: this.moves,
            timestamp: new Date()
        };
    }

    calculateGameDuration() {
        if (!this.startTime || !this.endTime) return 0;
        return (this.endTime - this.startTime) / 1000; // duration in seconds
    }

    saveGameAnalytics(summary) {
        // In a real application, this might send data to a server
        // For now, we'll just log to console and potentially save to localStorage
        console.log('Game Analytics:', summary);
        
        try {
            // Save last 5 game analytics to localStorage
            const savedAnalytics = JSON.parse(localStorage.getItem('chessAnalytics') || '[]');
            savedAnalytics.push(summary);
            
            // Keep only the last 5 game records
            if (savedAnalytics.length > 5) {
                savedAnalytics.shift();
            }
            
            localStorage.setItem('chessAnalytics', JSON.stringify(savedAnalytics));
        } catch (error) {
            console.error('Error saving analytics:', error);
        }
    }

    // Method to retrieve past game analytics
    getPastGameAnalytics() {
        try {
            return JSON.parse(localStorage.getItem('chessAnalytics') || '[]');
        } catch (error) {
            console.error('Error retrieving analytics:', error);
            return [];
        }
    }

    // Generate a detailed game performance report
    generatePerformanceReport() {
        const analytics = this.getPastGameAnalytics();
        
        if (analytics.length === 0) {
            return "No game history available.";
        }

        // Calculate overall statistics
        const totalGames = analytics.length;
        const totalMoves = analytics.reduce((sum, game) => sum + game.totalMoves, 0);
        const averageMoves = Math.round(totalMoves / totalGames);
        const averageDuration = analytics.reduce((sum, game) => sum + game.duration, 0) / totalGames;

        // Analyze wins
        const whiteWins = analytics.filter(game => game.winner === 'White').length;
        const blackWins = analytics.filter(game => game.winner === 'Black').length;

        // Capture analysis
        const totalCaptures = {
            white: analytics.reduce((sum, game) => sum + game.capturedPieces.white.length, 0),
            black: analytics.reduce((sum, game) => sum + game.capturedPieces.black.length, 0)
        };

        return `
Tactical Realms Chess - Performance Report

Total Games Played: ${totalGames}
Average Moves per Game: ${averageMoves}
Average Game Duration: ${averageDuration.toFixed(2)} seconds

Win Statistics:
- White Wins: ${whiteWins} (${((whiteWins / totalGames) * 100).toFixed(2)}%)
- Black Wins: ${blackWins} (${((blackWins / totalGames) * 100).toFixed(2)}%)

Piece Capture Statistics:
- White Pieces Captured: ${totalCaptures.white}
- Black Pieces Captured: ${totalCaptures.black}

Most Recent Game:
- Winner: ${analytics[analytics.length - 1].winner}
- Total Moves: ${analytics[analytics.length - 1].totalMoves}
- Duration: ${analytics[analytics.length - 1].duration.toFixed(2)} seconds
`;
    }

    // Display performance report in the UI
    displayPerformanceReport() {
        const reportContainer = document.createElement('div');
        reportContainer.classList.add('performance-report');
        reportContainer.innerHTML = `
            <h2>Tactical Realms Chess Analytics</h2>
            <pre>${this.generatePerformanceReport()}</pre>
        `;

        // Create a modal to display the report
        const modal = document.createElement('div');
        modal.classList.add('modal');
        modal.innerHTML = `
            <div class="modal-content">
                ${reportContainer.outerHTML}
                <button id="close-analytics-modal">Close</button>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'flex';

        // Add close event listener
        document.getElementById('close-analytics-modal').addEventListener('click', () => {
            modal.style.display = 'none';
            document.body.removeChild(modal);
        });
    }
}

// Initialize analytics when the game is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create a button to view analytics
    const analyticsButton = document.createElement('button');
    analyticsButton.textContent = 'View Game Analytics';
    analyticsButton.classList.add('analytics-btn');
    
    // Add the button to the game controls
    const gameControls = document.querySelector('.game-controls');
    if (gameControls) {
        gameControls.appendChild(analyticsButton);
    }

    // Initialize analytics when game is created
    const initAnalytics = () => {
        if (window.chessGame) {
            window.chessAnalytics = new ChessAnalytics(window.chessGame);
            
            // Add event listener to analytics button
            analyticsButton.addEventListener('click', () => {
                window.chessAnalytics.displayPerformanceReport();
            });
        } else {
            // Retry initialization if game not yet created
            setTimeout(initAnalytics, 100);
        }
    };

    initAnalytics();
});

export default ChessAnalytics;