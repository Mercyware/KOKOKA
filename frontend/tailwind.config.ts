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

				// Modern brand colors
				brand: {
					// Teal (Primary)
					primary: 'hsl(var(--brand-primary))',
					'primary-dark': 'hsl(var(--brand-primary-dark))',
					'primary-light': 'hsl(var(--brand-primary-light))',
					// Indigo (Secondary)
					secondary: 'hsl(var(--brand-secondary))',
					// Amber (Accent)
					accent: 'hsl(var(--brand-accent))',
					// Success
					success: 'hsl(var(--brand-success))',
					// Warning
					warning: 'hsl(var(--brand-warning))',
					// Info
					info: 'hsl(var(--brand-info))',
				},

				// Primary - Teal/Cyan
				primary: {
					DEFAULT: '#0891B2',  // cyan-600
					foreground: '#ffffff',
					50: '#ecfeff',
					100: '#cffafe',
					200: '#a5f3fc',
					300: '#67e8f9',
					400: '#22d3ee',
					500: '#06b6d4',
					600: '#0891b2',
					700: '#0e7490',
					800: '#155e75',
					900: '#164e63',
					950: '#083344',
				},

				// Secondary - Indigo
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
					50: '#eef2ff',
					100: '#e0e7ff',
					200: '#c7d2fe',
					300: '#a5b4fc',
					400: '#818cf8',
					500: '#6366f1',
					600: '#4f46e5',
					700: '#4338ca',
					800: '#3730a3',
					900: '#312e81',
				},

				// Accent - Amber
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
					50: '#fffbeb',
					100: '#fef3c7',
					200: '#fde68a',
					300: '#fcd34d',
					400: '#fbbf24',
					500: '#f59e0b',
					600: '#d97706',
					700: '#b45309',
					800: '#92400e',
					900: '#78350f',
				},

				// Success - Emerald
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))',
					50: '#ecfdf5',
					100: '#d1fae5',
					200: '#a7f3d0',
					300: '#6ee7b7',
					400: '#34d399',
					500: '#10b981',
					600: '#059669',
					700: '#047857',
					800: '#065f46',
					900: '#064e3b',
				},

				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},

				// Legacy siohioma colors for backward compatibility
				'siohioma-primary': 'hsl(var(--brand-primary))',
				'siohioma-primary-dark': 'hsl(var(--brand-primary-dark))',
				'siohioma-orange': 'hsl(var(--brand-accent))',
				'siohioma-light-green': 'hsl(var(--brand-primary-light))',
				'siohioma-yellow': 'hsl(var(--brand-accent))',
				'siohioma-accent': 'hsl(var(--brand-accent))',
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
	plugins: [
		require("tailwindcss-animate"),
		require("@tailwindcss/line-clamp")
	],
} satisfies Config;
