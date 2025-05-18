import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getSuggestionFromOpenAI } from "./services/openai";
import { getSuggestionFromHuggingFace } from "./services/huggingface";

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint for getting code suggestions
  app.post("/api/suggestions", async (req, res) => {
    try {
      const { code, language } = req.body;
      
      if (!code) {
        return res.status(400).json({ message: "Code is required" });
      }
      
      // Generate code suggestions, prioritizing Hugging Face (free model)
      let primarySuggestion = "";
      let secondarySuggestion = "";

      try {
        // First try to get suggestion from Hugging Face (free model)
        primarySuggestion = await getSuggestionFromHuggingFace(code, language);
      } catch (error) {
        console.error("Hugging Face API error:", error);
        // Fallback suggestion for demo purposes
        if (language === "javascript") {
          primarySuggestion = generateDemoJavaScriptSuggestion(code);
        } else {
          primarySuggestion = "// Add your code here";
        }
      }

      try {
        // Try to get OpenAI suggestion as backup if you have API access
        secondarySuggestion = await getSuggestionFromOpenAI(code, language);
      } catch (error) {
        console.error("OpenAI API error:", error);
        // Fallback suggestion for demo purposes
        if (language === "javascript") {
          secondarySuggestion = generateAlternativeDemoSuggestion(code);
        } else {
          secondarySuggestion = "// Alternative approach";
        }
      }
      
      // Return both suggestions in the same format as before
      // but we're now prioritizing Hugging Face (free model)
      const result = {
        openAi: primarySuggestion,      // Now using Hugging Face result as primary
        huggingFace: secondarySuggestion // Fallback to OpenAI or alternative suggestions
      };
      
      res.json(result);
    } catch (error) {
      console.error("Error getting code suggestions:", error);
      res.status(500).json({ message: "Failed to get code suggestions" });
    }
  });

// Demo suggestion generator for JavaScript when API is unavailable
function generateDemoJavaScriptSuggestion(code) {
  // Look for common patterns in the code to provide contextual suggestions
  
  // Check for "addTwo" or addition related functions
  if (code.toLowerCase().includes("addtwo") || 
      (code.toLowerCase().includes("add") && code.toLowerCase().includes("number"))) {
    return `
function addTwoNumbers(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new TypeError('Both arguments must be numbers');
  }
  return a + b;
}

// Example usage
const sum = addTwoNumbers(5, 3);
console.log('Sum:', sum); // Output: 8

// You can also use it with variables
const num1 = 10;
const num2 = 20;
const result = addTwoNumbers(num1, num2);
console.log('Result:', result); // Output: 30`;
  }
  
  // Check for array or list related code
  if (code.toLowerCase().includes("array") || 
      code.toLowerCase().includes("list") || 
      code.includes("[]")) {
    return `
// Array manipulation functions
function filterArray(array, predicate) {
  return array.filter(predicate);
}

function mapArray(array, transformer) {
  return array.map(transformer);
}

// Example usage
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const evenNumbers = filterArray(numbers, num => num % 2 === 0);
const doubled = mapArray(evenNumbers, num => num * 2);

console.log('Even numbers:', evenNumbers);
console.log('Doubled:', doubled);`;
  }
  
  // Check for sort or searching
  if (code.toLowerCase().includes("sort") || 
      code.toLowerCase().includes("search") || 
      code.toLowerCase().includes("find")) {
    return `
// Sorting an array
function sortArray(array, compareFunction) {
  return [...array].sort(compareFunction);
}

// Binary search (for sorted arrays)
function binarySearch(array, target) {
  let left = 0;
  let right = array.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (array[mid] === target) return mid;
    if (array[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  
  return -1; // Not found
}

// Example usage
const numbers = [34, 12, 56, 78, 23, 9, 45];
const sortedNumbers = sortArray(numbers, (a, b) => a - b);
console.log('Sorted numbers:', sortedNumbers);

const index = binarySearch(sortedNumbers, 45);
console.log('Found 45 at index:', index);`;
  }
  
  // Check for function declaration intent
  if (code.includes("function")) {
    return `
// Enhanced function with parameter validation and JSDoc
/**
 * Processes the provided data and returns a formatted result
 * @param {Object} data - The data object to process
 * @param {Object} options - Processing options
 * @param {boolean} options.normalize - Whether to normalize the data
 * @param {string} options.format - Output format ('json' or 'text')
 * @returns {Object|string} The processed data
 */
function processData(data, options = {}) {
  const { normalize = true, format = 'json' } = options;
  
  // Validate inputs
  if (!data || typeof data !== 'object') {
    throw new TypeError('Data must be a valid object');
  }
  
  // Process the data
  let result = { ...data };
  
  if (normalize) {
    // Normalization logic here
    result = normalizeData(result);
  }
  
  // Return in requested format
  return format === 'json' ? result : JSON.stringify(result);
}

// Helper function
function normalizeData(data) {
  // Normalization implementation
  return data;
}

// Usage example
const myData = { values: [1, 2, 3], raw: true };
const processed = processData(myData, { format: 'text' });
console.log(processed);`;
  }
  
  // Check for loops
  if (code.includes("for (") || code.includes("while (")) {
    return `
// Enhanced loop with better practices
const items = [
  { id: 1, name: 'Item 1', value: 15 },
  { id: 2, name: 'Item 2', value: 5 },
  { id: 3, name: 'Item 3', value: 25 }
];

// Using functional programming instead of loops
const filteredItems = items.filter(item => item.value > 10);
const mappedItems = filteredItems.map(item => ({
  ...item,
  processed: true,
  formattedName: \`Processed: \${item.name}\`
}));

// Create a lookup by ID
const itemsById = mappedItems.reduce((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {});

console.log('Filtered and processed items:', mappedItems);
console.log('Lookup by ID:', itemsById);
console.log('Item with ID 3:', itemsById[3]);`;
  }
  
  // Default suggestion (analyze the code to find any keywords)
  const keywords = [
    'api', 'fetch', 'request', 'http', 'json',
    'object', 'array', 'string', 'number', 'boolean',
    'class', 'function', 'const', 'let', 'var',
    'async', 'await', 'promise', 'then', 'catch',
    'math', 'date', 'time', 'dom', 'event',
    'component', 'render', 'react', 'vue', 'angular'
  ];
  
  for (const keyword of keywords) {
    if (code.toLowerCase().includes(keyword)) {
      // Return a suggestion relevant to the found keyword
      return generateKeywordSuggestion(keyword);
    }
  }
  
  // If no specific pattern is found, return a general suggestion
  return `
// Modern JavaScript utility function
/**
 * A utility helper for common JavaScript operations
 */
class Util {
  /**
   * Safely access nested object properties without errors
   */
  static getNestedValue(obj, path, defaultValue = null) {
    return path.split('.')
      .reduce((o, key) => (o && o[key] !== undefined ? o[key] : defaultValue), obj);
  }

  /**
   * Debounce a function call
   */
  static debounce(func, wait = 300) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
  
  /**
   * Format a date in a user-friendly way
   */
  static formatDate(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day);
  }
}

// Usage examples
const user = { profile: { settings: { theme: 'dark' } } };
const theme = Util.getNestedValue(user, 'profile.settings.theme', 'light');
console.log('User theme:', theme);

const formattedDate = Util.formatDate(new Date(), 'MM/DD/YYYY');
console.log('Formatted date:', formattedDate);`;
}

// Generate suggestion based on specific keyword
function generateKeywordSuggestion(keyword) {
  const suggestions = {
    'api': `
// Modern API client with fetch
class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  setAuthToken(token) {
    this.headers['Authorization'] = \`Bearer \${token}\`;
    return this;
  }

  async get(endpoint, params = {}) {
    const url = new URL(\`\${this.baseUrl}/\${endpoint}\`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, data) {
    const url = \`\${this.baseUrl}/\${endpoint}\`;
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async request(url, options) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: this.headers
      });
      
      if (!response.ok) {
        throw new Error(\`HTTP error \${response.status}: \${response.statusText}\`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
}

// Usage
const api = new ApiClient('https://api.example.com');
api.setAuthToken('your-auth-token');

// Make requests
async function fetchUserData() {
  try {
    const users = await api.get('users', { limit: 10 });
    console.log('Users:', users);
    
    const newUser = await api.post('users', { 
      name: 'John Doe', 
      email: 'john@example.com' 
    });
    console.log('Created user:', newUser);
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }
}

fetchUserData();`,

    'async': `
// Async utility functions for better Promise handling
class AsyncUtil {
  /**
   * Run an async operation with automatic retry on failure
   * @param {Function} operation - Async function to execute
   * @param {Object} options - Retry options
   */
  static async withRetry(operation, options = {}) {
    const { 
      retries = 3,
      delay = 300,
      backoffFactor = 2,
      onRetry = null
    } = options;
    
    let lastError;
    let currentDelay = delay;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt < retries) {
          if (onRetry) {
            onRetry(error, attempt);
          }
          
          await new Promise(resolve => setTimeout(resolve, currentDelay));
          currentDelay *= backoffFactor;
        }
      }
    }
    
    throw lastError;
  }
  
  /**
   * Execute operations in parallel with a concurrency limit
   * @param {Array} items - Items to process
   * @param {Function} operation - Async operation to perform on each item
   * @param {number} concurrency - Maximum concurrent operations
   */
  static async withConcurrency(items, operation, concurrency = 3) {
    const results = [];
    const inProgress = new Set();
    const queue = [...items];
    
    async function processNext() {
      if (queue.length === 0) return;
      
      const item = queue.shift();
      inProgress.add(item);
      
      try {
        const result = await operation(item);
        results.push(result);
      } catch (error) {
        console.error(\`Operation failed for item \${item}:\`, error);
      } finally {
        inProgress.delete(item);
        await processNext();
      }
    }
    
    // Start initial batch of operations
    const initialBatch = Math.min(concurrency, items.length);
    const starters = Array(initialBatch).fill().map(() => processNext());
    
    // Wait for all operations to complete
    await Promise.all(starters);
    return results;
  }
}

// Usage example
async function fetchUserById(id) {
  return AsyncUtil.withRetry(
    async () => {
      const response = await fetch(\`https://api.example.com/users/\${id}\`);
      if (!response.ok) throw new Error(\`Failed to fetch user \${id}\`);
      return response.json();
    },
    { 
      retries: 3,
      onRetry: (error, attempt) => console.log(\`Retrying fetch for user \${id}, attempt \${attempt + 1}\`)
    }
  );
}

// Fetch multiple users with concurrency limit
async function fetchUsers(userIds) {
  return AsyncUtil.withConcurrency(
    userIds,
    fetchUserById,
    5 // Process 5 users concurrently
  );
}

// Example
fetchUsers([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  .then(users => console.log('Fetched users:', users));`,

    'object': `
// Object utility functions
const ObjectUtils = {
  /**
   * Deep clone an object
   */
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.deepClone(item));
    }
    
    const cloned = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = this.deepClone(obj[key]);
      }
    }
    
    return cloned;
  },
  
  /**
   * Deep merge objects
   */
  deepMerge(target, ...sources) {
    if (!sources.length) return target;
    
    const source = sources.shift();
    if (source === undefined) return target;
    
    if (this.isObject(target) && this.isObject(source)) {
      for (const key in source) {
        if (this.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          this.deepMerge(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }
    
    return this.deepMerge(target, ...sources);
  },
  
  /**
   * Check if value is an object
   */
  isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
  },
  
  /**
   * Pick specific properties from an object
   */
  pick(obj, keys) {
    return keys.reduce((result, key) => {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = obj[key];
      }
      return result;
    }, {});
  },
  
  /**
   * Omit specific properties from an object
   */
  omit(obj, keys) {
    return Object.keys(obj)
      .filter(key => !keys.includes(key))
      .reduce((result, key) => {
        result[key] = obj[key];
        return result;
      }, {});
  }
};

// Usage examples
const user = {
  id: 1,
  name: 'John Doe',
  profile: {
    avatar: 'john.jpg',
    settings: {
      theme: 'dark',
      notifications: true
    }
  },
  roles: ['user', 'editor']
};

// Clone the user object
const clonedUser = ObjectUtils.deepClone(user);

// Merge objects
const defaultSettings = {
  profile: {
    settings: {
      theme: 'light',
      notifications: false,
      language: 'en'
    }
  }
};

const mergedUser = ObjectUtils.deepMerge({}, defaultSettings, user);
console.log('Merged user:', mergedUser);

// Pick only specific properties
const userBasics = ObjectUtils.pick(user, ['id', 'name']);
console.log('User basics:', userBasics);

// Omit sensitive data
const publicUser = ObjectUtils.omit(user, ['id', 'roles']);
console.log('Public user data:', publicUser);`
  };
  
  return suggestions[keyword] || suggestions['object'];
}

// Alternative demo suggestion generator
function generateAlternativeDemoSuggestion(code) {
  // Check if code has a function declaration
  if (code.includes("function")) {
    return `
// Alternative approach with arrow function
const yourFunctionName = async () => {
  // Implementation
  return result;
};

// Using Promise.all for parallel operations
const results = await Promise.all([
  operation1(),
  operation2(),
  operation3()
]);`;
  }
  
  // Check if code has a loop
  if (code.includes("for (") || code.includes("while (")) {
    return `
// Using functional programming approach
const results = data
  .filter(item => item.isValid)
  .map(item => transformItem(item))
  .reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});`;
  }
  
  // Default suggestion
  return `
// Class-based implementation
class DataService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }
  
  async fetchData(endpoint) {
    try {
      const response = await fetch(\`\${this.baseUrl}/\${endpoint}\`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  }
}

// Usage
const service = new DataService('https://api.example.com');
service.fetchData('users')
  .then(users => console.log(users));`;
}

  // API endpoint for getting suggestions from OpenAI only
  app.post("/api/openai/suggest", async (req, res) => {
    try {
      const { code, language } = req.body;
      
      if (!code) {
        return res.status(400).json({ message: "Code is required" });
      }
      
      const suggestion = await getSuggestionFromOpenAI(code, language);
      res.json(suggestion);
    } catch (error) {
      console.error("Error getting OpenAI suggestion:", error);
      res.status(500).json({ message: "Failed to get OpenAI suggestion" });
    }
  });

  // API endpoint for getting suggestions from Hugging Face only
  app.post("/api/huggingface/suggest", async (req, res) => {
    try {
      const { code, language } = req.body;
      
      if (!code) {
        return res.status(400).json({ message: "Code is required" });
      }
      
      const suggestion = await getSuggestionFromHuggingFace(code, language);
      res.json(suggestion);
    } catch (error) {
      console.error("Error getting Hugging Face suggestion:", error);
      res.status(500).json({ message: "Failed to get Hugging Face suggestion" });
    }
  });

  // API endpoint for saving user feedback on suggestions
  app.post("/api/feedback", async (req, res) => {
    try {
      const { feedback, suggestionType, suggestion, code } = req.body;
      
      // In a real app, we would store this feedback for model training
      // For now, just log it
      console.log(`Received ${feedback} feedback for ${suggestionType} suggestion`);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving feedback:", error);
      res.status(500).json({ message: "Failed to save feedback" });
    }
  });

  // File handling endpoints
  app.post("/api/files/save", async (req, res) => {
    try {
      const { name, content } = req.body;
      
      if (!name || content === undefined) {
        return res.status(400).json({ message: "Filename and content are required" });
      }
      
      // Store file in memory
      await storage.saveFile(name, content);
      
      res.json({ success: true, name });
    } catch (error) {
      console.error("Error saving file:", error);
      res.status(500).json({ message: "Failed to save file" });
    }
  });

  app.get("/api/files/open", async (req, res) => {
    try {
      const { name } = req.query;
      
      if (!name || typeof name !== "string") {
        return res.status(400).json({ message: "Filename is required" });
      }
      
      // Get file from memory
      const file = await storage.getFile(name);
      
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      res.json({ name, content: file.content });
    } catch (error) {
      console.error("Error opening file:", error);
      res.status(500).json({ message: "Failed to open file" });
    }
  });

  app.get("/api/files/list", async (req, res) => {
    try {
      // Get all files
      const files = await storage.listFiles();
      res.json(files);
    } catch (error) {
      console.error("Error listing files:", error);
      res.status(500).json({ message: "Failed to list files" });
    }
  });

  app.delete("/api/files/delete", async (req, res) => {
    try {
      const { name } = req.query;
      
      if (!name || typeof name !== "string") {
        return res.status(400).json({ message: "Filename is required" });
      }
      
      // Delete file from memory
      await storage.deleteFile(name);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ message: "Failed to delete file" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
