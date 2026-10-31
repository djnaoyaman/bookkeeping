# IL MASTRO — Pen & Fork

Deep blue `#16366b`, cream `#fffdf9` and red `#bd2637` retain the French tricolour identity. The mark pairs a crossed fork and fountain pen: cream silhouettes on blue, with a red pen cap. A separating blue outline keeps the crossing legible at small sizes.

`scripts/brand_assets.py` generates the vector source, multi-resolution favicon, opaque Apple Touch Icons, maskable icon and social cards. The social cards retain the serif wordmark and 「間違いは、理解に変わる。」 headline. OGP is 1200×630; the main X card is 1200×600. Asset URLs use `il-mastro-text-1` to refresh caches; social platforms may retain older previews.

The fork and pen are rotated −45° and +45° around the shared center, forming a precise right-angle crossing.

The site name is IL MASTRO（イル・マストロ）. The existing pen-and-fork mark and colors are retained while a replacement logo is under discussion. `python3 scripts/brand_assets.py --cards-only` regenerates social cards without changing icon pixels.
