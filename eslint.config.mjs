import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";


export default [
  {languageOptions: { globals: {...globals.browser, ...globals.node} }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    "rules": {
      "eqeqeq": "warn",
      "no-invalid-this": "warn",
      "yoda": "error",
      "sort-vars": 'warn',
      // "sort-imports": "warn"
    }
  }
];