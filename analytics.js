class GameAnalytics {
    constructor() {
        this.initializeAnalytics();
    }

    initializeAnalytics() {
        // Initialize local storage for game statistics
        if (!localStorage.getItem('chessGameStats')) {
            this.resetAnalytics();
        }
    }

    resetAnalytics() {
        const defaultStats = {
            totalGamesPlayed: 0,
            whiteWins: 0,
            blackWins: 0,
            averageMoves: 0,
            totalMoves: 0
        };
        localStorage.setItem('chessGameStats', JSON.stringify(defaultStats));
    }

    recordGameOutcome(winner, moves) {
        const stats = this.getStats();
        
        stats.totalGamesPlayed++;
        if (winner === 'white') {
            stats.whiteWins++;
        } else {
            stats.blackWins++;
        }

        // Update average moves
        stats.totalMoves += moves;
        stats.averageMoves = Math.round(stats.totalMoves / stats.totalGamesPlayed);

        // Save updated stats
        localStorage.setItem('chessGameStats', JSON.stringify(stats));
    }

    getStats() {
        const statsString = localStorage.getItem('chessGameStats');
        return statsString ? JSON.parse(statsString) : this.resetAnalytics();
    }

    displayStats() {
        const stats = this.getStats();
        console.log('Game Statistics:', stats);
        
        // Optional: Update UI with game statistics
        const statsDisplay = document.getElementById('game-stats');
        if (statsDisplay) {
            statsDisplay.innerHTML = `
                <p>Total Games: ${stats.totalGamesPlayed}</p>
                <p>White Wins: ${stats.whiteWins}</p>
                <p>Black Wins: ${stats.blackWins}</p>
                <p>Avg Moves per Game: ${stats.averageMoves}</p>
            `;
        }
    }
}

// Create a singleton instance of GameAnalytics
window.gameAnalytics = new GameAnalytics();

export default GameAnalytics;