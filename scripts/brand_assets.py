from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import subprocess
ROOT=Path(__file__).resolve().parents[1];D=ROOT/'dist';A=D/'assets';A.mkdir(exist_ok=True)
PAPER='#fffdf9';INK='#16366b';RED='#bd2637';WHITE='#ffffff';SOFT='#edf2fa';GRAY='#627087'
# Crossed fork and fountain pen, drawn as bold silhouettes for small sizes.
svg=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><title>Book Keeping — pen and fork</title><rect width="512" height="512" rx="104" fill="{INK}"/><g transform="rotate(-34 256 256)" fill="{PAPER}"><path d="M215 116H231V178H248V116H264V178H281V116H297V188Q297 215 272 227V382Q272 398 256 398Q240 398 240 382V227Q215 215 215 188Z"/></g><g transform="rotate(34 256 256)"><path d="M234 160H278V326L256 390L234 326Z" fill="{INK}" stroke="{INK}" stroke-width="16" stroke-linejoin="round"/><path d="M234 160H278V326L256 390L234 326Z" fill="{PAPER}"/><path d="M234 160V132Q234 116 250 116H262Q278 116 278 132V160Z" fill="{RED}"/><path d="M256 345V373" stroke="{INK}" stroke-width="6"/><circle cx="256" cy="340" r="5" fill="{INK}"/></g></svg>'''
(D/'favicon.svg').write_text(svg);(A/'brand-mark.svg').write_text(svg)
subprocess.run(['inkscape',str(D/'favicon.svg'),'--export-type=png','--export-width=1024','--export-filename='+str(A/'brand-master.png')],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
master=Image.open(A/'brand-master.png').convert('RGBA')
for size in [16,32,48,96,192,512]:
 im=master.resize((size,size),Image.Resampling.LANCZOS)
 im.save(D/f'favicon-{size}.png' if size<192 else D/f'icon-{size}.png')
master.save(D/'favicon.ico',format='ICO',sizes=[(16,16),(32,32),(48,48),(64,64)])
for size in [152,167,180]:
 bg=Image.new('RGB',(size,size),INK);im=master.resize((size,size),Image.Resampling.LANCZOS);bg.paste(im,mask=im.getchannel('A'));bg.save(D/('apple-touch-icon.png' if size==180 else f'apple-touch-icon-{size}.png'))
mask=Image.new('RGB',(512,512),INK);icon=master.resize((512,512));mask.paste(icon,(0,0),icon.getchannel('A'));mask.save(D/'icon-maskable-512.png')
FONT='/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc';REG='/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
def font(s,bold=True):return ImageFont.truetype(FONT if bold else REG,s,index=0)
def card(path,size=(1200,630),subject='日商簿記 / 全経簿記 / USCPA',headline=('間違いは、','理解に変わる。')):
 im=Image.new('RGB',size,PAPER);dr=ImageDraw.Draw(im);w,h=size
 # Editorial grid with a restrained French tricolour signature.
 dr.rectangle((0,0,11,h),fill=INK)
 dr.text((64,46),'Book Keeping',font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf',40),fill=INK)
 dr.rectangle((1050,56,1074,72),fill=INK);dr.rectangle((1075,56,1098,72),fill=WHITE);dr.rectangle((1099,56,1122,72),fill=RED)
 dr.line((64,121,1136,121),fill='#d6dbe3',width=1)
 dr.text((66,164),'LA PRATIQUE FAIT GRANDIR.',font=font(14,False),fill=GRAY)
 for y,line in [(210,headline[0]),(302,headline[1])]:
  s=64
  while dr.textlength(line,font=font(s))>715:s-=1
  dr.text((60,y),line,font=font(s),fill=INK)
 # The mark sits on its own quiet field; typography remains the focal point.
 dr.rectangle((852,186,1136,444),fill=SOFT)
 icon=master.resize((216,216),Image.Resampling.LANCZOS);im.paste(icon,(886,207),icon.getchannel('A'))
 dr.line((64,h-128,1136,h-128),fill='#d6dbe3',width=1)
 dr.rectangle((64,h-94,72,h-65),fill=RED)
 dr.text((89,h-98),subject,font=font(20,False),fill=INK)
 dr.text((65,h-45),'REPEAT / UNDERSTAND / GROW',font=font(11,False),fill=GRAY)
 im.save(A/path,optimize=True)
card('og-bookkeeping.png');card('card-bookkeeping.png',(1200,600))
for key,subject,headline in [('nissho','日商簿記 / 3級・2級・1級',('仕訳を解く。','数字が見える。')),('zenkei','全経簿記 / 基礎簿記会計〜上級',('基礎から、一問。','反復で、理解へ。')),('uscpa','USCPA / FAR・AUD・REG + Discipline',('Think. Solve.','Understand.'))]:card('og-'+key+'.png',subject=subject,headline=headline)
card('og-author.png',subject='宮崎直哉 / MIYAZAKI Naoya / DJ Naoyaman',headline=('好きになる。','かたちにする。'))
print('Generated pen and fork identity, platform icons and editorial social cards.')
