"""Generate platform derivatives from the selected 09 / P052 Italic identity.
The selected merchant drawing is supplied, not redrawn by this script.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import sys
ROOT=Path(__file__).resolve().parents[1];D=ROOT/'dist';A=D/'assets'
PAPER='#f4efe4';INK='#27251f';LEATHER='#79563d';WINE='#6b3038';LINE='#c9bca8'
FONT='/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc';REG='/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
def font(size,bold=False):return ImageFont.truetype(FONT if bold else REG,size,index=0)
def paste_contained(canvas,source,box):
 im=source.copy();im.thumbnail((box[2]-box[0],box[3]-box[1]),Image.Resampling.LANCZOS)
 canvas.paste(im,(box[0]+(box[2]-box[0]-im.width)//2,box[1]+(box[3]-box[1]-im.height)//2),im if im.mode=='RGBA' else None)
mark=Image.open(A/'il-mastro-emblem.png').convert('RGBA');wordmark=Image.open(A/'il-mastro-wordmark.png').convert('RGBA')
def card(path,size=(1200,630),subject='日商簿記 / 全経簿記 / USCPA',headline=('間違いは、','理解に変わる。')):
 im=Image.new('RGB',size,PAPER);dr=ImageDraw.Draw(im);w,h=size
 dr.rectangle((20,20,w-21,h-21),outline=LEATHER,width=1);dr.line((48,139,w-48,139),fill=LINE,width=1)
 paste_contained(im,wordmark,(60,48,395,108));dr.text((430,71),'イル・マストロ  /  簿記の反復演習',font=font(17),fill=LEATHER)
 dr.text((64,178),'STUDIO DI CONTABILITÀ',font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf',14),fill=LEATHER)
 for y,text in [(222,headline[0]),(316,headline[1])]:
  sz=61
  while dr.textlength(text,font=font(sz,True))>710:sz-=1
  dr.text((60,y),text,font=font(sz,True),fill=INK)
 paste_contained(im,mark,(824,174,1136,460));dr.line((64,h-126,w-64,h-126),fill=LINE,width=1)
 dr.rectangle((64,h-91,68,h-63),fill=WINE);dr.text((86,h-98),subject,font=font(20),fill=INK)
 dr.text((65,h-49),'REPEAT / UNDERSTAND / GROW',font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf',11),fill=LEATHER)
 im.save(A/path,optimize=True)
card('og-bookkeeping.png');card('card-bookkeeping.png',(1200,600))
for key,subject,headline in [('nissho','日商簿記 / 3級・2級・1級',('仕訳を解く。','数字が見える。')),('zenkei','全経簿記 / 基礎簿記会計〜上級',('基礎から、一問。','反復で、理解へ。')),('uscpa','USCPA / FAR・AUD・REG + Discipline',('Think. Solve.','Understand.'))]:card('og-'+key+'.png',subject=subject,headline=headline)
card('og-author.png',subject='IL MASTROをつくる理由 / 宮崎直哉',headline=('手を動かして、','わかる。'))
print('Generated six social cards from selected 09 identity.')
