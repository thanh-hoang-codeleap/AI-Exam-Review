# backend/Dockerfile
 
FROM python:3.11-slim
 
# Install uv
COPY --from=ghcr.io/astral-sh/uv:0.6.13 /uv /uvx /bin/

# Set environment variables to prevent buffering stdout/stderr
ENV PYTHONUNBUFFERED=1\
    UV_CACHE_DIR=/root/.cache/uv

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
# Using --no-cache-dir reduces image size
RUN uv pip install --system --no-cache -r requirements.txt

# Copy the rest of the backend application code
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Define the command to run the application
CMD ["python", "app.py"]