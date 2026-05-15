---
name: Smart & Futuristic Productivity
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#444651'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#757682'
  outline-variant: '#c5c5d3'
  surface-tint: '#4059aa'
  primary: '#00236f'
  on-primary: '#ffffff'
  primary-container: '#1e3a8a'
  on-primary-container: '#90a8ff'
  inverse-primary: '#b6c4ff'
  secondary: '#6b38d4'
  on-secondary: '#ffffff'
  secondary-container: '#8455ef'
  on-secondary-container: '#fffbff'
  tertiary: '#4b1c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#6e2c00'
  on-tertiary-container: '#f39461'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164e'
  on-primary-fixed-variant: '#264191'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#ffdbcb'
  tertiary-fixed-dim: '#ffb691'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#773205'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-padding: 32px
  card-gap: 24px
  section-margin: 48px
  gutter: 24px
---

## Brand & Style

This design system is built to balance high-performance productivity with a calm, encouraging atmosphere. The aesthetic blends **Minimalism** with subtle **Glassmorphism** and **Soft Futuristic** elements to create a workspace that feels advanced yet approachable. 

The interface relies on generous whitespace to reduce cognitive load, allowing users to focus on high-priority tasks. The "Soft Futuristic" feel is achieved through the use of vibrant gradients against a stark, clean backdrop, paired with ultra-smooth transitions and high-radius corners. The goal is to evoke a sense of clarity and momentum, making time management feel less like a chore and more like a guided journey toward success.

## Colors

The palette is anchored by a **Deep Professional Blue** for stability and authority, complemented by a **Vibrant Purple** that signals creativity and progress. A **Soft Pink** is reserved for high-value highlights, motivational milestones, and subtle call-outs to keep the user engaged.

Use the `primary_action` gradient for main CTAs (e.g., "Create New Task") and the `motivational` gradient for progress bars or achievement badges. Neutral tones should be cool-gray to maintain the crisp, modern feel of the light-mode foundation. Surfaces are predominantly pure white to maximize contrast and perceived cleanliness.

## Typography

This design system utilizes **Geist** for its technical precision and clean, geometric architecture. The typographic hierarchy is designed to be highly legible at a glance, using weight rather than size to distinguish importance in dense dashboard views.

For large displays, use negative letter spacing on headlines to create a more "designed" and tight feel. For body text, ensure a comfortable 150% line height to maintain the "calm" brand personality. Label styles should be used for metadata, tags, and secondary navigation elements to provide clear categorization without competing with primary content.

## Layout & Spacing

The layout follows a structured **12-column fixed grid** on desktop (max-width 1440px) to ensure dashboards feel organized and professional. On mobile, the system collapses to a single column with a fluid layout and 16px side margins.

A "generous whitespace" philosophy is mandatory. Elements should never feel cramped; use the `section-margin` to separate distinct functional areas. Inner card padding should scale from 16px on mobile to 32px on desktop to emphasize the "elevated" feel of the containers. Use an 8px base unit for all component-level spacing (padding, margins, and alignment).

## Elevation & Depth

Visual hierarchy is established using **Ambient Shadows** and **Tonal Layers**. Instead of harsh borders, use soft, diffused shadows with a slight blue-tinted bloom (`rgba(30, 58, 138, 0.08)`) to lift cards off the background.

1.  **Level 0 (Background):** Pure off-white (#F8FAFC).
2.  **Level 1 (Cards/Containers):** White surface with a 20px blur, 4px Y-offset shadow.
3.  **Level 2 (Interactive/Floating):** White surface with a 40px blur, 12px Y-offset shadow (used for active states, modals, and dropdowns).
4.  **Glassmorphism:** Use for sidebars or top navigation overlays with a 15px backdrop-filter blur and 60% opacity to maintain the futuristic aesthetic.

## Shapes

The shape language is defined by **large, friendly radiuses**. High-level containers like task cards and dashboard widgets use a 24px corner radius to create a soft, inviting look. Interactive components like buttons and inputs use a slightly tighter radius (12px and 8px respectively) to signify their utility and precision. Progress bars and status chips should be fully pill-shaped (rounded-full) to provide a distinct contrast against the rectangular grid of the dashboard.

## Components

### Buttons
Primary buttons use the `primary_action` gradient with white text and a soft shadow. Secondary buttons are transparent with a subtle 1px border and deep blue text. On hover, primary buttons should increase their shadow spread slightly to simulate physical elevation.

### Cards
Cards are the primary organizational unit. They must feature a white background, `card_radius`, and Level 1 elevation. Data-heavy cards should use thin, light-gray dividers (1px, #E2E8F0) rather than borders to separate content.

### Input Fields
Inputs are clean with a 1px border (#CBD5E1) that transitions to the `secondary_color` on focus. Use a subtle inner-shadow to give the field a slight "etched" look, enhancing the tactile feel.

### Chips & Badges
Motivational elements use the `motivational` gradient or soft pastel versions of the brand colors. They should always have rounded-full corners and be used for status indicators like "In Progress" or "Milestone Reached."

### Task Progress
Use "smooth-fill" progress bars. The track should be a light neutral, and the fill should be a gradient from `primary` to `secondary`. Add a faint glow effect (box-shadow) to the leading edge of the progress bar to emphasize the "futuristic" direction.