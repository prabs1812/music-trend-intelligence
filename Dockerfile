# Backend Dockerfile for Railway deployment
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install spaCy model directly via pip (avoids download command issues)
RUN pip install https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.7.1/en_core_web_sm-3.7.1-py3-none-any.whl

# Copy backend code
COPY backend/ ./backend/

# Create logs directory
RUN mkdir -p /app/logs

# Expose port (Railway will set PORT env variable)
EXPOSE 8000

# Run the application
CMD uvicorn backend.services.api.main:app --host 0.0.0.0 --port ${PORT:-8000}
