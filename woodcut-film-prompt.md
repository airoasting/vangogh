# 목판화 필름 프롬프트 가이드

코드로 그린 목판화(리노컷) 질감의 짧은 애니메이션을 AI에게 반복해서 주문하기 위한 문서다. 도쿄 횡단보도 원본 프롬프트를 부품으로 쪼개고, 빈칸 템플릿과 용어집, 점검표로 정리했다. 반 고흐 그림 지도 인트로(`vangogh/intro.js`)가 이 방식으로 만들어졌다.

## 1. 한 줄로 부르는 이름

AI에게는 아래 한 줄이면 스타일이 거의 통한다.

> **code-drawn linocut print film**: rough gouged lines, visible print grain, a limited 3 to 4 ink palette, slight plate misregistration, animated on twos, driven by one cycle (wait, surge, empty).

한국어로 말할 때: **"코드로 그린 리노컷 판화 필름. 거친 칼자국, 인쇄 입자, 잉크 3~4색, 판 어긋남, 12fps 끊김, 한 번의 사이클로 움직이는 구조."**

## 2. 원본 프롬프트가 잘 먹히는 이유 (부품 8개)

| 부품 | 원본 표현 | 하는 일 |
|---|---|---|
| 형식 | silent, autoplaying 20-second film, one self-contained HTML file | 길이, 소리, 납품 형태를 못 박는다 |
| 장면 | a rainy Tokyo crossing comes alive | 장소 하나, 날씨 하나로 무대를 좁힌다 |
| 잉크 | black, red, teal and white | 색을 잉크 이름으로 제한한다. 4색 이하 |
| 질감 | rough carved lines and visible print grain | 판화로 읽히게 하는 핵심 두 단어 |
| 동력 | one signal cycle drives the scene | 시간 구조를 사물 하나(신호등)에 묶는다 |
| 3박자 | umbrellas wait, surge diagonally, drain away | 정지, 대각선 돌진, 비움. 리듬이 생긴다 |
| 디테일 | footsteps break the gouged reflections, a train passes overhead | 큰 흐름 위에 작은 사건 두 개 |
| 제약 | crowded movement readable, clear contrast, draw all artwork in code, no outside assets or website UI | 군중이 읽히게, 대비 분명하게, 외부 이미지와 UI 금지 |

핵심은 **동력 1개와 3박자**다. 이 둘이 없으면 예쁜 그림이 흘러가기만 하고 영상이 되지 않는다.

## 3. 빈칸 템플릿

```
Create a [silent / narrated], autoplaying [N]-second film in one self-contained HTML file.
[장소], [시간대·날씨] comes alive in [잉크 1], [잉크 2], [잉크 3] and [바탕색],
with rough carved lines and visible print grain.
One [동력: 신호 / 해와 별 / 조수 / 종소리 / 기차 시간표] cycle drives the scene:
[주인공 무리] wait, surge [방향: diagonally / upward / in a spiral], then drain away as [다음 상태].
[작은 사건 1] and [작은 사건 2].
Keep the [무리] movement readable, with a clear contrast between [정지], [돌진] and [비어 있는 순간].
Draw all artwork in code; no outside visual assets or website UI.
```

한국어로 줄 때:

```
[N]초짜리 [무음 / 내레이션] 자동 재생 영상을 HTML 파일 하나로 만들어줘.
[장소]의 [시간·날씨]를 [잉크 3색]과 [바탕색] 네 가지 잉크로, 거친 칼자국과 눈에 보이는 인쇄 입자가 있는 리노컷 판화처럼 그려줘.
[동력] 한 번의 사이클이 장면을 끌고 간다. [무리]가 기다리다가, [방향]으로 몰려가고, [다음 상태]가 되면서 빠져나간다.
[작은 사건 1], [작은 사건 2].
무리의 움직임이 읽혀야 하고, 기다림, 몰려감, 잠깐 텅 빈 순간의 대비가 분명해야 한다.
그림은 전부 코드로 그리고, 외부 이미지나 웹사이트 UI는 쓰지 마.
```

## 4. 용어집 (AI가 알아듣는 말)

| 하고 싶은 말 | 영어로 쓰면 더 잘 통하는 말 |
|---|---|
| 판화 느낌 | linocut / woodcut print, relief print |
| 칼로 판 선 | rough gouged lines, carved strokes, tapered cuts |
| 검은 면을 파낸 흰 선 | white gouge marks cut out of black areas |
| 인쇄 입자 | visible print grain, paper texture, uneven ink pressure |
| 판이 살짝 어긋난 느낌 | slight plate misregistration, offset color plates |
| 손으로 찍은 듯 끊기는 움직임 | animated on twos, stepped at 12 fps |
| 색 제한 | limited palette of N inks, flat ink areas, no gradients |
| 한 번의 순환 | one cycle drives the scene |
| 정지, 돌진, 비움 | wait, surge, drain away / briefly empty |
| 무리가 읽히게 | keep the crowd movement readable |
| 전부 코드로 | draw all artwork in code, procedural, no external assets |
| 매번 같은 프레임 | seeded random, deterministic at time t |
| 화면 장식 금지 | no website UI, no buttons or overlays in the frame |

## 5. 바꿔 쓰기 예시

- **반 고흐 (이번 인트로)**: 아를의 하루. 해에서 별로 넘어가는 한 사이클. 밀밭이 기다리다가 바람에 대각선으로 출렁이고 까마귀가 몰려 날아오른 뒤, 밤이 오면 들판이 비고 사이프러스만 남는다. 잉크는 검정, 울트라마린, 크롬 옐로, 종이색.
- **서울 출근길**: 비 오는 아침 강남역 출구. 지하철 도착 한 사이클. 계단 위 사람들이 기다리다가 열차가 서면 위로 쏟아져 나오고, 문이 닫히면 빈 계단만 남는다. 잉크는 검정, 남색, 주황, 흰색.
- **바닷가 마을**: 해 질 녘 항구. 조수 한 사이클. 배들이 묶여 기다리다가 물이 차면 대각선으로 빠져나가고, 갈매기만 남은 부두. 잉크는 검정, 청록, 다홍, 종이색.

## 6. 점검표

- 정지, 돌진, 비움 세 순간이 정지 화면 세 장으로 구분되는가
- 잉크가 4색을 넘지 않는가, 그라데이션이 없는가
- 칼자국과 인쇄 입자가 확대하지 않아도 보이는가
- 무리의 방향이 한눈에 읽히는가 (대각선 하나로 통일)
- 외부 이미지, 이모지, 버튼 같은 UI가 화면에 없는가
- 같은 시간 t를 다시 그려도 같은 프레임이 나오는가 (`?introT=` 같은 디버그 훅이 있으면 검증이 쉽다)

## 7. 피해야 할 말 (AI스러운 결과가 나오는 말)

- "예쁘게", "감성적으로", "고급스럽게": 기준이 없어 그라데이션과 반짝이로 채운다
- "일러스트 스타일": 판화가 아니라 벡터 클립아트가 나온다
- "애니메이션 효과 많이": 동력 없이 움직임만 늘어난다
- 색을 "따뜻한 톤"처럼 분위기로 말하기: 잉크 이름과 개수로 말한다
