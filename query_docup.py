
from google import genai
from sentence_transformers import SentenceTransformer
import chromadb
from sentence_transformers import CrossEncoder
from fastapi import FastAPI, UploadFile
from dotenv import load_dotenv
import os

load_dotenv()  

api_key = os.getenv("gemini_key")


client = genai.Client(api_key=api_key)
model = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
client_model = chromadb.PersistentClient(path="./chroma_db")
embedder = SentenceTransformer("all-MiniLM-L6-v2")
chat_history = []
def ask(question, doc_name, chat_history):
    collection = client_model.get_collection(name=doc_name)
    total_chunks = collection.count()
    n_candidates = min(20, max(5, total_chunks // 10))
    n_top = min(5, max(3, total_chunks // 20)) 
    question_embedding = embedder.encode([question]).tolist()
    rel_chunks = collection.query(query_embeddings=question_embedding, n_results=n_candidates)

    candidates = rel_chunks["documents"][0]
    pairs = [[question, chunk] for chunk in candidates]
    scores = model.predict(pairs)
    ranked = sorted(zip(scores, candidates), key=lambda x: x[0], reverse=True)[:n_top]

    context = "\n\n".join([chunk for _, chunk in ranked])
    history_text = "\n".join([f"{m['role']}: {m['content']}" for m in chat_history[-6:]])

    prompt_system = (
        "You are an expert assistant specialized in reading, summarizing, and analyzing documents. "
        "Answer the user's question strictly based on the provided context. "
        "Be concise and focus only on what the user is asking. "
        "Do not add unnecessary information or assumptions. "
        "If the answer is not in the context, say so clearly.\n\n"
        
        f"Recent conversation:\n{history_text}\n\n"
        f"Relevant context:\n{context}\n\n"
        f"User question:\n{question}"
    )

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt_system
    )

    chat_history.append({"role": "user", "content": question})
    chat_history.append({"role": "model", "content": response.text})

    return response.text, chat_history
