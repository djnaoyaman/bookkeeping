from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import subprocess
ROOT=Path(__file__).resolve().parents[1];D=ROOT/'dist';A=D/'assets';A.mkdir(exist_ok=True)
PAPER='#fffdf9';INK='#16366b';RED='#bd2637';WHITE='#ffffff';SOFT='#edf2fa';GRAY='#627087'
svg=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><title>Book Keeping — BK</title><rect width="512" height="512" rx="104" fill="{INK}"/><path fill="{WHITE}" fill-rule="evenodd" d="M120 140H190Q250 140 250 199Q250 231 223 248Q254 265 254 308Q254 372 190 372H120ZM156 177V231H187Q213 231 213 204Q213 177 187 177ZM156 267V335H187Q217 335 217 301Q217 267 187 267Z"/><path fill="{WHITE}" d="M282 140H318V236L366 140H408L352 250L412 372H368L318 268V372H282Z"/><rect x="144" y="394" width="244" height="12" rx="2" fill="{RED}"/></svg>'''
(D/'favicon.svg').write_text(svg);(A/'brand-mark.svg').write_text(svg)
# Rendering a new vector design, not editing an existing image.
subprocess.run(['inkscape',str(D/'favicon.svg'),'--export-type=png','--export-width=1024','--export-filename='+str(A/'brand-master.png')],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
master=Image.open(A/'brand-master.png').convert('RGBA')
for size in [16,32,48,96,192,512]:
 im=master.resize((size,size),Image.Resampling.LANCZOS)
 im.save(D/f'favicon-{size}.png' if size<192 else D/f'icon-{size}.png')
master.save(D/'favicon.ico',format='ICO',sizes=[(16,16),(32,32),(48,48),(64,64)])
for size in [152,167,180]:
 bg=Image.new('RGB',(size,size),INK);im=master.resize((size,size),Image.Resampling.LANCZOS);bg.paste(im,mask=im.getchannel('A'));bg.save(D/('apple-touch-icon.png' if size==180 else f'apple-touch-icon-{size}.png'))
mask=Image.new('RGB',(512,512),INK);mask.paste(master.resize((512,512)),(0,0),master.resize((512,512)).getchannel('A'));mask.save(D/'icon-maskable-512.png')
FONT='/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc';REG='/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
def font(s,bold=True):return ImageFont.truetype(FONT if bold else REG,s,index=0)
def card(path,size=(1200,630),subject='日商簿記 / 全経簿記 / USCPA',headline=('間違いを、','理解に変える。')):
 im=Image.new('RGB',size,PAPER);dr=ImageDraw.Draw(im);w,h=size
 dr.line((64,64,w-64,64),fill='#d8dfea',width=6)
 dr.line((64,64,421,64),fill=INK,width=6)
 dr.line((421,64,779,64),fill=WHITE,width=6)
 dr.line((779,64,w-64,64),fill=RED,width=6)
 dr.text((66,84),'BOOK KEEPING / APPRENDRE PAR LA PRATIQUE.',font=font(13),fill=GRAY)
 dr.text((64,125),'Book Keeping',font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf',65),fill=INK,stroke_width=0)
 dr.text((64,251),headline[0],font=font(61),fill=INK)
 dr.text((64,330),headline[1],font=font(61),fill=INK)
 dr.rounded_rectangle((65,h-116,720,h-62),radius=3,fill=SOFT)
 dr.text((85,h-108),subject,font=font(21),fill=INK)
 dr.ellipse((935,106,1124,295),outline=RED,width=2)
 icon=master.resize((280,280),Image.Resampling.LANCZOS);im.paste(icon,(826,173),icon.getchannel('A'))
 dr.line((826,491,1106,491),fill=INK,width=2)
 dr.text((828,510),'COMPRENDRE. RÉPÉTER. PROGRESSER.',font=font(10),fill=INK)
 im.save(A/path,optimize=True)
card('og-bookkeeping.png');card('card-bookkeeping.png',(1200,600))
for key,subject,headline in [('nissho','日商簿記 / 3級・2級・1級',('仕訳を解く。','数字が見える。')),('zenkei','全経簿記 / 基礎簿記会計〜上級',('基礎から、一問。','反復で、理解へ。')),('uscpa','USCPA / FAR・AUD・REG + Discipline',('Think. Solve.','Understand.'))]:card('og-'+key+'.png',subject=subject,headline=headline)
card('og-author.png',subject='宮崎直哉 / MIYAZAKI Naoya / DJ Naoyaman',headline=('好きになる。','かたちにする。'))
print('Generated vector mark, favicon, Apple icons, maskable icon and social cards.')
