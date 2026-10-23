from pathlib import Path
import subprocess,json,re,html,xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1];D=ROOT/'dist';CFG=json.loads((ROOT/'site.config.json').read_text());BASE=CFG['url'].rstrip('/');DATA=json.loads(subprocess.check_output(['node',str(ROOT/'scripts/export-learning.cjs')],text=True));TEMPLATE=(ROOT/'src/index.template.html').read_text();META={};PAGES=[]
def e(s):return html.escape(str(s),quote=True)
def jsjson(x):return json.dumps(x,ensure_ascii=False).replace('<','\\u003c')
def pathq(q):return 'practice/'+q['exam']+'-'+str(q['id']).replace('extra-','e')+'.html'
def absolute(path):return BASE+'/'+path if path else BASE+'/'
def meta(path,title,desc,image='og-bookkeeping.png',kind='WebPage',extra=None):
 url=absolute(path);m=dict(url=url,title=title,description=desc,image=absolute('assets/'+image),card=absolute('assets/card-bookkeeping.png') if image=='og-bookkeeping.png' else absolute('assets/'+image),imageAlt=title,route=path)
 META[path or 'index.html']=m
 graph=[{'@type':kind,'@id':url+'#page','url':url,'name':title,'description':desc,'inLanguage':'ja','isPartOf':{'@id':BASE+'/#website'},'author':{'@id':BASE+'/#creator'}},{'@type':'WebSite','@id':BASE+'/#website','url':BASE+'/','name':'Book Keeping','inLanguage':'ja'},{'@type':'Person','@id':BASE+'/#creator','name':CFG['author'],'alternateName':'DJ Naoyaman','sameAs':[CFG['github']],'url':BASE+'/author.html'}]
 if path=='':graph.append({'@type':'WebApplication','@id':BASE+'/#application','name':'Book Keeping','url':BASE+'/','applicationCategory':'EducationalApplication','operatingSystem':'Web browser','description':desc,'inLanguage':['ja','en'],'browserRequirements':'JavaScript is required for scoring and local progress storage.'})
 if kind=='ProfilePage':graph[0]['mainEntity']={'@id':BASE+'/#creator'}
 if extra:graph.extend(extra)
 if path:
  graph.append({'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'Book Keeping','item':BASE+'/'},{'@type':'ListItem','position':2,'name':title.split('｜')[0],'item':url}]})
 prefix='../' if '/' in path else ''
 return f'''<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>{e(title)}</title><meta name="description" content="{e(desc)}"><meta name="author" content="{e(CFG['author'])}"><meta name="robots" content="index,follow,max-image-preview:large"><meta name="theme-color" content="#f5f4ee"><meta name="referrer" content="strict-origin-when-cross-origin"><link rel="canonical" href="{url}"><meta property="og:type" content="website"><meta property="og:locale" content="ja_JP"><meta property="og:site_name" content="Book Keeping"><meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(desc)}"><meta property="og:url" content="{url}"><meta property="og:image" content="{m['image']}"><meta property="og:image:secure_url" content="{m['image']}"><meta property="og:image:type" content="image/png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="{e(title)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{e(title)}"><meta name="twitter:description" content="{e(desc)}"><meta name="twitter:image" content="{m['card']}"><meta name="twitter:image:alt" content="{e(title)}"><link rel="icon" type="image/svg+xml" sizes="any" href="{prefix}favicon.svg"><link rel="icon" type="image/png" sizes="96x96" href="{prefix}favicon-96.png"><link rel="icon" type="image/png" sizes="32x32" href="{prefix}favicon-32.png"><link rel="shortcut icon" href="{prefix}favicon.ico"><link rel="apple-touch-icon" sizes="180x180" href="{prefix}apple-touch-icon.png"><link rel="apple-touch-icon" sizes="167x167" href="{prefix}apple-touch-icon-167.png"><link rel="apple-touch-icon" sizes="152x152" href="{prefix}apple-touch-icon-152.png"><meta name="apple-mobile-web-app-title" content="Book Keeping"><link rel="manifest" href="{prefix}site.webmanifest"><link rel="stylesheet" href="{prefix}assets/site.css"><script type="application/ld+json">{jsjson({'@context':'https://schema.org','@graph':graph})}</script>'''
def write(path,text):
 p=D/(path or 'index.html');p.parent.mkdir(exist_ok=True,parents=True);p.write_text(text);PAGES.append(path)
def body_prefix(body,path):
 prefix='../' if '/' in path else ''
 return re.sub(r'(href|src)="(?!https?:|#|data:|mailto:)([^"]+)"',lambda m:m[1]+'="'+prefix+m[2]+'"',body)
def ssr_question(q):
 options='<ol>'+''.join('<li>'+e(o)+'</li>' for o in q['options'])+'</ol>' if q['format']=='choice' else '<p class="scope-note">'+('借方・貸方の勘定科目と金額を入力する演習です。' if q['format']=='journal' else '選択肢を見ずに、金額・数値を入力する演習です。')+'</p>'
 return f'''<article class="panel"><div class="questionhead"><span>{e(DATA['catalogs'][q['exam']]['name'])} {e(q['unitLabel'])} / {e(q['topic'])}</span><span>練習問題</span></div><p class="question" lang="{'en' if q['exam']=='uscpa' else 'ja'}">{e(q['text'])}</p>{options}<details class="static-answer"><summary>解答と解説を確認する</summary><p><b>正答：{e(q['answerText'])}</b></p><p>{e(q['explain'])}</p></details><noscript><p>問題と解説はこのまま読めます。入力・採点・学習記録にはJavaScriptを有効にしてください。</p></noscript></article>'''
def app_page(path,route,q=None):
 body=TEMPLATE.split('</head>',1)[1]
 body=re.sub(r'<h1([^>]*)>(.*?)</h1>',lambda m:'<h2 class="page-title">'+m[2]+'</h2>',body,flags=re.S)
 target='profile' if route=='profile' else 'practice'
 body=re.sub(r'<section id="([^"]+)" class="view(?: show)?">',lambda m:'<section id="'+m[1]+'" class="view'+(' show' if m[1]==target else '')+'">',body)
 start=body.index('<section id="'+target+'"');hpos=body.index('<h2 class="page-title">',start);hend=body.index('</h2>',hpos);old=body[hpos:hend+5];new=old.replace('<h2 class="page-title">','<h1>').replace('</h2>','</h1>');body=body[:hpos]+new+body[hend+5:]
 if q:
  body=body.replace('<div id="questionarea"></div>','<div id="questionarea">'+ssr_question(q)+'</div>')
  if route=='question':
   start=body.index('<section id="practice"');hpos=body.index('<h1>',start);hend=body.index('</h1>',hpos);body=body[:hpos]+'<h1>'+e(q['topic'])+'の演習</h1>'+body[hend+5:]
 body=body.replace('<body>',f'<body data-discovery-route="{route}"'+(f' data-question="{e(q["id"])}"' if route=='question' else '')+'>',1)
 body=body_prefix(body,path)
 if route=='profile':head=meta(path,'つくった人・宮崎直哉のプロフィールと作品｜Book Keeping','簿記に夢中になり、仕事にもした宮崎直哉。DJ Naoyaman名義の活動、マーケティング・ブランディング、音楽や漢字など10のWeb作品とBook Keepingへの思い。','og-author.png','ProfilePage')
 elif route=='question':
  label=DATA['catalogs'][q['exam']]['name']+' '+q['unitLabel'];title=q['topic']+'の練習問題・解説｜'+label+'｜Book Keeping';desc=q['text'][:100]+' '+q['explain'][:55]
  extra=[{'@type':'Quiz','@id':absolute(path)+'#quiz','name':q['topic']+'の演習','educationalUse':'assessment','learningResourceType':'Practice problem','inLanguage':'en' if q['exam']=='uscpa' else 'ja','hasPart':[{'@type':'Question','name':q['topic'],'text':q['text'],'acceptedAnswer':{'@type':'Answer','text':q['answerText']+'。'+q['explain']}}]}]
  head=meta(path,title,desc,'og-'+q['exam']+'.png',extra=extra)
 else:head=meta('','簿記の仕訳・計算を反復演習｜Book Keeping',CFG['description'])
 write(path,'<!doctype html><html lang="ja" prefix="og: https://ogp.me/ns#"><head>'+head+'</head>'+body)
def simple(path,title,desc,content,image='og-bookkeeping.png',extra=None):
 prefix='../' if '/' in path else ''
 head=meta(path,title+'｜Book Keeping',desc,image,extra=extra)
 nav=f'<a href="{BASE}/">演習する</a><a href="{BASE}/exams/nissho.html">日商簿記</a><a href="{BASE}/exams/zenkei.html">全経簿記</a><a href="{BASE}/exams/uscpa.html">USCPA</a><a href="{BASE}/author.html">つくった人</a>'
 text=f'<!doctype html><html lang="ja" prefix="og: https://ogp.me/ns#"><head>{head}</head><body class="static-page"><header><a href="{BASE}/" style="color:inherit;text-decoration:none;font-size:24px;font-weight:900">Book Keeping</a><nav class="discovery-nav" aria-label="ページナビ">{nav}</nav></header><main><h1>{e(title)}</h1><p>{e(desc)}</p>{content}</main><footer><nav class="discovery-nav"><a href="{BASE}/about.html">使い方・対応範囲</a><a href="{BASE}/privacy.html">プライバシー</a><a href="{BASE}/llms.txt">サイト情報（テキスト）</a></nav></footer><script src="{prefix}discovery-config.js"></script><script src="{prefix}discovery.js"></script></body></html>'
 write(path,text)
questions=DATA['questions'];app_page('','app',questions[0]);app_page('author.html','profile')
for q in questions:app_page(pathq(q),'question',q)
introductions={
'nissho':('日商簿記の仕訳・計算演習','3級の商業簿記から、2級の商業簿記・工業簿記、1級の商業簿記・会計学・工業簿記・原価計算まで。収録問題を入力・選択形式で練習し、間違えた問題を解き直します。'),
'zenkei':('全経簿記の反復演習','基礎簿記会計、3級、2級の商業簿記・工業簿記、1級の商業簿記・財務会計と原価計算・管理会計、上級を選んで練習します。'),
'uscpa':('USCPAの英語問題・日本語解説','FAR・AUD・REGの必須3科目と、BAR・ISC・TCPの選択科目を学習対象にしています。英語の問題を解き、日本語で処理の理由を確認します。選択科目は受験時に1科目を選びます。')}
for exam,cat in DATA['catalogs'].items():
 title,intro=introductions[exam];qs=[q for q in questions if q['exam']==exam];sections=[]
 for unit in cat['units']:
  subset=[q for q in qs if q['level']==unit['id']];links=''.join(f'<li><a href="{absolute(pathq(q))}"><b>{e(q["topic"])}</b><small>{e(q["text"])}</small></a></li>' for q in subset)
  sections.append('<section><h2>'+e(unit['label'])+'</h2><ul class="static-question-list">'+links+'</ul></section>')
 source=DATA['sources'][{'nissho':'nissho2026','zenkei':'zenkei2024','uscpa':'aicpa2026'}[exam]]
 note=f'<details open><summary>収録数と対応範囲</summary><p>{len(qs)}問を収録。ここにある問題だけで試験範囲の全学習が完了するものではありません。</p><p>{e(source["note"])}</p><a href="{e(source["url"])}" target="_blank" rel="noopener noreferrer">出題範囲の公式資料 ↗</a></details>'
 content=f'<a class="primary" data-entry-exam="{exam}" href="{BASE}/?exam={exam}">{e(cat["name"])}の演習を始める →</a><h2>解いて、確認して、もう一度。</h2><ol><li>金額・仕訳・選択問題に解答する。</li><li>すぐに採点し、計算や仕訳の理由を読む。</li><li>間違えた問題を解き直し、時間をあけて再確認する。</li></ol>'+''.join(sections)+note
 simple('exams/'+exam+'.html',title,intro,content,'og-'+exam+'.png')
simple('about.html','使い方と教材の対応範囲','Book Keepingは、簿記の問題を繰り返し解いて理解を積み重ねる自主学習サイトです。',f'''<h2>演習の進め方</h2><ol><li>試験と級・科目を選び、おすすめ5問から始めます。</li><li>金額、借方・貸方、選択肢で解答します。</li><li>解説を確認し、誤答だけをすぐに解き直せます。</li><li>正解後の復習間隔は1日・3日・7日・14日・30日。誤答すると当日の復習対象に戻ります。</li></ol><h2>今の教材</h2><p>収録は56問（日商24問、全経14問、USCPA18問）。学習項目一覧、計画、自己チェックは演習を支える機能です。全項目の解説・類題・総合問題は整備途中で、合格の保証や判定は行いません。</p><p>日商は2026年度適用範囲、USCPAは2026年1月適用Blueprintsを参照。全経の詳細出題表との最終照合は未完了です。公式教材ではありません。</p><h2>学習時間と小ステップ</h2><p>学習時間はTAC・アビタスの公表目安を参考に、本人が変更できます。全経に未確認の平均値は設定しません。小ステップの確認結果は本人の記録です。</p><h2>記録の保存</h2><p>ブラウザ内に保存します。端末間同期はありません。学習記録をJSON、カリキュラムをCSVで書き出せます。</p><a class="primary" href="{BASE}/">問題を解く →</a>''')
simple('privacy.html','プライバシーと学習データ','Book Keepingの学習記録は、利用しているブラウザ内に保存されます。',f'''<h2>ブラウザに保存する情報</h2><p>解答履歴、入力した解答、復習間隔、メモ、学習計画、学習時間、自己確認の結果をlocalStorageに保存します。端末間の同期機能はありません。ブラウザのサイトデータを削除すると記録も消えるため、必要に応じて書き出してください。</p><h2>計測・広告</h2><p>現在、Google Analytics・広告タグ・第三者トラッキングSDKは接続していません。演習開始、解答、演習完了、共有操作のイベントを、将来の計測接続に備えたブラウザ内キューへ記録します。入力した解答、メモ、検索語はそのイベントに含めません。キューのイベントを外部の解析サービスへ送信する処理は現在ありません。</p><p>広告などの流入経路を示すUTMパラメーターは、サイト内の移動で引き継ぐ場合があります。ユーザーの解答やメモをURLに追加しません。</p><h2>外部リンク</h2><p>作品紹介、出題範囲の資料、GitHubなどへのリンクは、移動先のサービスの方針が適用されます。ホスティング事業者が運用上扱うアクセス情報については、その事業者の方針に従います。</p><h2>運営者</h2><p>宮崎直哉 / DJ Naoyaman。<a href="{BASE}/author.html">作者紹介</a>と<a href="https://github.com/djnaoyaman" rel="noopener noreferrer">公開GitHubプロフィール</a>で活動を紹介しています。</p>''')
# Actual, non-hash URLs only. Do not manufacture publication dates.
ns='http://www.sitemaps.org/schemas/sitemap/0.9';ET.register_namespace('',ns);tree=ET.Element('{'+ns+'}urlset')
for p in PAGES:
 node=ET.SubElement(tree,'{'+ns+'}url');ET.SubElement(node,'{'+ns+'}loc').text=absolute(p)
ET.ElementTree(tree).write(D/'sitemap.xml',encoding='utf-8',xml_declaration=True)
(D/'robots.txt').write_text('User-agent: *\nAllow: /\n\nSitemap: '+BASE+'/sitemap.xml\n')
manifest={'id':BASE+'/','name':'Book Keeping','short_name':'Book Keeping','lang':'ja','description':CFG['description'],'start_url':BASE+'/','scope':BASE+'/','display':'standalone','background_color':'#f5f4ee','theme_color':'#242621','icons':[{'src':BASE+'/icon-192.png','sizes':'192x192','type':'image/png','purpose':'any'},{'src':BASE+'/icon-512.png','sizes':'512x512','type':'image/png','purpose':'any'},{'src':BASE+'/icon-maskable-512.png','sizes':'512x512','type':'image/png','purpose':'maskable'}]};(D/'site.webmanifest').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
summary=f'''# Book Keeping\n\n> 日商簿記・全経簿記・USCPAの反復演習サイト。運営者は宮崎直哉（DJ Naoyaman）。\n\n## サイト\n- [演習]({BASE}/): 金額・仕訳入力と選択問題。\n- [日商簿記]({BASE}/exams/nissho.html)\n- [全経簿記]({BASE}/exams/zenkei.html)\n- [USCPA]({BASE}/exams/uscpa.html)\n- [作者]({BASE}/author.html)\n- [使い方と対応範囲]({BASE}/about.html)\n- [問題と解説のテキスト]({BASE}/llms-full.txt)\n\n## 対応状況\n56問を収録。全範囲の教材完成や合格を保証していません。全経の詳細出題表との最終照合は未完了です。USCPAは必須3科目と選択1科目の構成です。学習記録はブラウザ内に保存します。\n\nこのファイルはサイト内容を読み取るための補助情報です。検索エンジンの掲載やAIの引用を制御・保証するものではありません。\n''';(D/'llms.txt').write_text(summary)
full=[summary]
for q in questions:full.append(f'\n## {DATA["catalogs"][q["exam"]]["name"]} {q["unitLabel"]} / {q["topic"]}\n\nURL: {absolute(pathq(q))}\n\n問題: {q["text"]}\n\n解答: {q["answerText"]}\n\n解説: {q["explain"]}\n')
(D/'llms-full.txt').write_text('\n'.join(full))
qmap={str(q['id']):dict(path=pathq(q),exam=q['exam'],unit=q['level']) for q in questions}
(D/'discovery-config.js').write_text('window.BK_DISCOVERY='+jsjson({'base':BASE,'pages':META,'questions':qmap,'analytics':None})+';\n')
(ROOT/'content/discovery-build.json').write_text(json.dumps({'canonicalBase':BASE,'htmlPages':len(PAGES),'questionPages':len(questions),'pages':PAGES},ensure_ascii=False,indent=2))
print('Generated',len(PAGES),'HTML pages with static content, metadata, structured data, sitemap, icons manifest and text summaries.')
