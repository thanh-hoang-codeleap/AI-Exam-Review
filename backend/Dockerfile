# backend/Dockerfile
FROM python:3.11-slim

# Install system dependencies including git
RUN apt-get update && \
    apt-get install -y \
    build-essential \
    pkg-config \
    libpoppler-cpp-dev \
    cmake \
    git \
    && apt-get clean

# Set environment variables to prevent buffering stdout/stderr
ENV PYTHONUNBUFFERED=1

# Set the working directory in the container
WORKDIR /app

# Create a virtual environment
RUN python -m venv venv

# Set the virtual environment's bin directory as the default
ENV PATH="./venv/bin:$PATH"

# Copy the requirements file first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies in the virtual environment
RUN pip install --no-cache-dir -r requirements.txt

# Clone and install python-poppler from git
RUN git clone https://github.com/cbrunet/python-poppler.git && \
    cd python-poppler && \
    pip install . && \
    cd .. && \
    rm -rf python-poppler

# Copy the rest of the backend application code
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Define the command to run the application
CMD ["python", "app.py"]