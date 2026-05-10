# KT Service Dockerfile
FROM python:3.11-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# ---------------------------------------------------

FROM python:3.11-slim AS runtime

WORKDIR /app

# บังคับให้ Python แสดง Log ทันที ไม่ต้องเก็บไว้ใน Buffer (เหมาะกับ Docker)
ENV PYTHONUNBUFFERED=1
ENV PATH="/opt/venv/bin:$PATH"
ENV PYTHONPATH=/app

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /opt/venv /opt/venv

# บรรทัดนี้จะปลอดภัยแล้ว เพราะเรามี .dockerignore คอยกันไฟล์ขยะให้
COPY . .

RUN adduser --disabled-password --gecos '' appuser \
    && chown -R appuser:appuser /app
USER appuser

EXPOSE 8001

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]