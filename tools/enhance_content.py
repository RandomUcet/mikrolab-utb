"""Idempotently merge hand-authored extended lessons into the generated baseline course."""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[1]
source=ROOT/'public'/'content.json'
additions=json.loads((ROOT/'content'/'enrichment.json').read_text(encoding='utf-8'))
content=json.loads(source.read_text(encoding='utf-8'))
for topic in content['topics']:
    extra=additions.get(topic['id'])
    if not extra: raise ValueError(f"Missing content enrichment: {topic['id']}")
    topic['deepDive']=extra['deepDive']
    existingCards={card['id'] for card in topic['cards']}
    existingQ={q['id'] for q in topic['questions']}
    for idx,(front,back) in enumerate(extra['cards'],1):
        card_id=f"{topic['id']}-x-c{idx}"
        if card_id not in existingCards: topic['cards'].append({'id':card_id,'front':front,'back':back})
    for idx,(stem,options,answer,explanation,level) in enumerate(extra['questions'],1):
        q_id=f"{topic['id']}-x-q{idx}"
        if q_id not in existingQ: topic['questions'].append({'id':q_id,'stem':stem,'options':options,'answer':answer,'explanation':explanation,'level':level})
    topic['minutes']=max(15,topic['minutes'])
content['edition']='2.0 · rozšířená studijní verze, 2026'
source.write_text(json.dumps(content,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Kapitol:',len(content['topics']),'Otázek:',sum(len(t['questions']) for t in content['topics']),'Kartiček:',sum(len(t['cards']) for t in content['topics']))
