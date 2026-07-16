import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { ReelSymbol } from './ReelSymbol';
import { AURORA_THEME } from '../theme/auroraTheme';

export interface ReelConfig {
    index: number;
    x: number;
    y: number;
    symbolSize: number;
    visibleRows: number;
    reelStrip: string[];
    spacing: number;
}

export class ReelManager {
    public container: PIXI.Container;
    private reels: {
        config: ReelConfig;
        container: PIXI.Container;
        mask: PIXI.Graphics;
        symbols: ReelSymbol[];
        spinning: boolean;
    }[] = [];

    private readonly symbolSize: number = AURORA_THEME.layout.symbolSize;
    private readonly spacing: number = AURORA_THEME.layout.reelSpacing;
    private readonly visibleRows: number = AURORA_THEME.layout.rowCount;

    constructor() {
        this.container = new PIXI.Container();
        this.container.label = 'ReelManager';
    }

    public init(reelStrips: string[][], startX: number, startY: number): void {
        const reelCount = reelStrips.length;
        const totalWidth = reelCount * this.symbolSize + (reelCount - 1) * this.spacing;
        const originX = startX - totalWidth / 2 + this.symbolSize / 2;

        for (let i = 0; i < reelCount; i++) {
            const reelContainer = new PIXI.Container();
            reelContainer.label = `reel-${i}`;
            reelContainer.x = originX + i * (this.symbolSize + this.spacing);
            reelContainer.y = startY;

            const mask = new PIXI.Graphics();
            mask.rect(
                -this.symbolSize / 2,
                -this.visibleRows * this.symbolSize / 2,
                this.symbolSize,
                this.visibleRows * this.symbolSize
            );
            mask.fill({ color: 0xffffff });
            // Mask must be added to the stage in PIXI v8
            reelContainer.addChild(mask);
            reelContainer.mask = mask;

            const config: ReelConfig = {
                index: i,
                x: reelContainer.x,
                y: reelContainer.y,
                symbolSize: this.symbolSize,
                visibleRows: this.visibleRows,
                reelStrip: reelStrips[i],
                spacing: this.spacing,
            };

            const totalSlots = this.visibleRows + 4;
            const symbols: ReelSymbol[] = [];
            for (let j = 0; j < totalSlots; j++) {
                const symName = reelStrips[i][Math.floor(Math.random() * reelStrips[i].length)];
                const sym = new ReelSymbol(symName, this.symbolSize);
                const y = (j - totalSlots / 2 + 0.5) * this.symbolSize;
                sym.setPosition(0, y);
                symbols.push(sym);
                reelContainer.addChild(sym.container);
            }

            this.container.addChild(reelContainer);
            this.reels.push({ config, container: reelContainer, mask, symbols, spinning: false });
        }
    }

    public spinReel(reelIndex: number, finalSymbols: string[], duration: number): Promise<void> {
        return new Promise((resolve) => {
            const reel = this.reels[reelIndex];
            if (!reel) { resolve(); return; }
            reel.spinning = true;

            for (const symbol of reel.symbols) {
                symbol.setSpinState(true);
            }

            const strip = reel.config.reelStrip;
            const symHeight = this.symbolSize;
            const spinDistance = symHeight * (20 + reelIndex * 4);
            const scrollSteps = Math.floor(spinDistance / symHeight);

            for (let s = 0; s < scrollSteps; s++) {
                const randSym = strip[Math.floor(Math.random() * strip.length)];
                const recycled = reel.symbols.shift();
                if (recycled) {
                    recycled.updateSymbol(randSym, true);
                    const lastY = reel.symbols.length > 0
                        ? reel.symbols[reel.symbols.length - 1].container.y
                        : 0;
                    recycled.setPosition(0, lastY + symHeight);
                    reel.symbols.push(recycled);
                }
            }

            for (let f = 0; f < finalSymbols.length; f++) {
                const recycled = reel.symbols.shift();
                if (recycled) {
                    recycled.updateSymbol(finalSymbols[f], true);
                    const lastY = reel.symbols.length > 0
                        ? reel.symbols[reel.symbols.length - 1].container.y
                        : 0;
                    recycled.setPosition(0, lastY + symHeight);
                    reel.symbols.push(recycled);
                }
            }

            const startY = reel.container.y;
            const endY = startY - spinDistance;

            gsap.to(reel.container, {
                y: endY,
                duration: duration / 1000,
                ease: 'power3.out',
                onUpdate: () => {
                    const progress = Math.min(Math.max((reel.container.y - endY) / Math.max(spinDistance, 1), 0), 1);
                    const blur = 3 + progress * 5;
                    for (const symbol of reel.symbols) {
                        symbol.setBlur(blur);
                    }
                },
                onComplete: () => {
                    this.snapReel(reel, finalSymbols);
                    for (const symbol of reel.symbols) {
                        symbol.setSpinState(false);
                    }
                    reel.spinning = false;
                    resolve();
                },
            });
        });
    }

    private snapReel(reel: typeof this.reels[number], finalSymbols: string[]): void {
        const totalSlots = reel.symbols.length;
        const centerOffset = Math.floor(totalSlots / 2) - Math.floor(this.visibleRows / 2);

        for (let j = 0; j < totalSlots; j++) {
            const sym = reel.symbols[j];
            const y = (j - totalSlots / 2 + 0.5) * this.symbolSize;
            sym.setPosition(0, y);
            const visibleIndex = j - centerOffset;
            if (visibleIndex >= 0 && visibleIndex < this.visibleRows) {
                sym.updateSymbol(finalSymbols[visibleIndex]);
            } else {
                const randSym = reel.config.reelStrip[Math.floor(Math.random() * reel.config.reelStrip.length)];
                sym.updateSymbol(randSym);
            }
            sym.setBlur(0);
        }
        reel.container.y = reel.config.y;
    }

    public getVisibleSymbols(): string[][] {
        const result: string[][] = [];
        for (const reel of this.reels) {
            const totalSlots = reel.symbols.length;
            const centerOffset = Math.floor(totalSlots / 2) - Math.floor(this.visibleRows / 2);
            const col: string[] = [];
            for (let r = 0; r < this.visibleRows; r++) {
                col.push(reel.symbols[centerOffset + r].getName());
            }
            result.push(col);
        }
        return result;
    }

    public getSymbolAt(reelIndex: number, rowIndex: number): ReelSymbol | null {
        const reel = this.reels[reelIndex];
        if (!reel) return null;
        const totalSlots = reel.symbols.length;
        const centerOffset = Math.floor(totalSlots / 2) - Math.floor(this.visibleRows / 2);
        return reel.symbols[centerOffset + rowIndex] || null;
    }

    public getReelCount(): number { return this.reels.length; }
    public getVisibleRows(): number { return this.visibleRows; }
    public getSymbolSize(): number { return this.symbolSize; }
}
