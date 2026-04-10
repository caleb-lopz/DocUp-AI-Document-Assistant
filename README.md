# DocUp — AI Document Assistant

A full-stack document assistant that lets you upload any PDF and chat with it
using a RAG pipeline with reranking. Built with a FastAPI backend and a
Next.js frontend generated with V0.

---

## About this project

This project combines document indexing, vector search, and reranking to answer
questions about any PDF you upload. Instead of sending all retrieved chunks to
the LLM, the pipeline first retrieves a broad set of candidates from ChromaDB,
then scores each one against the user's question using a Cross-Encoder model.
Only the most relevant chunks are passed to Gemini as context — keeping
responses accurate while saving compute resources.

**Frontend:**
Built with [V0 by Vercel](https://v0.dev). The generated UI was connected to
the FastAPI backend by redirecting requests to the real `/ask` and `/upload`
endpoints.

**Known issue:**
When a PDF is uploaded, the app navigates to the chat view immediately before
the document finishes indexing. This causes a slight delay on the first question
since the document is still being embedded. It does not affect functionality.

**What I learned:**
- How to connect a Next.js frontend to a FastAPI backend
- How to build and customize a V0-generated UI
- How to implement a reranking strategy in a RAG pipeline
- How FastAPI handles file uploads and async endpoints

---

## How it works

1. The user uploads a PDF from the frontend
2. The backend converts and chunks the PDF using **Docling**
3. Each chunk is embedded using **SentenceTransformer (all-MiniLM-L6-v2)**
4. Embeddings are stored in a local **ChromaDB** collection
5. The user asks a question in the chat
6. The top candidate chunks are retrieved from ChromaDB
7. A **Cross-Encoder** reranker scores and filters the most relevant chunks
8. The filtered context is sent to **Gemini 2.5 Flash** for a final answer

---

## Project structure

```bash
docup/
├── main.py                  # FastAPI app — upload, ask, documents endpoints
├── index_docup.py           # PDF ingestion, chunking, and indexing
├── query_docup.py           # Retrieval, reranking, and LLM response
├── key.py                   # Gemini API key (not committed)
├── chroma_db/               # Local vector database (auto-generated)
├── temp/                    # Temporary PDF storage during upload
├── requirements.txt         # Python dependencies
├── frontend/                # Next.js frontend (generated with V0)
│   ├── src/
│   │   └── components/
│   │       └── chat-interface.tsx
│   ├── package.json
│   └── ...
└── README.md
```
---

## Important

- The indexing step only runs once per document
- If you upload the same PDF twice, it will be skipped automatically

---

## Requirements

- Python 3.11 (virtual environment recommended)
- Node.js 18+
- A [Gemini API key](https://aistudio.google.com/app/apikey)

Create a `key.py` file in the root folder:

```python
gemini_key = "your_gemini_api_key_here"
```

---

## Installation

**Backend:**
```bash
git clone https://github.com/calab-lopz/docup.git
cd docup
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
```

---

## Usage

**Step 1 — Start the backend:**
```bash
uvicorn main:app --reload
```

**Step 2 — Start the frontend:**
```bash
cd frontend
npm run dev
```



**Step 3 — Open the app:**

```bash
http://localhost:3000
```
Upload a PDF, wait a moment for indexing, then start asking questions.

---

## Tech stack

| Tool | Purpose |
|------|---------|
| [FastAPI](https://fastapi.tiangolo.com) | REST API backend |
| [Uvicorn](https://www.uvicorn.org) | ASGI server |
| [Docling](https://github.com/DS4SD/docling) | PDF parsing and chunking |
| [SentenceTransformers](https://www.sbert.net) — all-MiniLM-L6-v2 | Text embeddings |
| [ChromaDB](https://www.trychroma.com) | Local vector database |
| [Cross-Encoder](https://www.sbert.net/docs/cross_encoder/usage/usage.html) — ms-marco-MiniLM-L-6-v2 | Reranking |
| [Gemini 2.5 Flash](https://deepmind.google/technologies/gemini) | LLM response generation |
| [Next.js](https://nextjs.org) + [V0](https://v0.dev) | Frontend |
---
## DEMO

https://youtu.be/bn7K4T-X7Pc

---
## Related projects

- [Mexican Law Assistant — Agentic RAG + Reranking](https://github.com/caleb-lopz/Mexican-Law-Assistant-Agentic-RAG-Reranking) — A CLI-based legal assistant that extends the reranking pipeline with an agentic layer that automatically selects the right legal document to consult.
