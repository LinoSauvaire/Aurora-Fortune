// Game.ts — Aurora Fortune
import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { AssetLoader } from './modules/AssetLoader';
import { ReelManager } from './modules/ReelManager';
import { SpinManager, type SpinResult } from './modules/SpinManager';
import { AnimationManager } from './modules/AnimationManager';
import { AudioManager } from './modules/AudioManager';
import { PaylineRenderer } from './modules/PaylineRenderer';
import { UIManager } from './modules/UIManager';
import { BackgroundManager } from './modules/BackgroundManager';
import { ParticleManager } from './modules/ParticleManager';
import { AURORA_THEME } from './theme/auroraTheme';

interface ReelsConfig {
    reels: string[][];
}

export class Game {
    private app: PIXI.Application;
    private assetLoader: AssetLoader;
    private reelManager: ReelManager;
    private spinManager!: SpinManager;
    private animationManager!: AnimationManager;
    private audioManager: AudioManager;
    private paylineRenderer!: PaylineRenderer;
    private uiManager: UIManager;
    private backgroundManager!: BackgroundManager;
    private particleManager!: ParticleManager;
    private characterSprite: PIXI.Sprite | null = null;

    private reelStrips: string[][] = [];
    private balance: number = 1000;
    private bet: number = 10;

    constructor() {
        this.app = new PIXI.Application();
        this.assetLoader = new AssetLoader();
        this.reelManager = new ReelManager();
        this.audioManager = new AudioManager();
        this.uiManager = new UIManager(this.app);
    }

    public async start(): Promise<void> {
        await this.app.init({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: AURORA_THEME.colors.midnight,
            antialias: true,
            preserveDrawingBuffer: true,
        });
        document.body.appendChild(this.app.view);

        // Handle window resize
        window.addEventListener('resize', () => {
            this.app.renderer.resize(window.innerWidth, window.innerHeight);
        });

        // Load all asset bundles
        await this.assetLoader.init('/assets-manifest.json');
        await this.assetLoader.loadBundle('background');
        await this.assetLoader.loadBundle('character');
        await this.assetLoader.loadBundle('symbols');

        // Load reel config
        const reelsResp = await fetch('/configs/reels.json');
        const reelsConfig: ReelsConfig = await reelsResp.json();
        this.reelStrips = reelsConfig.reels;

        // === BACKGROUND ===
        this.backgroundManager = new BackgroundManager(this.app);
        this.backgroundManager.init();
        this.app.stage.addChild(this.backgroundManager.container);

        // === CHARACTER (Aurora on the right side) ===
        this.createCharacter();

        // === REEL FRAME ===
        this.createReelFrame();

        // Init reel manager (5 reels x 3 rows, centered)
        const reelCount = 5;
        const strips = this.reelStrips.slice(0, reelCount);
        const reelCenterX = this.app.screen.width / 2;
        const reelCenterY = this.app.screen.height / 2;
        this.reelManager.init(strips, reelCenterX, reelCenterY);
        this.app.stage.addChild(this.reelManager.container);

        // Spin manager
        this.spinManager = new SpinManager(this.reelManager, strips);

        // Paylines
        this.paylineRenderer = new PaylineRenderer(this.spinManager.getPaylines());
        const symbolSize = this.reelManager.getSymbolSize();
        const spacing = 8;
        const totalWidth = reelCount * symbolSize + (reelCount - 1) * spacing;
        const originX = reelCenterX - totalWidth / 2;
        this.paylineRenderer.init(reelCount, 3, symbolSize, spacing, originX, reelCenterY - symbolSize / 2);
        this.app.stage.addChild(this.paylineRenderer.container);

        // Animation manager
        this.animationManager = new AnimationManager(this.app);

        // === PARTICLES ===
        this.particleManager = new ParticleManager(this.app);
        this.particleManager.startAmbient();
        this.app.stage.addChild(this.particleManager.container);

        // === UI ===
        this.uiManager.init();
        this.uiManager.setBalance(this.balance);
        this.uiManager.setBet(this.bet);
        this.uiManager.onSpin = () => this.handleSpin();
        this.uiManager.onBetUp = () => this.adjustBet(5);
        this.uiManager.onBetDown = () => this.adjustBet(-5);
        this.uiManager.onMute = () => this.toggleMute();
        this.app.stage.addChild(this.uiManager.container);

        // Title
        this.createTitle();

        // Ticker for particle updates
        this.app.ticker.add((delta) => {
            this.particleManager.update(delta.deltaMS as number);
        });

        this.uiManager.showMessage('Press SPIN to play!', 3000);
        console.log('Aurora Fortune started!');
    }

    private createCharacter(): void {
        try {
            const texture = PIXI.Assets.get('aurora');
            if (texture) {
                this.characterSprite = new PIXI.Sprite(texture);
                // Position on the right side
                const targetHeight = this.app.screen.height * 0.7;
                const scale = targetHeight / texture.height;
                this.characterSprite.scale.set(scale);
                this.characterSprite.anchor.set(0.5, 1);
                this.characterSprite.x = this.app.screen.width - 80;
                this.characterSprite.y = this.app.screen.height - 90;
                this.characterSprite.alpha = 0.85;
                this.app.stage.addChild(this.characterSprite);

                // Idle floating animation
                gsap.to(this.characterSprite, {
                    y: this.characterSprite.y - 10,
                    duration: 3,
                    yoyo: true,
                    repeat: -1,
                    ease: 'sine.inOut',
                });
            }
        } catch {
            console.warn('Aurora character texture not found');
        }
    }

    private createReelFrame(): void {
        const reelCount = 5;
        const symbolSize = 130;
        const spacing = 8;
        const totalWidth = reelCount * symbolSize + (reelCount - 1) * spacing;
        const totalHeight = 3 * symbolSize;
        const cx = this.app.screen.width / 2;
        const cy = this.app.screen.height / 2;
        const framePadding = 20;

        const frame = new PIXI.Graphics();
        // Outer frame — dark stone with golden border
        frame.roundRect(
            cx - totalWidth / 2 - framePadding,
            cy - totalHeight / 2 - framePadding,
            totalWidth + framePadding * 2,
            totalHeight + framePadding * 2,
            16
        );
        frame.fill({ color: AURORA_THEME.colors.panelDark, alpha: 0.85 });
        frame.stroke({ width: 4, color: AURORA_THEME.colors.gold, alpha: 0.8 });

        // Inner glow border
        frame.roundRect(
            cx - totalWidth / 2 - framePadding + 4,
            cy - totalHeight / 2 - framePadding + 4,
            totalWidth + framePadding * 2 - 8,
            totalHeight + framePadding * 2 - 8,
            12
        );
        frame.stroke({ width: 2, color: AURORA_THEME.colors.turquoise, alpha: 0.4 });

        // Corner gems
        const cornerPositions = [
            { x: cx - totalWidth / 2 - framePadding, y: cy - totalHeight / 2 - framePadding },
            { x: cx + totalWidth / 2 + framePadding, y: cy - totalHeight / 2 - framePadding },
            { x: cx - totalWidth / 2 - framePadding, y: cy + totalHeight / 2 + framePadding },
            { x: cx + totalWidth / 2 + framePadding, y: cy + totalHeight / 2 + framePadding },
        ];
        for (const pos of cornerPositions) {
            frame.circle(pos.x, pos.y, 10);
            frame.fill({ color: AURORA_THEME.colors.turquoise, alpha: 0.9 });
            frame.circle(pos.x, pos.y, 6);
            frame.fill({ color: AURORA_THEME.colors.iceWhite, alpha: 0.8 });
        }

        this.app.stage.addChild(frame);

        // Pulsing glow on the frame
        gsap.to(frame, {
            alpha: 0.9,
            duration: 2,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
        });
    }

    private createTitle(): void {
        const title = new PIXI.Text({
            text: 'AURORA FORTUNE',
            style: new PIXI.TextStyle({
                fontFamily: 'Arial',
                fontSize: 32,
                fill: AURORA_THEME.colors.gold,
                fontWeight: 'bold',
                stroke: { color: AURORA_THEME.colors.midnight, width: 4 },
                dropShadow: {
                    color: AURORA_THEME.colors.turquoise,
                    blur: 8,
                    distance: 2,
                    angle: 0,
                    alpha: 0.6,
                },
            }),
        });
        title.anchor.set(0.5);
        title.x = this.app.screen.width / 2;
        title.y = 35;
        this.app.stage.addChild(title);

        // Subtle glow pulse
        gsap.to(title, {
            alpha: 0.8,
            duration: 3,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
        });
    }

    private async handleSpin(): Promise<void> {
        if (this.spinManager.isSpinning()) return;
        if (this.balance < this.bet) {
            this.uiManager.showMessage('Insufficient balance!', 2000);
            return;
        }

        this.balance -= this.bet;
        this.uiManager.setBalance(this.balance);
        this.uiManager.setWin(0);
        this.uiManager.setSpinEnabled(false);
        this.paylineRenderer.hideAll();
        this.audioManager.playSpin();

        const result: SpinResult = await this.spinManager.spin();
        this.audioManager.playReelStop();

        if (result.totalPayout > 0) {
            const winAmount = result.totalPayout * (this.bet / 10);
            this.balance += winAmount;
            this.uiManager.setWin(winAmount);
            this.uiManager.setBalance(this.balance);

            // Win animations
            this.animationManager.playWinAnimation(result, (reel, row) =>
                this.reelManager.getSymbolAt(reel, row)
            );

            for (const line of result.winningLines) {
                if (line.lineIndex >= 0) {
                    this.paylineRenderer.showLine(line.lineIndex);
                }
            }

            const cx = this.app.screen.width / 2;
            const cy = this.app.screen.height / 2;

            if (winAmount >= this.bet * 50) {
                // EPIC WIN
                this.audioManager.playBigWin();
                this.animationManager.screenShake(20, 0.6);
                this.particleManager.iceShatter(cx, cy, 40);
                this.particleManager.crystalRain(60, 4);
                this.particleManager.auroraBeam();
                this.uiManager.showMessage(`EPIC WIN! $${winAmount}`, 4000);
            } else if (winAmount >= this.bet * 20) {
                // BIG WIN
                this.audioManager.playBigWin();
                this.animationManager.screenShake(15, 0.5);
                this.particleManager.crystalBurst(cx, cy, 40, 1.5);
                this.particleManager.crystalRain(40, 3);
                this.uiManager.showMessage(`BIG WIN! $${winAmount}`, 3000);
            } else {
                // WIN
                this.audioManager.playWin();
                this.particleManager.crystalBurst(cx, cy, 20, 1);
                this.particleManager.sparkle(cx, cy, 12);
                this.uiManager.showMessage(`WIN! $${winAmount}`, 2000);
            }
        } else {
            this.uiManager.showMessage('No win — spin again!', 1500);
        }

        this.uiManager.setSpinEnabled(true);
    }

    private adjustBet(delta: number): void {
        if (this.spinManager.isSpinning()) return;
        const newBet = Math.max(5, Math.min(100, this.bet + delta));
        this.bet = newBet;
        this.uiManager.setBet(this.bet);
        this.audioManager.playClick();
    }

    private toggleMute(): void {
        const muted = !this.audioManager.isMuted();
        this.audioManager.setMuted(muted);
        this.uiManager.setMuteIcon(muted);
    }
}
