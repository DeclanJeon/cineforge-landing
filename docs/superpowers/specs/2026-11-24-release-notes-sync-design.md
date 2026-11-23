# 개발노트·스킬팩 배포 동기화 설계

작성일: 2026-11-24 · 대상 저장소 3개:
`DeclanJeon/cineforge`(CLI), `DeclanJeon/contents-production-skills`(스킬팩), `DeclanJeon/cineforge-landing`(랜딩)

## 1. 의도

CineForge와 스킬팩이 업데이트될 때마다 사용자가 **무엇이 바뀌었는지, 어떻게 쓰는지, 무엇이 들어 있는지**를
랜딩 한곳에서 확인하고 스킬팩을 내려받을 수 있어야 한다. 사람이 랜딩을 손으로 고치지 않아도
정식 릴리스가 나오면 랜딩에 반영돼야 한다.

## 2. 목표 / 비목표 / 실패 기준

목표
- CineForge 버전별 개발노트(사용자 관점)를 랜딩에 표시한다.
- 스킬팩 버전별 개발노트와 검증된 다운로드(아카이브 + SHA-256)를 랜딩에 표시한다.
- 사용 가이드(설치·첫 프로젝트), 제작 워크플로, 내장 기능 목록을 랜딩에 표시한다.
- 두 저장소에서 정식 릴리스를 발행하면 랜딩이 자동으로 다시 빌드·배포된다.
- CineForge에 사용자가 명시적으로 실행하는 스킬팩 업데이트 명령을 둔다.

비목표
- 랜딩의 실시간 GitHub API 호출, 커밋 단위 동기화, `Unreleased` 내용 공개.
- CineForge가 백그라운드에서 스킬팩을 자동 설치·교체하는 기능.
- 기존 프로젝트의 스킬팩 고정(pin)을 바꾸는 마이그레이션.

실패로 간주하는 경우(기술적으로 동작해도)
- 출시되지 않은 변경, 내부 QA 기록·경로·토큰이 랜딩에 노출된다.
- 다운로드 링크가 체크섬 없는 `main` 브랜치 ZIP을 가리킨다.
- 업데이트 명령이 진행 중인 프로젝트의 팩을 바꾼다.
- 동기화 실패 시 랜딩 빌드가 깨지거나 빈 개발노트로 배포된다.

## 3. 현재 상태(조사 결과)

- 랜딩: Vite + React 19 + i18next(ko 기본 `/`, en `/en/`), 섹션 컴포넌트 `src/components/*`,
  사전 `src/i18n/ko.ts`(타입 원본)·`en.ts`. `main` push 시 `deploy.yml`이 Cloudflare Pages(`cineforge`)로 배포.
  `sync-stats.yml`이 `repository_dispatch: stats-updated`·cron으로 `src/data/stats.json`을 커밋하는 선례가 있다.
- CineForge: `0.1.5`, 태그 v0.1.1–v0.1.5. GitHub 릴리스는 v0.1.1/v0.1.2/v0.1.4만 있고 **v0.1.5 릴리스 없음**.
  `CHANGELOG.md` 없음, `.github/workflows` 없음. `cineforge skills [--root]`는 진단만 한다.
  팩 탐색 순서: `CINEFORGE_SKILL_PACK` → `~/.codex/skills`, `~/.pi/agent/skills`, `~/.agents/skills`.
  프로젝트는 생성 시 팩(이름·버전·manifest/inventory sha256)을 고정하고 `discover(expected=...)`로 같은 팩을 요구한다.
- 스킬팩: `manifest.json` 2.63(로컬), GitHub 최신 릴리스 **v2.64**에 `contents-production-skills-2.64.tar.gz`와
  `.sha256`이 첨부돼 있다. `CHANGELOG.md`는 개발자용으로 길고 증거·경로가 많다. `USAGE_GUIDE.md`, `ci.yml`이 있다.

## 4. 접근 방식

| 방식 | 내용 | 판단 |
|---|---|---|
| **A. GitHub 릴리스 기준 + 빌드 시 동기화** | 릴리스 발행 → 랜딩에 dispatch → 릴리스 본문·첨부를 JSON으로 스냅샷 → 커밋 → 기존 배포 | **선택.** 정식 릴리스만 공개, 기존 stats 동기화·배포 재사용 |
| B. 각 저장소 `CHANGELOG.md` 파싱 | 커밋마다 파싱 | 제외: 개발자 기록·미출시 내용 노출 위험 |
| C. 브라우저에서 GitHub API 실시간 호출 | | 제외: 호출 한도·장애·SEO·속도 |

사용자 결정: A 방식, 그리고 "랜딩은 자동 반영, 로컬 스킬팩은 사용자가 명시적으로 업데이트".

## 5. 설계

### 5.1 단일 원본: 릴리스 노트 형식

각 GitHub 릴리스 본문이 랜딩 개발노트의 원본이다. 본문은 다음 구획을 가진다(마크다운 제목 고정).

```
## 요약
한두 문장.
## 새 기능
- ...
## 개선
- ...
## 수정
- ...
## 호환성
- 필요한 CineForge / 스킬팩 버전, 기존 프로젝트 영향
## Summary / New / Improved / Fixed / Compatibility   (영문, 같은 순서)
```

- 한국어 구획과 영문 구획이 모두 있으면 각 언어 페이지에 해당 언어를 쓴다. 한쪽만 있으면 그 언어로 양쪽에 표시하고 `원문 언어` 표시를 붙인다.
- 형식에 맞지 않는 과거 릴리스(v0.1.1, v0.1.2, v0.1.4, v2.64)는 본문 전체를 `요약`으로 취급한다(빌더가 과거 릴리스 본문을 손으로 새 형식으로 편집해도 된다).
- 각 저장소에 `.github/RELEASE_TEMPLATE.md`와 `docs/release-notes.md`(작성 규칙: 사용자 관점, 내부 경로·QA 기록·토큰 금지)를 둔다.
- CineForge에 사용자용 `CHANGELOG.md`를 새로 만들고 v0.1.1–v0.1.5를 태그·커밋·기존 릴리스 본문으로 채운다. 스킬팩 `CHANGELOG.md`는 개발 기록으로 유지한다.

### 5.2 발행 측 워크플로 (cineforge, contents-production-skills)

`.github/workflows/release.yml`, 트리거 `push: tags: ['v*']`.

- 버전 검증: CineForge는 태그 = `pyproject.toml` version, 스킬팩은 태그 = `manifest.json` version(`scripts/check_versions.py` 재사용). 불일치면 실패.
- 테스트 실행 후 산출물 생성:
  - CineForge: wheel + sdist.
  - 스킬팩: `scripts/install_package.py`로 임시 루트에 설치한 결과를 `contents-production-skills-<ver>.tar.gz`로 묶고 `.sha256` 생성(v2.64 첨부물과 같은 이름·구조).
- 릴리스 본문은 `docs/release-notes/<ver>.md`에서 읽어 `gh release create`로 발행. 파일이 없으면 실패(빈 노트 발행 금지).
- 마지막 단계에서 `cineforge-landing`에 `repository_dispatch` `release-published`를 보낸다. 토큰: 각 저장소 시크릿 `LANDING_DISPATCH_TOKEN`(랜딩 저장소 Contents 쓰기 권한의 fine-grained PAT). 시크릿이 없으면 경고만 하고 성공 처리(랜딩 cron이 보완).

### 5.3 랜딩 동기화 (cineforge-landing)

`.github/workflows/sync-releases.yml`: `repository_dispatch: release-published`, 매일 cron, `workflow_dispatch`.

`.github/scripts/sync-releases.mjs`가 두 저장소의 GitHub Releases API(draft·prerelease 제외, 최대 30개)를 읽어
`src/data/releases.json`을 쓴다.

```ts
type Release = {
  product: "cineforge" | "skills";
  version: string;          // "0.1.5" (v 제거)
  date: string;             // published_at ISO
  url: string;              // 릴리스 페이지
  notes: { ko?: Notes; en?: Notes; source: "ko" | "en" };
  assets: { name: string; url: string; size: number; sha256?: string }[];
  compat?: string;          // 호환성 구획 원문
};
type Notes = { summary: string; added: string[]; improved: string[]; fixed: string[] };
type ReleasesFile = { updatedAt: string; cineforge: Release[]; skills: Release[] };
```

- 스킬팩 `sha256`은 `.sha256` 첨부물을 내려받아 채운다. 내려받기 실패 시 해당 릴리스에 다운로드 버튼을 표시하지 않는다.
- 노트 텍스트는 마크다운 인라인(코드·굵게·링크)만 허용하고 HTML은 제거한다.
- 레이트 리밋·네트워크 실패 시 기존 `releases.json`을 유지하고 종료 코드 0(`sync-stats.mjs`와 같은 방침). 응답이 비어 있으면 덮어쓰지 않는다.
- 변경이 있을 때만 커밋 → `main` push → 기존 `deploy.yml`이 배포. 워크플로가 만든 push는 다른 워크플로를 트리거하지 않으므로 동기화 워크플로 안에서 `gh workflow run deploy.yml`을 호출한다(`actions: write` 권한).
- 최초 `releases.json`은 스크립트를 로컬에서 실행해 커밋한다.

### 5.4 랜딩 화면

기존 단일 페이지 흐름에 섹션을 추가하고, 개발노트는 별도 페이지로 둔다.

```
[기존 Hero … Sound]
[Features  내장 기능]      CLI 기능 6–8개 + 스킬팩 스킬 그룹(기획/카메라/3D/생성/오디오/기록)
[Workflow  제작 워크플로]  route → 기획·스토리보드 → 실행계획 승인 → 생성·편집 → 검수(verify) → 납품
[Guide     시작하기]       1 설치 2 스킬팩 설치 3 첫 프로젝트 4 업데이트 — 복사 가능한 명령 블록
[Downloads 스킬팩]         최신 버전·날짜·크기·SHA-256·다운로드·검증 명령, 호환 CineForge 버전
[Changelog 미리보기]       두 제품 최신 3개씩 → "전체 개발노트" 링크
[Closing]
```

- 전체 개발노트: `/changelog/`(ko), `/en/changelog/`(en). 기존 `/en/` 방식처럼 별도 `index.html` 엔트리를 Vite 입력에 추가. 제품 탭(CineForge / 스킬팩), 버전 앵커(`#cineforge-0.1.5`), 새 기능·개선·수정 배지.
- 기능·워크플로·가이드 문구는 `ko.ts`/`en.ts`에 정적으로 작성한다(릴리스마다 바뀌지 않음). 스킬 그룹 목록은 스킬팩 `manifest.json`을 기준으로 작성.
- 내비게이션(Chrome)에 기능·시작하기·다운로드·개발노트 항목 추가. `sitemap.xml`에 changelog 페이지 추가.
- 기존 디자인 토큰·컴포넌트(`SectionHead`, `Icons`)·GSAP 사용 방식을 따른다. 모션은 기존 수준 이하.

### 5.5 CineForge 스킬팩 업데이트 명령

```
cineforge skills update [--version X.Y] [--check] [--yes]
cineforge skills use <version>
cineforge skills list
```

- `update`: GitHub Releases에서 최신(또는 지정) 스킬팩 릴리스를 조회해 현재 활성 버전과 비교하고 변경 요약을 보여 준다. `--check`면 조회만. 설치는 확인 프롬프트 또는 `--yes`가 있어야 진행.
- 설치: 아카이브와 `.sha256` 다운로드 → 해시 검증(불일치 시 중단, 파일 삭제) → `~/.local/share/cineforge/skill-packs/<version>/`에 안전하게 압축 해제(경로 탈출 차단) → `read_manifest`로 CineForge 계약 확인 → 활성 포인터 `~/.config/cineforge/skill-pack.json`(`{version, root}`) 갱신. 기존 버전 디렉터리는 지우지 않는다.
- 탐색 순서 변경: `CINEFORGE_SKILL_PACK` → 활성 포인터 → 기존 기본 루트. 고정된 팩을 찾는 경우(`expected` 지정)에는 `skill-packs/*` 하위 전체도 후보에 넣어, 활성 버전이 바뀌어도 기존 프로젝트가 고정 버전을 계속 찾게 한다.
- 새 프로젝트만 활성 버전을 고정한다. 기존 프로젝트의 pin은 바꾸지 않는다(현행 동작 유지).
- CineForge 자체 업데이트 확인: `cineforge --version` 출력 옆에 알림하지 않는다(비목표). 가이드에는 CineForge README의 설치·업그레이드 방법(릴리스 wheel)을 그대로 안내.
- 네트워크는 이 명령에서만 사용. 테스트는 HTTP를 모킹한다.

## 6. 제약

- 시크릿·토큰은 워크플로 시크릿에만. 랜딩 산출물에 토큰·내부 경로 금지.
- 릴리스 발행과 기존 릴리스 본문 수정은 외부 공개 행위이므로, 실제 발행·편집(v0.1.5 릴리스 생성, 과거 본문 재작성, PAT 생성·등록)은 사용자 승인 후 진행한다. 코드와 워크플로는 승인 전에도 작성·로컬 검증할 수 있다.
- 스킬팩 저장소의 기존 미커밋 변경과 origin과의 분기(ahead 2 / behind 1)는 건드리지 않는다. 작업은 별도 브랜치·worktree에서 한다.

## 7. 검증

- 동기화 스크립트: 고정 API 응답 픽스처로 파싱(새 형식·과거 형식·한 언어만), 레이트 리밋 시 파일 유지, HTML 제거, sha256 첨부 누락 시 다운로드 미표시 테스트.
- 랜딩: `npm run build`, `npm run lint`, 360/768/1280 및 ko/en에서 새 섹션·changelog 페이지 스크린샷과 axe 검사(기존 devDependency 사용).
- 발행 워크플로: 태그·버전 불일치 실패, 노트 파일 누락 실패를 로컬 스크립트 테스트로 확인. 실제 발행은 승인 후 한 번 실행해 랜딩 반영까지 확인.
- CineForge: 해시 불일치 중단, 경로 탈출 아카이브 거부, `--check` 무변경, 활성 버전 변경 후 기존 프로젝트가 고정 팩을 찾는지, `pytest` 전체 통과.

## 8. 빌더 재량으로 남긴 것

- 섹션 세부 시각 디자인과 카피(기존 랜딩 톤 유지).
- 마크다운 인라인 렌더러 구현(의존성 추가 없이 작게).
- 과거 릴리스를 새 노트 형식으로 다시 써서 발행할지 여부는 승인 후 판단(기본: 표시만 하고 원본 유지).
