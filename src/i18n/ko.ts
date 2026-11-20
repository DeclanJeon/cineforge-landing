/**
 * Korean copy — the source of truth for the dictionary shape.
 * `en.ts` is typed against this object, so a missing translation is a build error.
 */
export const ko = {
  meta: {
    title: "CineForge — 요구사항 한 번, 선택 한 번. 그다음은 논스톱.",
    description:
      "CineForge는 콘셉트 조합부터 기획안·SSOT·에셋·검수·생성 인계까지 이어 주는 대화형 AI 영상 제작 오케스트레이터 CLI입니다.",
    ogTitle: "CineForge — AI 영상 제작 오케스트레이터",
    ogDescription:
      "15단계 파이프라인, 3개 검수 게이트, 사람의 승인 뒤에만 실행되는 생성 단계.",
  },
  common: {
    skip: "본문으로",
    copy: "copy",
    copied: "copied",
    copyLabel: "복사 copy",
    langLabel: "언어",
    stageUnit: "stage",
  },
  nav: {
    links: [
      { href: "#judgment", label: "한 번의 선택" },
      { href: "#pipeline", label: "파이프라인" },
      { href: "#terminal", label: "터미널" },
      { href: "#gate", label: "승인" },
    ],
    brandSub: "orchestrator",
    access: "저장소",
    accessLabel: "GitHub 저장소 열기 (새 창)",
    start: "시작하기",
  },
  hero: {
    edge: "CineForge · AI video orchestrator · v0.1.0",
    line1: "요구사항 한 번,",
    line2: "선택 한 번.",
    line3: "그다음은 ",
    accent: "논스톱.",
    lede: "CineForge는 콘셉트 조합부터 기획안·SSOT·에셋·검수·생성 인계까지 이어 주는 대화형 AI 영상 제작 오케스트레이터 CLI입니다. 요청문에 없는 것만, 처음에 한 번 묻습니다.",
    facts: ["v0.1.0", "python 3.10+", "15 stages · 3 gates", "51 tests"],
    starsLabel: "GitHub 스타 수",
    ctaPrimary: "시작하기",
    ctaSecondary: "파이프라인 보기",
    stripLabel: "제작 단계",
  },
  judgment: {
    kicker: "01 — judgment",
    title: "아홉 가지만 확인하고, 나머지는 묻지 않습니다.",
    note: "요청문에서 감지된 항목은 다시 묻지 않습니다. 부족한 항목만 처음 한 번 물어보고, 그 선택을 파이프라인 끝까지 끌고 갑니다.",
    items: [
      { name: "대본", hint: "이미 있으면 다시 묻지 않습니다" },
      { name: "시나리오", hint: "전개와 결말의 형태" },
      { name: "레퍼런스", hint: "톤·레퍼런스 영상 유무" },
      { name: "플롯 / 콘셉트", hint: "18개 축에서 조합" },
      { name: "주연 캐릭터", hint: "인물·관계·연기 방향" },
      { name: "목소리", hint: "내레이션·대사·보이스" },
      { name: "콘텐츠 콘셉트", hint: "형식과 플랫폼" },
      { name: "스토리 전개", hint: "12가지 서사 구조" },
      { name: "연출", hint: "샷·카메라·모션·사운드" },
    ],
    footHint: "추천으로 채우기",
    footDelegate: "나머지 맡기기",
    footFlag: "면 남은 필수 항목을 AI 추천으로 채웁니다.",
  },
  pipeline: {
    kicker: "pipeline",
    title: "멈추지 않는 열다섯 단계, 세 번의 검수.",
    hint: "스크롤하면 트랙이 이동합니다 — 단계는 파일 증거로만 완료됩니다.",
    summary: "15 stages · 3 gates",
    cardDone: "파일로만 complete",
    stages: [
      {
        code: "S00",
        title: "접수 · 분석",
        body: "요청문에서 9가지 판단 요소를 찾아내고, 없는 것만 골라 냅니다.",
      },
      {
        code: "S01",
        title: "콘셉트 선택",
        body: "18개 축의 라이브러리에서 조합 후보를 제시합니다. 선택은 처음 한 번.",
      },
      {
        code: "S02",
        title: "조합 · 적합성 · 평가",
        body: "적합성 규칙과 연출 팩으로 조합을 걸러 내고 6개 기준으로 점수를 냅니다.",
      },
      {
        code: "S03",
        title: "제작 기획안",
        body: "7섹션 기획안과 씬·컷·타임라인을 plan.json / plan.md로 남깁니다.",
      },
      {
        code: "G1",
        title: "기획안 검수",
        body: "사람이 기획안을 확인하기 전에는 스토리 SSOT로 넘어가지 않습니다.",
        gate: "검수 게이트",
      },
      {
        code: "S04",
        title: "대본 · 스토리 SSOT",
        body: "대본과 스토리를 해시로 고정합니다. 바뀌면 영향 범위를 계산합니다.",
      },
      {
        code: "S05",
        title: "캐릭터 · 세계관 SSOT",
        body: "캐릭터 바이블과 세계관을 잠그고 연속성 기준을 세웁니다.",
      },
      {
        code: "S06",
        title: "연출 · 스토리보드 · 타이밍",
        body: "샷·카메라·모션·타이밍을 컷 단위로 확정합니다.",
      },
      {
        code: "S07",
        title: "에셋 · 프롬프트 · 사운드 큐",
        body: "컷별 시작/끝 프레임, 이미지·영상 프롬프트, 사운드 큐 시트를 만듭니다.",
      },
      {
        code: "G2",
        title: "프리프로덕션 검수",
        body: "연속성(CQ01–CQ11)·제약·권리(RS01–RS04)를 파일 근거로 검사합니다.",
        gate: "검수 게이트",
      },
      {
        code: "S08",
        title: "생성 → 스킬 인계",
        body: "승인 뒤에만 실행됩니다. 단계마다 담당 스킬로 인계 패킷을 넘깁니다.",
        gate: "승인 필요",
      },
      {
        code: "S09",
        title: "편집 · 사운드 · 합성",
        body: "결정적 편집 계획과 ffmpeg 조립, 음량 정규화까지 이어집니다.",
      },
      {
        code: "S10",
        title: "품질 검수",
        body: "해시·길이·스트림·음량·자막을 최종 검수합니다.",
      },
      {
        code: "G3",
        title: "사용자 최종 검수",
        body: "게이트와 최종 검수를 모두 통과할 때만 납품 파일이 만들어집니다.",
        gate: "최종 게이트",
      },
      {
        code: "S11",
        title: "출력 · 이력",
        body: "final/*.mp4·srt·delivery.json과 영수증을 남깁니다.",
      },
    ],
  },
  metrics: {
    kicker: "02 — library",
    title: "콘셉트는 377개, 판단은 규칙으로.",
    note: "감으로 고르지 않습니다. 적합성 규칙 16개와 연출 규칙 팩 14개가 조합을 걸러 내고, 여섯 기준이 점수를 매깁니다.",
    items: [
      { value: 18, suffix: "축", label: "콘셉트 라이브러리 축" },
      { value: 377, suffix: "항목", label: "형식·장르·연출·서사 항목" },
      { value: 16, suffix: "규칙", label: "적합성 규칙 + 연출 팩 14" },
      { value: 6, suffix: "기준", label: "hook·feasibility·emotion 등 6개 평가 기준" },
      { value: 51, suffix: "통과", label: "오프라인 테스트 (실호출 2건 제외)" },
    ],
  },
  terminal: {
    kicker: "03 — terminal",
    title: "한 번 부르면, 다음 단계까지 알아서 이어집니다.",
    note: "상태는 progress.json 하나로 공유됩니다. 다른 에이전트도 감독 프로세스도 같은 스냅샷을 읽고, 각 단계는 증거 파일이 있을 때만 complete가 됩니다.",
    cta: "승인 규칙 보기",
    barTitle: "cineforge — bash",
    state: "idle",
    lines: [
      { kind: "cmd", text: 'cineforge new "60초 코미디 숏드라마, 연출은 시네마틱 실사"' },
      { kind: "out", text: "판단 요소 9개 확인 · 요청문에 없는 항목: 목소리" },
      {
        kind: "dim",
        text: "? 목소리 — 추천: 30대 여성, 건조한 톤      ! 나머지 맡기기",
      },
      { kind: "ok", text: "✓ S00 접수·분석 → S02 조합·적합성·평가 완료" },
      { kind: "gate", text: "G1 기획안 검수 대기 — 사람 확인 전 진행 없음" },
      { kind: "cmd", text: "cineforge authorize shorts-01 --spend-ceiling 20USD" },
      {
        kind: "dim",
        text: "터미널에 APPROVE 입력 · 기간 2시간 · 만료 시 execution_expired",
      },
      { kind: "ok", text: "✓ execution 승인 — S08 생성 단계 인계 가능" },
      { kind: "cmd", text: "cineforge deliver shorts-01" },
      {
        kind: "out",
        text: "final/shorts-01.mp4 · .srt · delivery.json (skills 핀 기록)",
      },
    ],
  },
  gate: {
    kicker: "04 — approval",
    statement: {
      before: "비용은 ",
      em: "사람의 허락",
      after: " 뒤에만 발생합니다.",
    },
    steps: [
      {
        label: "요청",
        value: "route · authorize",
        note: "제작 요청은 먼저 판정을 거칩니다. 어떤 스킬로 넘길지, 어떤 비용 한도가 필요한지 이 단계에서 정해집니다.",
      },
      {
        label: "승인",
        value: "대화형 터미널에서 APPROVE",
        note: "에이전트는 스스로 승인할 수 없습니다. 2시간이 지나면 execution_expired로 다시 막힙니다.",
      },
      {
        label: "실행",
        value: "S08 생성 → 스킬 인계",
        note: "승인 뒤에만 생성 잡이 열립니다. 불명 작업은 자동 재시도하지 않고 영수증에 SHA-256을 남깁니다.",
      },
    ],
    typing: "APPROVE",
    checks: [
      { label: "spend ceiling", value: "20USD" },
      { label: "providers", value: "suno, elevenlabs" },
      { label: "window", value: "2h" },
      { label: "gate", value: "verified only" },
    ],
    footnote: {
      before: "verify 승격도 터미널에서 ",
      mono: "VERIFY",
      after: "를 입력해야 기록됩니다. 키와 OAuth는 CineForge가 대신 로그인하지 않습니다.",
    },
  },
  sound: {
    kicker: "05 — sound",
    title: "한 화면에 한 겹. 소리도 규칙으로 정합니다.",
    note: "사운드 설계는 대본·콘티와 같은 plan.json에서 계산됩니다. OST는 배경음이 아니라 드라마 주제의 회수 장치입니다.",
    columns: ["순간", "레이어", "담당", "규칙"],
    layers: [
      {
        when: "오프닝 훅 · 엔딩",
        what: "OST",
        who: "Suno · 보컬",
        rule: "씬 하나에 한 번, 최대 12초. 같은 선율을 엔딩에서 회수합니다.",
      },
      {
        when: "대사 아래",
        what: "BGM",
        who: "Suno · 무보컬",
        rule: "OST와 같은 구간에 겹치지 않음. 대사 구간 -20 dB.",
      },
      {
        when: "장소 전환 · 호흡",
        what: "AMBIENCE",
        who: "ElevenLabs",
        rule: "씬 전체에 깔되 -28 LUFS, 루프로 유지합니다.",
      },
      {
        when: "행동 · 소품 · 타격",
        what: "SFX",
        who: "ElevenLabs",
        rule: "컷의 sound가 동작을 지시할 때만 단발로 넣습니다.",
      },
      {
        when: "인물의 말",
        what: "DIALOGUE",
        who: "Fish Audio",
        rule: "무대사 제약이면 생성하지 않습니다.",
      },
      {
        when: "의도적 정적",
        what: "SILENCE",
        who: "—",
        rule: "감정 전환·반전 직전. 다른 레이어를 끄고 만듭니다.",
      },
    ],
  },
  closing: {
    line1: "다음 영상은,",
    line2: "한 번의 선택으로.",
    install: "install",
    noteBefore: "저장소는 ",
    noteStrong: "공개",
    noteAfter:
      "되어 있습니다. 문서와 설치 안내도 그대로 들어 있습니다. Python 3.10+ · 의존성 PyYAML 하나.",
    ctaPrimary: "GitHub에서 보기",
    ctaSecondary: "파이프라인 다시 보기",
  },
  footer: {
    copyright: "© 2026 CineForge · 대화형 AI 영상 제작 오케스트레이터",
    links: [
      { href: "#top", label: "위로" },
      { href: "#pipeline", label: "파이프라인" },
      { href: "#gate", label: "승인" },
    ],
    access: "GitHub 저장소",
    navLabel: "바깥 링크",
  },
};

export type Dict = typeof ko;
