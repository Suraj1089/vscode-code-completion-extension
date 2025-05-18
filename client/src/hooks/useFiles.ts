import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { saveFile, openFile } from "@/lib/fileService";

interface File {
  name: string;
  content: string;
  language: string;
}

export function useFiles() {
  const [files, setFiles] = useState<File[]>([]);
  
  // Initialize with a default file if no files exist
  useEffect(() => {
    if (files.length === 0) {
      createFile("app.js", "// Welcome to CodeAssist IDE\n// Start coding here\n\nfunction greet() {\n  console.log('Hello, world!');\n}\n\ngreet();");
    }
  }, []);

  // Create a new file
  const createFile = (name: string, content: string = "") => {
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
    
    const newFile = { name, content, language };
    
    setFiles((prevFiles) => {
      // Check if file already exists
      const existingFileIndex = prevFiles.findIndex(file => file.name === name);
      if (existingFileIndex >= 0) {
        // Replace existing file
        const updatedFiles = [...prevFiles];
        updatedFiles[existingFileIndex] = newFile;
        return updatedFiles;
      } else {
        // Add new file
        return [...prevFiles, newFile];
      }
    });
    
    return newFile;
  };

  // Update an existing file's content
  const updateFile = (name: string, content: string) => {
    setFiles((prevFiles) => 
      prevFiles.map(file => 
        file.name === name ? { ...file, content } : file
      )
    );
  };

  // Delete a file
  const deleteFile = (name: string) => {
    setFiles((prevFiles) => prevFiles.filter(file => file.name !== name));
  };

  // Get a file by name
  const getFile = (name: string) => {
    return files.find(file => file.name === name) || null;
  };

  // Save file to local storage
  const saveFileMutation = useMutation({
    mutationFn: async ({ name, content }: { name: string, content: string }) => {
      // Try to save to backend
      try {
        const response = await apiRequest(
          "POST",
          "/api/files/save",
          { name, content }
        );
        return response.json();
      } catch (error) {
        // Fallback to local storage if backend save fails
        saveFile(name, content);
        return { name, savedLocally: true };
      }
    }
  });

  // Open file from local storage
  const openFileMutation = useMutation({
    mutationFn: async (name: string) => {
      try {
        // Try to open from backend
        const response = await apiRequest(
          "GET",
          `/api/files/open?name=${encodeURIComponent(name)}`,
          undefined
        );
        return response.json();
      } catch (error) {
        // Fallback to local storage if backend open fails
        const content = openFile(name) || "";
        return { name, content, openedLocally: true };
      }
    },
    onSuccess: (data) => {
      if (data.content !== undefined) {
        createFile(data.name, data.content);
      }
    }
  });

  return {
    files,
    createFile,
    updateFile,
    deleteFile,
    getFile,
    saveFile: (name: string, content: string) => saveFileMutation.mutate({ name, content }),
    openFile: (name: string) => openFileMutation.mutate(name),
    isSaving: saveFileMutation.isPending,
    isOpening: openFileMutation.isPending
  };
}
