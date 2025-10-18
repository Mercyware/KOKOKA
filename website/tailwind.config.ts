import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        // Base system colors
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',

        // KOKOKA Brand colors - Green theme
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },

        primary: {
          DEFAULT: '#1a5f3f',
          foreground: '#ffffff',
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#1a5f3f',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: '#f97316',
          foreground: '#ffffff',
          orange: '#f97316',
          'orange-light': '#fb923c',
          green: '#84cc16',
          yellow: '#eab308',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#1f2937',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        // Siohioma design system
        'siohioma-sm': '0.375rem',  // 6px
        'siohioma-md': '0.5rem',    // 8px
        'siohioma-lg': '0.75rem',   // 12px
        'siohioma-xl': '1rem',      // 16px
        'siohioma-2xl': '1.5rem',   // 24px
      },
      fontSize: {
        // Enhanced typography scale
        'siohioma-xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px
        'siohioma-sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
        'siohioma-base': ['1rem', { lineHeight: '1.5rem' }],     // 16px
        'siohioma-lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
        'siohioma-xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
        'siohioma-2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px
        'siohioma-3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        'siohioma-4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
      },
      fontWeight: {
        'siohioma-light': '300',
        'siohioma-normal': '400',
        'siohioma-medium': '500',
        'siohioma-semibold': '600',
        'siohioma-bold': '700',
      },
      spacing: {
        // Enhanced spacing scale following 8px grid
        'siohioma-xs': '0.25rem',   // 4px
        'siohioma-sm': '0.5rem',    // 8px
        'siohioma-md': '1rem',      // 16px
        'siohioma-lg': '1.5rem',    // 24px
        'siohioma-xl': '2rem',      // 32px
        'siohioma-2xl': '3rem',     // 48px
        'siohioma-3xl': '4rem',     // 64px
        'siohioma-4xl': '6rem',     // 96px
      },
      boxShadow: {
        // Siohioma shadow system
        'siohioma-xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'siohioma-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'siohioma-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'siohioma-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'siohioma-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'siohioma-green': '0 4px 6px -1px rgba(26, 95, 63, 0.1), 0 2px 4px -1px rgba(26, 95, 63, 0.06)',
        'siohioma-orange': '0 4px 6px -1px rgba(249, 115, 22, 0.1), 0 2px 4px -1px rgba(249, 115, 22, 0.06)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
