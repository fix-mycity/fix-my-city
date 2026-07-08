FROM python:3.10-slim

WORKDIR /app/city_operation_service

COPY city_operation_service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY city_operation_service/ .

EXPOSE 8002

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8002", "--reload"]
