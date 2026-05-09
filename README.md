# DocMind — AI Document to HTML Platform

Turn any document into beautiful HTML using your local Ollama AI.

## Setup

### 1. Install Python dependencies
```bash
pip install -r requirements.txt
```

### 2. Start Ollama (in a separate terminal)
```bash
ollama serve
```

### 3. Pull a model (if you haven't already)
```bash
ollama pull llama3.2
```

### 4. Run the app
```bash
python app.py
```

### 5. Open in browser
```
http://localhost:5000
```

---

## Project Structure

```
docmind/
├── app.py                  # Flask backend + Ollama integration
├── requirements.txt
├── templates/
│   ├── base.html           # Shared layout (sidebar, nav)
│   ├── index.html          # Home page
│   ├── generate.html       # Generate page
│   ├── history.html        # History page
│   └── settings.html       # Settings page
└── static/
    ├── css/
    │   └── main.css        # All styles
    └── js/
        ├── main.js         # Shared JS (status check, mobile nav)
        ├── generate.js     # Generate page logic
        ├── history.js      # History page logic
        └── settings.js     # Settings page logic
```

## Routes

| Route       | Description              |
|-------------|--------------------------|
| `/`         | Home / landing page      |
| `/generate` | Main generation tool     |
| `/history`  | Past generated documents |
| `/settings` | Configure Ollama & prefs |

## API Endpoints

| Endpoint         | Method | Description                        |
|------------------|--------|------------------------------------|
| `/api/models`    | GET    | List available Ollama models        |
| `/api/extract`   | POST   | Extract text from uploaded file     |
| `/api/generate`  | POST   | Stream HTML generation from Ollama  |

## Supported Input Formats

- Plain text (.txt)
- PDF (.pdf)
- Word document (.docx, .doc)
- Markdown (.md)
- HTML (.html)
- CSV (.csv)
- JSON (.json)

## Output Styles

- **Explainer** — Step-by-step explanation with key concepts
- **Summary** — Executive overview with key takeaways
- **Study Guide** — Definitions, facts, review questions
- **Presentation** — Slide-style cards layout
- **Technical Docs** — Structured documentation with code blocks
