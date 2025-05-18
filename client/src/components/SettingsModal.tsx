import { useState } from "react";
import { X } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    fontFamily: string;
    fontSize: number;
    tabSize: number;
    lineNumbers: boolean;
    wordWrap: boolean;
    minimap: boolean;
    autoSave: boolean;
  };
  onSave: (settings: {
    fontFamily: string;
    fontSize: number;
    tabSize: number;
    lineNumbers: boolean;
    wordWrap: boolean;
    minimap: boolean;
    autoSave: boolean;
  }) => void;
}

export function SettingsModal({ isOpen, onClose, settings, onSave }: SettingsModalProps) {
  const [formState, setFormState] = useState(settings);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formState);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-editor-panel w-3/4 max-w-2xl rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-editor-border">
          <h2 className="font-semibold text-lg">Settings</h2>
          <button className="text-gray-400 hover:text-white" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="flex h-96">
            <div className="w-48 border-r border-editor-border p-4">
              <div className="font-medium mb-2">User</div>
              <ul className="space-y-2 text-sm">
                <li className="text-accent-primary">Editor</li>
                <li className="text-gray-400 hover:text-white">AI Services</li>
                <li className="text-gray-400 hover:text-white">Appearance</li>
                <li className="text-gray-400 hover:text-white">Keyboard</li>
                <li className="text-gray-400 hover:text-white">Extensions</li>
              </ul>
            </div>
            
            <div className="flex-1 p-6 overflow-auto editor-scrollbar">
              <h3 className="font-medium mb-4">Editor Settings</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Font Family</label>
                  <select 
                    className="w-full bg-editor-bg border border-editor-border rounded px-3 py-2"
                    value={formState.fontFamily}
                    onChange={(e) => setFormState({...formState, fontFamily: e.target.value})}
                  >
                    <option value="JetBrains Mono">JetBrains Mono</option>
                    <option value="Fira Code">Fira Code</option>
                    <option value="Consolas">Consolas</option>
                    <option value="Menlo">Menlo</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Font Size</label>
                  <input 
                    type="number" 
                    value={formState.fontSize}
                    onChange={(e) => setFormState({...formState, fontSize: Number(e.target.value)})}
                    min={8}
                    max={24}
                    className="w-24 bg-editor-bg border border-editor-border rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Tab Size</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="tabSize" 
                        checked={formState.tabSize === 2} 
                        onChange={() => setFormState({...formState, tabSize: 2})}
                        className="mr-2" 
                      /> 
                      2 spaces
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="radio" 
                        name="tabSize" 
                        checked={formState.tabSize === 4}
                        onChange={() => setFormState({...formState, tabSize: 4})}
                        className="mr-2" 
                      /> 
                      4 spaces
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="flex items-center text-sm font-medium">
                    <input 
                      type="checkbox" 
                      checked={formState.lineNumbers}
                      onChange={(e) => setFormState({...formState, lineNumbers: e.target.checked})}
                      className="mr-2" 
                    /> 
                    Enable line numbers
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center text-sm font-medium">
                    <input 
                      type="checkbox" 
                      checked={formState.wordWrap}
                      onChange={(e) => setFormState({...formState, wordWrap: e.target.checked})}
                      className="mr-2" 
                    /> 
                    Enable word wrap
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center text-sm font-medium">
                    <input 
                      type="checkbox" 
                      checked={formState.minimap}
                      onChange={(e) => setFormState({...formState, minimap: e.target.checked})}
                      className="mr-2" 
                    /> 
                    Enable minimap
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center text-sm font-medium">
                    <input 
                      type="checkbox" 
                      checked={formState.autoSave}
                      onChange={(e) => setFormState({...formState, autoSave: e.target.checked})}
                      className="mr-2" 
                    /> 
                    Auto-save files
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end px-6 py-4 border-t border-editor-border">
            <button 
              type="button"
              onClick={onClose}
              className="bg-editor-border hover:bg-opacity-80 px-4 py-2 rounded mr-2"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="bg-accent-primary hover:bg-opacity-80 px-4 py-2 rounded"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
