class GameAnalytics {
    constructor() {
        this.gameStats = {
            turnsTaken: 0,
            movesMade: 0,
            resourcesSpent: 0,
            strategicChoices: [],
            performanceScore: 0
        };
    }

    recordTurn() {
        this.gameStats.turnsTaken++;
    }

    recordMove(piece, from, to) {
        this.gameStats.movesMade++;
        this.gameStats.strategicChoices.push({
            piece: piece,
            from: from,
            to: to,
            timestamp: new Date()
        });
    }

    spendResources(amount) {
        this.gameStats.resourcesSpent += amount;
    }

    calculatePerformanceScore() {
        // Complex performance calculation
        const turnEfficiency = this.gameStats.movesMade / (this.gameStats.turnsTaken || 1);
        const resourceEfficiency = 100 - (this.gameStats.resourcesSpent / 10);
        
        this.gameStats.performanceScore = Math.round(
            (turnEfficiency + resourceEfficiency) / 2
        );

        return this.gameStats.performanceScore;
    }

    generateAnalyticsReport() {
        const report = `
            <h3>Game Performance Analytics</h3>
            <p>Turns Taken: ${this.gameStats.turnsTaken}</p>
            <p>Total Moves: ${this.gameStats.movesMade}</p>
            <p>Resources Spent: ${this.gameStats.resourcesSpent}</p>
            <p>Performance Score: ${this.calculatePerformanceScore()}/100</p>
            <p>Strategic Complexity: ${this.analyzeStrategicDepth()}</p>
        `;
        
        document.getElementById('performanceMetrics').innerHTML = report;
    }

    analyzeStrategicDepth() {
        const uniqueMoves = new Set(this.gameStats.strategicChoices.map(move => 
            `${move.piece}-${move.from}-${move.to}`
        ));
        
        return uniqueMoves.size > 10 ? 'High' : 
               uniqueMoves.size > 5 ? 'Medium' : 'Low';
    }

    resetAnalytics() {
        this.gameStats = {
            turnsTaken: 0,
            movesMade: 0,
            resourcesSpent: 0,
            strategicChoices: [],
            performanceScore: 0
        };
    }
}

// Create a global analytics instance
const gameAnalytics = new GameAnalytics();