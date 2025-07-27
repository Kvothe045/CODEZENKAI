import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // VS Code Dark Theme Colors
        'vscode-bg': '#1e1e1e',
        'vscode-sidebar': '#252526',
        'vscode-editor': '#1e1e1e',
        'vscode-line': '#2d2d30',
        'vscode-selection': '#264f78',
        'vscode-blue': '#007acc',
        'vscode-green': '#4ec9b0',
        'vscode-yellow': '#dcdcaa',
        'vscode-red': '#f44747',
        'vscode-text': '#d4d4d4',
        'vscode-comment': '#6a9955'
      },
    },
  },
  plugins: [],
};
export default config;
