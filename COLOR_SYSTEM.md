# KOKOKA Color System

This document defines the complete color palette and usage guidelines for the KOKOKA school management system.

## Color Philosophy

The KOKOKA design system uses a modern, professional color palette designed specifically for educational platforms. The colors convey trust, professionalism, and clarity while maintaining accessibility and visual harmony.

---

## Primary Colors

### Teal/Cyan - Primary Brand Color
**Use for:** Primary actions, main CTAs, branding elements, links, focus states

| Shade | Hex Code | HSL | Use Case |
|-------|----------|-----|----------|
| **Primary** | `#0891B2` | `188 95% 37%` | Main brand color, primary buttons, default state |
| **Primary Dark** | `#0E7490` | `188 91% 29%` | Hover states, pressed buttons, darker variants |
| **Primary Light** | `#22D3EE` | `187 85% 53%` | Highlights, active navigation, light backgrounds |

**CSS Variables:**
```css
--brand-primary: 188 95% 37%;        /* #0891B2 */
--brand-primary-dark: 188 91% 29%;   /* #0E7490 */
--brand-primary-light: 187 85% 53%;  /* #22D3EE */
```

**Tailwind Classes:**
```tsx
// Background
className="bg-primary"              // #0891B2
className="bg-brand-primary-dark"   // #0E7490
className="bg-brand-primary-light"  // #22D3EE

// Text
className="text-primary"            // #0891B2
className="text-brand-primary-light" // #22D3EE

// Border
className="border-primary"          // #0891B2
```

---

### Indigo - Secondary Color
**Use for:** Secondary actions, less prominent features, informational elements

| Shade | Hex Code | HSL | Use Case |
|-------|----------|-----|----------|
| **Secondary** | `#4F46E5` | `243 75% 59%` | Secondary buttons, badges, accents |

**CSS Variables:**
```css
--brand-secondary: 243 75% 59%;  /* #4F46E5 - Indigo-600 */
```

**Tailwind Classes:**
```tsx
className="bg-secondary"      // #4F46E5
className="text-secondary"    // #4F46E5
```

**Note:** Currently, secondary is set to match primary in some contexts. Use indigo-600 when you need true secondary color.

---

### Amber - Accent Color
**Use for:** Action buttons (export, print), highlights, warnings, energy/attention

| Shade | Hex Code | HSL | Use Case |
|-------|----------|-----|----------|
| **Accent** | `#F59E0B` | `38 92% 50%` | Export buttons, action dropdowns, highlights |

**CSS Variables:**
```css
--brand-accent: 38 92% 50%;  /* #F59E0B - Amber-500 */
```

**Tailwind Classes:**
```tsx
className="bg-accent"       // #F59E0B
className="text-accent"     // #F59E0B
className="border-accent"   // #F59E0B
```

---

## Semantic Colors

### Success - Emerald Green
**Use for:** Success messages, positive trends, completed states, achievements

| Shade | Hex Code | HSL | Use Case |
|-------|----------|-----|----------|
| **Success** | `#10B981` | `160 84% 39%` | Success badges, positive indicators, checkmarks |
| Success 50 | `#ECFDF5` | - | Success backgrounds (light) |
| Success 100 | `#D1FAE5` | - | Success backgrounds (medium) |
| Success 700 | `#047857` | - | Success text (dark) |

**CSS Variables:**
```css
--brand-success: 160 84% 39%;  /* #10B981 - Emerald-500 */
```

**Tailwind Classes:**
```tsx
className="bg-success"              // #10B981
className="text-success"            // #10B981
className="bg-emerald-50"           // Light success background
className="text-emerald-700"        // Dark success text
```

---

### Destructive/Danger - Red
**Use for:** Delete actions, errors, critical warnings, destructive operations

| Shade | Hex Code | HSL | Use Case |
|-------|----------|-----|----------|
| **Destructive** | `#DC2626` | `0 72% 51%` | Delete buttons, error messages |
| Red 50 | `#FEF2F2` | - | Error backgrounds (light) |
| Red 600 | `#DC2626` | - | Error text, danger buttons |
| Red 700 | `#B91C1C` | - | Hover state for danger buttons |

**CSS Variables:**
```css
--destructive: 0 72% 51%;  /* #DC2626 - Red-600 */
```

**Tailwind Classes:**
```tsx
className="bg-destructive"      // #DC2626
className="text-destructive"    // #DC2626
className="bg-red-50"          // Light error background
className="text-red-600"       // Error text
```

---

### Warning - Orange/Amber
**Use for:** Warning messages, pending states, caution indicators

| Shade | Hex Code | HSL | Use Case |
|-------|----------|-----|----------|
| **Warning** | `#F97316` | `25 95% 53%` | Warning badges, pending states |
| Amber 100 | `#FEF3C7` | - | Warning backgrounds |
| Amber 700 | `#B45309` | - | Warning text (dark) |

**CSS Variables:**
```css
--brand-warning: 25 95% 53%;  /* #F97316 - Orange-500 */
```

**Tailwind Classes:**
```tsx
className="bg-amber-500"      // #F97316
className="text-amber-700"    // Dark warning text
className="bg-amber-100"      // Light warning background
```

---

### Info - Sky Blue
**Use for:** Informational messages, neutral notifications

| Shade | Hex Code | HSL | Use Case |
|-------|----------|-----|----------|
| **Info** | `#0EA5E9` | `199 89% 48%` | Info badges, informational alerts |

**CSS Variables:**
```css
--brand-info: 199 89% 48%;  /* #0EA5E9 - Sky-500 */
```

**Tailwind Classes:**
```tsx
className="bg-sky-500"      // #0EA5E9
className="text-sky-600"    // Info text
```

---

## Neutral Colors - Slate

**Use for:** Text, backgrounds, borders, cards, general UI elements

| Shade | Hex Code | Use Case |
|-------|----------|----------|
| Slate 50 | `#F8FAFC` | Page backgrounds, very light backgrounds |
| Slate 100 | `#F1F5F9` | Card backgrounds, subtle backgrounds |
| Slate 200 | `#E2E8F0` | Borders, dividers (light) |
| Slate 300 | `#CBD5E1` | Disabled states, inactive elements |
| Slate 400 | `#94A3B8` | Placeholders, captions |
| Slate 500 | `#64748B` | Secondary text |
| Slate 600 | `#475569` | Body text |
| Slate 700 | `#334155` | Headings, important text |
| Slate 800 | `#1E293B` | Dark backgrounds, sidebar (dark mode) |
| Slate 900 | `#0F172A` | Active states (view toggles), darkest text |

**Tailwind Classes:**
```tsx
// Backgrounds
className="bg-slate-50"     // Page background
className="bg-slate-100"    // Card background
className="bg-slate-900"    // Active toggle state

// Text
className="text-slate-600"  // Body text
className="text-slate-700"  // Headings
className="text-slate-900"  // Dark headings

// Borders
className="border-slate-200"  // Light borders
className="border-slate-300"  // Medium borders
```

---

## Context-Based Usage

### Buttons

#### Primary Action Button
```tsx
<Button intent="primary">Save</Button>
```
- **Background:** Teal `#0891B2`
- **Text:** White
- **Hover:** Darker teal `#0E7490`

#### Cancel Button
```tsx
<Button intent="cancel">Cancel</Button>
```
- **Background:** White
- **Text:** Red `#DC2626`
- **Border:** Red
- **Hover:** Light red background `#FEF2F2`

#### Action Button (Export, Edit, View)
```tsx
<Button intent="action">Export</Button>
```
- **Background:** Amber `#F59E0B`
- **Text:** White
- **Hover:** Darker amber

#### Danger/Delete Button
```tsx
<Button intent="danger">Delete</Button>
```
- **Background:** Red `#DC2626`
- **Text:** White
- **Hover:** Darker red `#B91C1C`

#### Success Button
```tsx
<Button intent="success">Complete</Button>
```
- **Background:** Emerald `#10B981`
- **Text:** White
- **Hover:** Darker emerald

#### Ghost Button (Dropdowns, Icon Buttons)
```tsx
<Button variant="ghost">
  <MoreVertical />
</Button>
```
- **Background:** Transparent
- **Text:** Slate 700
- **Hover:** Slate 100 background

#### Outline Button (Filters, Toggles)
```tsx
<Button variant="outline">Filter</Button>
```
- **Background:** White
- **Text:** Slate 700
- **Border:** Slate 300
- **Hover:** Slate 50 background

---

### View Toggle Buttons (Cards/Table Switcher)

**Active State:**
```tsx
className="bg-slate-900 text-white"
```

**Inactive State:**
```tsx
className="bg-white text-slate-700"
```

**⚠️ IMPORTANT:** Use `slate-900` for active state, NOT cyan/teal.

---

### Sidebar

**Background:**
- Light Mode: Dark gradient `hsl(215 28% 17%)` to `hsl(215 28% 14%)`
- Dark Mode: Darker gradient `hsl(215 28% 12%)`

**Text:**
- Default: White
- Active Item: Light Teal `#22D3EE`
- Hover: Light Teal `#22D3EE`

**CSS Variables:**
```css
--sidebar-background: 215 28% 17%;
--sidebar-foreground: 0 0% 100%;
--sidebar-primary: 188 95% 37%;
```

---

### Cards

**Light Mode:**
```tsx
className="bg-white border-slate-200"
```

**Dark Mode:**
```tsx
className="bg-slate-800 border-slate-700"
```

---

### Status Badges

#### Success/Completed
```tsx
className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
```

#### Pending/Warning
```tsx
className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
```

#### Error/Failed
```tsx
className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
```

#### Info
```tsx
className="bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
```

---

### Dropdown Menu Destructive Items

```tsx
<DropdownMenuItem
  onClick={handleDelete}
  className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
>
  <Trash2 className="h-4 w-4 mr-2" />
  Delete
</DropdownMenuItem>
```

---

### Forms

#### Input Borders
```tsx
className="border-slate-200 focus:border-primary focus:ring-primary"
```

#### Validation States
- **Success:** `border-emerald-500 focus:ring-emerald-500`
- **Error:** `border-red-500 focus:ring-red-500`

---

### Typography

#### Headings
```tsx
className="text-slate-900 dark:text-slate-100"  // H1, H2
className="text-slate-800 dark:text-slate-200"  // H3
```

#### Body Text
```tsx
className="text-slate-600 dark:text-slate-400"  // Regular body
className="text-slate-700 dark:text-slate-300"  // Emphasized body
```

#### Secondary/Meta Text
```tsx
className="text-slate-500 dark:text-slate-500"  // Captions, labels
className="text-slate-400 dark:text-slate-600"  // Very subtle text
```

---

## Chart Colors

For data visualization, use this harmonious palette:

```css
--chart-1: 188 95% 37%;   /* Teal - Primary */
--chart-2: 160 84% 39%;   /* Emerald - Success */
--chart-3: 38 92% 50%;    /* Amber - Accent */
--chart-4: 243 75% 59%;   /* Indigo - Secondary */
--chart-5: 271 91% 65%;   /* Purple - Additional */
```

---

## Dark Mode Adjustments

### Backgrounds
- **Page:** `bg-slate-900` (`hsl(215 28% 17%)`)
- **Cards:** `bg-slate-800` (`hsl(215 25% 20%)`)
- **Elevated:** `bg-slate-700`

### Text
- **Headings:** `text-slate-100`
- **Body:** `text-slate-400`
- **Secondary:** `text-slate-500`

### Borders
- **Default:** `border-slate-700`
- **Subtle:** `border-slate-800`

### Brand Colors (Brighter)
- **Primary:** Light Teal `#22D3EE` (instead of `#0891B2`)
- **Accent:** Lighter Amber (60% lightness instead of 50%)

---

## Accessibility Guidelines

### Contrast Ratios
- **Text on white:** Use slate-600 or darker for AA compliance
- **Text on primary:** Always use white text
- **Text on accent:** Always use white text
- **Small text:** Requires 4.5:1 contrast ratio
- **Large text:** Requires 3:1 contrast ratio

### Focus States
Always use `ring-primary` for focus indicators:
```tsx
className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
```

---

## Implementation Files

This color system is implemented in:
1. **[frontend/src/index.css](frontend/src/index.css)** - CSS variables and utility classes
2. **[frontend/tailwind.config.ts](frontend/tailwind.config.ts)** - Tailwind color configuration
3. **[CLAUDE.md](CLAUDE.md)** - Developer guidelines and usage examples

---

## Quick Reference

| Purpose | Color | Hex | Tailwind |
|---------|-------|-----|----------|
| Primary Actions | Teal | `#0891B2` | `bg-primary` |
| Secondary Actions | Indigo | `#4F46E5` | `bg-secondary` |
| Accent/Export | Amber | `#F59E0B` | `bg-accent` |
| Success | Emerald | `#10B981` | `bg-success` |
| Danger/Delete | Red | `#DC2626` | `bg-destructive` |
| Warning | Orange | `#F97316` | `bg-amber-500` |
| Info | Sky Blue | `#0EA5E9` | `bg-sky-500` |
| Text (Body) | Slate 600 | `#475569` | `text-slate-600` |
| Text (Heading) | Slate 900 | `#0F172A` | `text-slate-900` |
| Borders | Slate 200 | `#E2E8F0` | `border-slate-200` |
| Backgrounds | Slate 50 | `#F8FAFC` | `bg-slate-50` |

---

## Migration Notes

### Legacy Color Names (Deprecated)
The following color names are deprecated but maintained for backward compatibility:
- `siohioma-primary` → Use `brand-primary` or `primary`
- `siohioma-orange` → Use `brand-accent` or `accent`
- `siohioma-light-green` → Use `brand-primary-light`

**Action Required:** Gradually replace legacy names with new brand colors in all components.

---

**Last Updated:** 2025-11-30
**Version:** 1.0
