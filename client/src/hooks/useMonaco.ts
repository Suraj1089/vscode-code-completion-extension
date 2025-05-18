import { languages } from "monaco-editor";

export function useMonaco() {
  const setupMonaco = (monaco: any) => {
    // Set up theme
    monaco.editor.defineTheme("vs-dark-custom", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6A9955" },
        { token: "keyword", foreground: "569CD6" },
        { token: "string", foreground: "CE9178" },
        { token: "number", foreground: "B5CEA8" },
        { token: "type", foreground: "4EC9B0" },
        { token: "function", foreground: "DCDCAA" },
        { token: "variable", foreground: "9CDCFE" },
      ],
      colors: {
        "editor.background": "#1E1E1E",
        "editor.foreground": "#D4D4D4",
        "editorCursor.foreground": "#AEAFAD",
        "editor.lineHighlightBackground": "#282828",
        "editorLineNumber.foreground": "#5A5A5A",
        "editor.selectionBackground": "#264F78",
        "editor.inactiveSelectionBackground": "#3A3D41",
        "editorIndentGuide.background": "#404040",
      },
    });

    monaco.editor.setTheme("vs-dark-custom");

    // Set up suggestions provider (example for JavaScript)
    monaco.languages.registerCompletionItemProvider("javascript", {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };
        
        const suggestions = [
          {
            label: "console.log",
            kind: monaco.languages.CompletionItemKind.Method,
            documentation: "Log to the console",
            insertText: "console.log($1);",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range,
          },
          {
            label: "function",
            kind: monaco.languages.CompletionItemKind.Snippet,
            documentation: "Create a function",
            insertText: "function ${1:name}(${2:params}) {\n\t${3}\n}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range,
          },
          {
            label: "if",
            kind: monaco.languages.CompletionItemKind.Snippet,
            documentation: "Create an if statement",
            insertText: "if (${1:condition}) {\n\t${2}\n}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range,
          },
          {
            label: "async function",
            kind: monaco.languages.CompletionItemKind.Snippet,
            documentation: "Create an async function",
            insertText: "async function ${1:name}(${2:params}) {\n\t${3}\n}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range,
          },
          {
            label: "for",
            kind: monaco.languages.CompletionItemKind.Snippet,
            documentation: "Create a for loop",
            insertText: "for (let ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++) {\n\t${3}\n}",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range,
          },
        ];
        
        return { suggestions };
      },
    });
  };

  return { setupMonaco };
}
