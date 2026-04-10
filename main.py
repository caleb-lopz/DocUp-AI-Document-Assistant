
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from index_docup import index_document, client
from query_docup import ask
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("./temp", exist_ok=True)

class QuestionRequest(BaseModel):
    question: str
    doc_name: str
    chat_history: list

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    doc_name = file.filename.replace(".pdf", "").replace(" ", "_").upper()
    doc_path = f"./temp/{file.filename}"

    with open(doc_path, "wb") as f:
        f.write(await file.read())

    status = index_document(doc_name, doc_path)
    os.remove(doc_path)
    return {"status": status, "doc_name": doc_name}

@app.post("/ask")
def ask_question(request: QuestionRequest):
    answer, _ = ask(request.question, request.doc_name, request.chat_history)
    return {"answer": answer}

@app.get("/documents")
def get_documents():
    return {"documents": [i.name for i in client.list_collections()]}