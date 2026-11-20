# CineForge Landing

[CineForge](https://github.com/DeclanJeon)를 소개하는 원페이지 사이트입니다. GSAP 기반
모션그래픽과 한국어/영어 이중 언어를 지원하고, Cloudflare Pages에 정적 배포합니다.

- 한국어: `/`
- English: `/en/`

## 스택

- **Vite 8 + React 19 + TypeScript**
- **GSAP 3.15** — `useGSAP`, `ScrollTrigger`, `SplitText`
- **i18next + react-i18next** — 경로 기반 언어 분기(`/`, `/en/`)
- 폰트: **Gasoek One**(포스터) · **Pretendard Variable**(본문) · **Archivo** · **JetBrains Mono**
- 배포: **Cloudflare Pages**, 분석: **Cloudflare Web Analytics**(쿠키 없음)

## 실행

```bash
npm install
npm run dev      # http://localhost:5173  (영어는 /en/)
npm run build    # dist/ — /와 /en/ 두 개의 HTML
npm run preview
npm run lint     # oxlint
```

## i18n

| 경로 | 파일 | 언어 |
| --- | --- | --- |
| `/` | `index.html` | 한국어 (`lang="ko"`) |
| `/en/` | `en/index.html` | English (`lang="en"`) |

- 문안은 `src/i18n/ko.ts`가 원본이고, `src/i18n/en.ts`는 `Dict` 타입으로 묶여 있어
  번역이 빠지면 **빌드가 실패**합니다.
- 컴포넌트는 `const d = useDict()`로 현재 언어의 사전을 통째로 받습니다.
  `d.hero.lede`, `d.pipeline.stages`처럼 바로 읽습니다.
- 언어 전환은 `<a href="/en/">` 실제 링크입니다. 새 문서를 로드하므로 GSAP 타임라인과
  ScrollTrigger가 항상 깨끗한 상태에서 다시 만들어집니다.
- 언어별 `<title>`·description·OG·canonical·hreflang은 각 HTML 파일에 정적으로 들어 있고,
  `applyDocumentMeta()`가 활성 언어에 맞춰 한 번 더 맞춰 줍니다.

번역을 추가할 때: `ko.ts`에 키를 추가 → `en.ts`에서 타입 오류가 나면 그 자리에서 채웁니다.

## 타이포그래피 / 레이아웃 규칙

`src/styles/base.css`의 토큰 하나로 스케일을 관리합니다. 컴포넌트에서 임의의
`font-size: clamp(...)`를 다시 만들지 마세요.

| 토큰 | 값(@1440) | 쓰임 |
| --- | --- | --- |
| `--fs-post` | 102px | 히어로·클로징 포스터 헤드라인 (Gasoek One) |
| `--fs-statement` | 51px | 승인 선언문 (Pretendard 800) |
| `--fs-h2` | 45px | 섹션 제목 |
| `--fs-h3` | 17px | 카드·스테이지 제목 |
| `--fs-body` | 16px | 본문 |
| `--fs-sm` | 14px | 보조 설명 |
| `--fs-mono` | 11px | 라벨·메타 (JetBrains Mono) |

- 그리드: `--maxw: 1280px` + `--gut: clamp(1.25rem, 4vw, 4.5rem)`. `.wrap`은
  `width: min(100% - 2 * var(--gut), var(--maxw))`로 중앙 정렬하고, 네비·히어로·섹션·푸터가
  같은 좌측 엣지를 공유합니다. 가로 스크롤 레일도 `--edge`로 같은 인셋을 씁니다.
- 섹션 세로 리듬은 `--sec: clamp(3.5rem, 6.5vw, 5.5rem)` 하나만 씁니다.
- 한국어는 `word-break: keep-all`(본문 전역)로 어절 단위 줄바꿈, 긴 라틴 토큰은
  `overflow-wrap: break-word`, 코드/터미널은 `overflow-wrap: anywhere`.

## 배포 (Cloudflare Pages)

- 프로젝트: `cineforge` (Direct Upload)
- 운영 URL: **https://cineforge-7ps.pages.dev** · 영어: **https://cineforge-7ps.pages.dev/en/**
- `cineforge.pages.dev`는 이미 다른 계정이 쓰고 있어서 하위 도메인이 `-7ps`로 붙었습니다.
  나중에 커스텀 도메인을 붙이면 `index.html` · `en/index.html` · `src/i18n/index.ts` ·
  `public/sitemap.xml` · `public/robots.txt`의 도메인을 함께 바꾸세요.

### 로컬에서 배포

```bash
npx wrangler login     # 브라우저 승인 (1회)
npm run deploy         # build + pages deploy dist
```

### GitHub Actions 자동 배포

`.github/workflows/deploy.yml`이 `main` 푸시마다 배포합니다. 아래 두 개가 있어야 동작하고,
없으면 워크플로가 조용히 건너뜁니다.

| 이름 | 종류 | 값 |
| --- | --- | --- |
| `CLOUDFLARE_API_TOKEN` | secret | Cloudflare Pages:Edit 권한 토큰 |
| `CLOUDFLARE_ACCOUNT_ID` | secret | `e84d5ee27e7b7e8fe46cb794c99a33fe` |
| `VITE_CF_BEACON` | variable | Web Analytics 토큰 (선택) |

저장소 수치 동기화 워크플로가 `src/data/stats.json`을 커밋하면 이 배포가 이어서 실행됩니다.

SPA 라우팅이 필요 없습니다. `/`와 `/en/`은 각각 실제 HTML 파일이라 새로고침·공유가 안전합니다.

## 방문자 집계

Cloudflare Web Analytics(쿠키·배너 없음)를 씁니다. `cineforge-7ps.pages.dev` 사이트는 이미
등록되어 있고, beacon 토큰은 아래 두 곳에 들어 있습니다.

| 위치 | 값 |
| --- | --- |
| `.env.local` (gitignore) | `VITE_CF_BEACON=...` — 로컬 `npm run deploy`용 |
| GitHub repo variable `VITE_CF_BEACON` | Actions 배포용 |

- `src/lib/analytics.ts`가 토큰이 있을 때만 beacon을 주입합니다. 없으면 아무 것도 하지 않습니다.
- 방문자·페이지뷰·국가·경로(`/`, `/en/`)는 Cloudflare 대시보드 → Web Analytics에서 봅니다.
  사이트 목록: `cf rum site-info list`.
- 페이지 안에 숫자를 노출하지는 않습니다 — 공개 조회 API가 없고, 방문자에게 내부 지표를
  보여줄 이유도 없습니다.

## 저장소 수치 동기화 (별·포크·트래픽)

`.github/workflows/sync-stats.yml`이 매일 03:17 UTC(그리고 수동 실행·`repository_dispatch`)에
`src/data/stats.json`을 갱신합니다. 갱신되면 커밋 → Pages 재배포 → 히어로 메타에 `★ N` 표시.

1. **별·포크·워처·이슈 수는 secret 없이도 동작합니다** — 저장소가 공개라 익명 API로 충분합니다.
2. `STATS_TOKEN`(PAT, `repo` 읽기)은 **선택**입니다. 넣으면 트래픽(`views14d`/`clones14d`)까지
   채워지고, 없으면 그 두 값만 0으로 남습니다.
3. 별이 붙은 즉시(수 분 내) 반영하고 싶다면 CineForge 쪽에서 이 저장소로
   `repository_dispatch`(`event_type: stats-updated`)를 보내면 됩니다.

`★` 칩은 항상 렌더됩니다(0이어도 표시). 사이트는 빌드에 박힌 값을 먼저 그리고,
`src/lib/stats.ts`의 `useRepoStats()`가 공개 GitHub API(`/repos/DeclanJeon/cineforge`)를
호출해 실제 값으로 덮어씁니다.

- 방문자가 별을 누르면 **다음 방문(또는 탭 복귀)에서 바로** 반영됩니다. 재배포 불필요.
- 응답은 `sessionStorage`에 1분 캐시 → 비인증 API 한도(시간당 60회/IP)를 아낍니다.
- API가 막히면 빌드에 박힌 값이 그대로 남습니다(크롤러·JS 없는 방문자 포함).

## CTA 정책

CineForge 저장소는 **공개**입니다. 그래서 외부 링크는 전부 저장소
(`https://github.com/DeclanJeon/cineforge`) 하나만 가리킵니다 — 내비 "저장소",
마무리 주 CTA "GitHub에서 보기", 푸터 "GitHub 저장소", 히어로의 `★ N` 칩.
URL은 `Chrome.tsx`·`Closing.tsx`의 `REPO`, 칩은 `src/lib/stats.ts`의 `repoUrl`에 있습니다.

## 동작 원칙

- **`prefers-reduced-motion` 존중**: 모든 주요 모션은 `gsap.matchMedia()` 분기로 최종 상태를
  즉시 렌더합니다.
- **`useGSAP` + scope**: 언마운트 시 `ctx.revert()`로 애니메이션·ScrollTrigger·SplitText 정리.
- **`document.fonts.ready.then(ScrollTrigger.refresh)`**: 폰트 로드 후 트리거 위치 재계산.
- SplitText는 `autoSplit` + `onSplit`으로 리사이즈·폰트 로드에 재분할됩니다.
- 해시 딥링크(`/#pipeline`)는 마운트 후 `ScrollTrigger.refresh()` 뒤에 복원합니다.

## 구조

```
src/
  i18n/          ko.ts(원본) · en.ts(번역) · index.ts(초기화·경로·메타)
  lib/gsap.ts    플러그인 1회 등록 + re-export
  lib/stats.ts   빌드 시점 저장소 수치
  lib/analytics.ts  Cloudflare beacon 주입
  data/stats.json   sync-stats 워크플로가 갱신
  components/    Chrome · Hero · Judgment · Pipeline · Metrics · Terminal · Gate · Sound · Closing
  styles/        base · hero · sections · sections-b
en/index.html    영어 문서 (lang="en", 영어 메타)
.github/         sync-stats 워크플로와 스크립트
```

## 접근성 / 품질

- 시맨틱 헤딩(h1→h2→h3), 건너뛰기 링크, `:focus-visible` 링, 언어 전환 링크에 `hrefLang`.
- 본문 대비는 `--paper-dim #d6d0c4` / `--muted #a7adb4` / `--faint #8a9199`(6:1+).
- 1440·1024·768·390에서 가로 오버플로 0, 두 언어 모두 콘솔 에러 0으로 확인했습니다.

## 라이선스

[MIT](LICENSE) © 2026 Declan Jeon
