# PR Template Compliance Validator

Automated quality gate that enforces the repository's official Pull Request template.

## Usage

```bash
# Template mode — draft PRs and early feedback
bun run validate:pr -- --mode template --file path/to/pr-body.md

# Review mode — PRs ready for review
bun run validate:pr -- --mode review --file path/to/pr-body.md

# CI / local with environment variable
PR_BODY="$(cat path/to/pr-body.md)" bun run validate:pr -- --mode review
```

## Validation Modes

| Mode       | When                           | What it checks                                                            |
| ---------- | ------------------------------ | ------------------------------------------------------------------------- |
| `template` | Every PR, including drafts     | Structure, placeholders, HTML comments, Type of Change, optional sections |
| `review`   | Non-draft PRs ready for review | Everything in `template` mode plus content quality rules                  |

In GitHub Actions, draft PRs run `template` mode. When a PR leaves draft state, `review` mode runs automatically.

## Validator IDs

| ID    | Name               | Modes            |
| ----- | ------------------ | ---------------- |
| PR001 | Structure          | template, review |
| PR002 | Placeholders       | template, review |
| PR003 | Type of Change     | template, review |
| PR004 | Reviewer Notes     | template, review |
| PR005 | Additional Context | template, review |
| PR006 | Summary            | review           |
| PR007 | Related Issues     | review           |
| PR008 | Success Criteria   | review           |
| PR009 | How to Validate    | review           |

## Related Issues Format

Each non-empty line must match one of these formats:

```
Closes #123
Fixes ABC-123
Resolves #456
Relates to PER-10
```

Or the entire section may be:

```
N/A
```

Cross-platform issue keys (Linear, Jira, etc.) are supported without `#`:

```
Closes PER-10
Fixes ENG-42
```

## Fixing Common Failures

### PR001 — Structure

Keep the exact section titles and order from `.github/PULL_REQUEST_TEMPLATE.md`. Do not rename sections or add new ones.

### PR002 — Placeholders

Replace template placeholders such as:

- `- [ ] <One checklist item for each meaningful change>`
- `Closes #`
- `-`
- `1.`

Remove all `<!-- ... -->` instructional comments.

### PR003 — Type of Change

Select exactly one checkbox. Unordered list markers `-`, `*` and `+` are all accepted:

```markdown
- [x] ✨ Feature
- [ ] 🐛 Fix
```

### PR006 — Summary

Mark at least one checklist item as completed. Unordered list markers `-`, `*` and `+` are all accepted:

```markdown
- [x] Describe the meaningful change in this Pull Request
```

```markdown
- [x] Describe the meaningful change in this Pull Request
```

### PR007 — Related Issues

Use a supported reference format or `N/A` alone in the section. An optional list marker prefix (`-`, `*` or `+`) is accepted:

```markdown
- Closes #123
```

### PR008 — Success Criteria

Provide at least one meaningful bullet. `N/A` is not allowed in this section. Unordered list markers `-`, `*` and `+` are all accepted:

```markdown
- Users can successfully complete the expected outcome.
```

### PR009 — How to Validate

Provide at least one numbered step. `N/A` is not allowed in this section (review mode).

```markdown
1. Run `bun dev`
2. Verify the expected behavior
```

## Development

```bash

To run in review mode to check a PR:

bun run validate:pr -- --mode review --file scripts/validate-pr/fixtures/valid.md

or run in template mode to check the template itself:

bun run validate:pr -- --mode template --file scripts/validate-pr/fixtures/valid.md
```

The template definition in `core/template.ts` is kept in sync with `.github/PULL_REQUEST_TEMPLATE.md` via a dedicated sync test.
