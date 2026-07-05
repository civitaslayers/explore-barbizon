import nextConfig from "eslint-config-next/core-web-vitals";

/** @type {import("eslint").Linter.Config[]} */
const config = [
  { ignores: [".next/**", ".claude/worktrees/**"] },
  ...nextConfig,
];

export default config;
