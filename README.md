# 🚀 SLMGEN - Small Language Model Generator

**Fine-tune SLMs. 2x faster. For free.**

SLMGEN is a web application that automates SLM fine-tuning. Upload your JSONL data and receive ready-to-run Google Colab notebooks.

## ✨ Features

- 📤 **Upload** - Drag-and-drop JSONL datasets with instant validation
- 📊 **Analyze** - Automatic quality scoring and characteristic detection
- 🎯 **Recommend** - AI-powered model selection based on your data
- 🚀 **Generate** - Self-contained Colab notebooks with embedded datasets

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Backend** | Python 3.11+, FastAPI, Pydantic |
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS |
| **Training** | Unsloth + LoRA on Google Colab (Free T4) |

## 🚀 Quick Start

### Backend

```bash
cd libslmgen
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd slmgenui
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start fine-tuning!

## 📁 Project Structure

```
slmgen/
├── libslmgen/              # Python Backend
│   ├── app/
│   │   ├── main.py         # FastAPI app
│   │   ├── config.py       # Settings
│   │   ├── models.py       # Pydantic schemas
│   │   ├── session.py      # Session manager
│   │   └── routers/        # API endpoints
│   └── core/
│       ├── ingest.py       # JSONL parsing
│       ├── quality.py      # Quality scoring
│       ├── analyzer.py     # Dataset analysis
│       ├── recommender.py  # Model selection
│       └── notebook.py     # Notebook generator
├── slmgenui/               # Next.js Frontend
│   └── src/
│       ├── app/            # Pages
│       ├── components/     # UI components
│       ├── lib/            # API client & types
│       └── hooks/          # React hooks
└── LICENSE
```

## 📊 Supported Models

| Model | Size | Best For |
|-------|------|----------|
| **Phi-4 Mini** | 3.8B | Classification, Extraction |
| **Llama 3.2** | 3B | Q&A, Conversations |
| **Gemma 2** | 2B | Edge, Mobile |
| **Qwen 2.5** | 3B | Multilingual, JSON |
| **Mistral 7B** | 7B | Generation |

## 📦 Dataset Format

Each line in your JSONL file should be a conversation:

```json
{"messages": [{"role": "user", "content": "Hello!"}, {"role": "assistant", "content": "Hi there!"}]}
{"messages": [{"role": "system", "content": "You are helpful."}, {"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]}
```

**Requirements:**
- Minimum 50 examples
- At least one user and one assistant message per conversation
- UTF-8 encoding

## ⚙️ Environment Variables

```bash
# Backend (.env)
ALLOWED_ORIGINS=http://localhost:3000
UPLOAD_DIR=./uploads
GITHUB_TOKEN=           # Optional, for Colab URLs

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📄 License

MIT License - See [LICENSE](LICENSE)

## 👤 Author

**Eshan Roy**
- Email: eshanized@proton.me
- GitHub: [@eshanized](https://github.com/eshanized)
