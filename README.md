# 📘 Calculus Enhancement Platform

Calculus Enhancement Platform is a personalized learning web application designed to track and enhance students' calculus learning progress. The platform integrates machine learning (DKT-GRU) to adaptively path student exercises and a hybrid LLM pipeline to automatically classify, OCR, and provide step-by-step feedback for calculus questions.

---

## 🔗 GitHub Repository
* **Project URL:** [https://github.com/rofpitchayuth/calculus-enhancement-platform](https://github.com/rofpitchayuth/calculus-enhancement-platform)

---

## 🚀 Key Features
1. **Adaptive Quiz System:** Generates personalized quizzes based on the student's Zone of Proximal Development (ZPD) difficulty range.
2. **Deep Knowledge Tracing (DKT-GRU):** Real-time tracking of student topic mastery using a Recurrent Neural Network (RNN-GRU) to predict future success.
3. **AI Hybrid Pipeline (OCR & Classification):**
   * Uses **Gemini 2.5 Flash (Vision)** to OCR math equations and LaTeX formatting from uploaded question images.
   * Uses **Qwen2.5-Math (7B)** via Ollama to generate comprehensive step-by-step solutions in Thai.
   * Uses **Gemini 2.5 Flash** to reverse-engineer wrong choices and map them to specific common calculus error codes (Error Code Mapping).
4. **Performance Tracking Dashboard:** Visual reports summarizing student accuracy, strengths, weaknesses, and behavioral learning profiles.

---

## 📁 Project Structure
```text
calculus-enhancement-platform/
├── backend/               # Python FastAPI backend service
│   ├── app/               # Main application logic and repositories
│   ├── scripts/           # Database migrations and unified seed scripts
│   └── tests/             # Backend unit test suites
├── frontend/              # React + TypeScript + Vite web app (TailwindCSS)
├── ml-services/           # Python machine learning microservices
│   ├── KT_service/        # PyTorch DKT-GRU student mastery prediction service
│   └── LLM_service/       # Ollama & Gemini hybrid question solver and classifier
└── docker-compose.yml     # Multi-container Docker compose orchestration configuration
```

---

## 🛠️ Prerequisites
Before setting up the project, make sure you have the following installed:
* **Docker** and **Docker Compose**
* **Git**
* **Google Gemini API Key** (Get a free key from [Google AI Studio](https://aistudio.google.com/))

---

## 📥 Installation Manual

Follow these steps to run the application locally from scratch:

### 1. Clone the Repository
```bash
git clone https://github.com/rofpitchayuth/calculus-enhancement-platform.git
cd calculus-enhancement-platform
```

### 2. Configure Environment Variables
Copy the configuration template files and input your custom credentials:

* **Configure Backend API:**
  ```bash
  cp backend/.env.example backend/.env
  ```
  *(Default connection parameters are preconfigured for local Docker run)*

* **Configure LLM Service:**
  ```bash
  cp ml-services/LLM_service/.env.example ml-services/LLM_service/.env
  ```
  Open `ml-services/LLM_service/.env` and update the variables:
  * `GEMINI_API_KEY`: Paste your Google Gemini API Key.
  * `LLM_API_BASE_URL`: Specify the Ollama base API url (e.g. Tailscale IP of the PC hosting the model: `http://100.xxx.xxx.xxx:9292`, or `http://localhost:11434` if hosting locally).

---

### 3. Run the Services

Choose one of the two options below to run the application services:

#### Option A: Run via Docker Compose (Containerized Setup)
Build and run all services in the background:
```bash
docker-compose up --build -d
```
This builds and starts the PostgreSQL database, FastAPI backend, React frontend, KT microservice, and LLM microservice containerized.

##### Initialize Database (Migration & Seeding) for Docker:
Once the containers are running, run the following commands to create the database schema and populate it:
```bash
# 1. Run Alembic database migrations
docker-compose exec backend alembic upgrade head

# 2. Seed database tables (Populates Error Codes and calculus questions from Excel data)
docker-compose exec backend python scripts/seed.py
```

---

#### Option B: Run Manually (Local/Non-Docker Setup)
If you cannot build with Docker, you can run all components locally on your host machine.

##### 1. Start PostgreSQL Database
Make sure you have PostgreSQL running. You can install it on your machine, or run a lightweight Docker container just for the database (highly recommended as it avoids any Python/Node build issues):
```bash
docker run --name postgres_db -p 5432:5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=calculus_db -d postgres:15-alpine
```
*(Make sure the credentials in your `backend/.env` match: `DATABASE_URL=postgresql://postgres:password@localhost:5432/calculus_db`)*

##### 2. Start Backend Service
```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies, run migrations, seed data, and start server
pip install -r requirements.txt
alembic upgrade head
python scripts/seed.py
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

##### 3. Start KT (Knowledge Tracing) Service
```bash
cd ml-services/KT_service
python -m venv venv

# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8001 --reload
```

##### 4. Start LLM Service
```bash
cd ml-services/LLM_service
python -m venv venv

# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn llm_service:app --host 127.0.0.1 --port 8002 --reload
```

##### 5. Start Frontend Web App
```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 System Port Maps & URLs

Access the local services running on your host:
* **Frontend Web App:** [http://localhost:5173](http://localhost:5173) (Interactive exam interface and dashboard)
* **Backend API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI for backend services)
* **KT Microservice API Docs:** [http://localhost:8001/docs](http://localhost:8001/docs) (DKT-GRU inference service endpoint)
* **LLM Microservice API Docs:** [http://localhost:8002/docs](http://localhost:8002/docs) (Hybrid solver and OCR endpoint)

---

## 🧪 Running Automated Unit Tests

Automated test suites are provided to verify system integrity:

### 1. Run Backend Tests
Uses `pytest` to test the quiz flow and adaptive recommendation ZPD logic:
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\pip install -r requirements.txt
venv\Scripts\pytest tests/
# On macOS/Linux:
source venv/bin/activate
pip install -r requirements.txt
pytest tests/
```

### 2. Run Frontend Tests
Uses `vitest` to verify rendering styles and question mapping components:
```bash
cd frontend
npm install
npx vitest run
```
