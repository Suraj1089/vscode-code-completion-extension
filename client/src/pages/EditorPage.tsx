import { AIPanel } from "@/components/AIPanel";
import { CodeEditor } from "@/components/Editor";
import { Header } from "@/components/Header";
import { Mascot } from "@/components/Mascot";
import { SettingsModal } from "@/components/SettingsModal";
import { Sidebar } from "@/components/Sidebar";
import { StatusBar } from "@/components/StatusBar";
import { useAIAssistant } from "@/hooks/useAIAssistant";
import { useFiles } from "@/hooks/useFiles";
import { getLanguageFromFilename } from "@/lib/editorConfig";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";

export default function EditorPage() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(true);
  const [isMascotVisible, setIsMascotVisible] = useState(true);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [cursorPosition, setCursorPosition] = useState<{ line: number; column: number } | null>(null);
  const [editorSettings, setEditorSettings] = useState({
    fontFamily: "JetBrains Mono",
    fontSize: 14,
    tabSize: 2,
    lineNumbers: true,
    wordWrap: true,
    minimap: true,
    autoSave: true,
  });
  const [aiSettings, setAISettings] = useState({
    openaiKey: localStorage.getItem("openai_api_key") || "",
    huggingfaceToken: localStorage.getItem("huggingface_token") || "",
    suggestionFrequency: localStorage.getItem("suggestion_frequency") || "medium",
  });
  const [mascotPosition, setMascotPosition] = useState<'top-right' | 'bottom-right' | 'bottom-left' | 'top-left'>(
    localStorage.getItem("mascot_position") as any || "bottom-right"
  );
  
  const { files, createFile, updateFile, getFile } = useFiles();
  
  const { 
    code, 
    language, 
    suggestions, 
    isLoadingSuggestions, 
    updateCode, 
    updateLanguage, 
    applySuggestion, 
    dismissSuggestion 
  } = useAIAssistant(aiSettings.suggestionFrequency);

  // Update AI settings in localStorage when they change
  useEffect(() => {
    localStorage.setItem("openai_api_key", "");
    localStorage.setItem("huggingface_token", aiSettings.huggingfaceToken);
    localStorage.setItem("suggestion_frequency", aiSettings.suggestionFrequency);
  }, [aiSettings]);

  // Handle file selection
  const handleFileSelected = (filename: string, content: string) => {
    setCurrentFile(filename);
    updateCode(content);
    updateLanguage(getLanguageFromFilename(filename));
  };

  // Handle code changes
  const handleCodeChange = (value: string) => {
    updateCode(value);
    if (currentFile) {
      updateFile(currentFile, value);
    }
  };

  // Initialize with default file if needed
  useEffect(() => {
    if (files.length > 0 && !currentFile) {
      const defaultFile = files[0];
      setCurrentFile(defaultFile.name);
      updateCode(defaultFile.content);
      updateLanguage(getLanguageFromFilename(defaultFile.name));
    }
  }, [files]);

  // Save mascot position to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("mascot_position", mascotPosition);
  }, [mascotPosition]);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <div className="h-screen flex flex-col bg-editor-bg text-gray-200">
        <Header onSettingsClick={() => setIsSettingsOpen(true)} />
        
        <main className="flex flex-1 overflow-hidden">
          <Sidebar 
            onOpenSettings={() => setIsSettingsOpen(true)} 
            onFileSelected={handleFileSelected}
            currentFile={currentFile}
          />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <CodeEditor 
              value={code}
              onChange={handleCodeChange}
              language={language}
              suggestions={suggestions}
              isLoadingSuggestions={isLoadingSuggestions}
              onAcceptSuggestion={applySuggestion}
              onDismissSuggestion={dismissSuggestion}
            />
            
            <StatusBar 
              language={language}
              position={cursorPosition}
              aiStatus={{
                openai: !!aiSettings.openaiKey,
                huggingface: !!aiSettings.huggingfaceToken,
              }}
              problems={0}
            />
          </div>
          
          {isAIPanelOpen && (
            <AIPanel 
              suggestions={suggestions}
              onClose={() => setIsAIPanelOpen(false)}
              onApplySuggestion={applySuggestion}
              settings={aiSettings}
              onUpdateSettings={setAISettings}
            />
          )}
        </main>
        
        {/* Our new friendly coding assistant mascot */}
        <Mascot 
          language={language}
          isVisible={isMascotVisible}
          onClose={() => setIsMascotVisible(false)}
          position={mascotPosition}
        />
        
        <SettingsModal 
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={editorSettings}
          onSave={setEditorSettings}
        />
      </div>
    </ThemeProvider>
  );
}
