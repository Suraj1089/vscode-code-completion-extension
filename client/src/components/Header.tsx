import { FileIcon, Edit2Icon, EyeIcon, HelpCircleIcon, Settings2Icon, UserIcon } from "lucide-react";

interface HeaderProps {
  onSettingsClick: () => void;
}

export function Header({ onSettingsClick }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-editor-border h-10 px-4">
      <div className="flex items-center">
        <div className="flex items-center mr-4">
          <i className="ri-code-box-line text-lg text-accent-primary mr-2"></i>
          <span className="font-medium">CodeAssist IDE</span>
        </div>
        <nav className="hidden md:flex space-x-1">
          <button className="px-3 py-1 hover:bg-editor-panel rounded text-sm flex items-center">
            <FileIcon className="w-3 h-3 mr-1" />
            File
          </button>
          <button className="px-3 py-1 hover:bg-editor-panel rounded text-sm flex items-center">
            <Edit2Icon className="w-3 h-3 mr-1" />
            Edit
          </button>
          <button className="px-3 py-1 hover:bg-editor-panel rounded text-sm flex items-center">
            <EyeIcon className="w-3 h-3 mr-1" />
            View
          </button>
          <button className="px-3 py-1 hover:bg-editor-panel rounded text-sm flex items-center">
            <HelpCircleIcon className="w-3 h-3 mr-1" />
            Help
          </button>
        </nav>
      </div>
      <div className="flex items-center space-x-2">
        <button 
          className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-editor-panel"
          onClick={onSettingsClick}
        >
          <Settings2Icon className="w-5 h-5" />
        </button>
        <button className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-editor-panel">
          <UserIcon className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
