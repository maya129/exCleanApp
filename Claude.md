# Project Instructions & Rules (Claude.md)



## Project Context

- **Git Repo:** https://github.com/maya129/exCleanApp

- **Status File:** refer to `./Status.md` for current progress.

- **Specs:** refer to `./PRD.md` and `./TechSpec.md`.



## Core Development Rules

1. **Clean Code:** Always prioritize readability and modularity.

2. **No Orphaned Code:** If a change makes a function or variable redundant, delete it immediately.

3. **DRY (Don't Repeat Yourself):** If a code block is used more than once, extract it to a separate file or a reusable function.

4. **Temporary Files:** All temporary test scripts or scratchpads MUST be saved in the `tmp/` directory. (Ensure this folder is in .gitignore).

5. **Logging:** Every execution flow must include detailed logging to assist in debugging. Use descriptive log messages.



## Memory & Learning

- **Fundamental Fixes:** If I correct you on a core logic error or a recurring mistake, update this `Claude.md` file with a new rule to prevent it from happening again.

- **Workflow:** Update `Status.md` after every significant change or bug fix.



## AI & Data Caution (Crucial)

- Do NOT sample datasets (e.g., "first 10 rows") unless explicitly requested. Analyze the full dataset.

- Double-check numerical comparisons (greater than/less than) before presenting conclusions.
