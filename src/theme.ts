
/**
 * SYNAPSE BRAND IDENTITY & THEME ARCHITECTURE
 * Version: 2.0.4
 * Last Updated: 2026-04-01
 */

export const SYNAPSE_THEME = {
  identity: {
    name: 'SYNAPSE',
    version: '2.0.4',
    tagline: 'Neural Market Intelligence',
    roles: {
      AJA: {
        title: 'AJA SYNAPSE System Enthusiast & Expert',
        role: 'The eyes, ears, brain, and voice of the entire SYNAPSE system. Advanced humanoid neural interface.',
        avatar: 'High-Fidelity Humanoid 3D Presence',
        authority: 'Strategic / Operational'
      },
      PROJECT_MANAGER: {
        title: 'Core Logic Overseer',
        role: 'System authority, command center logic, and agent governance.',
        avatar: 'Technical HUD / Command Console',
        authority: 'Executive / Decision-Making'
      }
    }
  },
  colors: {
    background: {
      base: '#111318', // Deep Tech Gray
      panel: 'rgba(17, 19, 24, 0.7)',
      vault: 'rgba(17, 19, 24, 0.85)',
      overlay: 'rgba(0, 0, 0, 0.15)'
    },
    accents: {
      primary: '#00F2FF', // Neural Cyan
      secondary: '#D946EF', // Synth Magenta
      warning: '#F59E0B', // Amber
      critical: '#EF4444', // Red
      success: '#10B981' // Emerald
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#94A3B8', // Slate 400
      muted: '#64748B', // Slate 500
      glow: 'rgba(0, 242, 255, 0.5)'
    }
  },
  typography: {
    sans: 'Inter, system-ui, sans-serif',
    mono: 'JetBrains Mono, monospace',
    tracking: {
      tight: '-0.02em',
      wide: '0.2em',
      widest: '0.4em'
    }
  },
  effects: {
    glass: {
      blur: '30px',
      border: '1px solid rgba(0, 242, 255, 0.15)',
      shadow: 'inset 0 0 40px rgba(0, 242, 255, 0.05)'
    },
    scanlines: {
      opacity: 0.4,
      size: '4px'
    },
    grid: {
      size: '40px',
      opacity: 0.03
    },
    glow: {
      cyan: '0 0 15px rgba(0, 242, 255, 0.4)',
      magenta: '0 0 15px rgba(217, 70, 239, 0.4)',
      white: '0 0 15px rgba(255, 255, 255, 0.4)'
    }
  }
};

export type SynapseTheme = typeof SYNAPSE_THEME;
