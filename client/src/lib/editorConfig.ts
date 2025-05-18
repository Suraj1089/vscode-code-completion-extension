// Default editor configuration
export const editorOptions = {
  fontSize: 14,
  fontFamily: "'JetBrains Mono', monospace",
  fontLigatures: true,
  lineNumbers: "on" as const,
  tabSize: 2,
  insertSpaces: true,
  wordWrap: "on" as const,
  minimap: {
    enabled: true,
  },
  scrollBeyondLastLine: false,
  automaticLayout: true,
  scrollbar: {
    useShadows: false,
    verticalScrollbarSize: 10,
    horizontalScrollbarSize: 10,
  },
  lineHeight: 20,
  padding: {
    top: 10,
  },
  suggestOnTriggerCharacters: true,
  parameterHints: {
    enabled: true,
  },
  quickSuggestions: {
    other: true,
    comments: false,
    strings: false,
  },
  acceptSuggestionOnCommitCharacter: true,
  acceptSuggestionOnEnter: "on",
  renderWhitespace: "none",
  renderControlCharacters: false,
  renderIndentGuides: true,
  renderLineHighlight: "all",
  formatOnPaste: false,
  formatOnType: false,
  folding: true,
  showFoldingControls: "mouseover",
  matchBrackets: "always",
  find: {
    addExtraSpaceOnTop: true,
    autoFindInSelection: "never",
    seedSearchStringFromSelection: "selection",
    loop: true,
  },
  cursorBlinking: "blink",
  cursorStyle: "line",
  cursorWidth: 2,
  smoothScrolling: true,
  dragAndDrop: true,
  mouseWheelZoom: true,
  contextmenu: true,
  links: true,
  colorDecorators: true,
  lightbulb: {
    enabled: true,
  },
  bracketPairColorization: {
    enabled: true,
  },
  guides: {
    bracketPairs: true,
    indentation: true,
  },
};

// Language file extensions mappings
export const languageExtensions = {
  javascript: ["js"],
  typescript: ["ts", "tsx"],
  html: ["html", "htm"],
  css: ["css"],
  json: ["json"],
  markdown: ["md", "markdown"],
  python: ["py"],
  java: ["java"],
  csharp: ["cs"],
  cpp: ["cpp", "c", "h"],
  go: ["go"],
  rust: ["rs"],
  php: ["php"],
  ruby: ["rb"],
  sql: ["sql"],
  xml: ["xml"],
  yaml: ["yml", "yaml"],
  plaintext: ["txt"],
};

// Get language from file extension
export const getLanguageFromFilename = (filename: string): string => {
  const extension = filename.split(".").pop()?.toLowerCase() || "";
  
  for (const [language, extensions] of Object.entries(languageExtensions)) {
    if (extensions.includes(extension)) {
      return language;
    }
  }
  
  return "plaintext";
};
