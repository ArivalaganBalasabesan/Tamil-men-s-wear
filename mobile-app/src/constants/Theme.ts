export const Colors = {
  light: {
    background: '#FAFAFA', // Soft pearl white
    card:       '#FFFFFF',
    text:       '#111111',
    textSub:    '#444444',
    textMuted:  '#888888',
    border:     '#EEEEEE',
    primary:    '#B8960C', // Deep Golden Bronze
    accent:     '#FFD700', // Bright Gold
    tabBar:     '#FFFFFF',
    tabInactive:'#999999',
    surface:    '#F0F0F0',
    error:      '#D32F2F',
    success:    '#2E7D32',
  },
  dark: {
    background: '#0a0a0a', // Deeper Obsidian
    card:       '#141414', // Secondary Black
    text:       '#FFFFFF',
    textSub:    '#CCCCCC',
    textMuted:  '#777777',
    border:     '#222222',
    primary:    '#FFD700', // Pure Gold
    accent:     '#D4AF37',
    tabBar:     '#141414',
    tabInactive:'#555555',
    surface:    '#1e1e1e',
    error:      '#FF5252',
    success:    '#4CAF50',
  },
  // Legacy fallbacks to prevent undefined crashes in unmigrated screens
  primary: '#B8960C',
  accent: '#FFD700',
  error: '#FF5252',
  success: '#4CAF50',
  warning: '#FFA000',
  copper: '#B87333',
};

export const Spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
};

export const Radius = {
  sm: 8, md: 12, lg: 16, xl: 24, full: 999,
};

export const Shadows = {
  light: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  dark: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  }
};
