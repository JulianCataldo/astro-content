// eslint-disable-next-line tsdoc/syntax
/** @type {import("@types/eslint").Linter.Config} */

module.exports = {
  root: true,

  settings: {
    'import/resolver': {
      typescript: {}, // this loads <rootdir>/tsconfig.json to eslint
    },
  },
  env: {
    node: true,
    es2022: true,
    browser: true,
  },
  extends: ['eslint:recommended'],

  // Disabled, err 'Plugin "tsdoc" was conflicted between'
  plugins: ['eslint-plugin-tsdoc'],
  rules: {
    'no-restricted-syntax': 0,
    'tsdoc/syntax': 'warn',
  },

  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  overrides: [
    {
      files: ['*.mdx'],
      // extends: ['plugin:mdx/recommended'],
      plugins: [
        'plugin:mdx/recommended',
        'prettier',
        // 'preset-lint-consistent',
        // 'preset-lint-markdown-style-guide',
        // 'preset-lint-recommended',
        // 'preset-prettier',
      ],
      // optional, if you want to lint code blocks at the same time
      // settings: {
      //   'mdx/code-blocks': true,
      //   // optional, if you want to disable language mapper, set it to `false`
      //   // if you want to override the default language mapper inside, you can provide your own
      //   'mdx/language-mapper': {},
      // },
    },
    {
      files: ['*.ts', '*.mts', '*.cts'],
      parser: '@typescript-eslint/parser',
      extends: [
        'airbnb-base',
        'plugin:@typescript-eslint/recommended',
        'prettier',
      ],
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' },
        ],
        '@typescript-eslint/no-non-null-assertion': 'off',
        'max-lines': [
          'error',
          { max: 150, skipComments: true, skipBlankLines: true },
        ],
        'import/extensions': [
          'error',
          'ignorePackages',
          { js: 'never', ts: 'never', tsx: 'never' },
        ],
      },
    },
    {
      files: ['*.jsx'],
      extends: ['airbnb', 'plugin:react/jsx-runtime', 'prettier'],
      rules: {
        'import/extensions': [
          'error',
          'ignorePackages',
          { js: 'never', ts: 'never', tsx: 'never' },
        ],
      },
    },
    {
      files: ['*.tsx'],
      extends: [
        'airbnb',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/jsx-runtime',
        'prettier',
      ],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      rules: {
        'react/jsx-filename-extension': [1, { extensions: ['.tsx'] }],
        'import/extensions': [
          'error',
          'ignorePackages',
          { js: 'never', ts: 'never', tsx: 'never' },
        ],
      },
    },
  ],
};
