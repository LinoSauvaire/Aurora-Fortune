// Aurora Fortune — Theme Configuration
// Palette: bleu nuit, turquoise, vert émeraude, violet, blanc glacé, or lumineux

export const AURORA_THEME = {
    colors: {
        // Backgrounds
        nightBlue: 0x0a0e27,
        deepBlue: 0x111936,
        midnight: 0x050818,

        // Aurora colors
        turquoise: 0x40e0d0,
        emerald: 0x50c878,
        auroraGreen: 0x00ff9f,
        auroraBlue: 0x4fc3f7,
        auroraViolet: 0x8a2be2,
        iceWhite: 0xe0f7ff,

        // Accents
        gold: 0xffd700,
        brightGold: 0xffe44d,
        crystal: 0xb8e0ff,

        // UI
        panelDark: 0x0d1530,
        panelGlass: 0x1a2550,
        textPrimary: 0xe0f7ff,
        textSecondary: 0x7a8db5,
    },

    // Symbol names matching our generated assets
    symbols: {
        low: ['A', 'K', 'Q', 'J', '10', '9'],
        high: ['Diamond', 'Ruby', 'Coin'], // Will be expanded with Aurora-specific symbols
        special: ['Wild', 'Scatter'],
    },

    // Payouts (multiplier of bet)
    payouts: {
        Wild:    { 3: 50,  4: 200, 5: 1000 },
        Scatter: { 3: 20,  4: 80,  5: 400  },
        Diamond: { 3: 15,  4: 60,  5: 300  },
        Ruby:    { 3: 12,  4: 50,  5: 250  },
        Coin:    { 3: 10,  4: 40,  5: 200  },
        A:       { 3: 6,   4: 20,  5: 100  },
        K:       { 3: 5,   4: 15,  5: 80   },
        Q:       { 3: 4,   4: 12,  5: 60   },
        J:       { 3: 3,   4: 10,  5: 50   },
        '10':    { 3: 2,   4: 8,   5: 40   },
        '9':     { 3: 2,   4: 6,   5: 30   },
    },

    // Paylines (5 reels x 3 rows)
    paylines: [
        [1, 1, 1, 1, 1], // middle
        [0, 0, 0, 0, 0], // top
        [2, 2, 2, 2, 2], // bottom
        [0, 1, 2, 1, 0], // V
        [2, 1, 0, 1, 2], // ^
        [0, 0, 1, 2, 2], // diagonal down
        [2, 2, 1, 0, 0], // diagonal up
        [1, 0, 1, 2, 1], // zigzag
        [1, 2, 1, 0, 1], // zigzag reverse
        [0, 1, 0, 1, 0], // wave top
    ],

    // Layout
    layout: {
        reelCount: 5,
        rowCount: 3,
        symbolSize: 130,
        reelSpacing: 8,
        reelAreaWidth: 0,   // computed
        reelAreaHeight: 0,  // computed
    },

    // Animation timings
    timing: {
        spinDuration: 1200,
        reelStagger: 200,
        winHighlightDuration: 2500,
        bigWinDuration: 4000,
        megaWinDuration: 6000,
    },
} as const;

export type ThemeColors = typeof AURORA_THEME.colors;
