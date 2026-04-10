from docling.document_converter import DocumentConverter, PdfFormatOption
from docling.backend.pypdfium2_backend import PyPdfiumDocumentBackend
from docling.datamodel.base_models import InputFormat
from sentence_transformers import SentenceTransformer
from docling.chunking import HybridChunker
import chromadb
import gc
import os

os.makedirs("./temp", exist_ok=True)

conv = DocumentConverter(
    format_options={
        InputFormat.PDF: PdfFormatOption(
            backend=PyPdfiumDocumentBackend,
            do_ocr=False
        )
    }
)
chunker = HybridChunker(max_tokens=512)
embedder = SentenceTransformer("all-MiniLM-L6-v2")
client = chromadb.PersistentClient(path="./chroma_db")

def index_document(doc_name, doc_path):
    existing_names = [i.name for i in client.list_collections()]

    if doc_name in existing_names:
        return "already_exists"

    doc = conv.convert(doc_path).document
    chunks = list(chunker.chunk(dl_doc=doc))
    texts = [chunk.text for chunk in chunks]

    embeddings = embedder.encode(
        texts,
        batch_size=32,
        normalize_embeddings=True,
    )

    collection = client.get_or_create_collection(
        name=doc_name,
        metadata={"hnsw:space": "cosine"},
    )
    collection.add(
        ids       = [f"chunk_{i}" for i in range(len(chunks))],
        embeddings= embeddings.tolist(),
        documents = texts,
        metadatas = [{"chunk_index": i, "source": doc_name} for i in range(len(chunks))],
    )

    del doc, chunks, texts, embeddings
    gc.collect()
    return "ok"

