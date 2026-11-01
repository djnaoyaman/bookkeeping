"""Pure, scoped text-export validation; no accounting mastery inference."""
def validate_course_text(course,full_text,base):
 for q in course['questions']:
  marker='問題ID: '+q['id']+'\n'
  assert full_text.count(marker)==1,('missing/duplicate problem',q['id'])
  block=full_text.split(marker,1)[1].split('\n### 新教材問題:',1)[0]
  assert q['prompt'] in block
  for t in q.get('exhibits',[]):
   table_marker='資料: '+t['title']+'\n'
   assert block.count(table_marker)==1,('missing/duplicate table',q['id'],t['title'])
   table_block=block.split(table_marker,1)[1].split('\n資料: ',1)[0].split('\n解答欄と正答',1)[0]
   expected_rows=[' | '.join(str(v) for v in row) for row in [t['headers']]+t['rows']]
   assert table_block.strip().splitlines()==expected_rows,('missing/reordered/extra table data',q['id'],t['title'])
  if q['type']=='fields':
   for f in q['fields']:
    field_marker='欄: '+f['id']+' / '+f['label']+'\n'
    assert block.count(field_marker)==1,('missing/duplicate field',q['id'],f['id'])
    field_block=block.split(field_marker,1)[1].split('\n欄: ',1)[0].split('\n解説: ',1)[0]
    if f['type']=='choice':
     expected_field=['選択肢: '+' / '.join(o+'='+f['optionLabels'][o] for o in f['options']),'正答: '+f['answer']+'='+f['optionLabels'][f['answer']]]
    else:
     expected_field=['単位: '+f['unit']+' / 小数桁数: '+str(f.get('decimals',0)),'正答: '+str(f['answer'])+' '+f['unit']]
    expected_field+=['配点: '+str(f['points'])+'点','欄の解説: '+f['explanation']]
    assert field_block.strip()=='\n'.join(expected_field),('incorrect/duplicate field content',q['id'],f['id'])
    if f['type']=='choice':
     for option in f['options']:assert option+'='+f['optionLabels'][option] in field_block
     assert '正答: '+f['answer']+'='+f['optionLabels'][f['answer']] in field_block
    else:
     assert '正答: '+str(f['answer'])+' '+f['unit'] in field_block
     assert '単位: '+f['unit']+' / 小数桁数: '+str(f.get('decimals',0)) in field_block
    assert '欄の解説: '+f['explanation'] in field_block and '配点: '+str(f['points'])+'点' in field_block
  else:
   answer_block=block.split('解答欄と正答（配点は教材独自）:\n',1)[1].split('\n解説: ',1)[0]
   expected_journal=['単位: '+q['unit'],'選択できる勘定科目: '+' / '.join(q['accounts'])]
   expected_journal+=[str(i)+'行目: '+('借方' if line['side']=='debit' else '貸方')+' / '+line['account']+' / '+str(line['amount'])+' '+q['unit']+' / '+str(line['points'])+'点' for i,line in enumerate(q['lines'],1)]
   assert answer_block.strip()=='\n'.join(expected_journal),('incorrect/duplicate journal content',q['id'])
   for i,line in enumerate(q['lines'],1):
    expected=str(i)+'行目: '+('借方' if line['side']=='debit' else '貸方')+' / '+line['account']+' / '+str(line['amount'])+' '+q['unit']+' / '+str(line['points'])+'点'
    assert expected in block
   for account in q['accounts']:assert account in block
  for step in q['explanation']['steps']:assert step in block
  assert '出典（学習範囲）: '+' / '.join(q['provenance']['referenceUrls']) in block.splitlines()
  assert q['explanation']['check'] in block
  for pitfall in q['explanation']['pitfalls']:assert pitfall in block
 for lesson in course['lessons']:
  lesson_marker='\nURL: '+base+'/lessons/'+lesson['id']+'.html\n'
  assert full_text.count(lesson_marker)==1
  lesson_block=full_text.split(lesson_marker,1)[1].split('\n## 講義 ',1)[0].split('\n### 新教材問題:',1)[0]
  assert '間違えやすい点: '+' / '.join(lesson['pitfalls']) in lesson_block.splitlines()
  for example in lesson['workedExamples']:
   example_marker='\n例題: '+example['title']+'\n'
   assert lesson_block.count(example_marker)==1
   example_block=lesson_block.split(example_marker,1)[1].split('\n例題: ',1)[0].split('\n間違えやすい点: ',1)[0]
   assert '条件: '+example['prompt'] in example_block and '例題の答え: '+example['answer'] in example_block
   for step in example['steps']:assert step in example_block
