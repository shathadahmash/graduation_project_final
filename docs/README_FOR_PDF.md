# How to generate PDF documentation locally

You can convert the Markdown files and Mermaid diagrams into PDF using these recommended tools.

1) Prerequisites (install once):
- Pandoc (https://pandoc.org/) + a PDF engine (wkhtmltopdf or wkhtmltopdf + npm chroma), or LaTeX distribution (TeX Live/MikTeX).
- mermaid-cli (optional) to render diagrams to SVG/PNG.

Install examples (Windows PowerShell):
```powershell
# npm (install mermaid cli)
npm install -g @mermaid-js/mermaid-cli

# choco or apt for wkhtmltopdf / pandoc if available
# e.g., with scoop or choco:
choco install pandoc
choco install wkhtmltopdf
```

2) Render Mermaid diagrams to SVG or PNG:
```bash
mmdc -i diagrams/mermaid/system_overview.mmd -o docs/system_overview.svg
mmdc -i diagrams/mermaid/create_group_sequence.mmd -o docs/create_group_sequence.svg
mmdc -i diagrams/mermaid/websocket_flow.mmd -o docs/websocket_flow.svg
```

3) Convert Markdown to PDF (example using Pandoc + wkhtmltopdf):
```bash
# render Markdown to HTML then to PDF
pandoc docs/ARCHITECTURE.md docs/API_REFERENCE.md docs/openapi.yaml -o docs/Full_Docs.html --standalone
wkhtmltopdf docs/Full_Docs.html docs/Full_Docs.pdf
```

Alternative single-step (pandoc -> pdf using LaTeX):
```bash
pandoc docs/ARCHITECTURE.md docs/API_REFERENCE.md -o docs/Full_Docs.pdf --pdf-engine=xelatex
```

4) Combine diagrams into a single PDF (optional):
- Convert SVGs to PDF (e.g. Inkscape or rsvg-convert) and then merge with `pdfunite` or `pdftk`.

If you want, I can produce a single `docs/Full_Docs.md` that inlines the diagrams as links and then give you the exact pandoc command to create the PDF on your machine.