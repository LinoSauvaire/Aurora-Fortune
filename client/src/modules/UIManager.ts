import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { AURORA_THEME } from '../theme/auroraTheme';

export class UIManager {
    public container: PIXI.Container;
    private app: PIXI.Application;

    private balanceText!: PIXI.Text;
    private betText!: PIXI.Text;
    private winText!: PIXI.Text;
    private messageText!: PIXI.Text;
    private spinButton!: PIXI.Container;
    private betUpButton!: PIXI.Container;
    private betDownButton!: PIXI.Container;
    private muteButton!: PIXI.Container;

    private balance: number = 1000;
    private bet: number = 10;

    public onSpin: (() => void) | null = null;
    public onBetUp: (() => void) | null = null;
    public onBetDown: (() => void) | null = null;
    public onMute: (() => void) | null = null;

    constructor(app: PIXI.Application) {
        this.app = app;
        this.container = new PIXI.Container();
        this.container.label = 'ui';
    }

    public init(): void {
        this.createBackground();
        this.createHUD();
        this.createSpinButton();
        this.createBetControls();
        this.createMuteButton();
        this.createMessage();
    }

    private createBackground(): void {
        // Top bar — dark glass panel
        const topBar = new PIXI.Graphics();
        topBar.rect(0, 0, this.app.screen.width, 70);
        topBar.fill({ color: AURORA_THEME.colors.panelDark, alpha: 0.9 });
        topBar.rect(0, 68, this.app.screen.width, 2);
        topBar.fill({ color: AURORA_THEME.colors.turquoise, alpha: 0.5 });
        this.container.addChild(topBar);

        // Bottom bar
        const bottomBar = new PIXI.Graphics();
        bottomBar.rect(0, this.app.screen.height - 90, this.app.screen.width, 90);
        bottomBar.fill({ color: AURORA_THEME.colors.panelDark, alpha: 0.9 });
        bottomBar.rect(0, this.app.screen.height - 90, this.app.screen.width, 2);
        bottomBar.fill({ color: AURORA_THEME.colors.turquoise, alpha: 0.5 });
        this.container.addChild(bottomBar);
    }

    private createHUD(): void {
        const style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 22,
            fill: AURORA_THEME.colors.iceWhite,
            fontWeight: 'bold',
        });
        const labelStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 12,
            fill: AURORA_THEME.colors.turquoise,
        });

        // Balance
        const balLabel = new PIXI.Text({ text: 'BALANCE', style: labelStyle });
        balLabel.x = 30; balLabel.y = 12;
        this.balanceText = new PIXI.Text({ text: `$${this.balance}`, style });
        this.balanceText.x = 30; this.balanceText.y = 30;
        this.container.addChild(balLabel, this.balanceText);

        // Bet
        const betLabel = new PIXI.Text({ text: 'BET', style: labelStyle });
        betLabel.x = 250; betLabel.y = 12;
        this.betText = new PIXI.Text({ text: `$${this.bet}`, style });
        this.betText.x = 250; this.betText.y = 30;
        this.container.addChild(betLabel, this.betText);

        // Win
        const winLabel = new PIXI.Text({ text: 'WIN', style: labelStyle });
        winLabel.x = 400; winLabel.y = 12;
        this.winText = new PIXI.Text({ text: `$0`, style });
        this.winText.x = 400; this.winText.y = 30;
        this.container.addChild(winLabel, this.winText);
    }

    private createSpinButton(): void {
        this.spinButton = new PIXI.Container();
        // Outer glow
        const glow = new PIXI.Graphics();
        glow.circle(0, 0, 58);
        glow.fill({ color: AURORA_THEME.colors.turquoise, alpha: 0.15 });
        this.spinButton.addChild(glow);
        // Main button
        const circle = new PIXI.Graphics();
        circle.circle(0, 0, 50);
        circle.fill({ color: AURORA_THEME.colors.gold });
        circle.stroke({ width: 4, color: AURORA_THEME.colors.iceWhite, alpha: 0.9 });
        this.spinButton.addChild(circle);
        // Inner gradient effect
        const inner = new PIXI.Graphics();
        inner.circle(0, 0, 42);
        inner.fill({ color: AURORA_THEME.colors.brightGold, alpha: 0.3 });
        this.spinButton.addChild(inner);

        const label = new PIXI.Text({
            text: 'SPIN',
            style: new PIXI.TextStyle({ fontFamily: 'Arial', fontSize: 20, fill: AURORA_THEME.colors.midnight, fontWeight: 'bold' }),
        });
        label.anchor.set(0.5);
        this.spinButton.addChild(label);

        this.spinButton.x = this.app.screen.width / 2;
        this.spinButton.y = this.app.screen.height - 45;
        this.spinButton.eventMode = 'static';
        this.spinButton.cursor = 'pointer';
        this.spinButton.on('pointerdown', () => {
            gsap.to(this.spinButton.scale, { x: 0.92, y: 0.92, duration: 0.1, yoyo: true, repeat: 1 });
            this.onSpin?.();
        });
        // Permanent rotation glow
        gsap.to(glow, {
            alpha: 0.3,
            duration: 1.5,
            yoyo: true,
            repeat: -1,
            ease: 'sine.inOut',
        });
        this.container.addChild(this.spinButton);
    }

    private createBetControls(): void {
        this.betDownButton = this.makeSquareButton('-', AURORA_THEME.colors.deepBlue);
        this.betDownButton.x = this.app.screen.width / 2 - 130;
        this.betDownButton.y = this.app.screen.height - 45;
        this.betDownButton.eventMode = 'static';
        this.betDownButton.cursor = 'pointer';
        this.betDownButton.on('pointerdown', () => this.onBetDown?.());
        this.container.addChild(this.betDownButton);

        this.betUpButton = this.makeSquareButton('+', AURORA_THEME.colors.emerald);
        this.betUpButton.x = this.app.screen.width / 2 + 130;
        this.betUpButton.y = this.app.screen.height - 45;
        this.betUpButton.eventMode = 'static';
        this.betUpButton.cursor = 'pointer';
        this.betUpButton.on('pointerdown', () => this.onBetUp?.());
        this.container.addChild(this.betUpButton);
    }

    private makeSquareButton(label: string, color: number): PIXI.Container {
        const c = new PIXI.Container();
        const bg = new PIXI.Graphics();
        bg.roundRect(-25, -25, 50, 50, 8);
        bg.fill({ color });
        bg.stroke({ width: 2, color: AURORA_THEME.colors.turquoise, alpha: 0.6 });
        c.addChild(bg);
        const t = new PIXI.Text({
            text: label,
            style: new PIXI.TextStyle({ fontFamily: 'Arial', fontSize: 28, fill: AURORA_THEME.colors.iceWhite, fontWeight: 'bold' }),
        });
        t.anchor.set(0.5);
        c.addChild(t);
        return c;
    }

    private createMuteButton(): void {
        this.muteButton = new PIXI.Container();
        const bg = new PIXI.Graphics();
        bg.roundRect(-20, -20, 40, 40, 6);
        bg.fill({ color: AURORA_THEME.colors.panelGlass });
        bg.stroke({ width: 1, color: AURORA_THEME.colors.turquoise, alpha: 0.4 });
        this.muteButton.addChild(bg);
        const t = new PIXI.Text({
            text: '🔊',
            style: new PIXI.TextStyle({ fontFamily: 'Arial', fontSize: 20 }),
        });
        t.anchor.set(0.5);
        this.muteButton.addChild(t);
        this.muteButton.x = this.app.screen.width - 40;
        this.muteButton.y = 35;
        this.muteButton.eventMode = 'static';
        this.muteButton.cursor = 'pointer';
        this.muteButton.on('pointerdown', () => this.onMute?.());
        this.container.addChild(this.muteButton);
    }

    private createMessage(): void {
        this.messageText = new PIXI.Text({
            text: '',
            style: new PIXI.TextStyle({
                fontFamily: 'Arial',
                fontSize: 32,
                fill: AURORA_THEME.colors.gold,
                fontWeight: 'bold',
                stroke: { color: AURORA_THEME.colors.midnight, width: 4 },
                dropShadow: {
                    color: AURORA_THEME.colors.turquoise,
                    blur: 10,
                    distance: 2,
                    angle: 0,
                    alpha: 0.8,
                },
            }),
        });
        this.messageText.anchor.set(0.5);
        this.messageText.x = this.app.screen.width / 2;
        this.messageText.y = this.app.screen.height / 2 - 200;
        this.container.addChild(this.messageText);
    }

    public getBalance(): number { return this.balance; }
    public getBet(): number { return this.bet; }

    public setBalance(v: number): void {
        this.balance = v;
        this.balanceText.text = `$${v}`;
    }

    public setBet(v: number): void {
        this.bet = v;
        this.betText.text = `$${v}`;
    }

    public setWin(v: number): void {
        this.winText.text = `$${v}`;
    }

    public showMessage(text: string, duration: number = 2000): void {
        this.messageText.text = text;
        this.messageText.alpha = 0;
        gsap.to(this.messageText, { alpha: 1, duration: 0.3 });
        gsap.to(this.messageText, { alpha: 0, duration: 0.3, delay: duration / 1000 });
    }

    public setSpinEnabled(enabled: boolean): void {
        this.spinButton.eventMode = enabled ? 'static' : 'none';
        this.spinButton.alpha = enabled ? 1 : 0.6;
    }

    public setMuteIcon(muted: boolean): void {
        const t = this.muteButton.children[1] as PIXI.Text;
        t.text = muted ? '🔇' : '🔊';
    }
}
