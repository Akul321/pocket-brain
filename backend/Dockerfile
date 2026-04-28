FROM python:3.11-slim

# HF Spaces runs as a non-root user; /data is the persistent volume mount point
RUN mkdir -p /data && chmod 777 /data

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# HF Spaces requires port 7860
EXPOSE 7860

# Default DB to /data so it survives Space restarts when persistent storage is enabled
ENV DATABASE_URL=sqlite:////data/pocket_brain.db

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
