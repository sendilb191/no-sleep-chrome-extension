import prettier from "eslint-config-prettier";

export default [
  {
    ignores: ["node_modules/**"],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        chrome: "readonly",
        navigator: "readonly",
        document: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        window: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
      "no-console": "off",
      semi: ["error", "always"],
      quotes: ["error", "double"],
      indent: ["error", 2],
      "no-multiple-empty-lines": ["error", { max: 1 }],
      "eol-last": ["error", "always"],
    },
  },
  prettier,
];
