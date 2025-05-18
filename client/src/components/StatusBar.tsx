import { useState, useEffect } from "react";

interface StatusBarProps {
  language: string;
  position: { line: number; column: number } | null;
  aiStatus: {
    openai: boolean;
    huggingface: boolean;
  };
  problems: number;
}

export function StatusBar({ language, position, aiStatus, problems }: StatusBarProps) {
  return (
    <div className="h-6 flex items-center justify-between px-4 text-xs border-t border-editor-border bg-editor-panel">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <i className={`ri-${language === "javascript" ? "javascript" : language === "html" ? "html5" : "code-s"}-line mr-1`}></i>
          <span>{language === "javascript" ? "JavaScript" : language === "html" ? "HTML" : language === "css" ? "CSS" : "Text"}</span>
        </div>
        <div>Ln {position?.line || 1}, Col {position?.column || 1}</div>
        <div>Spaces: 2</div>
      </div>
      <div className="flex items-center space-x-4">
        <div className={`flex items-center ${aiStatus.openai ? 'text-accent-secondary' : 'text-gray-500'}`}>
          <i className="ri-openai-fill mr-1"></i>
          <span>OpenAI</span>
        </div>
        <div className={`flex items-center ${aiStatus.huggingface ? 'text-syntax-function' : 'text-gray-500'}`}>
          <i className="ri-ai-generate mr-1"></i>
          <span>Hugging Face</span>
        </div>
        <div className={`flex items-center ${problems > 0 ? 'text-accent-error' : 'text-accent-success'}`}>
          <i className={`ri-error-warning-line mr-1`}></i>
          <span>{problems} Problems</span>
        </div>
      </div>
    </div>
  );
}
