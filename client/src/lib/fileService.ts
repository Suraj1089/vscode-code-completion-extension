// Local storage keys
const FILE_PREFIX = "codeassist_file_";
const FILES_LIST_KEY = "codeassist_files";

// Save a file to local storage
export function saveFile(filename: string, content: string): void {
  try {
    // Save the file content
    localStorage.setItem(`${FILE_PREFIX}${filename}`, content);
    
    // Update files list
    const files = getSavedFiles();
    if (!files.includes(filename)) {
      files.push(filename);
      localStorage.setItem(FILES_LIST_KEY, JSON.stringify(files));
    }
  } catch (error) {
    console.error("Error saving file to local storage:", error);
    throw new Error("Failed to save file locally");
  }
}

// Open a file from local storage
export function openFile(filename: string): string | null {
  try {
    return localStorage.getItem(`${FILE_PREFIX}${filename}`);
  } catch (error) {
    console.error("Error opening file from local storage:", error);
    return null;
  }
}

// Delete a file from local storage
export function deleteFile(filename: string): void {
  try {
    localStorage.removeItem(`${FILE_PREFIX}${filename}`);
    
    // Update files list
    const files = getSavedFiles().filter(f => f !== filename);
    localStorage.setItem(FILES_LIST_KEY, JSON.stringify(files));
  } catch (error) {
    console.error("Error deleting file from local storage:", error);
  }
}

// Get list of saved files
export function getSavedFiles(): string[] {
  try {
    const filesJson = localStorage.getItem(FILES_LIST_KEY);
    return filesJson ? JSON.parse(filesJson) : [];
  } catch (error) {
    console.error("Error getting saved files list:", error);
    return [];
  }
}

// Check if file exists
export function fileExists(filename: string): boolean {
  try {
    return localStorage.getItem(`${FILE_PREFIX}${filename}`) !== null;
  } catch (error) {
    console.error("Error checking if file exists:", error);
    return false;
  }
}

// Download file as text
export function downloadFile(filename: string, content: string): void {
  const element = document.createElement("a");
  const file = new Blob([content], { type: "text/plain" });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

// Read file from upload
export function readUploadedFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
