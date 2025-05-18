import { IFile } from "@shared/schema";

// Storage interface for file operations
export interface IStorage {
  saveFile(name: string, content: string): Promise<IFile>;
  getFile(name: string): Promise<IFile | undefined>;
  listFiles(): Promise<IFile[]>;
  deleteFile(name: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private files: Map<string, IFile>;

  constructor() {
    this.files = new Map();
  }

  async saveFile(name: string, content: string): Promise<IFile> {
    // Determine language from file extension
    const extension = name.split('.').pop()?.toLowerCase() || "";
    let language = "text";
    
    if (extension === "js") language = "javascript";
    else if (extension === "html") language = "html";
    else if (extension === "css") language = "css";
    else if (extension === "ts" || extension === "tsx") language = "typescript";
    else if (extension === "json") language = "json";
    else if (extension === "py") language = "python";
    else if (extension === "java") language = "java";
    else if (extension === "c" || extension === "cpp") language = "cpp";
    
    const file: IFile = { 
      name, 
      content, 
      language,
      lastModified: new Date().toISOString()
    };
    
    this.files.set(name, file);
    return file;
  }

  async getFile(name: string): Promise<IFile | undefined> {
    return this.files.get(name);
  }

  async listFiles(): Promise<IFile[]> {
    return Array.from(this.files.values());
  }

  async deleteFile(name: string): Promise<void> {
    this.files.delete(name);
  }
}

export const storage = new MemStorage();
