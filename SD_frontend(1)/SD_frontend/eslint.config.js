import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  {
    ignores: ['dist', 'node_modules'],
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // 기본 JS 룰
      ...js.configs.recommended.rules,

      // React 관련 권장 룰
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      // 🔧 사용자 정의 규칙
      'no-unused-vars': 'off', // 사용되지 않는 변수 경고 끄기
      'react/prop-types': 'off', // prop-types 사용 강제 끄기

      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      'react/jsx-key': 'warn', // map 사용 시 key 없으면 경고
      'react-hooks/exhaustive-deps': 'warn', // useEffect deps 누락 경고
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];
