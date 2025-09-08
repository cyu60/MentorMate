import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
// @ts-ignore
import { flattenColorPalette } from "tailwindcss/lib/util/flattenColorPalette";

const addVariablesForColors = plugin(({ addBase, theme }) => {
	const colors = theme("colors");
	const flattened = flattenColorPalette(colors);
	const cssVars = Object.fromEntries(
		Object.entries(flattened).map(([k, v]) => [`--${k}`, v as string])
	);
	addBase({ ":root": cssVars });
});

const config: Config = {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
		/* Brand palette (from your design sheet) wired to CSS variables you set in globals.css */
		colors: {
			/* Semantic tokens (shadcn) */
			background: "hsl(var(--background))",
			foreground: "hsl(var(--foreground))",
			card: {
			DEFAULT: "hsl(var(--card))",
			foreground: "hsl(var(--card-foreground))",
			},
			popover: {
			DEFAULT: "hsl(var(--popover))",
			foreground: "hsl(var(--popover-foreground))",
			},
			primary: {
			DEFAULT: "hsl(var(--primary))",
			foreground: "hsl(var(--primary-foreground))",
			},
			secondary: {
			DEFAULT: "hsl(var(--secondary))",
			foreground: "hsl(var(--secondary-foreground))",
			},
			muted: {
			DEFAULT: "hsl(var(--muted))",
			foreground: "hsl(var(--muted-foreground))",
			},
			accent: {
			DEFAULT: "hsl(var(--accent))",
			foreground: "hsl(var(--accent-foreground))",
			},
			destructive: {
			DEFAULT: "hsl(var(--destructive))",
			foreground: "hsl(var(--destructive-foreground))",
			},
			border: "hsl(var(--border))",
			input: "hsl(var(--input))",
			ring: "hsl(var(--ring))",
			chart: {
			1: "hsl(var(--chart-1))",
			2: "hsl(var(--chart-2))",
			3: "hsl(var(--chart-3))",
			4: "hsl(var(--chart-4))",
			5: "hsl(var(--chart-5))",
			},

			/* === Brand families (usable as utilities) ===
			-> e.g. bg-jacksons-purple, bg-jacksons-purple-dark, text-pattens-blue-light, etc.
			*/
			neutral: {
			white: "var(--neutral-white)",
			lightest: "var(--neutral-lightest)",
			lighter: "var(--neutral-lighter)",
			light: "var(--neutral-light)",
			DEFAULT: "var(--neutral)",
			dark: "var(--neutral-dark)",
			darker: "var(--neutral-darker)",
			darkest: "var(--neutral-darkest)",
			},
			jacksons: {
			purple: {
				lightest: "var(--jacksons-purple-lightest)",
				lighter: "var(--jacksons-purple-lighter)",
				light: "var(--jacksons-purple-light)",
				DEFAULT: "var(--jacksons-purple)",
				dark: "var(--jacksons-purple-dark)",
				darker: "var(--jacksons-purple-darker)",
				darkest: "var(--jacksons-purple-darkest)",
			},
			},
			pattens: {
			blue: {
				lightest: "var(--pattens-blue-lightest)",
				lighter: "var(--pattens-blue-lighter)",
				light: "var(--pattens-blue-light)",
				DEFAULT: "var(--pattens-blue)",
				dark: "var(--pattens-blue-dark)",
				darker: "var(--pattens-blue-darker)",
				darkest: "var(--pattens-blue-darkest)",
			},
			},
			cumin: {
			lightest: "var(--cumin-lightest)",
			lighter: "var(--cumin-lighter)",
			light: "var(--cumin-light)",
			DEFAULT: "var(--cumin)",
			dark: "var(--cumin-dark)",
			darker: "var(--cumin-darker)",
			darkest: "var(--cumin-darkest)",
			},
		},

		borderRadius: {
			lg: "var(--radius)",
			md: "calc(var(--radius) - 2px)",
			sm: "calc(var(--radius) - 4px)",
		},
		},
	},
	plugins: [
		addVariablesForColors,
		require("tailwindcss-animate"),
		require("@tailwindcss/typography"),
	],
};

export default config;
