---
name: Base
description: Um espaço pessoal para planejar a alimentação e cuidar da rotina.
colors:
  navy: "#102c59"
  blue: "#234f98"
  yellow: "#f5c841"
  ground: "#f7f8fa"
  white: "#ffffff"
  ink: "#172a43"
  muted: "#637083"
  line: "#e5e9ef"
  soft-blue: "#edf1f8"
  success-ground: "#eaf4ed"
  success-ink: "#36745d"
  danger-ground: "#fbecef"
  danger-ink: "#ad3541"
typography:
  display:
    fontFamily: "Manrope, sans-serif"
    fontSize: "34px"
    fontWeight: 800
    lineHeight: 1.22
    letterSpacing: "-1px"
  headline:
    fontFamily: "Manrope, sans-serif"
    fontSize: "30px"
    fontWeight: 800
    lineHeight: 1.35
    letterSpacing: "-1px"
  title:
    fontFamily: "Manrope, sans-serif"
    fontSize: "17px"
    fontWeight: 800
    letterSpacing: "-0.4px"
  body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Manrope, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1.3
rounded:
  tag: "5px"
  field: "7px"
  control: "8px"
  panel: "12px"
  dialog: "14px"
spacing:
  compact: "8px"
  control: "12px"
  group: "16px"
  panel: "24px"
  section: "32px"
components:
  button-primary:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
    typography: "{typography.label}"
  button-outline:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
    typography: "{typography.label}"
  button-yellow:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.navy}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
    typography: "{typography.label}"
  field:
    backgroundColor: "{colors.white}"
    textColor: "{colors.navy}"
    rounded: "{rounded.field}"
    padding: "11px 12px"
  panel:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
---

# Design System: Base

## Overview

**Creative North Star: "Club member editorial"**

Base combines the navy, yellow and white requested by the user with the familiarity of a personal planning application. The identity feels calm and assured: a substantial navy navigation rail, clear white work surfaces, compact lists and warm yellow moments of recognition. Gaming affinity appears through ranks and earned progress, while the controls remain familiar web controls.

Expression comes from color, Manrope's rounded letterforms and restrained membership details. Food photography is illustrative and served locally. This system describes the implemented MVP, rather than an independent visual proposal.

**Key Characteristics:**

- Navy anchors the shell and primary actions.
- Yellow marks selected moments and earned progress.
- White work surfaces use fine borders rather than ambient shadows.
- Dense information uses aligned rows and consistent units.

## Colors

The palette combines club navy and warm yellow with cool neutral work surfaces.

### Primary

- **Club Navy** (`navy`): navigation, primary buttons, high-emphasis text and membership surfaces.
- **Action Blue** (`blue`): links, input caret, routine symbols and supporting actions.

### Secondary

- **Matchday Yellow** (`yellow`): highlighted actions, earned progress, selected week dates and logo details. Pair it with navy text.

### Tertiary

- **Quiet Green** (`success-ink`, `success-ground`): informational plan status.
- **Soft Red** (`danger-ink`, `danger-ground`): destructive actions.

### Neutral

- **Cool Ground** (`ground`): application canvas.
- **White Work Surface** (`white`): forms, lists and panels.
- **Reading Ink** (`ink`): body text.
- **Slate Secondary** (`muted`): supporting descriptions and units.
- **Fine Rule** (`line`): dividers and surface boundaries.
- **Soft Blue** (`soft-blue`): journey panels.

**The Navy Anchor Rule.** Navigation and major actions share navy; color changes communicate state rather than a separate visual theme for each page.

## Typography

**Display and body font:** self-hosted Manrope, with sans-serif fallback. Loaded weights are 400, 500, 600, 700 and 800. The same family carries expression and dense information; no monospace voice is introduced for nutritional data.

### Hierarchy

- **Display:** the membership banner uses the display token, increasing to 40px on wide screens. The login composition uses a separate 58px heading that scales down on smaller screens.
- **Headline:** page titles use the headline token and reduce to 26px below 1200px.
- **Title:** section headings use the title token, with dense sections at 14–16px.
- **Body:** the root is 14px; operational descriptions and forms commonly use 11–12px. Paragraphs use generous line height.
- **Label:** action labels use the label token. Smaller metadata is secondary to the task.
- **Numbers:** water and grocery quantities use tabular numerals. Units stay adjacent to values and carry less emphasis.

**The One Family Rule.** Use Manrope weight and scale to establish hierarchy; preserve a single voice across planning, habits and progress.

## Layout

At the default desktop size, the fixed navigation rail is 232px wide and the topbar is 76px high. Main content has a 1510px maximum width and 34px by 38px outer padding. The dashboard separates the main work area from a 304px routine column with a 26px gap. Below 1200px, the rail contracts to 210px and the routine column to 278px.

At 1000px and below, the dashboard becomes one main column with paired supporting panels; routine and progress become single-column views. At 760px and below, the rail becomes a 250px drawer, hidden when closed, and the topbar becomes 66px high. At 440px and below, supporting panels and meal photography stack vertically. Mobile content padding contracts to 16px.

Spacing is tighter within labeled controls and rows, then expands between task groups. Lists provide the dense structure; panels group distinct jobs. The week view preserves seven equal columns at every width.

## Elevation & Depth

Most surfaces are flat: white panels sit on a cool canvas with one fine border, while navy and tinted panels establish hierarchy through tone. Shadows are reserved for temporary overlays.

### Shadow Vocabulary

- **Toast:** `0 7px 28px #102c592b`, separating a transient status message from the page.
- **Dialog:** `0 20px 80px #06162e40`, separating focused editing from the darkened overlay.

**The Flat Work Surface Rule.** Persistent planning surfaces use borders or tonal separation; reserve shadows for temporary overlays.

## Shapes

Panels use gently curved corners from the panel token. Controls are slightly tighter; tags and fields are tighter again. Avatars and week dates are circular. The membership emblem uses a rounded square rotated slightly, while charts and progress tracks use simple geometric bars. Icons come from Lucide; the banner leaf explicitly uses a finer stroke than ordinary interface icons.

## Components

### Buttons

Compact, clear actions use icon-plus-text labels with an 8px gap and a default minimum height of 40px. Primary buttons are navy with white text; outline buttons use a fine neutral border; yellow buttons use navy text. Ghost actions gain a pale blue background on hover. Disabled actions reduce opacity and use the disabled cursor.

All interactive fields and buttons use a visible 3px blue focus outline with a 3px offset. Color transitions last 180ms.

### Tags

Small rectangular status labels use the tag radius. Blue indicates contextual plan information, green indicates a calm positive state, yellow highlights levels and unlocked achievements, and neutral tags describe inactive states. Tags are labels rather than substitute buttons.

### Panels and Lists

White panels share the panel radius and fine neutral boundary. Grocery categories use tinted section headers and aligned checklist rows; meals use aligned time, photograph, description and action areas. Supporting content does not require a separate card for each sentence.

### Inputs

White fields have a fine neutral stroke, field radius, and navy text. Labels sit above fields; the search icon sits inside the left inset. Read-only fields use a pale cool background. Browser validation handles required and numeric constraints in the MVP.

### Navigation

The navy rail uses pale blue text, consistent Lucide icons and 12px labels. The active destination gains a lighter navy surface, white label and yellow icon. The mobile drawer hides its closed controls from keyboard access; opening moves focus inside, Tab stays within the drawer and Escape closes it.

### Weekly Rhythm and Water

The week keeps one fixed cell per day. Today is navy; a completed check-in is yellow with a check icon. Water combines a numeric volume, eight outlined glasses and direct increment/decrement controls. Progress is always backed by a readable value and unit.

### Dialogs and Feedback

Radix dialogs protect focused editing with a dark overlay, titled content, close control and keyboard behavior. Toasts communicate completed actions. The brief page entrance and width transitions respect reduced-motion preferences. Text selection uses yellow and navy, and the input caret uses action blue.

## Do's and Don'ts

### Do:

- **Do** preserve the navy, yellow and white brand commitment.
- **Do** keep standard web navigation, checkboxes, buttons and forms recognizable.
- **Do** align numeric values with their units and label planned nutrition clearly.
- **Do** preserve visible keyboard focus and reduced-motion support.

### Don't:

- **Don't** replace the club palette with a generic gradient theme.
- **Don't** use decorative glyphs in place of the Lucide icon system.
- **Don't** turn a row-based planning task into a grid of interchangeable promotional cards.
