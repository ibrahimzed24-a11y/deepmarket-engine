# DeepMarket Engine ⚡

Autonomous Multi-Agent Market Research Intelligence System.

Built by **Nile Supplies** (`contact@nilesupplies.com`).

DeepMarket Engine is an autonomous full-stack market research platform powered by multi-agent orchestration. It decomposes ambitious market entry queries into parallel research graphs executed by specialized agents, synthesizing findings into a production-grade **Executive Intelligence Dossier**.

---

## 🏛️ Architecture & Agent Graph

DeepMarket Engine features a 5-stage agent pipeline:

1. **Orchestrator Agent**: Decomposes natural language queries, extracts key market entities (industry, geographic bounds, business models, incumbent competitors), and coordinates downstream autonomous agents.
2. **Geo & Demand Scout**: Analyzes regional TAM/SAM/SOM, purchasing power parity, consumer intent, regulatory barriers, and localized payment/fintech ecosystems (e.g., QRIS/GoPay, BML/Ooredoo, M-Pesa, Pix).
3. **SEO & Keyword Planner**: Maps search intent clusters (Informational vs. Transactional vs. Commercial), search volume proxies, difficulty, programmatic SEO opportunities, and unaddressed content gaps.
4. **Competitor & Gaps Hunter**: Deconstructs incumbents, dissects pricing models, isolates customer pain points, and reveals exploitable market moats.
5. **GTM Strategist**: Synthesizes cross-agent artifacts into a 30-60-90 day executable market entry roadmap, unit economics (LTV/CAC proxies), positioning statement, and acquisition channel playbook.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ or 20+
- (Optional) Local [Ollama](https://ollama.ai) instance running `qwen2.5-coder:7b` or `llama3.3`.

### 2. Installation
```bash
git clone https://github.com/ibrahimzed24-a11y/deepmarket-engine.git
cd deepmarket-engine
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Default variables:
```env
NEXT_PUBLIC_APP_NAME="DeepMarket Engine"
NEXT_PUBLIC_CONTACT_EMAIL="contact@nilesupplies.com"
LLM_BASE_URL="http://localhost:11434/v1"
LLM_API_KEY="ollama_local"
DEFAULT_MODEL="qwen2.5-coder:7b"
```

### 4. Running Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔌 Connecting to Local Ollama or Remote Endpoints

DeepMarket Engine supports any OpenAI-compatible endpoint.

### Option A: Localhost Ollama (Development)
1. Install Ollama and pull the recommended model:
   ```bash
   ollama pull qwen2.5-coder:7b
   ```
2. Start the Ollama server:
   ```bash
   ollama serve
   ```
3. Ollama runs on `http://localhost:11434/v1`. DeepMarket Engine connects to this by default.

### Option B: Cloud-Deployed Vercel with Local Ollama (Tunneling)
When DeepMarket Engine is hosted on Vercel, the cloud function cannot directly reach your private `localhost:11434`. You can bridge them securely in two minutes:

1. **Using Ngrok**:
   ```bash
   ngrok http 11434
   ```
   Copy the HTTPS forwarding address (e.g., `https://xxxx.ngrok-free.app/v1`).
2. **Using Cloudflare Tunnel**:
   ```bash
   cloudflared tunnel --url http://localhost:11434
   ```
3. In DeepMarket Engine, click the **Settings ⚙️** icon in the header and paste your tunnel URL into the **LLM Base URL** field.

### Option C: Remote OpenAI / vLLM / OpenCode Endpoint
You can also connect any hosted endpoint (vLLM, Together AI, Groq, OpenAI, DeepSeek):
1. Open the **Settings Modal** in the UI.
2. Enter the Base URL (e.g., `https://api.openai.com/v1` or `https://api.groq.com/openai/v1`).
3. Enter your API Key and Model Name (e.g., `gpt-4o`, `llama-3.3-70b-versatile`, `deepseek-chat`).

---

## 📦 Tech Stack
- **Framework**: Next.js 14 (App Router, Server-Sent Events)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS (Dark Mode Slate/Cyan Theme)
- **Icons**: Lucide React
- **LLM Client**: Universal OpenAI-compatible streaming client with JSON-repair parser and graceful resilience fallback

---

## 📄 License & Contact
Maintained by **Nile Supplies** — [contact@nilesupplies.com](mailto:contact@nilesupplies.com).
Distributed under the MIT License.
