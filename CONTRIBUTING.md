ProfPick Contribution Document

This document outlines the **team’s values, workflows, and contribution rules**. It serves as an agreement among all team members and contributors to ensure that collaboration remains efficient, respectful, and transparent.

---

## Team Values and Norms

Our team follows the [NYU Software Engineering Scrum Framework Team Norms](https://github.com/nyu-software-engineering/scrum-framework/blob/main/team-norms.md).

We value:
- Respectful and consistent communication  
- Accountability for individual and shared tasks  
- Transparency in decision-making and progress tracking  
- Collaboration and adaptability through Agile development principles  

Team members: **Haider**, **Yifan**, **Xiaomin**, **Ogechi**, **Ethan**  
- **Roles rotate** each sprint (Scrum Master, Product Owner, Developer)  
- **Communication channels**: Discord (daily communication) and Email (formal updates)  
- **Project management**: GitHub Projects taskboard and backlog tracking  

---

## Git Workflow

ProfPick follows an **Agile-based Git branching workflow**.  
Contributors **must not fork** the repository; all development is performed through **branches and pull requests** within the main organization repository:

> Repository: [https://github.com/agile-students-fall2025/4-final-random_truthteller]

### Branching Rules
- The **`main`** branch is considered stable and production-ready.  
- Each new feature or bug fix must be developed on a **separate branch** named as follows:
    feature/<short-description>
    fix/<short-description>
    docs/<short-description>
Example:
    feature/schedule-calendar-ui
    fix/login-auth-bug

### Commits
- **Signed commits are required** (`git commit -S -m "message"`)  
- Commit messages must follow this structure:
    [Type]: short descriptive one sentence summary
Examples:
feat: add live calendar view for class scheduling
fix: correct MongoDB connection string issue
docs: update installation steps in README

## Pull Request (PR) Process
Before submitting a PR, ensure all local tests pass, verify your branch is up to date with `main`, and write a clear PR description outlining the purpose of the change, related issue number (if applicable), and testing steps. Every PR requires at least two (2) team member approvals before merging. The Scrum Master for that sprint or the assigned reviewer merges approved PRs. Avoid merging your own PR without peer review unless explicitly approved by the team. No automated CI/CD checks are enforced yet, but manual testing and linting are required.

## Testing and Verification
All contributors must test their changes locally before submitting a PR. Run the project to verify all pages load and the main features work correctly. Ensure that no ESLint warnings or syntax errors remain, the new feature does not break existing functionality, and the UI remains responsive and consistent with design components. Tests must pass before merging into main.

## Contribution Rules

Only approved team members may contribute (no external contributions). All new work should begin with an assigned task on the GitHub project board. Each task or issue should include a clear description of the work to be done, assignee(s), and labels for categorization (feature, bug, enhancement, etc.). Work should follow the Agile sprint plan, updated in daily stand-ups and retrospectives.

## Task Tracking and Accountability

All team members use the GitHub Taskboard for sprint planning and tracking. Each commit and PR must link to its corresponding task or issue. Team progress is evaluated during weekly sprint reviews.

## Code Style and Standards

Use React.js (JSX) for front-end components. Follow project-specific ESLint configuration for formatting and best practices. Avoid inline styles unless necessary; use component-level CSS or styled components. Use clear and descriptive variable and function names. Write short, modular components rather than large monolithic ones.

## Code of Conduct

As part of the NYU Software Engineering community, we commit to a respectful and inclusive environment for all contributors. Contributors must communicate respectfully in code reviews, commits, and discussions; support others’ learning and growth; resolve conflicts constructively; and avoid discriminatory or unprofessional behavior in any project space. Violations will be addressed collectively by the team and reported if necessary.

## Continuous Improvement

We continuously review and refine our processes during sprint retrospectives. All contributors are encouraged to raise ideas for workflow improvement, share constructive feedback during retrospectives, and document new tools, patterns, or lessons learned.