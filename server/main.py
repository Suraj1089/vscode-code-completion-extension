import os
import uuid
import ollama
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import List

load_dotenv()
app = FastAPI()

# In-memory store for session-specific project guidelines
project_sessions = {}  # {session_id: guidelines}


# === Models ===
class ProjectInfo(BaseModel):
    project_name: str
    description: str
    languages_used: List[str]


# === Utility ===
def get_chat_response(prompt: str, model: str = "mistral") -> str:
    response = ollama.chat(model=model, messages=[{"role": "user", "content": prompt}])
    return response["message"]["content"]


# === Routes ===
@app.post("/generate")
def generate(prompt: str):
    response = get_chat_response(prompt)
    return {"response": response}


@app.post("/initialize")
def initialize_project(info: ProjectInfo):
    prompt = (
        f"You are a senior software architect. Based on the following details:\n"
        f"- Project Name: {info.project_name}\n"
        f"- Description: {info.description}\n"
        f"- Languages Used: {', '.join(info.languages_used)}\n\n"
        f"Please provide:\n"
        f"1. Project folder structure\n"
        f"2. Styling/code organization guidelines\n"
        f"3. Best practices to follow for this tech stack"
    )
    guidelines = get_chat_response(prompt)
    session_id = str(uuid.uuid4())
    project_sessions[session_id] = guidelines
    return {"session_id": session_id, "guidelines": guidelines}


@app.websocket("/verify")
async def verify_code(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            session_id = data.get("session_id")
            code = data.get("code")

            guideline = project_sessions.get(session_id)
            if not guideline:
                await websocket.send_text("Invalid or expired session ID.")
                continue

            prompt = (
                f"The following are the coding guidelines for this project:\n\n{guideline}\n\n"
                f"Now analyze the following code and verify if it adheres to the guidelines:\n\n{code}"
            )
            response = get_chat_response(prompt)
            await websocket.send_text(response)

    except WebSocketDisconnect:
        print("Client disconnected from WebSocket.")
