## Summary

- [x] Add PR compliance validator with template and review modes

## Type of Change

- [x] ✨ Feature
- [ ] 🐛 Fix
- [ ] ♻️ Refactor
- [ ] 📦 Chore
- [ ] 📚 Documentation
- [ ] 💥 Breaking Change

## Related Issues

Closes #42

## Success Criteria

- CI blocks non-compliant Pull Request descriptions
- Reviewers can use asterisk bullets without failing validation

## How to Validate

1. Run `bun run validate:pr -- --mode review --file scripts/validate-pr/validators/success-criteria/fixtures/valid-success-criteria-asterisk.md`
2. Verify the command exits with code 0

## Reviewer Notes

N/A

## Additional Context

N/A
