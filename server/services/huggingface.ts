import fetch from "node-fetch";

// Hugging Face API base URL
const HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models";

// Free models for different programming languages
// These models are publicly available and don't require authentication
const DEFAULT_MODELS: Record<string, string> = {
  javascript: "codeparrot/codeparrot-small-javascript",
  python: "codeparrot/codeparrot-small-python",
  typescript: "codeparrot/codeparrot-small-javascript",
  default: "codeparrot/codeparrot-small"
};

/**
 * Get code suggestions from Hugging Face
 * @param code Current code in the editor
 * @param language Programming language
 * @returns Suggested code completion
 */
export async function getSuggestionFromHuggingFace(code: string, language: string = "javascript"): Promise<string> {
  try {
    // Get the appropriate model for the language
    const model = DEFAULT_MODELS[language] || DEFAULT_MODELS.default;
    const apiUrl = `${HUGGINGFACE_API_URL}/${model}`;
    
    // Get Hugging Face API token from environment variables (optional for public models)
    const apiToken = process.env.HUGGINGFACE_API_TOKEN;
    
    // Prepare headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    
    // Add authorization header if token is available
    if (apiToken) {
      headers["Authorization"] = `Bearer ${apiToken}`;
    }
    
    // Make request to Hugging Face API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        inputs: code,
        parameters: {
          max_new_tokens: 100,
          temperature: 0.7,
          top_p: 0.95,
          return_full_text: false
        }
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Hugging Face API error: ${error}`);
    }
    
    const result = await response.json();
    
    // Extract the generated text from the response
    // Handle different response formats from various models
    try {
      if (Array.isArray(result) && result.length > 0) {
        // Check for different response formats from array responses
        if (result[0] && typeof result[0] === 'object' && 'generated_text' in result[0]) {
          // Format used by bigcode models
          return (result[0] as {generated_text: string}).generated_text;
        } else if (typeof result[0] === 'string') {
          // Format used by some text generation models
          return result[0].replace(code, ''); // Remove the input code
        }
      } else if (result && typeof result === 'object' && 'generated_text' in result) {
        // Another common response format
        return (result as {generated_text: string}).generated_text.replace(code, ''); // Remove the input code
      } else if (typeof result === 'string') {
        // Simple string response
        return result.replace(code, ''); // Remove the input code
      }
      
      // If we reach here, try to stringify the result and extract some useful text
      const resultText = JSON.stringify(result);
      if (resultText && resultText.length > 0) {
        return resultText.substring(0, 100); // Return part of the response as a fallback
      }
    } catch (parseError) {
      console.error("Error parsing Hugging Face response:", parseError);
    }
    
    // Fallback if we can't parse the response
    return "";
  } catch (error) {
    console.error("Hugging Face API error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to get suggestion from Hugging Face: ${errorMessage}`);
  }
}
