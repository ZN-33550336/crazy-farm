#!/usr/bin/env python3
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 若原始模板已改名為 index1.html，則以它為來源，並將單檔版輸出為 index.html
TEMPLATE_NAME = "index1.html" if os.path.exists(os.path.join(BASE_DIR, "index1.html")) else "index.html"
OUTPUT_NAME = "index.html" if TEMPLATE_NAME == "index1.html" else "瘋狂農場3D計算器_單檔版.html"

with open(os.path.join(BASE_DIR, TEMPLATE_NAME), "r", encoding="utf-8") as f:
    html = f.read()

with open(os.path.join(BASE_DIR, "css", "spatial-ui.css"), "r", encoding="utf-8") as f:
    css = f.read()

scripts = []
for name in ["data.js", "shaders.js", "audio.js", "scene3d.js", "app.js"]:
    with open(os.path.join(BASE_DIR, "js", name), "r", encoding="utf-8") as f:
        scripts.append(f"<!-- Inlined {name} -->\n<script>\n{f.read()}\n</script>")

html = html.replace(
    '<link rel="stylesheet" href="./css/spatial-ui.css" />',
    f"<style>\n{css}\n</style>"
)

old_scripts_block = """    <script src="./js/data.js"></script>
    <script src="./js/shaders.js"></script>
    <script src="./js/audio.js"></script>
    <script src="./js/scene3d.js"></script>
    <script src="./js/app.js"></script>"""

assert old_scripts_block in html, f"Could not locate script tags block in {TEMPLATE_NAME}"
html = html.replace(old_scripts_block, "\n".join(scripts))

out_path = os.path.join(BASE_DIR, OUTPUT_NAME)
with open(out_path, "w", encoding="utf-8") as f:
    f.write(html)

print(f"Built single HTML bundle: {out_path} ({os.path.getsize(out_path)} bytes)")
