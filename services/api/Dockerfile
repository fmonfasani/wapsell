FROM python:3.11-slim

WORKDIR /app

# git is needed to pip-install the wapsell SDK from git+https.
RUN apt-get update \
    && apt-get install -y --no-install-recommends git \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .
COPY buyer_personas.py .
COPY buyer_profile_manager.py .
COPY wapsell_sales.py .
COPY integrations/ ./integrations/

# Data dir for the persistent SQLite volume (WAPSELL_DB_PATH=/data/wapsell.db).
RUN mkdir -p /data

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
