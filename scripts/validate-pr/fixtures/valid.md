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

## How to Validate

1. Run `bun run validate:pr -- --mode review --file scripts/validate-pr/fixtures/valid.md`
2. Verify the command exits with code 0

## Reviewer Notes

N/A

## Additional Context

N/A
