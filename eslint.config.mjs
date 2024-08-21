import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        ignores: ['**/*.js'],
    },
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-require-imports': 'off',
            indent: ['warn', 4, {
                SwitchCase: 1
            }],
            'no-console': 'off',
            'no-trailing-spaces': 'error',
            quotes: ['error', 'single', {
                avoidEscape: true,
                allowTemplateLiterals: true
            }],
            semi: ['error', 'always'],
            'comma-dangle': ['error', 'only-multiline']
        },
        languageOptions: {
            ecmaVersion: 2023,
            sourceType: 'module'
        }
    }
);