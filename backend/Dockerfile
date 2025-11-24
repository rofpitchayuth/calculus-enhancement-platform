# ---------- Base Python image ----------
FROM python:3.12-slim

# ---------- Environment config ----------
ENV PYTHONDONTWRITEBYTECODE=1 \
  PYTHONUNBUFFERED=1 \
  PIP_NO_CACHE_DIR=1

WORKDIR /app

# ---------- Install required system packages ----------
# libgomp1 = สำหรับ scikit-learn (OpenMP)
# build-essential / python3-dev = ใช้ชั่วคราวเพื่อ build wheel
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
  build-essential \
  python3-dev \
  libgomp1 \
  && rm -rf /var/lib/apt/lists/*

# ---------- Install Python dependencies ----------
COPY requirements.txt /app/requirements.txt
RUN pip install --upgrade pip setuptools wheel \
  && pip install --no-cache-dir -r /app/requirements.txt \
  && apt-get purge -y --auto-remove build-essential python3-dev \
  && rm -rf /var/lib/apt/lists/*

# ---------- Copy backend source code ----------
COPY . /app/

# ---------- Expose and run FastAPI ----------
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
