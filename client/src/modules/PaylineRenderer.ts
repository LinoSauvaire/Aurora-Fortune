import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { AURORA_THEME } from '../theme/auroraTheme';

export class PaylineRenderer {
    public container: PIXI.Container;
    private lines: PIXI.Graphics[] = [];
    private paylines: number[][];

    constructor(paylines: number[][]) {
        this.container = new PIXI.Container();
        this.container.label = 'paylines';
        this.paylines = paylines;
    }

    /**
     * Draw payline paths (initially hidden).
     */
    public init(reelCount: number, rowCount: number, symbolSize: number, spacing: number, originX: number, originY: number): void {
        this.container.removeChildren();
        this.lines = [];

        for (const line of this.paylines) {
            const g = new PIXI.Graphics();
            const points: number[] = [];
            for (let r = 0; r < reelCount; r++) {
                const x = originX + r * (symbolSize + spacing) + symbolSize / 2;
                const y = originY + (line[r] - (rowCount - 1) / 2) * symbolSize;
                points.push(x, y);
            }
            g.moveTo(points[0], points[1]);
            for (let i = 2; i < points.length; i += 2) {
                g.lineTo(points[i], points[i + 1]);
            }
            g.stroke({ width: 4, color: AURORA_THEME.colors.gold, alpha: 0.8 });
            g.alpha = 0;
            this.lines.push(g);
            this.container.addChild(g);
        }
    }

    public showLine(lineIndex: number, duration: number = 0.3): void {
        if (lineIndex < 0 || lineIndex >= this.lines.length) return;
        const line = this.lines[lineIndex];
        gsap.to(line, { alpha: 1, duration, ease: 'power2.out' });
    }

    public hideLine(lineIndex: number, duration: number = 0.3): void {
        if (lineIndex < 0 || lineIndex >= this.lines.length) return;
        const line = this.lines[lineIndex];
        gsap.to(line, { alpha: 0, duration, ease: 'power2.out' });
    }

    public showAll(duration: number = 0.3): void {
        for (const line of this.lines) {
            gsap.to(line, { alpha: 1, duration });
        }
    }

    public hideAll(duration: number = 0.3): void {
        for (const line of this.lines) {
            gsap.to(line, { alpha: 0, duration });
        }
    }

    public flashLine(lineIndex: number, times: number = 3): void {
        if (lineIndex < 0 || lineIndex >= this.lines.length) return;
        const line = this.lines[lineIndex];
        const tl = gsap.timeline();
        for (let i = 0; i < times; i++) {
            tl.to(line, { alpha: 1, duration: 0.2, ease: 'power2.out' });
            tl.to(line, { alpha: 0, duration: 0.2, ease: 'power2.in' });
        }
    }
}
