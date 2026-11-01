from pathlib import Path
import subprocess,json,re,html,xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1];D=ROOT/'dist';CFG=json.loads((ROOT/'site.config.json').read_text());BASE=CFG['url'].rstrip('/');DATA=json.loads(subprocess.check_output(['node',str(ROOT/'scripts/export-learning.cjs')],text=True));TEMPLATE=(ROOT/'src/index.template.html').read_text();META={};PAGES=[]
COURSE_PATH=ROOT/'content/learning-course.json'
COURSE=json.loads(COURSE_PATH.read_text()) if COURSE_PATH.exists() else None
if COURSE:
 assert COURSE.get('authoringStatus')=='reviewed','Only independently reviewed content belongs in the build input'
 subprocess.run(['node',str(ROOT/'scripts/validate-learning-content.cjs'),str(COURSE_PATH),'--publish'],check=True)
TEMPLATE=TEMPLATE.replace('<!--LEARNING_COURSE_NAV-->','<a class="mock-entry" href="mock.html">60分の総合練習</a><!--LEARNING_COURSE_NAV-->')
TEMPLATE=TEMPLATE.replace('<!--LEARNING_COURSE_NAV-->','<button data-view="learningcourse"><span>▤</span>講義と演習</button>' if COURSE else '').replace('<!--LEARNING_COURSE_SECTION-->','<section id="learningcourse" class="view"><div id="learningcoursebody"></div></section>' if COURSE else '').replace('<!--LEARNING_COURSE_SCRIPTS-->','<script src="learning-course-data.js"></script><script src="learning-course.js"></script>' if COURSE else '')
COURSE_BLURB=(f'日商3級の講義{len(COURSE["lessons"])}本・構造化演習{len(COURSE["questions"])}問を追加しています。<a href="{BASE}/lessons/index.html">講義一覧</a>から学べます。'+COURSE.get('coverageNote','')) if COURSE else ''
if COURSE:TEMPLATE=TEMPLATE.replace('収録演習は56問です。','従来の反復演習56問に加え、日商3級の講義と構造化演習を段階的に整備しています。')

def e(s):return html.escape(str(s),quote=True)
def jsjson(x):return json.dumps(x,ensure_ascii=False).replace('<','\\u003c')
def pathq(q):return 'practice/'+q['exam']+'-'+str(q['id']).replace('extra-','e')+'.html'
def absolute(path):return BASE+'/'+path if path else BASE+'/'
def analytics_head():
 analytics=CFG.get('analytics')
 if not analytics:return ''
 mid=analytics.get('measurementId','')
 assert re.fullmatch(r'G-[A-Z0-9]+',mid),'Invalid GA4 measurement ID'
 return f'''<script async src="https://www.googletagmanager.com/gtag/js?id={mid}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments)}}gtag('js',new Date());gtag('config','{mid}',{{send_page_view:false,page_location:location.origin+location.pathname,page_referrer:document.referrer.split(/[?#]/)[0]}});</script>'''
def meta(path,title,desc,image='og-bookkeeping.png',kind='WebPage',extra=None):
 url=absolute(path);version='?v='+CFG.get('brandVersion','1');icon_version='?v='+CFG.get('iconVersion',CFG.get('brandVersion','1'));m=dict(url=url,title=title,description=desc,image=absolute('assets/'+image)+version,card=absolute('assets/card-bookkeeping.png')+version if image=='og-bookkeeping.png' else absolute('assets/'+image)+version,imageAlt=title,route=path)
 META[path or 'index.html']=m
 graph=[{'@type':kind,'@id':url+'#page','url':url,'name':title,'description':desc,'inLanguage':'ja','isPartOf':{'@id':BASE+'/#website'},'author':{'@id':BASE+'/#creator'}},{'@type':'WebSite','@id':BASE+'/#website','url':BASE+'/','name':'IL MASTRO','inLanguage':'ja'},{'@type':'Person','@id':BASE+'/#creator','name':CFG['author'],'alternateName':'DJ Naoyaman','sameAs':[CFG['github']],'url':BASE+'/author.html'}]
 if path=='':graph.append({'@type':'WebApplication','@id':BASE+'/#application','name':'IL MASTRO','url':BASE+'/','applicationCategory':'EducationalApplication','operatingSystem':'Web browser','description':desc,'inLanguage':['ja','en'],'browserRequirements':'JavaScript is required for scoring and local progress storage.'})
 if kind=='ProfilePage':
  graph[0]['mainEntity']={'@id':BASE+'/#creator'}
  graph[0]['dateModified']='2026-11-01'
  graph[2]={'@type':'Person','@id':BASE+'/#creator','name':CFG['author'],'url':'https://djnaoyaman.github.io/profile.html'}
 if extra:graph.extend(extra)
 if path:
  graph.append({'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'IL MASTRO','item':BASE+'/'},{'@type':'ListItem','position':2,'name':title.split('｜')[0],'item':url}]})
 prefix='../' if '/' in path else ''
 return analytics_head()+(f'<link rel="stylesheet" href="{prefix}assets/learning-course.css">' if COURSE else '')+f'''<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>{e(title)}</title><meta name="description" content="{e(desc)}"><meta name="author" content="{e(CFG['author'])}"><meta name="robots" content="index,follow,max-image-preview:large"><meta name="theme-color" content="#f4efe4"><meta name="referrer" content="strict-origin-when-cross-origin"><link rel="canonical" href="{url}"><meta property="og:type" content="website"><meta property="og:locale" content="ja_JP"><meta property="og:site_name" content="IL MASTRO"><meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(desc)}"><meta property="og:url" content="{url}"><meta property="og:image" content="{m['image']}"><meta property="og:image:secure_url" content="{m['image']}"><meta property="og:image:type" content="image/png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="{e(title)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{e(title)}"><meta name="twitter:description" content="{e(desc)}"><meta name="twitter:image" content="{m['card']}"><meta name="twitter:image:alt" content="{e(title)}"><link rel="icon" type="image/svg+xml" sizes="any" href="{prefix}favicon.svg{icon_version}"><link rel="icon" type="image/png" sizes="96x96" href="{prefix}favicon-96.png{icon_version}"><link rel="icon" type="image/png" sizes="32x32" href="{prefix}favicon-32.png{icon_version}"><link rel="shortcut icon" href="{prefix}favicon.ico{icon_version}"><link rel="apple-touch-icon" sizes="180x180" href="{prefix}apple-touch-icon.png{icon_version}"><link rel="apple-touch-icon" sizes="167x167" href="{prefix}apple-touch-icon-167.png{icon_version}"><link rel="apple-touch-icon" sizes="152x152" href="{prefix}apple-touch-icon-152.png{icon_version}"><meta name="apple-mobile-web-app-title" content="IL MASTRO"><link rel="manifest" href="{prefix}site.webmanifest{icon_version}"><link rel="stylesheet" href="{prefix}assets/site.css{version}"><script type="application/ld+json">{jsjson({'@context':'https://schema.org','@graph':graph})}</script>'''
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
 if route=='profile':head=meta(path,'このサイトをつくる理由｜IL MASTRO','簿記は、手を動かすほど面白くなる。その楽しさを、短い問題と繰り返しの中で伝えたくてつくりました。','og-author.png','ProfilePage')
 elif route=='question':
  label=DATA['catalogs'][q['exam']]['name']+' '+q['unitLabel'];title=q['topic']+'の練習問題・解説｜'+label+'｜IL MASTRO';desc=q['text'][:100]+' '+q['explain'][:55]
  extra=[{'@type':'Quiz','@id':absolute(path)+'#quiz','name':q['topic']+'の演習','educationalUse':'assessment','learningResourceType':'Practice problem','inLanguage':'en' if q['exam']=='uscpa' else 'ja','hasPart':[{'@type':'Question','name':q['topic'],'text':q['text'],'acceptedAnswer':{'@type':'Answer','text':q['answerText']+'。'+q['explain']}}]}]
  head=meta(path,title,desc,'og-'+q['exam']+'.png',extra=extra)
 else:head=meta('','簿記の仕訳・計算を反復演習｜IL MASTRO',CFG['description'])
 write(path,'<!doctype html><html lang="ja" prefix="og: https://ogp.me/ns#"><head>'+head+'</head>'+body)
def simple(path,title,desc,content,image='og-bookkeeping.png',extra=None):
 prefix='../' if '/' in path else ''
 head=meta(path,title+'｜IL MASTRO',desc,image,extra=extra)
 nav=f'<a href="{BASE}/">演習する</a><a href="{BASE}/exams/nissho.html">日商簿記</a><a href="{BASE}/exams/zenkei.html">全経簿記</a><a href="{BASE}/exams/uscpa.html">USCPA</a><a href="{BASE}/author.html">つくった人</a>'
 text=f'<!doctype html><html lang="ja" prefix="og: https://ogp.me/ns#"><head>{head}</head><body class="static-page"><a class="skip-link" href="#main-content">本文へ移動</a><header><a class="static-brand" href="{BASE}/" aria-label="IL MASTRO ホーム"><img src="{prefix}assets/il-mastro-lockup.png?v=il-mastro-09-1" width="360" height="390" alt="IL MASTRO"></a><nav class="discovery-nav" aria-label="ページナビ">{nav}</nav></header><main id="main-content" tabindex="-1"><h1>{e(title)}</h1><p>{e(desc)}</p>{content}</main><footer><nav class="discovery-nav"><a href="{BASE}/about.html">使い方・簿記の歴史</a><a href="{BASE}/privacy.html">プライバシー</a><a href="{BASE}/llms.txt">サイト情報（テキスト）</a></nav></footer><script src="{prefix}discovery-config.js"></script><script src="{prefix}discovery.js"></script></body></html>'
 write(path,text)
if COURSE:(D/'learning-course-data.js').write_text('globalThis.ILMASTRO_COURSE='+jsjson({k:v for k,v in COURSE.items() if k!='reviewRecords'})+';\n')
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
simple('about.html','簿記の歴史・使い方と対応範囲','IL MASTROは、簿記の問題を繰り返し解いて理解を積み重ねる自主学習サイトです。',f'''<section id="history" aria-labelledby="history-title"><p class="eyebrow">THE ORIGINS OF BOOKKEEPING</p><h2 id="history-title">私の入口は、簿記の歴史でした。</h2><p>簿記には、取引を記録してきた人々の長い歴史があります。その歴史が、私にとって簿記を知る入口でした。</p><ol><li><strong>古代メソポタミア：記録することから。</strong><br>粘土板には、物の受け渡しや貸し借りなどの経済活動が記録されていました。現代の複式簿記より、はるか前の記録です。</li><li><strong>中世イタリア：商業の中で育つ。</strong><br>商人たちの実務の中で、取引を借方と貸方の両面から記録する複式簿記が発達しました。</li><li><strong>1494年、ヴェネツィア：印刷された説明へ。</strong><br>ルカ・パチョーリが著書『スムマ』で複式簿記を説明しました。これは複式簿記についての最初の印刷された解説であり、パチョーリが発明したわけではありません。</li></ol><p>記録の歴史から、目の前の一つの取引へ。このサイトでは、仕訳や計算を実際に解き、間違えた理由を確かめながら理解を積み重ねます。</p><details><summary>歴史の参考資料</summary><ul><li><a href="https://www.bancaditalia.it/servizi-cittadino/musei-e-visite/museo-moneta/tavolette-mesopotamiche/index.html?com.dotmarketing.htmlpage.language=1" rel="noopener noreferrer">イタリア銀行：メソポタミアの粘土板</a></li><li><a href="https://www.icaew.com/library/historical-resources/timeline" rel="noopener noreferrer">ICAEW：会計の歴史年表</a></li><li><a href="https://www.nls.uk/collections/rare-books/collections/icas/pacioli/" rel="noopener noreferrer">スコットランド国立図書館：パチョーリと『スムマ』</a></li></ul></details><p>最終更新：<time datetime="2026-11-01">2026年11月1日（日本時間）</time></p></section><h2>演習の進め方</h2><ol><li>試験と級・科目を選び、おすすめ5問から始めます。</li><li>金額、借方・貸方、選択肢で解答します。</li><li>解説を確認し、誤答だけをすぐに解き直せます。</li><li>正解後の復習間隔は1日・3日・7日・14日・30日。誤答すると当日の復習対象に戻ります。</li></ol><h2>今の教材</h2><p>従来の反復演習は56問（日商24問、全経14問、USCPA18問）。{COURSE_BLURB}学習項目一覧、計画、自己チェックは演習を支える機能です。全項目の解説・類題・総合問題は整備途中で、合格の保証や判定は行いません。</p><p>日商は2026年度適用範囲、USCPAは2026年1月適用Blueprintsを参照。全経の詳細出題表との最終照合は未完了です。公式教材ではありません。</p><h2>学習時間と小ステップ</h2><p>学習時間はTAC・アビタスの公表目安を参考に、本人が変更できます。全経に未確認の平均値は設定しません。小ステップの確認結果は本人の記録です。</p><h2>記録の保存</h2><p>ブラウザ内に保存します。端末間同期はありません。学習記録をJSON、カリキュラムをCSVで書き出せます。</p><a class="primary" href="{BASE}/">問題を解く →</a>''')
simple('privacy.html','プライバシーと学習データ','IL MASTROの学習記録は、利用しているブラウザ内に保存されます。',f'''<h2>ブラウザに保存する情報</h2><p>解答履歴、入力した解答、復習間隔、メモ、学習計画、学習時間、自己確認の結果をlocalStorageに保存します。端末間の同期機能はありません。ブラウザのサイトデータを削除すると記録も消えるため、必要に応じて書き出してください。</p><h2>計測・広告</h2><p>Google Analytics 4（Googleタグ）を利用して、ページ閲覧と学習機能の利用状況を計測します。広告タグは設置していません。演習への最初の解答、解答の確定、演習完了、誤答の復習、画面移動、試験選択、データ書き出し、問題共有をイベントとしてGoogleへ送信します。試験・級や科目・問題ID・問題形式・今回解答した問題数などを含みます。入力した解答、正誤・成績、メモ、サイト内検索語、学習記録ファイルの内容、氏名・メールアドレスはイベントに含めません。Google AnalyticsはCookie等を利用する場合があります。</p><p>広告などの流入経路を示すUTMパラメーターは、サイト内の移動で引き継ぐ場合があります。ユーザーの解答やメモをURLに追加しません。</p><h2>外部リンク</h2><p>作品紹介、出題範囲の資料、GitHubなどへのリンクは、移動先のサービスの方針が適用されます。Googleによるデータの扱いは<a href="https://policies.google.com/technologies/partner-sites" rel="noopener noreferrer">Googleの説明</a>、ホスティング事業者によるアクセス情報の扱いはその事業者の方針に従います。</p><h2>運営者</h2><p>宮崎直哉 / DJ Naoyaman。<a href="{BASE}/author.html">作者紹介</a>と<a href="https://github.com/djnaoyaman" rel="noopener noreferrer">公開GitHubプロフィール</a>で活動を紹介しています。</p>''')

# Original authored lessons remain readable without JavaScript; scoring is in the app.
if COURSE:
 listing='<p>'+e(COURSE.get('coverageNote','全範囲の教材整備は進行中です。'))+'</p><ul>'+''.join('<li><a href="'+BASE+'/lessons/'+e(l['id'])+'.html">'+e(l['title'])+'</a></li>' for l in COURSE['lessons'])+'</ul>'
 simple('lessons/index.html','日商簿記3級の講義と演習','説明・例題・オリジナル演習で簿記の考え方を学ぶ。2026年度範囲の段階的な教材整備。',listing)
 for l in COURSE['lessons']:
  body='<p>日商簿記3級 / 2026年度範囲（2027年3月31日まで） / オリジナル教材</p><p><a href="'+BASE+'/lessons/index.html">講義一覧</a></p>'
  for section in l['sections']:body+='<h2>'+e(section['title'])+'</h2>'+''.join('<p>'+e(p)+'</p>' for p in section['paragraphs'])
  body+='<h2>例題</h2>'
  for w in l['workedExamples']:body+='<h3>'+e(w['title'])+'</h3><p>'+e(w['prompt'])+'</p><details><summary>解き方と答え</summary><ol>'+''.join('<li>'+e(p)+'</li>' for p in w['steps'])+'</ol><p>'+e(w['answer'])+'</p></details>'
  body+='<h2>間違えやすいところ</h2><ul>'+''.join('<li>'+e(p)+'</li>' for p in l['pitfalls'])+'</ul><p><a class="primary" href="'+BASE+'/?course='+e(l['id'])+'">この講義の問題を解く →</a></p><p class="scope-note">採点と記録にはJavaScriptを使います。配点はこの教材独自のものです。</p>'
  simple('lessons/'+l['id']+'.html',l['title']+'の講義・例題',l['title']+'をオリジナル解説・例題・演習で学ぶ。日商簿記3級、2026年度範囲。',body)
# Original timed-practice page; existing course/storage are not replaced.
subprocess.run(['node',str(ROOT/'scripts/build_mock.cjs')],check=True)
simple('mock.html','日商簿記3級・60分のオリジナル総合練習','2026年度範囲の第1回。45・20・35点、サイト独自の欄別採点。公式試験の再現や合格予測ではありません。','<div id="mock-app" class="mock-app"><p>時間制練習を準備しています。</p></div><noscript><p>入力・途中保存・採点にはJavaScriptが必要です。通常の講義ページはJavaScriptなしでも読めます。</p></noscript>')
p=D/'mock.html';mock_html=p.read_text().replace('</head>','<link rel="stylesheet" href="assets/mock.css"></head>').replace('</body>','<script src="assessment-engine.js"></script><script src="mock-model.js"></script><script src="mock-store.js"></script><script src="mock-form-data.js"></script><script src="mock-ui.js"></script></body>');p.write_text(mock_html)
# Actual, non-hash URLs only. Do not manufacture publication dates.
ns='http://www.sitemaps.org/schemas/sitemap/0.9';ET.register_namespace('',ns);tree=ET.Element('{'+ns+'}urlset')
for p in PAGES:
 node=ET.SubElement(tree,'{'+ns+'}url');ET.SubElement(node,'{'+ns+'}loc').text=absolute(p)
 if p in PAGES:ET.SubElement(node,'{'+ns+'}lastmod').text='2026-11-01'
ET.ElementTree(tree).write(D/'sitemap.xml',encoding='utf-8',xml_declaration=True)
(D/'robots.txt').write_text('User-agent: *\nAllow: /\n\nSitemap: '+BASE+'/sitemap.xml\n')
manifest={'id':BASE+'/','name':'IL MASTRO','short_name':'IL MASTRO','lang':'ja','description':CFG['description'],'start_url':BASE+'/','scope':BASE+'/','display':'standalone','background_color':'#f4efe4','theme_color':'#27251f','icons':[{'src':BASE+'/icon-192.png?v='+CFG.get('iconVersion',CFG.get('brandVersion','1')),'sizes':'192x192','type':'image/png','purpose':'any'},{'src':BASE+'/icon-512.png?v='+CFG.get('iconVersion',CFG.get('brandVersion','1')),'sizes':'512x512','type':'image/png','purpose':'any'},{'src':BASE+'/icon-maskable-512.png?v='+CFG.get('iconVersion',CFG.get('brandVersion','1')),'sizes':'512x512','type':'image/png','purpose':'maskable'}]};(D/'site.webmanifest').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
summary=f'''# IL MASTRO｜イル・マストロ\n\n> 日商簿記・全経簿記・USCPAの反復演習サイト。企画・編集は宮崎直哉。\n\n## サイト\n- [演習]({BASE}/): 金額・仕訳入力と選択問題。\n- [60分の総合練習]({BASE}/mock.html): 2026年度範囲・独自配点のオリジナル第1回。公式難易度や合格予測を示しません。\n- [日商簿記]({BASE}/exams/nissho.html)\n- [全経簿記]({BASE}/exams/zenkei.html)\n- [USCPA]({BASE}/exams/uscpa.html)\n- [作者]({BASE}/author.html)\n- [簿記の歴史・使い方と対応範囲]({BASE}/about.html)\n- [問題と解説のテキスト]({BASE}/llms-full.txt)\n\n## 簿記の歴史\n作者の入口は簿記の歴史。古代メソポタミアの記録、中世イタリアでの複式簿記の発達、1494年のパチョーリによる最初の印刷された解説を、参考資料とともに紹介しています。パチョーリを発明者とはしていません。\n\n## 対応状況\n従来の反復演習56問を収録。全範囲の教材完成や合格を保証していません。全経の詳細出題表との最終照合は未完了です。USCPAは必須3科目と選択1科目の構成です。学習記録はブラウザ内に保存します。\n\nこのファイルはサイト内容を読み取るための補助情報です。検索エンジンの掲載やAIの引用を制御・保証するものではありません。\n''';(D/'llms.txt').write_text(summary)
if COURSE:
 summary+='\n## 日商3級の講義と構造化演習\n'+str(len(COURSE['lessons']))+'講義・'+str(len(COURSE['questions']))+'設問を別途収録。'+COURSE.get('coverageNote','全範囲整備は進行中。')+'\n[講義一覧]('+BASE+'/lessons/index.html)\n'
 (D/'llms.txt').write_text(summary)
full=[summary]
for q in questions:full.append(f'\n## {DATA["catalogs"][q["exam"]]["name"]} {q["unitLabel"]} / {q["topic"]}\n\nURL: {absolute(pathq(q))}\n\n問題: {q["text"]}\n\n解答: {q["answerText"]}\n\n解説: {q["explain"]}\n')
if COURSE:
 for l in COURSE['lessons']:
  full.append('\n## 講義 '+l['title']+'\nURL: '+BASE+'/lessons/'+l['id']+'.html\n'+'\n'.join(s['title']+'\n'+'\n'.join(s['paragraphs']) for s in l['sections']))
  for w in l['workedExamples']:
   full.append('\n例題: '+w['title']+'\n条件: '+w['prompt']+'\n手順: '+' / '.join(w['steps'])+'\n例題の答え: '+w['answer'])
  full.append('間違えやすい点: '+' / '.join(l['pitfalls']))
 for q in COURSE['questions']:
  lines=['\n### 新教材問題: '+q['title'],'問題ID: '+q['id'],'講義URL: '+BASE+'/lessons/'+q['lessonId']+'.html',q['prompt']]
  for t in q.get('exhibits',[]):
   lines+=['資料: '+t['title'],' | '.join(str(v) for v in t['headers'])]
   lines+=[' | '.join(str(v) for v in row) for row in t['rows']]
  lines.append('解答欄と正答（配点は教材独自）:')
  if q['type']=='journal':
   lines+=['単位: '+q['unit'],'選択できる勘定科目: '+' / '.join(q['accounts'])]
   for i,line in enumerate(q['lines'],1):
    lines.append(str(i)+'行目: '+('借方' if line['side']=='debit' else '貸方')+' / '+line['account']+' / '+str(line['amount'])+' '+q['unit']+' / '+str(line['points'])+'点')
  else:
   for f in q['fields']:
    lines.append('欄: '+f['id']+' / '+f['label'])
    if f['type']=='choice':
     lines.append('選択肢: '+' / '.join(o+'='+f['optionLabels'][o] for o in f['options']))
     lines.append('正答: '+f['answer']+'='+f['optionLabels'][f['answer']])
    else:
     lines+=['単位: '+f['unit']+' / 小数桁数: '+str(f.get('decimals',0)),'正答: '+str(f['answer'])+' '+f['unit']]
    lines+=['配点: '+str(f['points'])+'点','欄の解説: '+f['explanation']]
  lines+=['解説: '+' / '.join(q['explanation']['steps']),'照合: '+q['explanation']['check'],'間違えやすい点: '+' / '.join(q['explanation']['pitfalls']),'出典（学習範囲）: '+' / '.join(q['provenance']['referenceUrls'])]
  full.append('\n'.join(lines))
(D/'llms-full.txt').write_text('\n'.join(full))
qmap={str(q['id']):dict(path=pathq(q),exam=q['exam'],unit=q['level']) for q in questions}
(D/'discovery-config.js').write_text('window.BK_DISCOVERY='+jsjson({'base':BASE,'pages':META,'questions':qmap,'analytics':CFG.get('analytics')})+';\n')
(ROOT/'content/discovery-build.json').write_text(json.dumps({'canonicalBase':BASE,'htmlPages':len(PAGES),'questionPages':len(questions),'pages':PAGES},ensure_ascii=False,indent=2))
print('Generated',len(PAGES),'HTML pages with static content, metadata, structured data, sitemap, icons manifest and text summaries.')

