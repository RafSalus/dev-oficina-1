import js from '@eslint/js'
import globals from 'globals'

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // Regras ajustadas para aceitar baseline legado de forma não-bloqueante (AC4)
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^(React|_)' }],
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'no-empty': ['warn', { allowEmptyCatch: true }],
      'no-useless-assignment': 'warn',
      'preserve-caught-error': 'warn',
      'no-undef': 'warn',
      'no-debugger': 'warn',
    },
  },
  {
    // Regras estritamente bloqueantes para os módulos novos desenvolvidos a partir do Epic 1
    files: [
      'src/components/auth/**/*.{js,jsx}',
      'src/context/AdminAuthContext.jsx',
      'src/context/ClienteContext.jsx',
      'src/pages/GestaoMfa*.jsx',
      'tests/**/*.{js,jsx}',
    ],
    rules: {
      'no-undef': 'error',
      'no-debugger': 'error',
      'no-useless-assignment': 'error',
    },
  },
  {
    ignores: [
      'dist/**',
      'dist_old/**',
      'node_modules/**',
      '.aiox-core/**',
      '.claude/**',
      '.grok/**',
      '.gemini/**',
      '.antigravity/**',
      'build/**',
    ],
  },
]
