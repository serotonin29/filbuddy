"""Generate app/icon.png (favicon FilBuddy) dari logo mark SVG, latar transparan."""

from playwright.sync_api import sync_playwright

HTML = """<!DOCTYPE html>
<html><body style="margin:0;background:transparent">
<svg id="icon" xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="ind" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#4f46e5"/>
    </linearGradient>
    <linearGradient id="mnt" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#10b981"/><stop offset="1" stop-color="#059669"/>
    </linearGradient>
  </defs>
  <g transform="translate(-6.2,25.6) scale(4.6)">
    <path d="M22 28 C22 20.3 28.3 14 36 14 H66 C73.7 14 80 20.3 80 28 V52 C80 59.7 73.7 66 66 66 H44 L30 76 V66 H36 C28.3 66 22 59.7 22 52 Z" fill="url(#ind)"/>
    <path d="M36 36 L43 42 L36 48" stroke="#FFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <line x1="47" y1="48" x2="56" y2="48" stroke="#FFF" stroke-width="3" stroke-linecap="round"/>
    <path d="M48 48 C48 42.5 52.5 38 58 38 H82 C87.5 38 92 42.5 92 48 V68 C92 73.5 87.5 78 82 78 H78 V86 L68 78 H58 C52.5 78 48 73.5 48 68 Z" fill="url(#mnt)" stroke="#FFF" stroke-width="3"/>
    <path d="M64 58 L68 62 L76 54" stroke="#FFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </g>
</svg>
</body></html>"""

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    page = b.new_page(viewport={"width": 512, "height": 512})
    page.set_content(HTML)
    page.locator("#icon").screenshot(path="app/icon.png", omit_background=True)
    b.close()

print("app/icon.png dibuat")
