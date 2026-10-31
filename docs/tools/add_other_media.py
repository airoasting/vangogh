#!/usr/bin/env python3
"""유화가 아닌 작품(소묘, 수채화, 판화)을 data.js에 합친다.

사용법:  python3 -I tools/add_other_media.py <docs 폴더>
입력:    tools/other_media.json (정본: Wikidata 목록 + 한국어 제목 + 종류)
출력:    data.js (덮어씀)

build_catalog.py로 data.js를 다시 만든 뒤에는 이 스크립트를 이어서 돌린다.
여러 번 돌려도 결과가 같다. `kind`가 있는 작품과 이 정본이 더한 빈 미술관을 먼저 지우고 다시 넣는다.
목록을 새로 받으려면 tools/other_media.rq를 Wikidata에 던진 결과로 other_media.json을 고친다.
"""
import json, os, sys, urllib.parse

DIR = sys.argv[1] if len(sys.argv) > 1 else '.'
canon = json.load(open(os.path.join(DIR, 'tools', 'other_media.json')))
path = os.path.join(DIR, 'data.js')
src = open(path).read()
head, body = src.split('window.VG_DATA = ', 1)
data = json.loads(body.rstrip().rstrip(';'))
museums = data['museums']

# 1) 이전에 넣은 것 지우기
added_ids = {m['id'] for m in canon['museums']}
for m in museums:
    m['works'] = [w for w in m['works'] if not w.get('kind')]
museums[:] = [m for m in museums if m['works'] or m['id'] not in added_ids]

# 2) 새 미술관 더하기
by_id = {m['id']: m for m in museums}
for cm in canon['museums']:
    if cm['id'] not in by_id:
        m = dict(cm, works=[])
        museums.append(m)
        by_id[m['id']] = m

# 3) 작품 더하기. 자동 문장은 유화와 같은 틀에 종류만 바꾼다
ENDING = {'소묘': '그린 소묘예요.', '수채화': '그린 수채화예요.', '판화': '만든 판화예요.'}
for cw in canon['works']:
    yr = f"{cw['year']}년에 " if cw.get('year') else ''
    pl = f"{cw['place']}에서 " if cw.get('place') else ''
    by_id[cw['coll']]['works'].append({
        'id': cw['id'], 'titleKo': cw['titleKo'], 'titleEn': cw['titleEn'], 'year': cw.get('year'),
        'img': 'https://commons.wikimedia.org/wiki/Special:FilePath/' + urllib.parse.quote(cw['file']) + '?width=640',
        'place': cw.get('place', ''), 'kind': cw['kind'],
        'story': '고흐가 ' + yr + pl + ENDING[cw['kind']],
    })

# 4) build_catalog.py와 같은 순서로 정렬
for m in museums:
    m['works'].sort(key=lambda w: (not w.get('featured'), w.get('year') or 9999))
museums.sort(key=lambda m: -len(m['works']))

open(path, 'w').write(head + 'window.VG_DATA = ' + json.dumps(data, ensure_ascii=False, indent=0) + ';\n')
ws = [w for m in museums for w in m['works']]
print('museums', len(museums), 'works', len(ws), 'other media', sum(1 for w in ws if w.get('kind')))
