import os
import time

import torch
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer

# Load environment variables
load_dotenv()

# Model name
MODEL_NAME = "Salesforce/codegen-350M-mono"

# Use GPU if available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
torch.set_grad_enabled(False)

# FastAPI app
app = FastAPI()

# Globals
model = None
tokenizer = None
project_context = {}  # Store project information and rules


class CodeRequest(BaseModel):
    prompt: str


class ProjectInitRequest(BaseModel):
    project_name: str
    language: str = "python"
    description: str = ""
    frameworks: list = []
    coding_style: str = "standard"  # e.g., standard, PEP8, Google, etc.
    custom_rules: list = []  # Custom coding rules


@app.post("/initialize_project")
def initialize_project(req: ProjectInitRequest):
    """
    Initialize the project context with rules and guidelines for code generation.
    """
    global project_context
    
    # Store project details
    project_context = {
        "project_name": req.project_name,
        "language": req.language,
        "description": req.description,
        "frameworks": req.frameworks,
        "coding_style": req.coding_style,
        "custom_rules": req.custom_rules,
        "initialized_at": time.strftime("%Y-%m-%d %H:%M:%S"),
    }
    
    # Generate style guide based on the provided information
    style_guide = []
    
    # Language-specific rules
    if req.language.lower() == "python":
        style_guide.append("Follow PEP 8 style guidelines")
        style_guide.append("Use 4 spaces for indentation")
        style_guide.append("Include docstrings for functions and classes")
    elif req.language.lower() == "javascript":
        style_guide.append("Follow Standard JS or Airbnb style guidelines")
        style_guide.append("Use 2 spaces for indentation")
        style_guide.append("Use camelCase for variable and function names")
    
    # Framework-specific rules
    for framework in req.frameworks:
        if framework.lower() == "flask":
            style_guide.append("Follow Flask application structure")
            style_guide.append("Use Blueprint for modular applications")
        elif framework.lower() == "react":
            style_guide.append("Use functional components with hooks")
            style_guide.append("Separate components into their own files")
    
    # Add custom rules
    style_guide.extend(req.custom_rules)
    
    # Store the style guide in the project context
    project_context["style_guide"] = style_guide
    
    return {
        "status": "success",
        "message": f"Project '{req.project_name}' initialized successfully",
        "project_context": project_context
    }


@app.get("/project_status")
def project_status():
    """Get the current project context and status."""
    global project_context
    
    if not project_context:
        return {
            "status": "not_initialized",
            "message": "No project has been initialized yet"
        }
    
    return {
        "status": "initialized",
        "project_context": project_context
    }


@app.on_event("startup")
def load_model():
    global model, tokenizer

    try:
        print(f"🔄 Loading model: {MODEL_NAME}")
        tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        model = AutoModelForCausalLM.from_pretrained(MODEL_NAME, low_cpu_mem_usage=True).to(device)
        model.eval()

        # Warm-up with a dummy input to reduce first-time latency
        dummy_input = tokenizer("def hello_world():", return_tensors="pt").input_ids.to(device)
        model.generate(dummy_input, max_length=16)
        print(f"✅ Model loaded and warmed up on {'GPU' if torch.cuda.is_available() else 'CPU'}")
    except Exception as e:
        print(f"❌ Error loading model: {e}")


@app.post("/complete")
def complete_code(req: CodeRequest):
    global model, tokenizer, project_context

    if model is None or tokenizer is None:
        return {"completion": "", "error": "Model not loaded. Check server logs."}

    try:
        start_time = time.time()

        # Format prompt with project context if available
        prompt_prefix = ""
        if project_context:
            prompt_prefix = f"# Project: {project_context.get('project_name', '')}\n"
            prompt_prefix += f"# Language: {project_context.get('language', 'python')}\n"
            
            # Add style guidelines
            if style_guide := project_context.get('style_guide'):
                prompt_prefix += "# Style guidelines:\n"
                for rule in style_guide[:3]:  # Limit to first 3 rules to keep context reasonable
                    prompt_prefix += f"# - {rule}\n"
            
            prompt_prefix += "\n"
        
        # Format prompt
        formatted_prompt = f"{prompt_prefix}# {req.prompt}\n# Complete the following code:\n\n"
        input_ids = tokenizer(formatted_prompt, return_tensors="pt").input_ids.to(device)

        # Generate output
        with torch.no_grad():
            generated_ids = model.generate(
                input_ids,
                max_length=128,  # Keep max tokens reasonable for speed
                num_return_sequences=1,
                temperature=0.7,
                top_p=0.95,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id,
            )

        # Decode result
        full_text = tokenizer.decode(generated_ids[0], skip_special_tokens=True)
        completion = full_text[len(formatted_prompt):].strip()

        duration = time.time() - start_time
        print(f"⚡ Completed in {duration:.2f}s")

        # Filter out garbage
        if not completion or completion.startswith("#" * 5) or len(completion) < 10:
            return {"completion": "Unable to generate meaningful code."}

        return {"completion": completion}

    except Exception as e:
        print(f"❌ Error generating code: {e}")
        return {"completion": "Unable to generate meaningful code.", "error": str(e)}


# Run this with:
# uvicorn main:app --reload
