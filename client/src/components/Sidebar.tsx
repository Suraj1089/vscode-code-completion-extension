import { useState } from "react";
import { 
  FileTextIcon, 
  SearchIcon, 
  GitBranchIcon, 
  BugIcon, 
  TerminalIcon, 
  BotIcon,
  UserIcon,
  SettingsIcon,
  FolderIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  RefreshCw,
  MoreHorizontalIcon,
  XIcon
} from "lucide-react";
import { useFiles } from "@/hooks/useFiles";

interface SidebarProps {
  onOpenSettings: () => void;
  onFileSelected: (filename: string, content: string) => void;
  currentFile: string | null;
}

export function Sidebar({ onOpenSettings, onFileSelected, currentFile }: SidebarProps) {
  const { files, createFile } = useFiles();
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);
  
  return (
    <div className="flex flex-col border-r border-editor-border h-full">
      {/* Sidebar Icons */}
      <div className="w-12 flex flex-col items-center py-2 bg-editor-sidebar">
        <button className="p-2 text-accent-primary bg-opacity-20 bg-accent-primary rounded mb-2">
          <FileTextIcon className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-400 hover:text-white rounded mb-2">
          <SearchIcon className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-400 hover:text-white rounded mb-2">
          <GitBranchIcon className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-400 hover:text-white rounded mb-2">
          <BugIcon className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-400 hover:text-white rounded mb-2">
          <TerminalIcon className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-400 hover:text-white rounded mb-2">
          <BotIcon className="w-5 h-5" />
        </button>
        <div className="flex-1"></div>
        <button className="p-2 text-gray-400 hover:text-white rounded mb-2">
          <UserIcon className="w-5 h-5" />
        </button>
        <button 
          className="p-2 text-gray-400 hover:text-white rounded"
          onClick={onOpenSettings}
        >
          <SettingsIcon className="w-5 h-5" />
        </button>
      </div>

      {/* File Explorer */}
      <div className="w-56 bg-editor-sidebar flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 h-10 border-b border-editor-border">
          <span className="font-medium text-sm">EXPLORER</span>
          <button className="text-gray-400 hover:text-white">
            <MoreHorizontalIcon className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-2 border-b border-editor-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold tracking-wide">OPEN EDITORS</span>
            <button className="text-xs text-gray-400 hover:text-white">
              <XIcon className="w-3 h-3" />
            </button>
          </div>
          <div className="ml-2">
            {files.length > 0 ? (
              files.map((file) => (
                <div 
                  key={file.name}
                  className={`flex items-center py-1 px-2 ${currentFile === file.name ? 'bg-editor-activeLine rounded' : 'text-gray-400 hover:text-white'} cursor-pointer text-sm`}
                  onClick={() => onFileSelected(file.name, file.content)}
                >
                  <i className={`ri-${file.name.endsWith('.js') ? 'javascript' : file.name.endsWith('.html') ? 'html5' : 'code-s'}-line mr-2 ${file.name.endsWith('.js') ? 'text-syntax-function' : file.name.endsWith('.html') ? 'text-syntax-type' : ''}`}></i>
                  <span>{file.name}</span>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-xs italic py-1">No open editors</div>
            )}
          </div>
        </div>
        
        <div className="p-2 flex-1 overflow-auto editor-scrollbar">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold tracking-wide">PROJECT</span>
            <div className="flex space-x-1">
              <button 
                className="text-xs text-gray-400 hover:text-white"
                onClick={() => {
                  const filename = prompt("Enter file name (e.g. example.js):");
                  if (filename) {
                    createFile(filename, "// Your code here");
                    onFileSelected(filename, "// Your code here");
                  }
                }}
              >
                <PlusIcon className="w-3 h-3" />
              </button>
              <button className="text-xs text-gray-400 hover:text-white">
                <RefreshCw className="w-3 h-3" />
              </button>
              <button className="text-xs text-gray-400 hover:text-white">
                <MoreHorizontalIcon className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          {/* File Tree */}
          <div className="ml-2 text-sm">
            <div className="flex items-center py-1">
              <button 
                className="flex items-center focus:outline-none"
                onClick={() => setIsExplorerOpen(!isExplorerOpen)}
              >
                {isExplorerOpen ? (
                  <ChevronDownIcon className="w-4 h-4 mr-1 text-gray-400" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4 mr-1 text-gray-400" />
                )}
                <FolderIcon className="w-4 h-4 mr-1 text-gray-400" />
                <span>src</span>
              </button>
            </div>
            
            {isExplorerOpen && (
              <div className="ml-4">
                {files.map((file) => (
                  <div 
                    key={file.name}
                    className={`flex items-center py-1 cursor-pointer ${currentFile === file.name ? 'bg-editor-activeLine rounded px-2' : ''}`}
                    onClick={() => onFileSelected(file.name, file.content)}
                  >
                    <i className={`ri-${file.name.endsWith('.js') ? 'javascript' : file.name.endsWith('.html') ? 'html5' : file.name.endsWith('.css') ? 'css3' : 'file-text'}-line mr-2 ${
                      file.name.endsWith('.js') ? 'text-syntax-function' : 
                      file.name.endsWith('.html') ? 'text-syntax-type' : 
                      file.name.endsWith('.css') ? 'text-blue-400' : 'text-gray-400'
                    }`}></i>
                    <span>{file.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
