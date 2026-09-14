from pathlib import Path
import json
import re
from html import escape

SITE = "https://rafaeloliveirxis.github.io/koramarketplace"

PAGES = {
    "index.html": {
        "title": "FlashMarket | Marketplace Online",
        "description": "FlashMarket é um marketplace online com produtos, ofertas e lojas. Encontre moda, casa, tecnologia, papelaria e muito mais em uma experiência de compra rápida e prática.",
        "robots": "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
        "type": "WebSite",
    },
    "afiliado.html": {
        "title": "FlashMarket | Programa de Afiliados",
        "description": "Conheça a Área de Afiliados FlashMarket, acompanhe vendas, comissões, produtos e links de divulgação em um só lugar.",
        "robots": "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
        "type": "WebPage",
    },
    "rastrear-pedido.html": {
        "title": "FlashMarket | Rastrear Pedido",
        "description": "Rastreie seu pedido FlashMarket e acompanhe as etapas da entrega de forma rápida, simples e segura.",
        "robots": "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
        "type": "WebPage",
    },
    "suporte.html": {
        "title": "FlashMarket | Central de Atendimento",
        "description": "Acesse a Central de Atendimento FlashMarket para tirar dúvidas sobre pedidos, pagamentos, trocas, conta, produtos e afiliados.",
        "robots": "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
        "type": "WebPage",
    },
    "minha-conta.html": {
        "title": "FlashMarket | Minha Conta",
        "description": "Área pessoal da sua conta FlashMarket para consultar pedidos, favoritos, cupons, endereços e dados pessoais.",
        "robots": "noindex, follow, noarchive",
        "type": "WebPage",
    },
    "resetar-senha.html": {
        "title": "FlashMarket | Redefinir Senha",
        "description": "Página segura para redefinir a senha da sua conta FlashMarket.",
        "robots": "noindex, nofollow, noarchive",
        "type": "WebPage",
    },
}


def remove_tag(text, pattern):
    return re.sub(pattern, "", text, flags=re.I | re.S)


def optimize(path: Path, cfg: dict):
    text = path.read_text(encoding="utf-8-sig")

    patterns = [
        r"<title\b[^>]*>.*?</title>",
        r"<meta\s+[^>]*name=[\"'](?:description|keywords|author|robots|googlebot|theme-color|mobile-web-app-capable|apple-mobile-web-app-capable|apple-mobile-web-app-status-bar-style)[\"'][^>]*>",
        r"<meta\s+[^>]*property=[\"'](?:og:[^\"']+)[\"'][^>]*>",
        r"<meta\s+[^>]*name=[\"']twitter:[^\"']+[\"'][^>]*>",
        r"<link\s+[^>]*rel=[\"']canonical[\"'][^>]*>",
        r"<script\s+type=[\"']application/ld\+json[\"'][^>]*>.*?</script>",
    ]
    for pattern in patterns:
        text = remove_tag(text, pattern)

    canonical = f"{SITE}/" if path.name == "index.html" else f"{SITE}/{path.name}"
    og_image = f"{SITE}/assets/favicon.png"

    schema = {
        "@context": "https://schema.org",
        "@type": cfg["type"],
        "name": cfg["title"],
        "url": canonical,
        "description": cfg["description"],
        "inLanguage": "pt-BR",
        "isPartOf": {
            "@type": "WebSite",
            "name": "FlashMarket",
            "url": f"{SITE}/",
        },
    }
    if path.name == "index.html":
        schema["potentialAction"] = {
            "@type": "SearchAction",
            "target": f"{SITE}/?q={{search_term_string}}",
            "query-input": "required name=search_term_string",
        }

    block = f'''\n  <!-- SEO FlashMarket -->\n  <meta name="description" content="{escape(cfg['description'], quote=True)}">\n  <meta name="robots" content="{cfg['robots']}">\n  <meta name="googlebot" content="{cfg['robots']}">\n  <meta name="author" content="FlashMarket">\n  <meta name="theme-color" content="#ffc21c">\n  <link rel="canonical" href="{canonical}">\n  <meta property="og:type" content="website">\n  <meta property="og:locale" content="pt_BR">\n  <meta property="og:site_name" content="FlashMarket">\n  <meta property="og:title" content="{escape(cfg['title'], quote=True)}">\n  <meta property="og:description" content="{escape(cfg['description'], quote=True)}">\n  <meta property="og:url" content="{canonical}">\n  <meta property="og:image" content="{og_image}">\n  <meta property="og:image:alt" content="FlashMarket">\n  <meta name="twitter:card" content="summary_large_image">\n  <meta name="twitter:title" content="{escape(cfg['title'], quote=True)}">\n  <meta name="twitter:description" content="{escape(cfg['description'], quote=True)}">\n  <meta name="twitter:image" content="{og_image}">\n  <title>{escape(cfg['title'])}</title>\n  <script type="application/ld+json">\n{json.dumps(schema, ensure_ascii=False, indent=2)}\n  </script>\n'''

    text, count = re.subn(r"<head\b[^>]*>", lambda m: m.group(0) + block, text, count=1, flags=re.I)
    if count != 1:
        raise RuntimeError(f"Não foi possível localizar <head> em {path}")

    path.write_text(text, encoding="utf-8")


root = Path("_site")
for filename, cfg in PAGES.items():
    path = root / filename
    if path.exists():
        optimize(path, cfg)
        print(f"SEO otimizado: {path}")

for path in root.glob("*.html"):
    if path.name not in PAGES:
        text = path.read_text(encoding="utf-8-sig")
        if 'rel="canonical"' not in text:
            canonical = f"{SITE}/{path.name}"
            block = f'\n  <meta name="robots" content="index, follow">\n  <link rel="canonical" href="{canonical}">\n'
            text = re.sub(r"<head\b[^>]*>", lambda m: m.group(0) + block, text, count=1, flags=re.I)
            path.write_text(text, encoding="utf-8")
            print(f"SEO técnico aplicado: {path}")
