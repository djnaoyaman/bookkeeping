# IL MASTRO

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

従来の反復演習56問に加え、日商3級の基幹26講義＋補強4講義・228設問（146管理用問題群）を整備しています。新講義は説明・例題・構造化解答・部分点・誤答復習に対応。公式62項目に対応していますが、項目対応は全技能の修得を意味しません。全欄を自力で埋める精算表・未見の総合問題・時間制限模試は整備途中で、全経の詳細範囲の最終照合は未完了です。記録はブラウザ内に保存します。GA4（G-837HXKXW8Q）で閲覧・演習イベントを計測します。広告タグは設置していません。

## GitHub Pages

公開リポジトリ `djnaoyaman/bookkeeping` 向けの構成です。Settings → Pages → Source を **GitHub Actions** にすると、mainへのpush時に `.github/workflows/pages.yml` が検証と公開を実行します。公開先は https://djnaoyaman.github.io/bookkeeping/ です（デプロイ成功後）。

リポジトリは公開設定で管理します。Pagesの公開状況はGitHub Actionsの実行結果とSettings → Pagesで確認できます。


## 学習教材の検証

`content/learning-course.json` が新教材の単一入力です。原稿は独立解答レビュー・公開範囲の一次資料照合を終えてから採用します。`node scripts/validate-learning-content.cjs content/learning-course.json --publish` は原稿・講義のreview hash、型、リンク、採点自己整合を検査します（教育的充足を自動保証するものではありません）。`--all-source-rows` は62の出典行のmapping確認のみです。

`node tests/assessment-engine.cjs` / `node tests/assessment-session.cjs` / `node tests/learning-course.cjs` で構造化採点・期限と版・入力と復習を検査します。学習モードの同科目合算は警告付き、CBTモードは同一側の同一科目重複を不正解にします。本試験型模試の教材と画面はまだ未提供です。

ブラウザ統合検査は `node course-integration-browser.cjs`（既存review workflow）で実データを読みます。320/390/768/1280幅、全30講義・37表、390幅で全228問と補強12問の保存復元、8行仕訳、誤答復習、キーボード操作を対象にしています。実行結果が得られるまで未検証です。
