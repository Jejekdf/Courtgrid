# CourtGrid - Design System & UI/UX Guidelines

## Tokens
Reference these tokens exactly when generating Tailwind CSS classes. Do not invent new colors or spacing values outside of this system.

### Colors
| Token | Tailwind Class | Use |
| :--- | :--- | :--- |
| `{colors.canvas-light}` | `bg-white` | Main application background. |
| `{colors.canvas-subtle}`| `bg-zinc-50` | Secondary backgrounds, inactive states, or subtle sections. |
| `{colors.canvas-dark}` | `bg-zinc-950` | Primary interactive elements, buttons, and dark accents. |
| `{colors.ink-primary}` | `text-zinc-950` | Primary headings, body text, active icons. |
| `{colors.ink-muted}` | `text-zinc-500` | Secondary text, placeholders, subtitles, disabled states. |
| `{colors.border-light}` | `border-zinc-200`| Card borders, dividers, input borders. |
| `{colors.border-focus}` | `border-zinc-950`| Active or focused input borders. |

### Semantic & Status Colors
Used exclusively to guide the user's eye for important states and feedback.
| Token | Tailwind Class | Use |
| :--- | :--- | :--- |
| `{colors.status-selected}`| `bg-emerald-600 text-white shadow-md` | Selected booking slots or successful actions. |
| `{colors.status-pending}` | `bg-amber-50 text-amber-700 border-amber-200` | Pending states, DP (Down Payment) waiting status. |
| `{colors.error-bg}` | `bg-red-50` | Error state backgrounds. |
| `{colors.error-text}` | `text-red-500` | Error messages, destructive actions, Zod validation feedback. |

### Typography
| Token | Tailwind Class | Use |
| :--- | :--- | :--- |
| `{typography.h1}` | `text-3xl font-bold tracking-tight` | Page titles, main hero headings. |
| `{typography.h2}` | `text-2xl font-semibold tracking-tight`| Section headings. |
| `{typography.h3}` | `text-lg font-medium tracking-tight` | Card titles, modal headers. |
| `{typography.body}` | `text-base leading-relaxed` | Standard paragraph text. |
| `{typography.body-sm}`| `text-sm leading-normal` | UI text, dense data tables, secondary details. |
| `{typography.label}` | `text-xs font-medium uppercase tracking-wider`| Input labels, badges, table headers. |

### Shapes (Border Radius)
| Token | Tailwind Class | Use |
| :--- | :--- | :--- |
| `{rounded.sm}` | `rounded-md` | Small interactive elements, checkboxes, small badges. |
| `{rounded.md}` | `rounded-lg` | Standard buttons, input fields, dropdown menus. |
| `{rounded.lg}` | `rounded-xl` | Cards, modals, main content containers. |

### Elevation & Depth
Depth in CourtGrid is achieved through crisp, clean borders and very soft shadows to maintain a bright, flat UI aesthetic.
| Token | Tailwind Class | Use |
| :--- | :--- | :--- |
| `{elevation.flat}` | `border {colors.border-light} shadow-none`| Default container state. |
| `{elevation.subtle}`| `border {colors.border-light} shadow-sm` | Default cards, resting buttons, top navigation. |
| `{elevation.hover}` | `border {colors.border-light} shadow-md` | Hover states for interactive cards (Courts). |
| `{elevation.modal}` | `border {colors.border-light} shadow-xl` | Dialogs, modals, and popovers. |

---

## Components

### Buttons
**`button-primary`** — The main call-to-action (e.g., "Book Now", "Pay DP").
*   Background `{colors.canvas-dark}`, Text `text-white`, Geometry `{rounded.md}`, Padding `px-4 py-2`, Font `{typography.body-sm} font-medium`.
*   Hover state: `hover:bg-zinc-800`.
*   Transition: `transition-all duration-200 active:scale-[0.98]`.

**`button-secondary`** — Alternative actions (e.g., "Cancel", "View Details").
*   Background `{colors.canvas-light}`, Border `1px solid {colors.border-light}`, Text `{colors.ink-primary}`, Geometry `{rounded.md}`, Padding `px-4 py-2`.
*   Hover state: `hover:bg-zinc-50`.

**`button-destructive`** — Actions with negative consequences.
*   Background `{colors.error-bg}`, Text `{colors.error-text}`, Border `1px solid border-red-200`, Hover: `hover:bg-red-100`.

### Cards & Containers
**`card-court-list`** — Used to display available sport courts.
*   Background `{colors.canvas-light}`, Padding `p-5`, Geometry `{rounded.lg}`, Elevation `{elevation.subtle}`.
*   Hover behavior: `transition-all duration-300 hover:-translate-y-1 hover:shadow-md`.

**`card-auth`** — Container for Login/Register forms.
*   Background `{colors.canvas-light}`, Padding `p-8`, Geometry `{rounded.lg}`, Elevation `{elevation.subtle}`, Max-width `max-w-md mx-auto`.

### Inputs & Forms (Zod + React Hook Form)
**`text-input`** — Standard form fields.
*   Background `bg-white`, Border `border {colors.border-light}`, Text `{colors.ink-primary}`, Padding `px-3 py-2`, Geometry `{rounded.md}`.
*   Focus state: `focus:outline-none focus:ring-2 focus:ring-zinc-950/20 focus:border-zinc-950 transition-colors`.
*   Error state: Border changes to `border-red-500`, accompanied by a `{typography.body-sm} {colors.error-text}` label immediately below the input.

---

## Signature Components

1.  **Dynamic QRIS Checkout Panel:** 
    A minimalist, centered modal or card specifically designed for the 50% DP Anti-Palkor system. Features a clean SVG rendering of the QR code, bordered by `{colors.border-light}`, with a mono-spaced countdown timer prominently displayed in `{typography.h2}`.
    
2.  **Booking Time Slot Grid:**
    A wrap flex container or grid of interactive time slots.
    *   **Available:** `bg-white border border-zinc-200 text-zinc-700 hover:border-zinc-950`
    *   **Selected:** Strictly use `{colors.status-selected}` (`bg-emerald-600 text-white shadow-md`)
    *   **Pending / DP:** Strictly use `{colors.status-pending}` (`bg-amber-50 text-amber-700 border-amber-200`)
    *   **Booked / Unavailable:** `bg-zinc-100 text-zinc-400 cursor-not-allowed line-through`

---

## Do's and Don'ts

### Do
*   Use standard HTML5 semantic tags (`<header>`, `<main>`, `<section>`, `<article>`) for all structural wrappers.
*   Ensure every interactive element has `transition-all duration-200` to maintain the "UI/UX Pro Max" smooth feel.
*   Render form validation errors dynamically using Zod schema outputs in `{colors.error-text}`.
*   Enforce a generous use of whitespace (padding and margin) to maintain the clean aesthetic.
*   Maintain a clean Light Mode foundation (Zinc + White). Use Semantic Colors (Emerald, Amber, Red) exclusively for statuses, validation, and critical user feedback to guide the eye naturally.

### Don't
*   **Don't use heavy, blurred drop shadows.** Depth is created by crisp `1px` borders and very subtle `shadow-sm`.
*   **Don't use dark backgrounds for main containers.** Use `bg-white` or `bg-zinc-50`. Save `bg-zinc-950` purely for text and primary buttons.
*   **Don't use absolute positioning for layout.** Rely on modern CSS Grid and Flexbox for responsiveness.
*   **Don't mix client and server components blindly.** Explicitly declare `"use client"` only at the leaf nodes (forms, interactive buttons) while keeping layouts as Server Components in Next.js 16.

---

## Responsive Behavior & Breakpoints

| Name | Width | Key Changes |
| :--- | :--- | :--- |
| Desktop | `≥ 1024px` | Default layout. Court grids display 3-up or 4-up. Sidebars visible. |
| Tablet | `768px – 1023px` | Court grids display 2-up. Sidebars convert to slide-over drawers. |
| Mobile | `< 768px` | Typography scales down (H1 becomes `text-2xl`). Court grids display 1-up. Navigation collapses to a hamburger menu. Full-width buttons for touch targets. |

**Touch Target Rule:**
All interactive elements (buttons, inputs, time slots) on Mobile (`< 768px`) MUST have a minimum height of `44px` to comply with WCAG AAA accessibility standards.