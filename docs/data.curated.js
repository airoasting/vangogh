/* 반 고흐 어린이 백과: 공유 데이터 (window.VG_DATA)
   이미지: Wikimedia Commons 썸네일. 소장처는 각 미술관 공식 소장 기준. */
(function () {
  var C = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/';
  window.VG_DATA = {
    museums: [
      {
        id: 'vgm', nameKo: '반 고흐 미술관', nameEn: 'Van Gogh Museum', city: '암스테르담', country: '네덜란드', flag: '🇳🇱',
        lat: 52.3584, lon: 4.8811,
        intro: '세상에서 고흐 그림이 가장 많은 미술관이에요. 고흐의 동생 테오의 가족이 지켜 온 그림들이 여기 모여 있어요.',
        works: [
          { id: 'potato-eaters', titleKo: '감자 먹는 사람들', titleEn: 'The Potato Eaters', year: 1885,
            img: C + 'c/c6/De_aardappeleters_-_s0005V1962_-_Van_Gogh_Museum.jpg/960px-De_aardappeleters_-_s0005V1962_-_Van_Gogh_Museum.jpg',
            story: '네덜란드 시골 뉘넌에서 그린 그림이에요. 하루 종일 밭에서 일한 가족이 램프 불빛 아래에서 감자를 나눠 먹고 있어요. 고흐는 땀 흘려 일하는 사람들의 진짜 모습을 그리고 싶었어요.',
            lookFor: '그림에서 찾아보기: 천장에 매달린 램프를 찾아보세요.', fun: '고흐는 흙을 만진 손을 보여 주려고 사람들의 손을 일부러 크고 거칠게 그렸어요.' },
          { id: 'sunflowers-vgm', titleKo: '해바라기', titleEn: 'Sunflowers', year: 1889,
            img: C + '9/9d/Vincent_van_Gogh_-_Sunflowers_-_VGM_F458.jpg/960px-Vincent_van_Gogh_-_Sunflowers_-_VGM_F458.jpg',
            story: '고흐는 해바라기 그림을 여러 장 그렸어요. 이 그림은 런던에 있는 해바라기를 보고 다시 그린 그림이에요. 노란색 하나로도 이렇게 많은 느낌을 낼 수 있어요.',
            lookFor: '그림에서 찾아보기: 꽃병에 적힌 고흐의 이름 "Vincent"를 찾아보세요.', fun: '고흐는 그림에 성 대신 이름 "빈센트"만 적는 걸 좋아했어요.' },
          { id: 'bedroom-vgm', titleKo: '아를의 침실', titleEn: 'The Bedroom', year: 1888,
            img: C + '7/76/Vincent_van_Gogh_-_De_slaapkamer_-_Google_Art_Project.jpg/960px-Vincent_van_Gogh_-_De_slaapkamer_-_Google_Art_Project.jpg',
            story: '프랑스 아를의 노란 집에 있던 고흐의 방이에요. 고흐는 이 방을 보면 마음이 푹 쉬는 느낌이 들기를 바랐어요.',
            lookFor: '그림에서 찾아보기: 의자가 몇 개 있는지 세어 보세요.', fun: '고흐는 이 방 그림을 모두 세 번 그렸어요. 나머지 두 장은 시카고와 파리에 있어요.' },
          { id: 'almond-blossom', titleKo: '꽃 피는 아몬드 나무', titleEn: 'Almond Blossom', year: 1890,
            img: C + '6/68/Vincent_van_Gogh_-_Almond_blossom_-_Google_Art_Project.jpg/960px-Vincent_van_Gogh_-_Almond_blossom_-_Google_Art_Project.jpg',
            story: '동생 테오에게 아기가 태어났다는 소식을 듣고 그린 선물이에요. 파란 하늘에 하얀 꽃이 활짝 피어 있어요. 새 생명을 축하하는 마음이 담겨 있어요.',
            lookFor: '그림에서 찾아보기: 아직 피지 않은 꽃봉오리를 찾아보세요.', fun: '테오는 아기 이름을 형의 이름을 따서 빈센트라고 지었어요.' },
          { id: 'wheatfield-crows', titleKo: '까마귀가 나는 밀밭', titleEn: 'Wheatfield with Crows', year: 1890,
            img: C + 'a/a1/Korenveld_met_kraaien_-_s0149V1962_-_Van_Gogh_Museum.jpg/960px-Korenveld_met_kraaien_-_s0149V1962_-_Van_Gogh_Museum.jpg',
            story: '고흐가 마지막 여름을 보낸 오베르쉬르우아즈에서 그렸어요. 노란 밀밭 위로 짙은 파란 하늘이 펼쳐지고 까마귀들이 날아가요.',
            lookFor: '그림에서 찾아보기: 밀밭 사이로 난 길이 몇 갈래인지 세어 보세요.', fun: '이 그림은 옆으로 아주 길쭉해요. 넓은 들판을 한눈에 담으려고 그랬대요.' },
          { id: 'yellow-house', titleKo: '노란 집', titleEn: 'The Yellow House', year: 1888,
            img: C + '7/7b/Vincent_van_Gogh_-_The_yellow_house_%28%27The_street%27%29.jpg/960px-Vincent_van_Gogh_-_The_yellow_house_%28%27The_street%27%29.jpg',
            story: '아를에서 고흐가 빌려 살던 집이에요. 고흐는 이곳을 화가 친구들이 함께 그림을 그리는 집으로 만들고 싶었어요.',
            lookFor: '그림에서 찾아보기: 초록색 문이 달린 창문을 찾아보세요.', fun: '진짜 노란 집은 전쟁 때 부서져서 지금은 그림으로만 볼 수 있어요.' }
        ]
      },
      {
        id: 'kmm', nameKo: '크뢸러뮐러 미술관', nameEn: 'Kröller-Müller Museum', city: '오테를로', country: '네덜란드', flag: '🇳🇱',
        lat: 52.0950, lon: 5.8166,
        intro: '커다란 국립공원 숲속에 있는 미술관이에요. 공원에 있는 하얀 자전거를 타고 갈 수 있어요.',
        works: [
          { id: 'cafe-terrace', titleKo: '밤의 카페 테라스', titleEn: 'Café Terrace at Night', year: 1888,
            img: C + '8/86/Van_Gogh_-_Terrace_of_a_Caf%C3%A9_at_Night_%28Place_du_Forum%29_1888.jpg/960px-Van_Gogh_-_Terrace_of_a_Caf%C3%A9_at_Night_%28Place_du_Forum%29_1888.jpg',
            story: '아를의 밤거리에 있는 카페예요. 노란 불빛이 환하고 하늘에는 별이 반짝여요. 고흐는 밤에도 밖에 나가서 직접 보며 그렸어요.',
            lookFor: '그림에서 찾아보기: 하늘에 떠 있는 별을 세어 보세요.', fun: '고흐는 이 밤 그림을 그리면서 검은색을 하나도 쓰지 않았다고 편지에 썼어요.' },
          { id: 'road-cypress-star', titleKo: '사이프러스와 별이 있는 길', titleEn: 'Road with Cypress and Star', year: 1890,
            img: C + '7/75/Vincent_van_Gogh_-_Road_with_Cypress_and_Star_-_c._12-15_May_1890.jpg/960px-Vincent_van_Gogh_-_Road_with_Cypress_and_Star_-_c._12-15_May_1890.jpg',
            story: '하늘까지 닿을 듯한 사이프러스 나무(키가 크고 뾰족한 나무)가 가운데 서 있어요. 한쪽엔 반짝이는 별, 다른 쪽엔 가느다란 달이 함께 떠 있어요.',
            lookFor: '그림에서 찾아보기: 길을 걸어가는 두 사람을 찾아보세요.', fun: '고흐가 생레미 병원을 떠나기 직전에 그린 그림이에요.' },
          { id: 'eternity-gate', titleKo: '슬픔에 잠긴 노인', titleEn: "At Eternity's Gate", year: 1890,
            img: C + '0/0f/At_Eternity%27s_Gate_-_Vincent_Van_Gogh.jpg/960px-At_Eternity%27s_Gate_-_Vincent_Van_Gogh.jpg',
            story: '할아버지가 난롯가 의자에 앉아 얼굴을 두 손으로 감싸고 있어요. 고흐는 슬픈 마음도 그림으로 솔직하게 그렸어요.',
            lookFor: '그림에서 찾아보기: 활활 타는 난로 불을 찾아보세요.', fun: '고흐는 젊을 때 그렸던 같은 장면의 그림을 보고 이 그림을 다시 그렸어요..' }
        ]
      },
      {
        id: 'orsay', nameKo: '오르세 미술관', nameEn: "Musée d'Orsay", city: '파리', country: '프랑스', flag: '🇫🇷',
        lat: 48.8600, lon: 2.3266,
        intro: '옛날 기차역을 고쳐서 만든 미술관이에요. 커다란 시계가 있는 건물 안에서 고흐와 친구 화가들의 그림을 볼 수 있어요.',
        works: [
          { id: 'starry-rhone', titleKo: '론강의 별이 빛나는 밤', titleEn: 'Starry Night Over the Rhône', year: 1888, place: '아를',
            img: C + '0/01/Vincent_van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/960px-Vincent_van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
            story: '아를의 강가에서 본 밤 풍경이에요. 강물 위로 가로등 불빛이 노랗게 길게 비쳐요. 강가에는 두 사람이 산책을 하고 있어요.',
            lookFor: '그림에서 찾아보기: 하늘에서 국자 모양의 북두칠성을 찾아보세요.', fun: '고흐는 밤하늘을 그리는 걸 정말 좋아해서 "별을 보면 꿈을 꾸게 된다"고 편지에 썼어요.' },
          { id: 'church-auvers', titleKo: '오베르의 교회', titleEn: 'The Church at Auvers', year: 1890,
            img: C + 'a/ad/Vincent_van_Gogh_-_The_Church_in_Auvers-sur-Oise%2C_View_from_the_Chevet_-_Google_Art_Project.jpg/960px-Vincent_van_Gogh_-_The_Church_in_Auvers-sur-Oise%2C_View_from_the_Chevet_-_Google_Art_Project.jpg',
            story: '오베르쉬르우아즈 마을의 교회예요. 단단한 돌 건물인데 고흐의 붓질로 흔들흔들 춤추는 것처럼 보여요.',
            lookFor: '그림에서 찾아보기: 길이 두 갈래로 나뉘는 곳을 찾아보세요.', fun: '이 교회는 지금도 오베르 마을에 그대로 서 있어서 직접 가 볼 수 있어요.' },
          { id: 'bedroom-orsay', titleKo: '아를의 침실 (세 번째 그림)', titleEn: 'Bedroom in Arles', year: 1889,
            img: C + 'd/d0/La_Chambre_%C3%A0_Arles%2C_by_Vincent_van_Gogh%2C_from_C2RMF.jpg/960px-La_Chambre_%C3%A0_Arles%2C_by_Vincent_van_Gogh%2C_from_C2RMF.jpg',
            story: '고흐가 엄마와 여동생에게 주려고 조금 작게 다시 그린 침실 그림이에요. 암스테르담에 있는 첫 번째 그림과 비교해 보면 재미있어요.',
            lookFor: '그림에서 찾아보기: 벽에 걸린 액자 속 얼굴을 찾아보세요.', fun: '세 그림을 나란히 놓으면 벽에 걸린 그림이 조금씩 달라요.' }
        ]
      },
      {
        id: 'ng-london', nameKo: '내셔널 갤러리', nameEn: 'The National Gallery', city: '런던', country: '영국', flag: '🇬🇧',
        lat: 51.5089, lon: -0.1283,
        intro: '런던 트래펄가 광장 앞에 있는 미술관이에요. 누구나 돈을 내지 않고 들어갈 수 있어요.',
        works: [
          { id: 'sunflowers-london', titleKo: '해바라기', titleEn: 'Sunflowers', year: 1888,
            img: C + '4/46/Vincent_Willem_van_Gogh_127.jpg/960px-Vincent_Willem_van_Gogh_127.jpg',
            story: '친구 고갱이 아를에 온다는 소식에 고흐는 신이 났어요. 친구 방을 꾸미려고 해바라기를 그렸어요. 배경도 꽃병도 꽃도 모두 노란색이에요.',
            lookFor: '그림에서 찾아보기: 해바라기가 모두 몇 송이인지 세어 보세요.', fun: '활짝 핀 꽃, 시든 꽃, 씨만 남은 꽃까지 해바라기의 일생이 다 들어 있어요.' },
          { id: 'vangogh-chair', titleKo: '고흐의 의자', titleEn: "Van Gogh's Chair", year: 1888,
            img: C + '9/96/Vincent_Willem_van_Gogh_138.jpg/960px-Vincent_Willem_van_Gogh_138.jpg',
            story: '고흐가 쓰던 평범한 나무 의자예요. 사람은 없지만 의자만 봐도 고흐가 떠올라요.',
            lookFor: '그림에서 찾아보기: 의자 위에 놓인 담배 파이프를 찾아보세요.', fun: '고흐는 친구 고갱의 의자도 그려서 두 그림이 짝꿍이 되었어요.' }
        ]
      },
      {
        id: 'moma', nameKo: '뉴욕 현대미술관', nameEn: 'MoMA', city: '뉴욕', country: '미국', flag: '🇺🇸',
        lat: 40.7614, lon: -73.9776,
        intro: '뉴욕 한가운데 있는 현대미술관이에요. 세계에서 가장 유명한 밤하늘 그림을 보러 매일 사람들이 줄을 서요.',
        works: [
          { id: 'starry-night', titleKo: '별이 빛나는 밤', titleEn: 'The Starry Night', year: 1889,
            img: C + 'e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/960px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
            story: '생레미의 병원 창문 너머로 본 새벽 하늘을 그렸어요. 하늘이 소용돌이처럼 빙글빙글 돌아요. 마을은 고흐가 상상을 더해서 그렸어요.',
            lookFor: '그림에서 찾아보기: 왼쪽에 불꽃처럼 솟은 사이프러스 나무(키 크고 뾰족한 나무)를 찾아보세요.', fun: '고흐는 이 그림을 낮에 기억을 떠올리며 그렸어요. 병원 방에서는 밤에 그림을 그릴 수 없었거든요.' },
          { id: 'olive-trees-moma', titleKo: '올리브 나무', titleEn: 'The Olive Trees', year: 1889,
            img: C + '0/0b/WLA_moma_Vincent_van_Gogh_The_Olive_Trees_1889.jpg/960px-WLA_moma_Vincent_van_Gogh_The_Olive_Trees_1889.jpg',
            story: '별이 빛나는 밤과 같은 달에 생레미에서 그린 그림이에요. 올리브 나무와 땅과 하늘이 모두 물결처럼 꿈틀거려요.',
            lookFor: '그림에서 찾아보기: 하늘에 떠 있는 하얀 구름을 찾아보세요.', fun: '고흐는 생레미에서 올리브 나무 그림을 열 장 넘게 그렸어요.' },
          { id: 'joseph-roulin', titleKo: '조제프 룰랭의 초상', titleEn: 'Portrait of Joseph Roulin', year: 1889,
            img: C + '1/11/WLA_moma_Vincent_van_Gogh_Portrait_of_Joseph_Roulin_1889.jpg/960px-WLA_moma_Vincent_van_Gogh_Portrait_of_Joseph_Roulin_1889.jpg',
            story: '아를의 우체부 아저씨 룰랭이에요. 룰랭은 외로운 고흐에게 다정한 친구가 되어 주었어요.',
            lookFor: '그림에서 찾아보기: 뒤쪽 벽지에 핀 꽃들을 찾아보세요.', fun: '고흐는 룰랭 아저씨뿐 아니라 아내와 세 아이까지 온 가족을 그렸어요.' }
        ]
      },
      {
        id: 'guggenheim', nameKo: '구겐하임 미술관', nameEn: 'Solomon R. Guggenheim Museum', city: '뉴욕', country: '미국', flag: '🇺🇸',
        lat: 40.7830, lon: -73.9590,
        intro: '건물이 하얀 소라 껍데기처럼 동그랗게 돌아가는 미술관이에요. 빙글빙글 비탈길을 걸어 내려오면서 그림을 봐요.',
        works: [
          { id: 'mountains-saint-remy', titleKo: '생레미의 산', titleEn: 'Mountains at Saint-Rémy', year: 1889,
            img: C + '9/97/Van_Gogh_-_Berglandschaft_in_Saint-R%C3%A9my.jpeg/960px-Van_Gogh_-_Berglandschaft_in_Saint-R%C3%A9my.jpeg',
            story: '고흐가 생레미 병원에서 지낼 때 창밖으로 보이던 산을 그렸어요. 산과 언덕이 파도처럼 출렁출렁 움직이는 것 같아요.',
            lookFor: '그림에서 찾아보기: 산 위 하늘에 꿈틀꿈틀 흐르는 구름을 찾아보세요.',
            fun: '이 그림은 탄하우저라는 미술품 수집가가 구겐하임 미술관에 선물한 그림이에요.' }
        ]
      },
      {
        id: 'met', nameKo: '메트로폴리탄 미술관', nameEn: 'The Metropolitan Museum of Art', city: '뉴욕', country: '미국', flag: '🇺🇸',
        lat: 40.7794, lon: -73.9632,
        intro: '센트럴 파크 옆에 있는 아주 큰 미술관이에요. 이집트 미라부터 고흐 그림까지 볼 수 있어요.',
        works: [
          { id: 'wheat-cypresses', titleKo: '사이프러스가 있는 밀밭', titleEn: 'Wheat Field with Cypresses', year: 1889,
            img: C + 'c/ce/Wheat-Field-with-Cypresses-%281889%29-Vincent-van-Gogh-Met.jpg/960px-Wheat-Field-with-Cypresses-%281889%29-Vincent-van-Gogh-Met.jpg',
            story: '여름날 생레미의 황금빛 밀밭이에요. 하늘에는 구름이 소용돌이치고 키 크고 뾰족한 초록 사이프러스 나무가 우뚝 서 있어요.',
            lookFor: '그림에서 찾아보기: 멀리 보이는 파란 산을 찾아보세요.', fun: '고흐는 사이프러스 나무가 이집트의 뾰족한 돌기둥(오벨리스크)처럼 멋지다고 했어요.' },
          { id: 'irises-met', titleKo: '붓꽃', titleEn: 'Irises', year: 1890,
            img: C + '9/9b/Vincent_van_Gogh_-_Irises_%281890%29.jpg/960px-Vincent_van_Gogh_-_Irises_%281890%29.jpg',
            story: '생레미 병원을 떠나기 직전에 그린 꽃병 속 붓꽃이에요. 보라색 꽃이 꽃병에서 넘칠 듯이 가득해요.',
            lookFor: '그림에서 찾아보기: 칼처럼 뾰족한 초록 잎을 찾아보세요.', fun: '처음에는 배경이 분홍빛이었는데, 오랜 세월이 지나며 색이 바래서 하얗게 보여요.' },
          { id: 'straw-hat', titleKo: '밀짚모자를 쓴 자화상', titleEn: 'Self-Portrait with a Straw Hat', year: 1887, place: '파리',
            img: C + 'a/a8/Van_Gogh_Self-Portrait_with_Straw_Hat_1887-Metropolitan.jpg/960px-Van_Gogh_Self-Portrait_with_Straw_Hat_1887-Metropolitan.jpg',
            story: '파리에 살 때 거울을 보며 그린 고흐 자신의 얼굴이에요. 짧은 붓질을 촘촘히 쌓아서 밝은 색을 냈어요.',
            lookFor: '그림에서 찾아보기: 밀짚모자에 쓰인 색을 몇 가지나 찾을 수 있는지 보세요.', fun: '이 그림 뒷면에는 감자 깎는 여자를 그린 다른 그림이 있어요. 캔버스를 아끼려고 양쪽을 다 썼어요.' }
        ]
      },
      {
        id: 'aic', nameKo: '시카고 미술관', nameEn: 'Art Institute of Chicago', city: '시카고', country: '미국', flag: '🇺🇸',
        lat: 41.8796, lon: -87.6237,
        intro: '입구에 커다란 사자 조각 두 마리가 지키고 있는 미술관이에요.',
        works: [
          { id: 'bedroom-aic', titleKo: '침실 (두 번째 그림)', titleEn: 'The Bedroom', year: 1889,
            img: C + '5/50/Vincent_van_Gogh_-_The_Bedroom_-_1926.417_-_Art_Institute_of_Chicago.jpg/960px-Vincent_van_Gogh_-_The_Bedroom_-_1926.417_-_Art_Institute_of_Chicago.jpg',
            story: '첫 번째 침실 그림이 물에 젖어 상하자 고흐는 같은 크기로 다시 그렸어요. 그게 바로 이 그림이에요.',
            lookFor: '그림에서 찾아보기: 벽에 걸린 수건을 찾아보세요.', fun: '방 모서리가 비스듬한 건 실제 노란 집의 방 모양이 그랬기 때문이에요.' },
          { id: 'selfportrait-aic', titleKo: '자화상', titleEn: 'Self-Portrait', year: 1887, place: '파리',
            img: C + '3/37/Vincent_van_Gogh_-_Self-Portrait_-_1954.326_-_Art_Institute_of_Chicago.jpg/960px-Vincent_van_Gogh_-_Self-Portrait_-_1954.326_-_Art_Institute_of_Chicago.jpg',
            story: '파리에서 새로운 화가 친구들을 만난 고흐는 작은 점과 짧은 선으로 그리는 방법을 배웠어요. 얼굴과 배경이 알록달록한 점으로 가득해요.',
            lookFor: '그림에서 찾아보기: 수염 속에 숨은 빨간색과 초록색 점을 찾아보세요.', fun: '고흐는 모델을 부를 돈이 없어서 자기 얼굴을 30번 넘게 그렸어요.' }
        ]
      },
      {
        id: 'nga', nameKo: '내셔널 갤러리 오브 아트', nameEn: 'National Gallery of Art', city: '워싱턴 D.C.', country: '미국', flag: '🇺🇸',
        lat: 38.8913, lon: -77.0199,
        intro: '미국의 수도 워싱턴에 있는 국립 미술관이에요. 누구나 무료로 들어갈 수 있어요.',
        works: [
          { id: 'farmhouse-provence', titleKo: '프로방스의 농가', titleEn: 'Farmhouse in Provence', year: 1888,
            img: C + '0/06/Farmhouse_in_Provence%2C_1888%2C_Vincent_van_Gogh%2C_NGA.jpg/960px-Farmhouse_in_Provence%2C_1888%2C_Vincent_van_Gogh%2C_NGA.jpg',
            story: '아를 근처 시골의 농부 집과 밀밭이에요. 여름 햇볕 아래 밀이 노랗게 익어 가요.',
            lookFor: '그림에서 찾아보기: 길을 걸어가는 사람을 찾아보세요.', fun: '고흐는 노란 밀과 파란 하늘처럼 서로 반대되는 색을 나란히 두면 더 환해 보인다는 걸 알았어요.' },
          { id: 'roses-nga', titleKo: '장미', titleEn: 'Roses', year: 1890, place: '생레미드프로방스',
            img: C + 'b/b1/Vincent_van_Gogh%2C_Roses%2C_1890%2C_NGA_72328.jpg/960px-Vincent_van_Gogh%2C_Roses%2C_1890%2C_NGA_72328.jpg',
            story: '생레미 병원을 떠나기 전, 고흐가 꽃병 가득 장미를 그렸어요. 꽃이 너무 많아서 테이블까지 넘쳐흘러요.',
            lookFor: '그림에서 찾아보기: 테이블 위에 떨어진 장미를 찾아보세요.', fun: '지금은 하얀 장미로 보이지만, 처음에는 분홍색 장미였어요. 물감 색이 세월이 지나며 바랬어요.' },
          { id: 'green-wheat', titleKo: '오베르의 초록 밀밭', titleEn: 'Green Wheat Fields, Auvers', year: 1890,
            img: C + 'e/ec/Vincent_van_Gogh%2C_Green_Wheat_Fields%2C_Auvers%2C_1890%2C_NGA_163323.jpg/960px-Vincent_van_Gogh%2C_Green_Wheat_Fields%2C_Auvers%2C_1890%2C_NGA_163323.jpg',
            story: '오베르 마을의 아직 덜 익은 초록 밀밭이에요. 바람에 밀이 살랑살랑 흔들리는 것 같아요.',
            lookFor: '그림에서 찾아보기: 밀밭 사이에 핀 작은 꽃들을 찾아보세요.', fun: '고흐는 오베르에서 지낸 약 70일 동안 하루에 거의 한 장씩 그림을 그렸어요.' }
        ]
      },
      {
        id: 'neue-pinakothek', nameKo: '노이에 피나코테크', nameEn: 'Neue Pinakothek', city: '뮌헨', country: '독일', flag: '🇩🇪',
        lat: 48.1500, lon: 11.5708,
        intro: '독일 뮌헨에 있는 미술관이에요. 지금은 공사 중이라 그림들을 바로 옆 미술관에서 보여 주고 있어요.',
        works: [
          { id: 'sunflowers-munich', titleKo: '해바라기', titleEn: 'Sunflowers', year: 1888,
            img: C + 'a/ae/Sunflowers_-_Vincent_van_Gogh_%28Munich_version%29.jpg/960px-Sunflowers_-_Vincent_van_Gogh_%28Munich_version%29.jpg',
            story: '아를에서 그린 해바라기예요. 런던의 해바라기와 달리 배경이 시원한 청록색이에요.',
            lookFor: '그림에서 찾아보기: 해바라기가 몇 송이인지 세어 보고 런던 그림과 비교해 보세요.', fun: '이 그림에는 해바라기가 12송이 있어요.' },
          { id: 'arles-orchards', titleKo: '꽃 피는 과수원과 아를 풍경', titleEn: 'View of Arles, Flowering Orchards', year: 1889,
            img: C + '4/41/Vincent_Van_Gogh.-_Vue_d%27Arles.jpg/960px-Vincent_Van_Gogh.-_Vue_d%27Arles.jpg',
            story: '봄이 온 아를의 과일나무 밭이에요. 앞에는 키 큰 나무줄기들이 서 있고, 그 사이로 꽃 핀 나무와 마을이 보여요.',
            lookFor: '그림에서 찾아보기: 나무 사이로 보이는 마을의 지붕을 찾아보세요.', fun: '고흐는 일본 판화를 좋아해서, 앞쪽 나무 사이로 먼 풍경을 들여다보는 방법을 따라 해 봤어요.' }
        ]
      },
      {
        id: 'pushkin', nameKo: '푸시킨 미술관', nameEn: 'Pushkin Museum of Fine Arts', city: '모스크바', country: '러시아', flag: '🇷🇺',
        lat: 55.7473, lon: 37.6051,
        intro: '러시아 모스크바에 있는 큰 미술관이에요. 프랑스 화가들의 그림이 많이 있어요.',
        works: [
          { id: 'red-vineyard', titleKo: '붉은 포도밭', titleEn: 'The Red Vineyard', year: 1888,
            img: C + '3/35/Red_vineyards.jpg/960px-Red_vineyards.jpg',
            story: '가을 저녁, 아를의 포도밭이 해 질 녘 빛을 받아 빨갛게 물들었어요. 사람들이 바쁘게 포도를 따고 있어요.',
            lookFor: '그림에서 찾아보기: 하늘에 떠 있는 동그란 해를 찾아보세요.', fun: '고흐가 살아 있을 때 팔린 그림으로 잘 알려진 작품이에요.' },
          { id: 'prisoners-round', titleKo: '죄수들의 산책', titleEn: "Prisoners' Round (after Gustave Doré)", year: 1890,
            img: C + '9/9e/Vincent_Willem_van_Gogh_037.jpg/960px-Vincent_Willem_van_Gogh_037.jpg',
            story: '높은 벽에 둘러싸인 마당에서 사람들이 빙글빙글 원을 그리며 걷고 있어요. 고흐는 귀스타브 도레라는 화가의 판화(판에 새겨 찍어 낸 그림)를 보고 색을 입혀 그렸어요.',
            lookFor: '그림에서 찾아보기: 바닥 위를 날아다니는 나비 두 마리를 찾아보세요.', fun: '가운데 모자를 쓰지 않은 사람이 고흐를 닮았다는 이야기가 있어요.' }
        ]
      },
      {
        id: 'getty', nameKo: '게티 센터', nameEn: 'The Getty Center', city: '로스앤젤레스', country: '미국', flag: '🇺🇸',
        lat: 34.0780, lon: -118.4741,
        intro: '로스앤젤레스 언덕 위에 있는 하얀 미술관이에요. 작은 기차를 타고 올라가요.',
        works: [
          { id: 'irises-getty', titleKo: '붓꽃', titleEn: 'Irises', year: 1889,
            img: C + '3/3e/Irises-Vincent_van_Gogh.jpg/960px-Irises-Vincent_van_Gogh.jpg',
            story: '고흐가 생레미 병원에 들어가고 처음 그린 그림 중 하나예요. 병원 정원에 핀 보라색 붓꽃을 보며 그렸어요.',
            lookFor: '그림에서 찾아보기: 보라색 꽃들 사이에 혼자 하얀 붓꽃을 찾아보세요.', fun: '1987년에 팔릴 때 그때까지 세상에서 가장 비싼 그림 값이었어요.' }
        ]
      },
      {
        id: 'nmwa-tokyo', nameKo: '국립서양미술관', nameEn: 'National Museum of Western Art', city: '도쿄', country: '일본', flag: '🇯🇵',
        lat: 35.7154, lon: 139.7757,
        intro: '도쿄 우에노 공원 안에 있는 미술관이에요. 건물이 특별해서 세계유산이 되었어요.',
        works: [
          { id: 'roses-tokyo', titleKo: '장미', titleEn: 'Roses', year: 1889,
            img: C + '7/72/Vincent_van_Gogh_-_Roses_-_Google_Art_Project.jpg/960px-Vincent_van_Gogh_-_Roses_-_Google_Art_Project.jpg',
            story: '생레미 병원 정원의 장미 덤불을 가까이에서 그렸어요. 초록 잎 사이로 하얀 장미가 동글동글 피어 있어요.',
            lookFor: '그림에서 찾아보기: 잎사귀 사이에 숨은 장미꽃을 몇 송이나 찾을 수 있는지 세어 보세요.', fun: '고흐는 일본 그림을 무척 좋아했는데, 이 그림은 지금 일본에서 사람들을 만나고 있어요.' }
        ]
      },
      {
        // 아이가 "귀는 왜요?"라고 물을 그림이라 아이용 문장은 아픔과 회복만 말하고, 자세한 사실은 forAdults(어른용 메모)에 둔다
        id: 'courtauld', nameKo: '코톨드 갤러리', nameEn: 'Courtauld Gallery', city: '런던', country: '영국', flag: '🇬🇧',
        lat: 51.5116, lon: -0.1177,
        intro: '',
        works: [
          { id: 'bandaged-ear', titleKo: '귀에 붕대를 감은 자화상', titleEn: 'Self-Portrait with Bandaged Ear', year: 1889, place: '아를',
            img: C + 'a/ab/Self-Portrait_with_a_Bandaged_Ear_-_Vincent_van_Gogh.jpg/960px-Self-Portrait_with_a_Bandaged_Ear_-_Vincent_van_Gogh.jpg',
            story: '아를에 살던 1889년 겨울에 그린 자화상이에요. 고흐는 마음이 많이 아팠던 때 귀를 다쳐서 병원에서 치료를 받았어요. 집에 돌아온 뒤 붕대를 감은 자기 모습을 그리며 다시 그림을 시작했어요.',
            lookFor: '그림에서 찾아보기: 뒤쪽 벽에 걸린 일본 판화를 찾아보세요. 산과 사람들이 보여요.',
            fun: '고흐가 다친 쪽은 왼쪽 귀였어요. 거울을 보며 그려서, 그림에서는 오른쪽 귀에 붕대를 감은 것처럼 보여요.',
            forAdults: '1888년 12월, 고흐는 마음의 병이 심해진 상태에서 자신의 왼쪽 귀를 다쳤고 아를의 병원에서 치료를 받았어요. 이 그림은 퇴원한 뒤인 1889년 1월에 그렸어요. 아이가 "귀는 왜 다쳤어요?" 하고 물으면 "마음이 많이 아파서 스스로를 다치게 했고, 병원에서 도움을 받은 뒤 다시 그림을 그렸어"처럼 아픔과 회복을 함께 말해 주세요. 마음이 아플 때 어른에게 도움을 청하는 것은 부끄러운 일이 아니라는 이야기로 이어 갈 수 있어요.' }
        ]
      }
    ],
    life: [
      { id: 'zundert', placeKo: '쥔더르트', country: '네덜란드', lat: 51.4700, lon: 4.6600, years: '1853',
        story: '빈센트 반 고흐가 태어난 작은 마을이에요. 아빠는 목사님이었고, 빈센트는 들판과 곤충을 관찰하는 걸 좋아했어요.', emoji: '👶' },
      { id: 'london', placeKo: '런던', country: '영국', lat: 51.5074, lon: -0.1278, years: '1873~1876',
        story: '젊은 고흐는 그림을 파는 가게에서 일하며 런던에 살았어요. 이때 미술관에서 멋진 그림을 많이 봤어요.', emoji: '🖼️' },
      { id: 'borinage', placeKo: '보리나주 (몽스 근처)', country: '벨기에', lat: 50.4300, lon: 3.8300, years: '1879~1880',
        story: '석탄을 캐는 광부 마을에서 가난한 사람들을 도왔어요. 여기서 화가가 되기로 마음먹고 그림 공부를 시작했어요.', emoji: '⛏️' },
      { id: 'nuenen', placeKo: '뉘넌', country: '네덜란드', lat: 51.4700, lon: 5.5500, years: '1883~1885',
        story: '부모님이 사는 시골 마을에서 농부와 옷감 짜는 사람들을 그렸어요. 감자 먹는 사람들을 이곳에서 그렸어요.', emoji: '🥔' },
      { id: 'paris', placeKo: '파리', country: '프랑스', lat: 48.8867, lon: 2.3431, years: '1886~1888',
        story: '동생 테오와 함께 살며 새로운 화가 친구들을 만났어요. 어두웠던 그림이 밝고 알록달록하게 바뀌었어요.', emoji: '🎨' },
      { id: 'arles', placeKo: '아를', country: '프랑스', lat: 43.6766, lon: 4.6278, years: '1888~1889',
        story: '햇살 가득한 남프랑스로 이사해 노란 집에 살았어요. 해바라기와 밤의 카페 테라스를 여기서 그렸어요.', emoji: '🌻' },
      { id: 'saint-remy', placeKo: '생레미드프로방스', country: '프랑스', lat: 43.7890, lon: 4.8317, years: '1889~1890',
        story: '몸과 마음이 아파서 병원에서 지내며 쉬었어요. 그래도 창밖을 보며 별이 빛나는 밤을 그렸어요.', emoji: '🌌' },
      { id: 'auvers', placeKo: '오베르쉬르우아즈', country: '프랑스', lat: 49.0714, lon: 2.1700, years: '1890',
        story: '파리 근처 조용한 마을에서 마지막 여름을 보내며 그림을 아주 많이 그렸어요. 고흐는 1890년 여름, 37살에 세상을 떠났어요.', emoji: '🌾' }
    ],
    // 이야기가 없는 위키데이터 작품에 붙이는 어른용 메모. 키는 Wikidata 작품 ID(data.js의 id)
    adultNotes: {
      // 담배 피는 해골 (반 고흐 미술관)
      Q7536969: '고흐가 벨기에 안트베르펜의 미술 학교에 다니던 무렵 그린 그림이에요. 미술 학교에서는 사람의 뼈 구조를 배우려고 해골을 보고 그리는 연습을 했는데, 이 그림은 그 딱딱한 연습을 놀리는 장난처럼 그린 것으로 많이 봐요. 아이가 "무서워요" 하면 "고흐가 장난을 친 그림이야. 해골이 담배를 물고 있는 게 우습지?"처럼 가볍게 받아 주세요. "해골도 담배를 피워요?" 하고 물으면 담배는 몸에 해로워서, 뼈만 남은 해골이 담배를 무는 모습이 바로 이 그림의 농담이라고 이야기할 수 있어요.',
      // 아를 병원의 병동 (암 뢰머홀츠 미술관)
      Q26221182: '1888년 12월 귀를 다친 뒤, 고흐는 1889년 초에 몸과 마음이 다시 아파 아를의 병원에 또 들어갔어요. 이 그림은 1889년 봄, 그 병원의 길고 커다란 병실을 그린 거예요. 가운데 난로 둘레에 환자들이 앉아 있고, 양쪽으로 침대가 줄지어 있어요. 아이가 "고흐는 왜 병원에 있었어요?" 하고 물으면 "마음이 많이 아파서 쉬면서 치료를 받았어. 병원에서도 그림을 계속 그렸단다"처럼 말해 주세요. 그 뒤 고흐가 스스로 생레미의 병원에 들어가 1년쯤 지내며 「별이 빛나는 밤」을 그렸다는 이야기로 이어 갈 수 있어요.'
    }
  };
})();
