import { useEffect, useRef, useState } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { Skeleton } from "@/components/ui/skeleton";
import { useMonaco } from "@/hooks/useMonaco";
import { Suggestion } from "@/lib/aiService";
import { editorOptions } from "@/lib/editorConfig";
import "@/index.css";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  suggestions: Suggestion | null;
  isLoadingSuggestions: boolean;
  onAcceptSuggestion: (suggestion: string) => void;
  onDismissSuggestion: () => void;
}

export function CodeEditor({
  value,
  onChange,
  language,
  suggestions,
  isLoadingSuggestions,
  onAcceptSuggestion,
  onDismissSuggestion,
}: CodeEditorProps) {
  const [isEditorReady, setIsEditorReady] = useState(false);
  const monacoRef = useRef<any>(null);
  const editorRef = useRef<any>(null);
  const { theme } = useTheme();
  const { setupMonaco } = useMonaco();

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    setupMonaco(monaco);
    setIsEditorReady(true);
  };

  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    const model = editorRef.current.getModel();
    if (model) {
      const position = editorRef.current.getPosition();
      if (position && suggestions?.openAi) {
        // Trim the suggestion to just show a preview of what's being suggested
        // Get first two lines max
        let previewSuggestion = suggestions.openAi;
        const lines = suggestions.openAi.split('\n');
        if (lines.length > 2) {
          previewSuggestion = lines[0] + '\n' + lines[1] + '...';
        }
        
        // Create a decoration to show the suggestion inline (ghost text)
        const decorations = editorRef.current.createDecorationsCollection([
          {
            range: {
              startLineNumber: position.lineNumber,
              startColumn: position.column,
              endLineNumber: position.lineNumber,
              endColumn: position.column,
            },
            options: {
              after: {
                content: previewSuggestion,
                inlineClassName: "suggestion-text",
              },
            },
          },
        ]);

        // Create a disposable handler for Tab key
        const disposable = editorRef.current.addAction({
          id: 'accept-suggestion',
          label: 'Accept Suggestion',
          keybindings: [monacoRef.current.KeyCode.Tab],
          run: () => {
            if (suggestions?.openAi) {
              onAcceptSuggestion(suggestions.openAi);
              return true;
            }
            return false;
          }
        });

        return () => {
          decorations.clear();
          disposable.dispose();
        };
      }
    }
  }, [suggestions, onAcceptSuggestion]);

  return (
    <div className="relative flex flex-col h-full">
      {!isEditorReady && (
        <Skeleton className="w-full h-full absolute z-10 bg-editor-bg" />
      )}
      
      <div className="flex h-10 bg-editor-bg border-b border-editor-border">
        <div className="flex items-center px-4 py-1 bg-editor-activeLine border-r border-editor-border">
          <i className={`ri-${language === "javascript" ? "javascript" : language === "html" ? "html5" : "code-s"}-line mr-2 ${language === "javascript" ? "text-syntax-function" : "text-syntax-type"}`}></i>
          <span>file.{language === "javascript" ? "js" : language === "html" ? "html" : language}</span>
          <button className="ml-2 text-gray-500 hover:text-white">
            <i className="ri-close-line"></i>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <Editor
          height="100%"
          width="100%"
          language={language}
          value={value}
          theme={theme === "light" ? "vs-light" : "vs-dark"}
          options={editorOptions}
          onChange={(value) => onChange(value || "")}
          onMount={handleEditorDidMount}
          className="editor-scrollbar"
          loading={<Skeleton className="w-full h-full bg-editor-bg" />}
        />
        
        {/* Small floating hint when suggestion is available */}
        {suggestions?.openAi && (
          <div className="absolute bottom-3 right-3 bg-editor-panel border border-accent-primary rounded-md px-3 py-1.5 text-sm shadow-lg suggestion-animation z-10">
            <div className="flex items-center">
              <span className="text-xs mr-2">Suggestion available</span>
              <span className="bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono">Tab</span>
              <span className="ml-1 text-xs">to accept</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
