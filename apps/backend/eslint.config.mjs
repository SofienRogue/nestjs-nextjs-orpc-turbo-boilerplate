import { nestJsConfig } from '@workspace/eslint-config/nestjs';
import tseslint from 'typescript-eslint';

export default tseslint.config(...nestJsConfig, {
  languageOptions: {
    parserOptions: {
      tsconfigRootDir: import.meta.dirname,
    },
  },
});