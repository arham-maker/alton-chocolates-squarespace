from pathlib import Path
import re

shop = Path(r"e:\GITHUB-DESKTOP\alton chocolates\pages\shop.page")
text = shop.read_text(encoding="utf-8")
text2 = re.sub(
    r'<h3 class="product-title">([^<]+)</h3>',
    r'<h3 class="product-title"><a href="/product">\1</a></h3>',
    text,
)
shop.write_text(text2, encoding="utf-8")
print("shop linked", text2.count('href="/product"'))

home = Path(r"e:\GITHUB-DESKTOP\alton chocolates\pages\home.page")
ht = home.read_text(encoding="utf-8")
ht2 = re.sub(
    r'<h3 class="product-title">(Bonbon Collection|Chocolate Bar|Sea Salt Caramels|Chocolate Cookies)</h3>',
    r'<h3 class="product-title"><a href="/product">\1</a></h3>',
    ht,
)
home.write_text(ht2, encoding="utf-8")
print("home linked")

gifts = Path(r"e:\GITHUB-DESKTOP\alton chocolates\pages\gifts.page")
gt = gifts.read_text(encoding="utf-8")
gt2 = re.sub(
    r'(<div class="gift-collection-card__body">\s*)<h3 class="product-title">([^<]+)</h3>',
    r'\1<h3 class="product-title"><a href="/gift-details">\2</a></h3>',
    gt,
)
gifts.write_text(gt2, encoding="utf-8")
print("gifts linked", gt2.count('href="/gift-details"'))

src = Path(r"e:\GITHUB-DESKTOP\alton chocolates\styles\alton.css")
dst = Path(r"e:\GITHUB-DESKTOP\alton chocolates\assets\alton.css")
dst.write_text(src.read_text(encoding="utf-8"), encoding="utf-8")
print("copied alton.css", dst.stat().st_size)

p = Path(r"e:\GITHUB-DESKTOP\alton chocolates\_compile_flow.py")
if p.exists():
    p.unlink()
    print("removed temp")
