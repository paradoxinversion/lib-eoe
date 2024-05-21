import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";


export default [
  {languageOptions: { globals: {...globals.browser, ...globals.node} }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    "rules": {
      "no-unused-vars": ["error", {
          "vars": "all",
          "args": "after-used",
          "caughtErrors": "all",
          "ignoreRestSiblings": false,
          "reportUsedIgnorePattern": false
      }]
    }
  }
];