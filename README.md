# 📘 Calculus Enhancement Platform (แพลตฟอร์มการเรียนรู้แคลคูลัสแบบปรับตัวบุคคล)

Calculus Enhancement Platform คือแพลตฟอร์มการเรียนรู้แคลคูลัสอัจฉริยะที่ช่วยวิเคราะห์ทักษะความรู้ของนักเรียนเป็นรายบุคคล (Personalized Learning) โดยผสานรวมโมเดล AI ในการจัดเส้นทางการเรียนรู้และวิเคราะห์ข้อผิดพลาดเพื่อช่วยให้นักเรียนพัฒนาทักษะได้ตรงจุด

---

## 🔗 GitHub Repository
* **Project URL:** [https://github.com/rofpitchayuth/calculus-enhancement-platform](https://github.com/rofpitchayuth/calculus-enhancement-platform)

---

## 🚀 ฟีเจอร์หลักของระบบ (Key Features)
1. **Adaptive Quiz System:** จัดข้อสอบวัดความรู้ตามขอบเขตระดับทักษะจริง (Zone of Proximal Development - ZPD) ของนักเรียนเป็นรายบุคคล
2. **Deep Knowledge Tracing (DKT-GRU):** วิเคราะห์ระดับการเรียนรู้และทำนายความเข้าใจในหัวข้อย่อยแบบ Real-time โดยใช้โครงข่ายประสาทเทียมแบบ Recurrent Neural Network (RNN-GRU)
3. **AI Hybrid Pipeline (OCR & Classification):** 
   * ใช้ **Gemini 2.5 Flash (Vision)** ในการทำ OCR สแกนโจทย์คณิตศาสตร์และ LaTeX จากรูปภาพ
   * ใช้ **Qwen2.5-Math (7B)** ในการสร้างคำอธิบายทีละขั้นตอนอย่างละเอียดในภาษาไทย
   * ใช้ **Gemini 2.5 Flash** ในการวิเคราะห์ประเภทข้อผิดพลาด (Error Code Mapping) แบบเจาะลึก
4. **Performance Tracking Dashboard:** แดชบอร์ดสรุปสถิติคะแนน จุดอ่อน จุดแข็ง และคาแรคเตอร์การเรียนรู้ของนักศึกษา

---

## 📁 โครงสร้างโปรเจค (Project Structure)
```text
calculus-enhancement-platform/
├── backend/               # FastAPI Web API หลัก (Python)
│   ├── app/               # โค้ดหลักระบบบริหารควิซและการคำนวณสถิติ
│   ├── scripts/           # สคริปต์สำหรับการ Migration และ Seed ข้อมูลฐานข้อมูล [NEW]
│   └── tests/             # ชุดคำสั่งการทดสอบระบบหลังบ้าน (Backend Unit Tests)
├── frontend/              # เว็บแอปพลิเคชันฝั่งผู้ใช้งาน (React + TypeScript + Vite)
├── ml-services/           # บริการไมโครเซอร์วิสฝั่ง AI/ML
│   ├── KT_service/        # บริการรันโมเดลทำนายความรู้ DKT-GRU (PyTorch)
│   └── LLM_service/       # บริการจัดหมวดหมู่โจทย์คณิตศาสตร์ผ่านโมเดลภาษา (Hybrid LLM Pipeline)
└── docker-compose.yml     # ไฟล์สำหรับสั่งรันบริการทั้งหมดในระบบพร้อมกัน
```

---

## 🛠️ ความต้องการของระบบ (Prerequisites)
ก่อนทำการติดตั้งและรันระบบ กรุณาเตรียมโปรแกรมเหล่านี้ในเครื่องของคุณให้พร้อม:
* **Docker** และ **Docker Compose**
* **Git** (สำหรับจัดการซอร์สโค้ด)
* **API Key ของ Google Gemini** (สามารถขอได้จาก [Google AI Studio](https://aistudio.google.com/))

---

## 📥 คู่มือการติดตั้งและใช้งานระบบ (Installation Manual)

ขั้นตอนการรันระบบขึ้นมาใช้งานตั้งแต่เริ่มต้น:

### 1. โคลนและเตรียมโครงการ
```bash
git clone https://github.com/rofpitchayuth/calculus-enhancement-platform.git
cd calculus-enhancement-platform
```

### 2. การตั้งค่าตัวแปรสภาพแวดล้อม (Environment Config)
คัดลอกไฟล์แม่แบบคอนฟิกสภาพแวดล้อม และกรอกคีย์ใช้งานของตัวคุณเอง:

* **ตั้งค่าฝั่ง Backend API:**
  ```bash
  cp backend/.env.example backend/.env
  ```
  *(สามารถใช้งานค่าพอร์ตและสิทธิ์ฐานข้อมูลเริ่มต้นใน `.env` ได้ทันที)*

* **ตั้งค่าฝั่ง LLM Service:**
  ```bash
  cp ml-services/LLM_service/.env.example ml-services/LLM_service/.env
  ```
  เปิดไฟล์ `ml-services/LLM_service/.env` และทำการกรอกคีย์ของคุณดังนี้:
  * `GEMINI_API_KEY`: กรอกคีย์ API ของ Google Gemini ของคุณ
  * `LLM_API_BASE_URL`: ระบุพอร์ตเชื่อมต่อไปยังโมเดล Qwen2.5-math (สามารถระบุเป็น IP Tailscale ของคุณที่รัน Ollama อยู่ เช่น `http://100.xxx.xxx.xxx:9292` หรือใช้ `http://localhost:11434` หากรันในเครื่องเดียวกัน)

---

### 3. การสั่งรันระบบด้วย Docker Compose
สั่งประกอบร่างและรันทุกบริการขึ้นมาทำงานร่วมกันผ่านคำสั่ง:
```bash
docker-compose up --build -d
```
คำสั่งนี้จะทำการดาวน์โหลดภาพอิมเมจ สร้างฐานข้อมูล PostgreSQL และสั่งรันแอปพลิเคชัน Backend, Frontend, KT Service, และ LLM Service ในเวลาเดียวกัน

---

### 4. เตรียมข้อมูลเริ่มต้น (Database Migration & Seeding)
เมื่อระบบรันขึ้นมาเป็นที่เรียบร้อยแล้ว ให้รันชุดคำสั่งเพื่อสร้างโครงสร้างตารางและนำเข้าข้อมูลชุดคำถามเริ่มต้น:

```bash
# 1. รันสคริปต์สร้างตารางฐานข้อมูล
docker-compose exec backend alembic upgrade head

# 2. รันสคริปต์นำเข้าคำถามแคลคูลัสและรหัสวิเคราะห์ข้อผิดพลาดจาก Excel
docker-compose exec backend python scripts/seed.py
```

เมื่อทำตามขั้นตอนนี้เรียบร้อยแล้ว ระบบจะพร้อมใช้งานและมีโจทย์คำถามแคลคูลัสทั้งหมดอยู่ในระบบทันทีครับ!

---

## 🌐 การเข้าใช้งานหน้าจอระบบ (System URLs)

หลังจากรันคำสั่งสำเร็จ คุณสามารถเข้าทดสอบการทำงานผ่านพอร์ตต่าง ๆ บนเครื่องได้ดังนี้:
* **Frontend Web App:** [http://localhost:5173](http://localhost:5173) (หน้าจอทำข้อสอบ แดชบอร์ดวิเคราะห์ประวัตินักศึกษา)
* **Backend API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs) (หน้าจอ Swagger UI ทดสอบ Backend API)
* **KT Microservice API:** [http://localhost:8001/docs](http://localhost:8001/docs) (ทดสอบ API สำหรับโมเดลความรู้ DKT-GRU)
* **LLM Microservice API:** [http://localhost:8002/docs](http://localhost:8002/docs) (ทดสอบ API การแก้โจทย์และแยกประเภทย่อย)

---

## 🧪 การรันแบบทดสอบความถูกต้องของระบบ (Running Automated Tests)

โครงการมีการจัดทำชุดทดสอบอัตโนมัติ (Unit Tests) เพื่อตรวจสอบความถูกต้องของระบบก่อนการส่งมอบงาน:

### 1. ทดสอบหลังบ้าน (Backend tests)
ใช้เฟรมเวิร์ก `pytest` ในการทดสอบตรรกะควิซและระบบ ZPD:
```bash
# รันเทสฝั่ง Backend
cd backend
python -m venv venv
# Windows:
venv\Scripts\pip install -r requirements.txt
venv\Scripts\pytest tests/
# macOS/Linux:
source venv/bin/activate
pip install -r requirements.txt
pytest tests/
```

### 2. ทดสอบหน้าบ้าน (Frontend tests)
ใช้เฟรมเวิร์ก `vitest` ในการตรวจสอบการแสดงผลป้ายอธิบาย (Feedback Panel) และ ZPD UI:
```bash
# รันเทสฝั่ง Frontend
cd frontend
npm install
npx vitest run
```
