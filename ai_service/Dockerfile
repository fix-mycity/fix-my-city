FROM python:3.10-slim

WORKDIR /app/ai_service

COPY ai_service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ai_service/ .

EXPOSE 8003

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8003", "--reload"]
