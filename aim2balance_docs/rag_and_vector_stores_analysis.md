# RAG API & Vector Stores Analysis

This document provides a deep dive into LibreChat's Retrieval-Augmented Generation (RAG) architecture, including its dedicated API, vector database integration, and file storage options.

## 1. System Architecture

LibreChat employs a decoupled microservice architecture for its RAG capabilities. This is a robust design that separates the core application from the resource-intensive tasks of file processing and vector search.

-   **Main Application (`api` service):** The primary Node.js application handles user requests, conversation logic, and orchestrates calls to other services.
-   **RAG API (`rag_api` service):** A dedicated Python (FastAPI) service responsible for all RAG-related tasks. This includes file parsing, text splitting, generating embeddings, and querying the vector database.
-   **Vector Database (`vectordb` service):** The default vector store is **pgvector**, running in its own Docker container. The RAG API is designed to be modular and can be adapted to work with other vector databases like Weaviate or Qdrant.

This separation ensures that the main application remains responsive while the `rag_api` handles the heavy computational work of the RAG pipeline.

## 2. File Storage

When a user uploads a file, LibreChat uses a dual-storage pattern:

1.  **Persistent File Storage:** The original file is saved to a configured file storage provider. This ensures the original document is preserved.
2.  **Vector Storage:** The file is also sent to the `rag_api` to be processed, chunked, embedded, and stored in the vector database for semantic search.

LibreChat supports the following file storage providers, which can be configured in the `.env` file:

-   **Local File System:** The default option, which stores files on the server's local disk.
-   **AWS S3:** For scalable, cloud-based object storage.
-   **Azure Blob Storage:** Microsoft's object storage solution.
-   **Firebase Storage:** Google's object storage solution.

## 3. RAG API Endpoints

The main LibreChat application communicates with the `rag_api` via a simple REST API, secured with short-lived JWTs. The key endpoints are:

-   `POST /embed`
    -   **Purpose:** To upload, process, and embed a new file.
    -   **Process:** The main app sends a `multipart/form-data` request containing the file and its metadata (e.g., `file_id`). The `rag_api` then reads the file, splits it into chunks, generates embeddings for each chunk (using the configured embedding model), and stores the vectors in the vector database.

-   `POST /query`
    -   **Purpose:** To perform a semantic search over one or more files.
    -   **Process:** This endpoint is called by the `file_search` tool. The request body contains a natural language `query` and a list of `file_id`s to search within. The `rag_api` generates an embedding for the query and performs a similarity search in the vector database to find the most relevant document chunks.

-   `DELETE /documents`
    -   **Purpose:** To delete the vector data associated with a file.
    -   **Process:** When a file is deleted in LibreChat, the main app sends a request with the `file_id` to this endpoint to ensure the corresponding vectors are removed from the database.

## 4. Configuration

The RAG system is configured through environment variables in the `.env` file:

-   `RAG_API_URL`: The URL of the RAG API service (e.g., `http://rag_api:8000`), used by the main app to communicate with it.
-   `EMBEDDINGS_PROVIDER`: Defines which service to use for generating embeddings (e.g., `openai`, `ollama`).
-   `EMBEDDINGS_MODEL`: The specific model to use for embeddings (e.g., `text-embedding-3-small`).
-   **Vector DB Connection:** The `rag_api` service itself uses environment variables like `DB_HOST` to connect to the vector database.
-   **File Storage:** As mentioned above, variables like `AWS_ACCESS_KEY_ID`, `AZURE_STORAGE_CONNECTION_STRING`, etc., are used to configure the persistent file storage.
