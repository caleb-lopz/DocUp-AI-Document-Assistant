import streamlit as st
from index_docup import index_document  
from query_docup import ask
import chromadb

st.set_page_config(page_title="Doc Assistant", page_icon="📄", layout="wide")

col1, col2 = st.columns([1, 2])


with col1:
    st.title("Documentos")
    uploaded_files = st.file_uploader("Upload your PDFs", type="pdf", accept_multiple_files=True, key="pdf_uploader")
    if uploaded_files:
        for file in uploaded_files:
            # llama tu función de indexado
            index_document(file)


with col2:
    st.title("Chat")
    
    client_model = chromadb.PersistentClient(path="./chroma_db")
    collections = [i.name for i in client_model.list_collections()]
    
    if collections:
        doc_name = st.selectbox("Documento activo", collections)
        
        if "chat_history" not in st.session_state:
            st.session_state.chat_history = []

        for msg in st.session_state.chat_history:
            with st.chat_message(msg["role"]):
                st.write(msg["content"])

        question = st.chat_input("Ask a question")
        if question:
            with st.chat_message("user"):
                st.write(question)
            answer, st.session_state.chat_history = ask(question, doc_name, st.session_state.chat_history)
            with st.chat_message("assistant"):
                st.write(answer)
    else:
        st.info("Upload a document to begin")

