import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/*.d.ts',
      '.claude/**',
      // Standalone StackBlitz apps, each with its own tooling.
      'examples/**',
      'docs/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    // Tests and build tooling are outside the publishable projects on purpose, so type-aware
    // linting is pointed at a project that includes them.
    files: [
      '*.config.ts',
      'eslint.config.js',
      'packages/*/tsup.config.ts',
      'packages/*/vitest.config.ts',
      'packages/*/tests/**/*.ts',
      'packages/*/tests/**/*.tsx',
      'scripts/*.mjs',
    ],
    languageOptions: {
      parserOptions: {
        projectService: false,
        project: './tsconfig.tools.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['scripts/*.mjs'],
    languageOptions: {
      globals: { console: 'readonly', fetch: 'readonly', process: 'readonly' },
    },
  },
)
