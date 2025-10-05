# RAG Cost Analysis for LibreChat

This document provides a detailed breakdown of the additional costs associated with using the Retrieval-Augmented Generation (RAG) feature in LibreChat. Understanding these costs is essential for implementing a custom billing system for a platform like aim2balance.ai.

## 1. Executive Summary

Yes, using the RAG feature (file uploads and search) in LibreChat incurs extra costs beyond the standard fees for language model interactions. These costs can be categorized into three main areas:

1.  **Embedding Costs:** API fees for converting text to vectors.
2.  **Storage Costs:** Fees for storing original files and their vector embeddings.
3.  **Infrastructure Costs:** The cost of running the dedicated RAG services.

For a platform like aim2balance.ai that aims to bill for resource usage, it is critical to track and account for these RAG-related costs.

## 2. Embedding Costs (API Fees)

This is the most direct and often most significant cost associated with RAG. It is incurred every time text is converted into a vector embedding by calling an external API.

-   **Provider:** Configured by the `EMBEDDINGS_PROVIDER` and `EMBEDDINGS_MODEL` variables in the `.env` file (e.g., OpenAI's `text-embedding-3-small`).
-   **Pricing:** Typically billed on a per-token basis (e.g., $0.02 per 1 million tokens for OpenAI's `text-embedding-3-small`).

### Cost-Incurring Events:

1.  **On File Upload:**
    -   **What happens:** When a user uploads a file, the `rag_api` service reads the file, splits it into chunks, and sends each chunk to the embedding model's API.
    -   **Cost Implication:** The entire content of every uploaded file is processed, which can lead to significant costs for large documents.

2.  **On File Search:**
    -   **What happens:** When a user performs a search (e.g., via the `file_search` agent tool), their search query is sent to the embedding model's API to be converted into a vector.
    -   **Cost Implication:** While the cost of embedding a single query is small, it is incurred on every search, which can add up over time.

## 3. Storage Costs

There are two types of storage costs associated with the RAG system:

### a. Original File Storage

-   **What it is:** The cost of storing the original files that users upload.
-   **Providers:** LibreChat supports several storage providers, configured in the `.env` file:
    -   **AWS S3 (`AWS_*` variables)**
    -   **Azure Blob Storage (`AZURE_*` variables)**
    -   **Firebase Storage (`FIREBASE_*` variables)**
    -   **Local File System** (cost is part of the server's disk space)
-   **Pricing:** Billed per gigabyte per month (GB/month) and for data transfer operations (uploads/downloads).

### b. Vector Database Storage

-   **What it is:** The cost of storing the vector embeddings generated from the files.
-   **Providers:**
    -   **Self-Hosted (Default):** The default `docker-compose.yml` uses a `pgvector` container. The cost is part of your server's infrastructure (disk space, CPU, RAM).
    -   **Managed Service:** If you configure the `rag_api` to use a managed vector database (e.g., Weaviate Cloud, Qdrant Cloud, a managed Postgres instance), this will be a separate, direct cost from that provider.

## 4. Infrastructure Costs

These are the costs associated with running the services that power the RAG functionality.

-   **RAG API Service:** The `rag_api` is a dedicated container that consumes server resources (CPU and RAM). It handles all the processing, so its resource allocation may need to be scaled depending on usage.
-   **Vector Database Service:** The `vectordb` container also consumes server resources.

## 5. Conclusion for aim2balance.ai

To implement a billing system that accurately reflects resource usage, you must track all of the above cost factors. The `spendTokens` model in LibreChat is designed to track token usage for language models, but it does not account for RAG-related costs.

To build a comprehensive billing system, you will need to:

1.  **Track Embedding API Calls:** Modify the `rag_api` or the main API to log every call to the embedding model, including the number of tokens processed.
2.  **Monitor Storage Usage:** Track the amount of file storage and vector database storage used by each user or project.
3.  **Factor in Infrastructure Costs:** Allocate a portion of your server and database hosting costs to RAG usage.

By combining these metrics, you can create a billing model that accurately reflects the true cost of the RAG feature and aligns with the sustainability goals of aim2balance.ai.
