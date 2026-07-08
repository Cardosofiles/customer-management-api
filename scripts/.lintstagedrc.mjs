/**
 * lint-staged — fast, auto-fixing checks over staged files only.
 *
 * Invoked by the Husky `pre-commit` hook. Type-checking and the full test
 * suite intentionally live in `pre-push`: both need the whole project graph,
 * so running them per-file here would be both slow and incorrect.
 *
 * @see https://github.com/lint-staged/lint-staged
 */
export default {
  '*.{ts,mts,cts}': ['eslint --fix --no-warn-ignored', 'prettier --write'],
  '*.{js,mjs,cjs}': ['eslint --fix --no-warn-ignored', 'prettier --write'],
  '*.{json,jsonc,md,yml,yaml}': ['prettier --write'],
};
