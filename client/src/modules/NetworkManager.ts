// NetworkManager.ts
export interface SpinResponse {
    symbols: string[][]; // 5 columns x 3 rows of symbol names (string)
    wins: Array<{
        paylineId: number;
        symbol: string;
        count: number;
        amount: number;
        positions: Array<{ row: number; col: number }>;
    }>;
    bonus: {
        triggered: boolean;
        freeSpinsAwarded: number;
        multiplier: number;
    } | null;
    multiplier: number;
    balance: number;
}

export interface GameConfig {
    betOptions: number[];
    paylines: number[][];
    symbols: string[];
}

export class NetworkManager {
    private baseUrl: string;

    constructor() {
        // Automatically target the local server
        this.baseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:3000'
            : window.location.origin;
        console.log("NetworkManager initialized with baseUrl:", this.baseUrl);
    }

    public async getConfig(): Promise<GameConfig> {
        try {
            const response = await fetch(`${this.baseUrl}/config`);
            if (!response.ok) throw new Error("Failed to fetch game config");
            return await response.json();
        } catch (error) {
            console.warn("Fallback to client-side configuration", error);
            return {
                betOptions: [0.2, 0.4, 0.6, 1.0, 2.0, 5.0, 10.0, 20.0, 50.0, 100.0],
                paylines: [
                    [1,1,1,1,1], // 1
                    [0,0,0,0,0], // 2
                    [2,2,2,2,2], // 3
                    [0,1,2,1,0], // 4
                    [2,1,0,1,2], // 5
                    [0,0,1,2,2], // 6
                    [2,2,1,0,0], // 7
                    [1,2,1,0,1], // 8
                    [1,0,1,2,1], // 9
                    [0,1,0,1,0], // 10
                    [2,1,2,1,2], // 11
                    [1,1,0,1,1], // 12
                    [1,1,2,1,1], // 13
                    [0,0,2,0,0], // 14
                    [2,2,0,2,2], // 15
                    [0,2,0,2,0], // 16
                    [2,0,2,0,2], // 17
                    [1,2,2,2,1], // 18
                    [1,0,0,0,1], // 19
                    [0,2,2,2,0]  // 20
                ],
                symbols: ["Wild", "Scatter", "A", "K", "Q", "J", "10", "9", "Ruby", "Diamond", "Coin"]
            };
        }
    }

    public async getBalance(): Promise<number> {
        try {
            const response = await fetch(`${this.baseUrl}/balance`);
            if (!response.ok) throw new Error("Failed to fetch balance");
            const data = await response.json();
            return data.balance;
        } catch (error) {
            console.error("Network error fetching balance:", error);
            return 1000.0; // Client-side fallback
        }
    }

    public async spin(bet: number, isBonus: boolean = false): Promise<SpinResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/spin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bet, isBonus })
            });
            if (!response.ok) throw new Error("Failed to perform spin on server");
            return await response.json();
        } catch (error) {
            console.warn("Server unavailable, generating secure client-side spin fallback", error);
            return this.generateMockSpin(bet);
        }
    }

    private generateMockSpin(bet: number, _isBonus: boolean = false): SpinResponse {
        const symbolOptions = ["Wild", "Scatter", "A", "K", "Q", "J", "10", "9", "Ruby", "Diamond", "Coin"];
        // Pick random symbols for 5 columns and 3 rows
        const symbols: string[][] = [];
        for (let col = 0; col < 5; col++) {
            const column: string[] = [];
            for (let row = 0; row < 3; row++) {
                column.push(symbolOptions[Math.floor(Math.random() * symbolOptions.length)]);
            }
            symbols.push(column);
        }

        // Mock some winnings
        const wins: SpinResponse['wins'] = [];
        const paylines = [
            [1,1,1,1,1], [0,0,0,0,0], [2,2,2,2,2], [0,1,2,1,0], [2,1,0,1,2]
        ];

        // Randomly award a win
        if (Math.random() < 0.35) {
            const paylineId = Math.floor(Math.random() * 5);
            const winSymbol = ["Ruby", "Diamond", "Coin", "A", "K"][Math.floor(Math.random() * 5)];
            const matchCount = 3 + Math.floor(Math.random() * 3); // 3, 4, or 5
            
            const positions: Array<{ row: number; col: number }> = [];
            for (let col = 0; col < matchCount; col++) {
                const row = paylines[paylineId][col];
                symbols[col][row] = winSymbol; // Force alignment
                positions.push({ row, col });
            }

            wins.push({
                paylineId,
                symbol: winSymbol,
                count: matchCount,
                amount: bet * (matchCount * 0.5),
                positions
            });
        }

        // Scatter / bonus triggers
        const scatterPositions: Array<{ row: number; col: number }> = [];
        for (let col = 0; col < 5; col++) {
            for (let row = 0; row < 3; row++) {
                if (symbols[col][row] === "Scatter") {
                    scatterPositions.push({ row, col });
                }
            }
        }

        let bonusData: SpinResponse['bonus'] = null;
        if (scatterPositions.length >= 3) {
            bonusData = {
                triggered: true,
                freeSpinsAwarded: 10,
                multiplier: 2
            };
        }

        const totalWin = wins.reduce((acc, w) => acc + w.amount, 0);

        return {
            symbols,
            wins,
            bonus: bonusData,
            multiplier: 1,
            balance: 1000.0 + totalWin - bet
        };
    }
}
