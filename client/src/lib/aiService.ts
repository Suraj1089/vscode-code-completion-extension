import { apiRequest } from "./queryClient";

export interface Suggestion {
  openAi: string;
  huggingFace: string;
}

// Get AI suggestions for code
export async function getAISuggestions(code: string, language: string): Promise<Suggestion> {
  try {
    const response = await apiRequest(
      "POST",
      "/api/suggestions",
      { code, language }
    );
    
    return await response.json();
  } catch (error) {
    console.error("Error getting AI suggestions:", error);
    throw error;
  }
}

// Get code completion from OpenAI
export async function getOpenAISuggestion(code: string, language: string): Promise<string> {
  try {
    const response = await apiRequest(
      "POST",
      "/api/openai/suggest",
      { code, language }
    );
    
    return await response.json();
  } catch (error) {
    console.error("Error getting OpenAI suggestion:", error);
    throw error;
  }
}

// Get code completion from Hugging Face
export async function getHuggingFaceSuggestion(code: string, language: string): Promise<string> {
  try {
    const response = await apiRequest(
      "POST",
      "/api/huggingface/suggest",
      { code, language }
    );
    
    return await response.json();
  } catch (error) {
    console.error("Error getting Hugging Face suggestion:", error);
    throw error;
  }
}

// Report feedback on suggestion
export async function reportSuggestionFeedback(
  feedback: "helpful" | "not_helpful",
  suggestionType: "openai" | "huggingface",
  suggestion: string,
  code: string
): Promise<void> {
  try {
    await apiRequest(
      "POST",
      "/api/feedback",
      { feedback, suggestionType, suggestion, code }
    );
  } catch (error) {
    console.error("Error reporting feedback:", error);
    throw error;
  }
}
