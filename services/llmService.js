const { LlamaModel, LlamaContext } = require('node-llama-cpp');
// Replace any OpenAI imports

class LocalLLMService {
  constructor(config) {
    this.config = config;
    this.model = new LlamaModel({
      modelPath: config.llm.modelPath || './models/llama-7b.bin',
      contextSize: config.llm.contextSize || 4096,
    });
  }
  
  async initialize() {
    // Load model if needed
    // Most local LLM libraries handle this internally
  }
  
  async generateCompletion(prompt, options = {}) {
    const context = new LlamaContext({ model: this.model });
    
    const result = await context.generate(prompt, {
      maxTokens: options.maxTokens || 500,
      temperature: options.temperature || 0.7,
      topP: options.topP || 0.9,
      stopSequences: options.stop || [],
    });
    
    return {
      text: result.text,
      usage: {
        promptTokens: result.usage?.promptTokens || 0,
        completionTokens: result.usage?.completionTokens || 0,
        totalTokens: result.usage?.totalTokens || 0
      }
    };
  }
  
  async generateChat(messages, options = {}) {
    // For chat completion, format messages into a prompt
    const formattedPrompt = this.formatMessagesToPrompt(messages);
    const completion = await this.generateCompletion(formattedPrompt, options);
    return completion;
  }
  
  formatMessagesToPrompt(messages) {
    return messages.map(msg => {
      if (msg.role === 'system') {
        return `System: ${msg.content}\n`;
      } else if (msg.role === 'user') {
        return `User: ${msg.content}\n`;
      } else if (msg.role === 'assistant') {
        return `Assistant: ${msg.content}\n`;
      }
      return `${msg.content}\n`;
    }).join('');
  }
}

module.exports = LocalLLMService;