import { useState } from "react";
import { 
  ThumbsUp, 
  ThumbsDown, 
  Copy, 
  X, 
  Sparkles,
  MessageSquare
} from "lucide-react";
import { Suggestion } from "@/lib/aiService";

interface AIPanelProps {
  suggestions: Suggestion | null;
  onClose: () => void;
  onApplySuggestion: (suggestion: string) => void;
  settings: {
    openaiKey: string;
    huggingfaceToken: string;
    suggestionFrequency: string;
  };
  onUpdateSettings: (settings: {
    openaiKey: string;
    huggingfaceToken: string;
    suggestionFrequency: string;
  }) => void;
}

export function AIPanel({ 
  suggestions, 
  onClose, 
  onApplySuggestion, 
  settings,
  onUpdateSettings
}: AIPanelProps) {
  const [activeTab, setActiveTab] = useState<'suggestions' | 'chat'>('suggestions');
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="w-72 border-l border-editor-border flex flex-col bg-editor-sidebar">
      <div className="flex items-center justify-between px-4 h-10 border-b border-editor-border">
        <span className="font-medium text-sm">AI ASSISTANT</span>
        <button 
          className="text-gray-400 hover:text-white"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex border-b border-editor-border">
        <button 
          className={`flex-1 py-2 px-4 text-sm ${activeTab === 'suggestions' ? 'border-b-2 border-accent-primary' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('suggestions')}
        >
          Suggestions
        </button>
        <button 
          className={`flex-1 py-2 px-4 text-sm ${activeTab === 'chat' ? 'border-b-2 border-accent-primary' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('chat')}
        >
          Chat
        </button>
      </div>
      
      <div className="p-3 flex-1 overflow-auto editor-scrollbar">
        {activeTab === 'suggestions' ? (
          <>
            {suggestions?.openAi && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <i className="ri-openai-fill mr-2 text-accent-secondary"></i>
                    <span className="font-medium text-sm">OpenAI</span>
                  </div>
                  <span className="text-xs text-gray-400">Just now</span>
                </div>
                <div className="bg-editor-panel p-3 rounded-md text-xs font-mono">
                  <div className="whitespace-pre-wrap">{suggestions.openAi}</div>
                </div>
                <div className="flex justify-end mt-2 space-x-2">
                  <button className="text-xs bg-editor-panel hover:bg-editor-border px-2 py-1 rounded flex items-center">
                    <ThumbsDown className="w-3 h-3 mr-1" />
                    Not helpful
                  </button>
                  <button 
                    className="text-xs bg-accent-primary px-2 py-1 rounded hover:bg-opacity-80 flex items-center"
                    onClick={() => onApplySuggestion(suggestions.openAi)}
                  >
                    <ThumbsUp className="w-3 h-3 mr-1" />
                    Apply
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  <span className="bg-gray-700 px-1 py-0.5 rounded font-mono">Tab</span> 
                  <span className="ml-1">Press Tab in the editor to accept this suggestion</span>
                </div>
              </div>
            )}
            
            {suggestions?.huggingFace && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <i className="ri-ai-generate mr-2 text-syntax-function"></i>
                    <span className="font-medium text-sm">Hugging Face</span>
                  </div>
                  <span className="text-xs text-gray-400">Just now</span>
                </div>
                <div className="bg-editor-panel p-3 rounded-md text-xs font-mono">
                  <div className="whitespace-pre-wrap">{suggestions.huggingFace}</div>
                </div>
                <div className="flex justify-end mt-2 space-x-2">
                  <button className="text-xs bg-editor-panel hover:bg-editor-border px-2 py-1 rounded flex items-center">
                    <ThumbsDown className="w-3 h-3 mr-1" />
                    Not helpful
                  </button>
                  <button 
                    className="text-xs bg-accent-primary px-2 py-1 rounded hover:bg-opacity-80 flex items-center"
                    onClick={() => onApplySuggestion(suggestions.huggingFace)}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Apply
                  </button>
                </div>
              </div>
            )}

            {!suggestions?.openAi && !suggestions?.huggingFace && (
              <div className="text-center py-10 text-gray-400">
                <Sparkles className="w-10 h-10 mx-auto mb-4 opacity-30" />
                <p className="text-sm mb-2">No AI suggestions yet</p>
                <p className="text-xs">Type in the editor to receive suggestions</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10 text-gray-400">
            <MessageSquare className="w-10 h-10 mx-auto mb-4 opacity-30" />
            <p className="text-sm mb-2">Chat coming soon</p>
            <p className="text-xs">This feature is under development</p>
          </div>
        )}
      </div>
      
      <div className="p-3 border-t border-editor-border">
        {isConfiguring ? (
          <>
            <div className="flex justify-between mb-4">
              <span className="text-xs font-medium">AI CONFIGURATION</span>
              <div className="space-x-2">
                <button 
                  className="text-xs text-gray-400 hover:text-white"
                  onClick={() => {
                    setIsConfiguring(false);
                    setTempSettings(settings);
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="text-xs text-accent-primary"
                  onClick={() => {
                    onUpdateSettings(tempSettings);
                    setIsConfiguring(false);
                  }}
                >
                  Save
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs block">OpenAI API Key</label>
                <input 
                  type="password" 
                  value={tempSettings.openaiKey}
                  onChange={(e) => setTempSettings({...tempSettings, openaiKey: e.target.value})}
                  className="w-full text-xs bg-editor-panel px-2 py-1 rounded border border-editor-border"
                  placeholder="sk-..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs block">Hugging Face Token</label>
                <input 
                  type="password" 
                  value={tempSettings.huggingfaceToken}
                  onChange={(e) => setTempSettings({...tempSettings, huggingfaceToken: e.target.value})}
                  className="w-full text-xs bg-editor-panel px-2 py-1 rounded border border-editor-border"
                  placeholder="hf_..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs block">Suggestion Frequency</label>
                <select 
                  className="w-full text-xs bg-editor-panel px-2 py-1 rounded border border-editor-border"
                  value={tempSettings.suggestionFrequency}
                  onChange={(e) => setTempSettings({...tempSettings, suggestionFrequency: e.target.value})}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between mb-2">
              <span className="text-xs font-medium">AI SETTINGS</span>
              <button 
                className="text-xs text-accent-primary"
                onClick={() => setIsConfiguring(true)}
              >
                Configure
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>OpenAI API Key</span>
                <span className="text-xs bg-editor-panel px-2 py-1 rounded">
                  {settings.openaiKey ? "●●●●●●●●●●" : "Not set"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Hugging Face Token</span>
                <span className="text-xs bg-editor-panel px-2 py-1 rounded">
                  {settings.huggingfaceToken ? "●●●●●●●●●●" : "Not set"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Suggestion Frequency</span>
                <select 
                  className="text-xs bg-editor-panel px-2 py-1 rounded border-none"
                  value={settings.suggestionFrequency}
                  onChange={(e) => onUpdateSettings({...settings, suggestionFrequency: e.target.value})}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
