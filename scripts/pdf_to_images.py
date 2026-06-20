"""6月教材PDF（スキャン画像）を各ページPNGに変換するOCR準備スクリプト。

実行（環境隔離ルール順守）：
    cd app
    uv run --with pymupdf python scripts/pdf_to_images.py

出力：scripts/_ocr_images/<PDF名>/pNN.png （~180dpi）
この画像はOCR作業用の一時素材であり、最終アプリ（src/）には含めない。
"""
import sys
from pathlib import Path

import fitz  # pymupdf

# このスクリプトは app/scripts/ にある想定
SCRIPT_DIR = Path(__file__).resolve().parent
APP_DIR = SCRIPT_DIR.parent
PDF_DIR = APP_DIR.parent / "６月"          # さちか勉強アプリ/６月
OUT_DIR = SCRIPT_DIR / "_ocr_images"

DPI = 180
ZOOM = DPI / 72.0


def main() -> None:
    if not PDF_DIR.exists():
        print(f"PDFフォルダが見つかりません: {PDF_DIR}", file=sys.stderr)
        sys.exit(1)

    pdfs = sorted(PDF_DIR.glob("*.pdf"))
    if not pdfs:
        print(f"PDFが見つかりません: {PDF_DIR}", file=sys.stderr)
        sys.exit(1)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    mat = fitz.Matrix(ZOOM, ZOOM)
    total = 0

    for pdf in pdfs:
        doc = fitz.open(pdf)
        sub = OUT_DIR / pdf.stem
        sub.mkdir(parents=True, exist_ok=True)
        for i, page in enumerate(doc, start=1):
            pix = page.get_pixmap(matrix=mat)
            out = sub / f"p{i:02d}.png"
            pix.save(out)
            total += 1
        print(f"{pdf.name}: {len(doc)}ページ -> {sub}")
        doc.close()

    print(f"完了：{len(pdfs)}ファイル / 計{total}ページ -> {OUT_DIR}")


if __name__ == "__main__":
    main()
