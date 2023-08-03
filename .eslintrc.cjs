module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
        project: "./tsconfig.json",
    },
    extends: [
        "airbnb-base",
        "plugin:@typescript-eslint/recommended",
        "plugin:prettier/recommended",
    ],
    plugins: ["@typescript-eslint", "prettier"],
    rules: {
        "prettier/prettier": ["error", { printWidth: 80 }],
        "import/no-unresolved": "off",
        "import/extensions": "off",
        "no-console": "off",
        "class-methods-use-this": "off",
        "import/prefer-default-export": "off",
        "lines-between-class-members": "off",
        "no-useless-constructor": "off",
        "no-empty-function": "off",
    },
};