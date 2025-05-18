import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "",
});

/**
 * Get code suggestions from OpenAI
 * @param code Current code in the editor
 * @param language Programming language
 * @returns Suggested code completion
 */
export async function getSuggestionFromOpenAI(code: string, language: string = "javascript"): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that helps developers write high-quality ${language} code. 
          Given the code context, provide a useful continuation or suggestion that would improve the code.
          Focus on code quality, best practices, and addressing any potential issues.
          Only respond with the actual code suggestion without any explanation or markdown formatting.`
        },
        {
          role: "user",
          content: `Here is my ${language} code: \n\n${code}\n\nPlease suggest a continuation or improvement.`
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("OpenAI API error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to get suggestion from OpenAI: ${errorMessage}`);
  }
}

/**
 * Analyze code for potential issues
 * @param code Code to analyze
 * @param language Programming language
 * @returns Analysis results with suggestions
 */
export async function analyzeCode(code: string, language: string = "javascript"): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a code review assistant. Analyze the given ${language} code for potential issues, bugs, 
          code smells, and possible optimizations. Provide your analysis in JSON format with the following structure:
          {
            "issues": [
              { "type": "issue_type", "line": line_number, "description": "description", "suggestion": "suggestion" }
            ],
            "score": quality_score_out_of_10,
            "summary": "overall_summary"
          }`
        },
        {
          role: "user",
          content: `Analyze this ${language} code: \n\n${code}`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
      temperature: 0.3,
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("OpenAI code analysis error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to analyze code with OpenAI: ${errorMessage}`);
  }
}
