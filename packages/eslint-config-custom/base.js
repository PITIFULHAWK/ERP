/** @type {import("eslint").Linter.Config} */
const config = {
    env: {
        node: true,
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "turbo",
        "prettier",
    ],
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
    },
    rules: {
        "@typescript-eslint/no-unused-vars": "warn",
        "no-console": "warn",
    },
};

export default config;
