export default {
  "*.{js,cjs,mjs,ts,tsx}": ["oxlint --fix", "oxfmt --write"],

  "*.{json,yml,yaml,md,mdx}": ["oxfmt --write"],

  "*.{css,scss}": ["oxfmt --write"],
};
