module.exports = {
    extends: [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:@typescript-eslint/recommended",
        "prettier",
    ],

    rules: {
        "prettier/prettier": "error",
    },

    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint", "prettier"],
};
