# Book Keeping

日商簿記・全経簿記・USCPAの反復演習サイト。

## ローカル表示

```sh
python3 -m http.server 8000 --directory dist
```

## コンテンツ・共有情報の再生成

```sh
python3 scripts/build_discovery.py
python3 scripts/check_discovery.py
```

Node.js 20以降、Python 3、画像検証用のPillowが必要です。アイコンや共有画像を変更するときは、InkscapeとNoto CJKフォントがある環境で `python3 scripts/brand_assets.py` を実行してください。

正規URLは `site.config.json` で管理します。`src/index.template.html` と `dist/assets/site.css` を編集し、生成されたHTMLだけを直接変更しないでください。

[検索・共有の実装と残作業](docs/DISCOVERY.md) / [SEM準備](docs/SEM-PLAN.md) / [ブランド](docs/BRAND.md) / [教材の出典と対応状況](content/SOURCE-AUDIT.md)

収録演習は56問。全範囲の解説・演習は整備途中で、全経の詳細範囲の最終照合は未完了です。記録はブラウザ内に保存します。GA4（G-837HXKXW8Q）で閲覧・演習イベントを計測します。広告タグは設置していません。

## GitHub Pages

公開リポジトリ `djnaoyaman/bookkeeping` 向けの構成です。Settings → Pages → Source を **GitHub Actions** にすると、mainへのpush時に `.github/workflows/pages.yml` が検証と公開を実行します。公開先は https://djnaoyaman.github.io/bookkeeping/ です（デプロイ成功後）。

リポジトリは公開設定で管理します。Pagesの公開状況はGitHub Actionsの実行結果とSettings → Pagesで確認できます。
