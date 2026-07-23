# Core Project Context
Please read and strictly follow the product roadmap and business logic defined in:
- @PRD.md

# Core Project Rules
Please load and adhere to the following specialized agent skills for this project:
- @.agents/skills/agent-memory-systems/SKILL.md
- @.agents/skills/backend-security-coder/SKILL.md
- @.agents/skills/clean-code/SKILL.md
- @.agents/skills/codex-subagent/SKILL.md
- @.agents/skills/nextjs-best-practices/SKILL.md
- @.agents/skills/prisma-expert/SKILL.md
- @.agents/skill/supabase-postgres-best-practices.md
- @.agents/skills/ui-ux-pro-max/SKILL.md

# Design System & Component Architecture
For all visual and component generation, strictly follow:
- @DESIGN.MD

## UI Reusability & Architecture Rules (Atomic Design)
- **No Hardcoding Native HTML:** DO NOT use native HTML tags like `<input>`, `<button>`, or raw cards directly inside complex forms or page components.
- **Enforce Reusable Components:** Always separate concerns. Build or use foundational, reusable UI components inside the `/components/ui/` directory (e.g., `/components/ui/Input.tsx`, `/components/ui/Button.tsx`).
- **Mandatory forwardRef:** All reusable UI elements (especially form inputs and buttons) MUST implement `forwardRef`. This ensures seamless integration with `react-hook-form` and `framer-motion`.
- **Composition over Monolith:** When generating a new form or layout, import and compose these custom UI components to maintain a clean, consistent codebase and avoid massive monolithic files.