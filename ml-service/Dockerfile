FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p models

EXPOSE 8089

CMD ["gunicorn", "--bind", "0.0.0.0:8089", "--workers", "2", "--timeout", "120", "app:app"]
