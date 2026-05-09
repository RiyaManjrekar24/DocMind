<div align="center">

<br />

# 🧠 DocMind

### **Transform Any Document into Beautiful HTML — Powered by Local AI**

*No cloud. No API keys. No data leaving your machine.*

<br />

[![Python](https://img.shields.io/badge/Python-3.8%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-2.x-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![Ollama](https://img.shields.io/badge/Ollama-Local%20AI-FF6B35?style=for-the-badge&logo=ollama&logoColor=white)](https://ollama.ai)
[![License](https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-8B5CF6?style=for-the-badge)](CONTRIBUTING.md)

<br />

</div>

---

## ✨ Why DocMind?

> Upload a PDF. Pick a style. Get a gorgeous, structured HTML page — all processed by your local AI in seconds.

DocMind bridges the gap between raw documents and polished, readable content. Whether you're summarizing research, turning reports into slides, or building study guides — DocMind handles it all **locally**, **privately**, and **fast**.

---

## 🚀 Quick Start

Get up and running in under 3 minutes:

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Start Ollama (in a separate terminal)
ollama serve

# 3. Pull a model
ollama pull llama3.2

# 4. Launch DocMind
python app.py
```

Then open **[http://localhost:5000](http://localhost:5000)** in your browser. That's it.

---

## 📁 Project Structure

```
docmind/
├── app.py                  # Flask backend + Ollama integration
├── requirements.txt        # Python dependencies
├── templates/
│   ├── base.html           # Shared layout (sidebar, nav)
│   ├── index.html          # Home / landing page
│   ├── generate.html       # Document generation tool
│   ├── history.html        # Past generations viewer
│   └── settings.html       # Ollama config & preferences
└── static/
    ├── css/
    │   └── main.css        # Global styles
    └── js/
        ├── main.js         # Shared logic (status check, mobile nav)
        ├── generate.js     # Generation page logic
        ├── history.js      # History page logic
        └── settings.js     # Settings page logic
```

---

## 🗺️ Routes

| Route | Page | Description |
|---|---|---|
| `/` | 🏠 Home | Landing page & overview |
| `/generate` | ⚡ Generate | Main document-to-HTML tool |
| `/history` | 📜 History | Browse past generated documents |
| `/settings` | ⚙️ Settings | Configure Ollama model & preferences |

---

## 🔌 API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/models` | `GET` | List all available Ollama models |
| `/api/extract` | `POST` | Extract raw text from an uploaded file |
| `/api/generate` | `POST` | Stream AI-generated HTML from Ollama |

---

## 📄 Supported Input Formats

Upload any of the following and DocMind will handle the rest:

| Format | Extension |
|---|---|
| 📝 Plain Text | `.txt` |
| 📕 PDF | `.pdf` |
| 📘 Word Document | `.docx`, `.doc` |
| 🖊️ Markdown | `.md` |
| 🌐 HTML | `.html` |
| 📊 Spreadsheet | `.csv` |
| 🗂️ Structured Data | `.json` |

---

## 🎨 Output Styles

Choose the format that fits your use case:

| Style | Best For |
|---|---|
| 🧩 **Explainer** | Step-by-step breakdowns with key concepts highlighted |
| 📋 **Summary** | Executive overviews with key takeaways at a glance |
| 📚 **Study Guide** | Definitions, facts, and review questions for learners |
| 🖼️ **Presentation** | Slide-style card layouts for visual storytelling |
| 🛠️ **Technical Docs** | Structured documentation with code blocks & references |

---

## 🔒 Privacy First

DocMind runs **100% locally** using [Ollama](https://ollama.ai). Your documents never leave your machine — no cloud processing, no third-party API calls, no telemetry.

---

## 🛠️ Tech Stack

- **[Flask](https://flask.palletsprojects.com/)** — Lightweight Python web framework
- **[Ollama](https://ollama.ai/)** — Local LLM runner (supports Llama 3, Mistral, Gemma & more)
- **Vanilla JS** — No frontend framework bloat, just fast and clean interactions

---

## 🤝 Contributing

Contributions are welcome! If you have ideas for new output styles, format support, or UI improvements, feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ and local AI · <a href="https://ollama.ai">Powered by Ollama</a>

</div>
