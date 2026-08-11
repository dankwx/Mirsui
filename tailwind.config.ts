import type { Config } from 'tailwindcss'

const config = {
    darkMode: ['class'],
    content: [
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
    ],
    prefix: '',
    theme: {
    	container: {
    		center: true,
    		padding: '2rem',
    		screens: {
    			'2xl': '1400px'
    		}
    	},
    	extend: {
    		fontFamily: {
    			sans: ['var(--font-hanken)', 'system-ui', 'sans-serif'],
    			mono: ['var(--font-space-grotesk)', 'Space Grotesk', 'system-ui', 'sans-serif']
    		},
    		colors: {
    			/**
    			 * Duas cores acentuam, e cada uma tem um assunto:
    			 *
    			 *   acc  (lima)    tempo e precedência. "Você chegou cedo": posição,
    			 *                  destaque de 1º lugar, foco. Nada além disso.
    			 *   warm (laranja)  gente. Seguir, recados, favoritar, presença de
    			 *                  outra pessoa na sua página.
    			 *   text (creme)    todo o resto, inclusive hover e botão neutro.
    			 *
    			 * O lima dá 14,4:1 sobre mir-bg — praticamente o mesmo que o texto
    			 * (14,6:1). Ele não escurece o suficiente para virar "secundário":
    			 * ou é o dado mais importante da tela, ou não devia estar aceso.
    			 */
    			mir: {
    				// Rampa de elevação. Continua sutil de propósito (é um app escuro
    				// e quente, não um dashboard de caixinhas), mas a distância entre
    				// os degraus dobrou: card sobre bg saiu de 1,11:1 para 1,20:1.
    				// Antes nada levantava do fundo e todo elemento precisava de uma
    				// borda para existir.
    				//
    				// bg fica em #16120c: esse hex está escrito à mão em ~20 lugares
    				// (rotas OG, MirsuiLogo, LegalDoc, mir-landing) como a tinta do
    				// produto. Mover o chão exigiria caçar todos eles.
    				bg: '#16120c',
    				surface: '#221b12',
    				card: '#2b2317',
    				/** menus, popovers e hover — o degrau que faltava */
    				raised: '#382d1d',
    				line: 'rgba(236,227,210,0.12)',
    				line2: 'rgba(236,227,210,0.20)',
    				fill1: 'rgba(236,227,210,0.04)',
    				fill2: 'rgba(236,227,210,0.08)',
    				text: '#ece3d2',
    				// contraste sobre mir-bg: text 14.6:1, text2 7.6:1, text3 5.1:1.
    				// text3 estava em 0.42 (3.5:1) e reprovava no WCAG AA, apesar de
    				// vestir timestamps, rótulos e legendas em todo o app.
    				// Sobre o mir-card novo, text3 dá 4,7:1 — ainda passa no AA.
    				text2: 'rgba(236,227,210,0.70)',
    				text3: 'rgba(236,227,210,0.55)',
    				acc: '#cdef36',
    				'acc-soft': 'rgba(205,239,54,0.14)',
    				'on-acc': '#16120c',
    				// Irmão claro do #c14a26 que já vivia escondido no gradiente de
    				// avatar. 6,3:1 sobre mir-bg e 5,2:1 sobre mir-card: passa no AA
    				// como texto normal, então pode escrever, não só decorar.
    				warm: '#e8734a',
    				'warm-soft': 'rgba(232,115,74,0.14)',
    				'on-warm': '#16120c'
    			},
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			primary: {
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))',
    				hover: 'hsl(var(--primary-hover))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))',
    				hover: 'hsl(var(--secondary-hover))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))',
    				hover: 'hsl(var(--accent-hover))'
    			},
    			tertiary: {
    				DEFAULT: 'hsl(var(--tertiary))',
    				foreground: 'hsl(var(--tertiary-foreground))',
    				hover: 'hsl(var(--tertiary-hover))'
    			},
    			success: {
    				DEFAULT: 'hsl(var(--success))',
    				foreground: 'hsl(var(--success-foreground))'
    			},
    			warning: {
    				DEFAULT: 'hsl(var(--warning))',
    				foreground: 'hsl(var(--warning-foreground))'
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
    				foreground: 'hsl(var(--card-foreground))'
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
    			}
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
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
    			},
    			slideDown: {
    				'0%': {
    					transform: 'translateY(-100%)',
    					opacity: '0'
    				},
    				'100%': {
    					transform: 'translateY(0)',
    					opacity: '1'
    				}
    			},
    			fadeOut: {
    				'0%': {
    					opacity: '1'
    				},
    				'100%': {
    					opacity: '0',
    					height: '0',
    					marginBottom: '0',
    					paddingBottom: '0'
    				}
    			},
    			underline: {
    				'0%, 100%': {
    					transform: 'scaleX(0)',
    					transformOrigin: 'left'
    				},
    				'50%': {
    					transform: 'scaleX(1)',
    					transformOrigin: 'left'
    				},
    				'50.1%': {
    					transformOrigin: 'right'
    				},
    				'100%': {
    					transform: 'scaleX(0)',
    					transformOrigin: 'right'
    				}
    			}
    		},
    		animation: {
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out',
    			'slide-down': 'slideDown 0.5s ease-out',
    			'fade-out': 'fadeOut 10s ease-out forwards',
    			underline: 'underline 14s ease-in-out infinite'
    		}
    	}
    },
    plugins: [require('tailwindcss-animate')],
} satisfies Config

export default config
