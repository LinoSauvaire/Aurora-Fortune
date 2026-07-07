import { ReelManager } from './ReelManager';

export interface SpinResult {
    grid: string[][];
    winningLines: { lineIndex: number; symbols: { reel: number; row: number }[]; symbol: string; payout: number }[];
    totalPayout: number;
}

const PAYLINES: number[][] = [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0],
    [2, 2, 2, 2, 2],
    [0, 1, 2, 1, 0],
    [2, 1, 0, 1, 2],
];

const PAYOUTS: Record<string, { 3: number; 4: number; 5: number }> = {
    Wild:    { 3: 50, 4: 200, 5: 1000 },
    Scatter: { 3: 20, 4: 80,  5: 400 },
    Diamond: { 3: 15, 4: 60,  5: 300 },
    Ruby:    { 3: 12, 4: 50,  5: 250 },
    Coin:    { 3: 10, 4: 40,  5: 200 },
    A:       { 3: 6,  4: 20,  5: 100 },
    K:       { 3: 5,  4: 15,  5: 80 },
    Q:       { 3: 4,  4: 12,  5: 60 },
    J:       { 3: 3,  4: 10,  5: 50 },
    '10':    { 3: 2,  4: 8,   5: 40 },
    '9':     { 3: 2,  4: 6,   5: 30 },
};

export class SpinManager {
    private reelManager: ReelManager;
    private reelStrips: string[][];
    private spinning: boolean = false;

    constructor(reelManager: ReelManager, reelStrips: string[][]) {
        this.reelManager = reelManager;
        this.reelStrips = reelStrips;
    }

    public isSpinning(): boolean { return this.spinning; }

    public async spin(): Promise<SpinResult> {
        if (this.spinning) {
            return { grid: [], winningLines: [], totalPayout: 0 };
        }
        this.spinning = true;

        const reelCount = this.reelManager.getReelCount();
        const rowCount = this.reelManager.getVisibleRows();

        const finalGrid: string[][] = [];
        for (let r = 0; r < reelCount; r++) {
            const strip = this.reelStrips[r % this.reelStrips.length];
            const col: string[] = [];
            for (let row = 0; row < rowCount; row++) {
                col.push(strip[Math.floor(Math.random() * strip.length)]);
            }
            finalGrid.push(col);
        }

        const baseDuration = 1200;
        const stagger = 250;
        const spinPromises: Promise<void>[] = [];
        for (let r = 0; r < reelCount; r++) {
            const duration = baseDuration + r * stagger;
            spinPromises.push(this.reelManager.spinReel(r, finalGrid[r], duration));
        }

        await Promise.all(spinPromises);

        const result = this.evaluateWins(finalGrid);
        this.spinning = false;
        return result;
    }

    private evaluateWins(grid: string[][]): SpinResult {
        const winningLines: SpinResult['winningLines'] = [];
        let totalPayout = 0;

        for (let lineIdx = 0; lineIdx < PAYLINES.length; lineIdx++) {
            const line = PAYLINES[lineIdx];
            const symbols = line.map((row, reel) => ({ reel, row, name: grid[reel][row] }));

            let matchSymbol = symbols[0].name;
            if (matchSymbol === 'Scatter') continue;

            let count = 1;
            for (let i = 1; i < symbols.length; i++) {
                const sym = symbols[i].name;
                if (sym === matchSymbol || sym === 'Wild' || matchSymbol === 'Wild') {
                    if (matchSymbol === 'Wild' && sym !== 'Wild') {
                        matchSymbol = sym;
                    }
                    count++;
                } else {
                    break;
                }
            }

            if (count >= 3) {
                const payout = this.getPayout(matchSymbol, count);
                if (payout > 0) {
                    winningLines.push({
                        lineIndex: lineIdx,
                        symbols: symbols.slice(0, count),
                        symbol: matchSymbol,
                        payout,
                    });
                    totalPayout += payout;
                }
            }
        }

        let scatterCount = 0;
        const scatterPositions: { reel: number; row: number }[] = [];
        for (let r = 0; r < grid.length; r++) {
            for (let row = 0; row < grid[r].length; row++) {
                if (grid[r][row] === 'Scatter') {
                    scatterCount++;
                    scatterPositions.push({ reel: r, row });
                }
            }
        }
        if (scatterCount >= 3) {
            const payout = this.getPayout('Scatter', scatterCount);
            winningLines.push({ lineIndex: -1, symbols: scatterPositions, symbol: 'Scatter', payout });
            totalPayout += payout;
        }

        return { grid, winningLines, totalPayout };
    }

    private getPayout(symbol: string, count: number): number {
        const table = PAYOUTS[symbol];
        if (!table) return 0;
        if (count >= 5) return table[5];
        if (count === 4) return table[4];
        if (count === 3) return table[3];
        return 0;
    }

    public getPaylines(): number[][] { return PAYLINES; }
}
