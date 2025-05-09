# Use official Python image
FROM python:3.11-slim

# Set work directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Copy .env file
COPY .env .env

# Expose the FastAPI port
EXPOSE 8000

# Start FastAPI server
CMD ["uvicorn", "fastapi_server:app", "--host", "0.0.0.0", "--port", "8000"]