# backend/Dockerfile

FROM python:3.11-slim

# Install uv
COPY --from=ghcr.io/astral-sh/uv:0.6.13 /uv /uvx /bin/
RUN apt-get update && \
    apt-get install -y \
    build-essential \
    pkg-config \
    libpoppler-cpp-dev \
    cmake \
    && apt-get clean

# Set environment variables to prevent buffering stdout/stderr
ENV PYTHONUNBUFFERED=1 \
    UV_CACHE_DIR=/root/.cache/uv

# Set the working directory in the container
WORKDIR /app

# Create a virtual environment
RUN uv venv

# Set the virtual environment's bin directory as the default
ENV PATH="/venv/bin:$PATH"

# Copy the requirements file first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies in the virtual environment
RUN uv pip install --no-cache-dir -r requirements.txt

# Install python-poppler in the virtual environment
RUN uv pip install python-poppler

# Copy the rest of the backend application code
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Define the command to run the application
CMD ["python", "app.py"]
