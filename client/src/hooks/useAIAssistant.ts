import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Suggestion } from "@/lib/aiService";

export function useAIAssistant(frequency: string = "medium") {
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState<string>("javascript");
  const [suggestions, setSuggestions] = useState<Suggestion | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);
  const debounceTimerRef = useRef<number | null>(null);

  // Get debounce time based on frequency setting
  const getDebounceTime = () => {
    switch (frequency) {
      case "high":
        return 500;
      case "medium":
        return 1000;
      case "low":
        return 2000;
      default:
        return 1000;
    }
  };

  // Get code suggestions from the API
  const getSuggestionMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest(
        "POST",
        "/api/suggestions",
        { code, language }
      );
      return response.json();
    },
    onSuccess: (data) => {
      setSuggestions(data);
      setIsLoadingSuggestions(false);
    },
    onError: (error) => {
      console.error("Error getting suggestions:", error);
      setIsLoadingSuggestions(false);
    },
  });

  // Update code and trigger suggestion fetching with debounce
  const updateCode = (newCode: string) => {
    setCode(newCode);
    
    // Clear previous timer
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }

    // Only fetch suggestions if code has meaningful content
    if (newCode.trim().length > 10) {
      setIsLoadingSuggestions(true);
      
      // Set new timer
      debounceTimerRef.current = window.setTimeout(() => {
        getSuggestionMutation.mutate(newCode);
      }, getDebounceTime());
    } else {
      setSuggestions(null);
      setIsLoadingSuggestions(false);
    }
  };

  // Apply a suggestion to the code
  const applySuggestion = (suggestion: string) => {
    setCode((prevCode) => {
      // Get the current position to properly insert the suggestion
      // In a real implementation with full Monaco integration, we would
      // get the exact cursor position from the editor
      const lines = prevCode.split('\n');
      const currentLineIndex = lines.length - 1;
      const currentLine = lines[currentLineIndex];
      
      // Insert the suggestion at the current cursor location
      const updatedLines = [...lines];
      updatedLines[currentLineIndex] = currentLine + suggestion;
      
      return updatedLines.join('\n');
    });
    
    // Clear the suggestions after applying one
    setSuggestions(null);
  };

  // Dismiss current suggestions
  const dismissSuggestion = () => {
    setSuggestions(null);
  };

  // Update language
  const updateLanguage = (newLanguage: string) => {
    setLanguage(newLanguage);
  };

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    code,
    language,
    suggestions,
    isLoadingSuggestions,
    updateCode,
    updateLanguage,
    applySuggestion,
    dismissSuggestion,
  };
}
