/**
 * Commitlint — Conventional Commits, Staff-level ruleset.
 *
 * Enforced by the Husky `commit-msg` hook. Authored as native ESM (`.mjs`) so
 * it loads without a TypeScript runtime loader under this `"type": "module"`
 * package, while staying fully typed for editors via the JSDoc annotation.
 *
 * Format: <type>(<scope>): <subject>
 *   e.g. feat(customers): add idempotent registration intent
 *
 * @see https://www.conventionalcommits.org/
 * @type {import('@commitlint/types').UserConfig}
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Allowed commit types (superset of the Angular convention).
    'type-enum': [
      2,
      'always',
      [
        'feat', // A new feature
        'fix', // A bug fix
        'docs', // Documentation only
        'style', // Formatting, no code-behavior change
        'refactor', // Neither fixes a bug nor adds a feature
        'perf', // Performance improvement
        'test', // Adding or fixing tests
        'build', // Build system or dependencies (pnpm, Docker)
        'ci', // CI configuration and scripts
        'chore', // Other changes that don't touch src or tests
        'revert', // Reverts a previous commit
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'scope-case': [2, 'always', 'kebab-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'header-max-length': [2, 'always', 100],
    'body-leading-blank': [2, 'always'],
    'body-max-line-length': [1, 'always', 100],
    'footer-leading-blank': [2, 'always'],
  },
};
