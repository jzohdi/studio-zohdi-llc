# Studio Zohdi Site Spec

## Purpose

Build a premium portfolio and company website for a freelance web development business. The site should feel modern, confident, and polished while staying clear, fast, and professional.

## Design Direction

- Overall tone: sleek, modern, tasteful, premium, business-forward
- Motion style: subtle and intentional, never noisy or distracting
- Responsive priority: desktop and mobile should be designed together rather than treated as separate afterthoughts
- Source of truth: supplied screenshots plus written behavior notes

## Theme Tokens

Primary light theme tokens:

```css
:root {
	--background: 0 0% 100%;
	--foreground: 222.2 84% 4.9%;
	--muted: 210 40% 96.1%;
	--muted-foreground: 215.4 16.3% 46.9%;
	--popover: 0 0% 100%;
	--popover-foreground: 222.2 84% 4.9%;
	--card: 0 0% 100%;
	--card-foreground: 222.2 84% 4.9%;
	--border: 214.3 31.8% 91.4%;
	--input: 214.3 31.8% 91.4%;
	--primary: 222.2 47.4% 11.2%;
	--primary-foreground: 210 40% 98%;
	--secondary: 210 40% 96.1%;
	--secondary-foreground: 222.2 47.4% 11.2%;
	--accent: 210 40% 96.1%;
	--accent-foreground: 222.2 47.4% 11.2%;
	--destructive: 0 72.2% 50.6%;
	--destructive-foreground: 210 40% 98%;
	--ring: 222.2 84% 4.9%;
	--radius: 0.5rem;
	--pink: 318 78% 53%;
}
```

Primary dark theme tokens:

```css
[data-theme='dark'] {
	--pink: 318 78% 53%;
	--background: 222.2 84% 4.9%;
	--foreground: 210 40% 98%;
	--muted: 217.2 32.6% 17.5%;
	--muted-foreground: 215 20.2% 65.1%;
	--popover: 222.2 84% 4.9%;
	--popover-foreground: 210 40% 98%;
	--card: 222.2 84% 4.9%;
	--card-foreground: 210 40% 98%;
	--border: 217.2 32.6% 17.5%;
	--input: 217.2 32.6% 17.5%;
	--primary: 210 40% 98%;
	--primary-foreground: 222.2 47.4% 11.2%;
	--secondary: 217.2 32.6% 17.5%;
	--secondary-foreground: 210 40% 98%;
	--accent: 217.2 32.6% 17.5%;
	--accent-foreground: 210 40% 98%;
	--destructive: 0 62.8% 30.6%;
	--destructive-foreground: 210 40% 98%;
	--ring: 212.7 26.8% 83.9%;
}
```

### Token usage notes

- The pink accent should be used sparingly for emphasis, focus states, and select accents.
- Neutrals should carry most of the layout and typography.
- Surface contrast should stay soft and premium rather than stark and noisy.

## Typography

- Preferred direction: `League Spartan` for display typography
- Body text should stay highly readable and can use a system sans fallback stack
- Headline styling should be bold, condensed, and graphic
- Small navigation labels should be uppercase with tracking

## Motion Principles

- Favor opacity, subtle transforms, and easing over large or gimmicky movement
- Hover and active states should help with orientation, especially on the featured projects section
- Motion should support hierarchy and delight, not slow the site down
- All nonessential motion should degrade cleanly for `prefers-reduced-motion`

## Homepage V1 Scope

The first homepage implementation should include:

- A slim top navigation bar
- A desktop featured-project selector with one active project preview
- A mobile stacked project list with inline previews
- A dark mode control
- Structured project data that can be swapped to real assets later

## Current Content Assumptions

- The homepage featured project list should currently reflect this live lineup:
  - `foiasearch.com`
  - `stockpromotiontracker.com`
  - `stopnasdaqchinafraud.com`
  - `highgroundresearch.com`
  - `Greffier` (local-first meeting transcription desktop app, website TBD)
  - `8ksearch.com`
- The current homepage summaries should stay factual and conservative when details are not yet confirmed
- Real case-study assets, motion details, and deeper project-specific visuals will be added later
- CTA destinations and final contact details should remain conservative until confirmed

## Engineering Notes

- Prefer global CSS custom properties for design tokens
- Prefer imported or centralized assets over hard-coded paths spread through components
- Keep SEO and accessibility in place from the start instead of backfilling later
- Keep the README technical; keep brand and design decisions in this spec
