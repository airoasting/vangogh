#!/usr/bin/env python3
"""Wikidata 카탈로그 + 번역 + 기존 큐레이션(32점 이야기)을 합쳐 data.js를 만든다.

사용법:
  python3 -I tools/build_catalog.py <scratch_dir> <vangogh_dir>
입력:  <scratch>/catalog.json (Wikidata SPARQL 정리본), tr_titles_*.out.json, tr_misc.out.json
       <vangogh>/data.js (기존 큐레이션: 이야기, 찾아보기, 알고 있나요, 고흐의 삶)
출력:  <vangogh>/data.js (덮어씀, 원본은 data.curated.js로 보관)
"""
import json, os, re, subprocess, sys, urllib.parse, glob

SP, DIR = sys.argv[1], sys.argv[2]
cat = json.load(open(os.path.join(SP, 'catalog.json')))
tr = {}
for f in glob.glob(os.path.join(SP, 'tr_titles_*.out.json')):
    tr.update(json.load(open(f)))
misc = json.load(open(os.path.join(SP, 'tr_misc.out.json')))

# 기존 큐레이션 읽기 (원본 보관)
cur_path = os.path.join(DIR, 'data.curated.js')
if not os.path.exists(cur_path):
    os.rename(os.path.join(DIR, 'data.js'), cur_path)
cur = json.loads(subprocess.check_output(['node', '-e',
    "global.window={};require(process.argv[1]);console.log(JSON.stringify(window.VG_DATA))", cur_path]))

def fname(url):
    """이미지 URL에서 커먼즈 파일명을 뽑아 비교 키로 쓴다."""
    if not url:
        return None
    u = urllib.parse.unquote(url)
    if 'Special:FilePath/' in u:
        n = u.split('Special:FilePath/')[1].split('?')[0]
    else:
        parts = u.split('/')
        n = parts[-2] if '/thumb/' in u else parts[-1]
    return n.replace(' ', '_').lower()

curated_by_file = {}
curated_museum = {}
for m in cur['museums']:
    curated_museum[m['nameEn'].lower()] = m
    for w in m['works']:
        curated_by_file[fname(w['img'])] = (w, m)

ALIAS = {  # 큐레이션 영문명과 Wikidata 이름이 다른 경우
    'moma': 'museum of modern art', 'the metropolitan museum of art': 'metropolitan museum of art',
    'art institute of chicago': 'art institute of chicago', 'neue pinakothek': 'bavarian state painting collections',
    'pushkin state museum of fine arts': 'pushkin museum of fine arts', 'getty center': 'j. paul getty museum',
    'the national gallery': 'national gallery', 'national gallery, london': 'national gallery',
}

CITY_FIX = {  # 구, 동네, 주 이름을 아이가 아는 도시 이름으로
    '맨해튼': '뉴욕', '파리 7구': '파리', '란트스트라세': '빈', '미테': '베를린', '교바시': '도쿄', '니시신주쿠': '도쿄',
    '우에노코엔': '도쿄', '서더크구': '런던', '시티오브웨스트민스터': '런던', '시티오브에든버러': '에든버러',
    '시루드미에시치에': '바르샤바', '에더': '오테를로', '스톡홀름시': '스톡홀름', '코펜하겐시': '코펜하겐',
    '예테보리시': '예테보리', '필라델피아군': '필라델피아', '에덴 파크': '신시내티', '리헨': '바젤', '모토마치': '히로시마',
    '온타리오주': '해밀턴', '오클라호마주': '노먼', '매사추세츠주': '윌리엄스타운', '기자주': '카이로', '아선': '아선',
    '바덴': '바덴', '고마키': '고마키', '이즈미시': '이즈미', '기타시오바라촌': '기타시오바라', '다카야마시': '다카야마',
    '하쓰카이치시': '하쓰카이치', '가사마시': '가사마', '바티칸 시국': '바티칸',
}
NAME_FIX = {'Q214867': 'National Gallery of Art', 'Q2148186': 'RISD Museum', 'Q1117704': 'Indianapolis Museum of Art'}
CITY_BY_NAME = {'Denver Art Museum': '덴버', 'National Gallery Prague': '프라하'}

museums = {}
for c in cat['colls']:
    c['nameEn'] = NAME_FIX.get(c['nameEn'], c['nameEn'])
    ko = c.get('nameKo') or misc['museums'].get(c['nameEn']) or c['nameEn']
    city = c.get('cityKo') or misc['cities'].get(c.get('cityEn') or '', None) or (c.get('cityEn') or '')
    city = CITY_FIX.get(city, city) or CITY_BY_NAME.get(c['nameEn'], '')
    museums[c['id']] = {'id': c['id'], 'nameKo': ko, 'nameEn': c['nameEn'], 'city': city,
                        'country': c.get('countryKo') or '', 'lat': round(c['lat'], 4), 'lon': round(c['lon'], 4),
                        'intro': '', 'works': []}

# 큐레이션 미술관 소개글 붙이기
for m in museums.values():
    en = m['nameEn'].lower()
    for cen, cm in curated_museum.items():
        if ALIAS.get(cen, cen) == en or cen == en:
            m['intro'] = cm.get('intro', '')
            m['nameKo'] = cm.get('nameKo') or m['nameKo']
            m['city'] = cm.get('city') or m['city']

for mid, fix in cur.get('museumFixes', {}).items():  # Wikidata 미술관 값을 정본으로 바로잡는다(예: 도시)
    if mid in museums:
        museums[mid].update(fix)

adult_notes = cur.get('adultNotes', {})  # {Wikidata 작품 ID: 어른용 메모}
used_curated = set()
work_fixes = cur.get('workFixes', {})  # {Wikidata 작품 ID: {catalog.json 필드: 바로잡은 값}}
drop_works = cur.get('dropWorks', {})  # {Wikidata 작품 ID: 빼는 이유}
for w in cat['works']:
    if w['qid'] in drop_works:
        continue
    w.update(work_fixes.get(w['qid'], {}))  # 자동 문장과 정렬이 바로잡은 값을 쓰도록 맨 먼저 덮어쓴다
    m = museums[w['coll']]
    key = fname(w['img'])
    title_ko = w.get('titleKo') or tr.get(w.get('titleEn') or '', '') or (w.get('titleEn') or '제목 없음')
    img = 'https://commons.wikimedia.org/wiki/Special:FilePath/' + urllib.parse.quote(urllib.parse.unquote(w['img'].split('Special:FilePath/')[1])) + '?width=640'
    item = {'id': w['qid'], 'titleKo': title_ko, 'titleEn': w.get('titleEn') or '', 'year': w.get('year'), 'img': img,
            'place': w.get('placeKo') or ''}
    if key in curated_by_file:
        cw, _ = curated_by_file[key]
        used_curated.add(key)
        item.update({'titleKo': cw['titleKo'], 'story': cw.get('story', ''), 'lookFor': cw.get('lookFor', ''),
                     'fun': cw.get('fun', ''), 'featured': True, 'img': cw['img']})
        if cw.get('forAdults'):
            item['forAdults'] = cw['forAdults']  # 어른용 메모(아이 화면에서는 접어 둔다)
        if cw.get('talk'):
            item['talk'] = cw['talk']  # 같이 이야기해요(부모와 아이가 주고받는 질문)
    else:
        yr = f"{w['year']}년에 " if w.get('year') else ''
        pl = f"{w['placeKo']}에서 " if w.get('placeKo') else ''
        item['story'] = f"고흐가 {yr}{pl}그린 그림이에요." if (yr or pl) else '고흐가 그린 그림이에요.'
        if w['qid'] in adult_notes:
            item['forAdults'] = adult_notes[w['qid']]  # 이야기 없는 작품의 어른용 메모(정본 adultNotes)
    m['works'].append(item)

# Wikidata에 없던 큐레이션 작품은 원래 미술관(이름이 맞는 곳)에 그대로 넣는다
for key, (cw, cm) in curated_by_file.items():
    if key in used_curated:
        continue
    target = None
    en = ALIAS.get(cm['nameEn'].lower(), cm['nameEn'].lower())
    for m in museums.values():
        if m['nameEn'].lower() == en:
            target = m
    if target is not None:
        ct = (cw.get('titleEn') or '').lower()
        hit = [w for w in target['works'] if not w.get('featured') and w.get('titleEn') and
               (w['titleEn'].lower() == ct or (len(ct) >= 6 and (ct in w['titleEn'].lower() or w['titleEn'].lower() in ct)))
               and (not w.get('year') or not cw.get('year') or abs(w['year'] - cw['year']) <= 1)]
        if hit:
            hit[0].update({'titleKo': cw['titleKo'], 'story': cw.get('story', ''), 'lookFor': cw.get('lookFor', ''),
                           'fun': cw.get('fun', ''), 'featured': True})
            if cw.get('forAdults'):
                hit[0]['forAdults'] = cw['forAdults']
            if cw.get('talk'):
                hit[0]['talk'] = cw['talk']
            if not hit[0].get('place') and cw.get('place'):
                hit[0]['place'] = cw['place']  # Wikidata에 그린 곳이 없으면 큐레이션 값을 쓴다
            continue
    if target is None:
        target = {'id': cm['id'], 'nameKo': cm['nameKo'], 'nameEn': cm['nameEn'], 'city': cm['city'],
                  'country': cm['country'], 'lat': cm['lat'], 'lon': cm['lon'], 'intro': cm.get('intro', ''), 'works': []}
        museums[cm['id']] = target
    target['works'].append(dict(cw, featured=True, place=cw.get('place', '')))

out = [m for m in museums.values() if m['works']]
for m in out:
    m['works'].sort(key=lambda w: (not w.get('featured'), w.get('year') or 9999))
out.sort(key=lambda m: -len(m['works']))

# 나란히 보기 묶음은 그대로 옮긴다. 소묘와 판화는 add_other_media.py가 나중에 더하므로
# 여기서 거르지 않고, 없는 작품 id는 app.js가 건너뛴다
versions = cur.get('versions', [])

data = {'museums': out, 'life': cur['life'], 'afterLife': cur.get('afterLife'), 'versions': versions,
        'source': 'Wikidata (CC0) 소장 정보, Wikimedia Commons 퍼블릭 도메인 이미지'}
with open(os.path.join(DIR, 'data.js'), 'w') as f:
    f.write('/* 자동 생성: tools/build_catalog.py. 큐레이션 원본은 data.curated.js */\n')
    f.write('window.VG_DATA = ' + json.dumps(data, ensure_ascii=False, indent=0) + ';\n')
print('museums', len(out), 'works', sum(len(m['works']) for m in out),
      'featured', sum(1 for m in out for w in m['works'] if w.get('featured')),
      'curated unmatched', len(curated_by_file) - len(used_curated))
