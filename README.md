# 祥花クエスト（React + TypeScript版）

小学6年生向けの個人用学習RPG。漢字・算数・理科・社会を、ゲーム感覚で反復学習できます。
問題は6月の教材PDF（および小学校で習う漢字）から作成しています。

## 遊び方（できあがったアプリ）

ビルドすると `dist/` に静的ファイルができます。サーバーやインストールは不要で、
`dist/index.html` をブラウザで開くだけ（タブレットでもOK・オフライン動作・進捗はブラウザに保存）。

## 開発するとき

```bash
cd app
npm install
npm run dev      # 開発サーバー（http://localhost:5173）
npm run build    # 本番ビルド → dist/
npm run preview  # ビルド結果の確認
```

## 中身

- **教科**
  - 漢字：学年別（小1〜小6）。間違えると「成り立ち・部品の意味」をやさしく解説。
  - 算数：速さ・旅人算・流水算・単位変換・グラフ・容器と水量（型と公式を重視）。
  - 理科：気象・金属と水溶液・気体・力（滑車/ばね/浮力）・植物/動物/生態系。
  - 社会：社会保障・財政・税・経済（需給/物価/為替）・貿易・国際。
- **ゲーム要素**：HP・コイン・経験値・連続正解・宝箱・モンスター・図鑑（2回正解でマスター）。
- **にがて復習（SRS）**：間違えた問題を最優先で出し直す（Leitner方式）。
- **書き取り**：手本をなぞって練習（指でも書ける）。
- **型レッスン**：公式・パターン・漢字の部品をまとめて確認。

## データの増やし方・差しかえ方

問題は教科ごとのJSONに分かれています。

- `src/data/kanji.json`（学年 `grade`・成り立ち `origin` 付き）
- `src/data/math.json` / `science.json` / `social.json`
- `src/data/lessons.json`（型レッスン）
- `src/data/writeitems.json`（書き取りのお題）

スキーマは `src/types.ts` の `Question` / `WriteItem` / `Lesson` を参照。
**重要**：問題・解説は教材に出ている範囲だけから作り、各問に `source`（出典）を付ける方針です。

## 教材PDFから問題を作るとき（OCR）

教材PDFはスキャン画像なので、`scripts/pdf_to_images.py` で各ページをPNGに変換し、
その画像を読み取って `src/data/*.json` に問題を追加します。

```bash
cd app
uv run --with pymupdf python scripts/pdf_to_images.py
# → scripts/_ocr_images/<PDF名>/pNN.png （作業用・配布物には含めない）
```
