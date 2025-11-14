import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

export default [
	{
		files: ["**/*.js"],
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			globals: {
				Response: "readonly",
				Request: "readonly",
				addEventListener: "readonly",
				console: "readonly",
				fetch: "readonly"
			}
		},
		rules: {
			"indent": ["error", "tab"],
			"linebreak-style": ["error", "unix"],
			"quotes": ["error", "double"],
			"semi": ["error", "always"]
		}
	},
	{
		files: ["**/*.ts"],
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			parser: tsparser,
			parserOptions: {
				project: "./tsconfig.json"
			}
		},
		plugins: {
			"@typescript-eslint": tseslint
		},
		rules: {
			"indent": ["error", "tab"],
			"linebreak-style": ["error", "unix"],
			"quotes": ["error", "double"],
			"semi": ["error", "always"],
			"@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
			"@typescript-eslint/explicit-function-return-type": "off"
		}
	}
];
