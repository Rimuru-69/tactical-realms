// Analytics tracking for Tactical Realms Chess
class GameAnalytics {
    constructor() {
        this.gameStats = {
            totalGames: 0,
            whiteWins: 0,
            blackWins: 0,
            averageMoves: 0,
            longestGame: 0
        };
        this.loadStats();
    }

    // Save game statistics to local storage
    saveStats() {
        localStorage.setItem('tacticalRealmsStats', JSON.stringify(this.gameStats));
    }

    // Load game statistics from local storage
    loadStats() {
        const savedStats = localStorage.getItem('tacticalRealmsStats');
        if (savedStats) {
            this.gameStats = JSON.parse(savedStats);
        }
    }

    // Track game completion
    trackGameCompletion(winner, moves) {
        this.gameStats.totalGames++;
        
        if (winner === 'white') {
            this.gameStats.whiteWins++;
        } else {
            this.gameStats.blackWins++;
        }

        // Update average moves
        this.gameStats.averageMoves = (
            (this.gameStats.averageMoves * (this.gameStats.totalGames - 1) + moves) / 
            this.gameStats.totalGames
        );

        // Update longest game
        this.gameStats.longestGame = Math.max(this.gameStats.longestGame, moves);

        this.saveStats();
        this.displayStats();
    }

    // Display game statistics (optional - can be expanded)
    displayStats() {
        console.log('Tactical Realms Chess Stats:', this.gameStats);
    }
}

// Initialize analytics when the script loads
const gameAnalytics = new GameAnalytics();