# Release Notes & Skill Pack Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** GitHub 릴리스를 원본으로 CineForge·스킬팩 개발노트와 스킬팩 다운로드를 랜딩에 자동 반영하고, CineForge에 명시적 스킬팩 업데이트 명령을 추가한다.

**Architecture:** 세 저장소, 세 파트. (A) 스킬팩·CineForge에 릴리스 노트 파일 + 태그 기반 `release.yml`(검증 → 산출물 → `gh release create` → 랜딩 dispatch). (B) 랜딩에 `sync-releases.mjs`가 Releases API를 `src/data/releases.json`으로 스냅샷하고, 새 섹션과 `/changelog/` 페이지가 그 JSON을 렌더. (C) CineForge `skills update/use/list`가 체크섬 검증 후 버전별 디렉터리에 설치하고 활성 포인터를 갱신.

**Tech Stack:** Python ≥3.10 표준 라이브러리 + pytest(CineForge, 스킬팩), Node 22 ESM + `node:test`(랜딩 스크립트), React 19 + Vite + i18next(랜딩), GitHub Actions + `gh`.

**Spec:** `docs/superpowers/specs/2026-11-24-release-notes-sync-design.md` (이 저장소)

## Global Constraints

- 저장소: CineForge `~/Documents/Projects/Products/01_Persnal_Work/cineforge`, 스킬팩 `~/Documents/Projects/Products/04_Skills/Skills-and-Automation/contents-production-skills`, 랜딩 `~/Documents/Projects/Products/01_Persnal_Work/cineforge-landing`.
- 스킬팩 작업은 `origin/main`(2.64)에서 만든 worktree `.worktrees/release-notes-sync`, 브랜치 `feat/release-notes-sync`에서만 한다. 기존 미커밋 변경·로컬 main 분기를 건드리지 않는다. CineForge도 브랜치 `feat/skill-pack-update`(미추적 파일 그대로 둠). 랜딩은 브랜치 `feat/release-notes-sync`.
- 릴리스 노트 구획 제목(고정): `## 요약`, `## 새 기능`, `## 개선`, `## 수정`, `## 호환성`, `## Summary`, `## New`, `## Improved`, `## Fixed`, `## Compatibility`.
- 스킬팩 첨부물 이름: `contents-production-skills-<ver>.tar.gz`, `contents-production-skills-<ver>.sha256`(내용 `<hex>  <tarname>`), 아카이브 최상위 디렉터리 `contents-production-skills-<ver>/`.
- dispatch 이벤트 타입 `release-published`, 발행 측 시크릿 `LANDING_DISPATCH_TOKEN`(없으면 경고 후 성공).
- 랜딩 데이터 파일 `src/data/releases.json`, 타입은 스펙 §5.3의 `Release`/`Notes`/`ReleasesFile` 그대로.
- CineForge 설치 위치 `~/.local/share/cineforge/skill-packs/<version>/`(`XDG_DATA_HOME` 우선), 활성 포인터 `~/.config/cineforge/skill-pack.json` = `{"version": str, "root": str}`(`XDG_CONFIG_HOME` 우선). 기존 버전 디렉터리 삭제 금지, 기존 프로젝트 pin 변경 금지.
- 탐색 순서: `CINEFORGE_SKILL_PACK` → 활성 포인터 → 기존 `DEFAULT_ROOTS`; `expected` 지정 시 `skill-packs/*`도 후보.
- 새 런타임 의존성 금지(랜딩 마크다운 렌더러, CineForge HTTP 모두 표준 기능으로).
- 외부 공개 행위(태그 push, 릴리스 발행·편집, PAT 생성·등록, `main` push로 인한 배포)는 Task 9에서 사용자 승인 후에만.

## Review Focus

- 과거 형식 릴리스 본문(구획 없음, 마크다운 표·HTML 포함) → 전체가 `summary`로 들어가고 HTML은 제거된다. (Task 3 `parses legacy body`)
- GitHub 403/429/5xx 또는 빈 배열 응답 → 기존 `releases.json` 그대로, 종료 코드 0. (Task 3 `keeps file on rate limit`, `keeps file on empty`)
- 악성/손상 아카이브(`../` 경로, 절대경로, 심볼릭 링크, 해시 불일치) → 아무것도 설치되지 않고 다운로드 임시파일 삭제. (Task 7)
- 활성 버전을 바꾼 뒤 기존 프로젝트 재개 → 고정된 옛 버전 팩을 `skill-packs/*`에서 찾는다. (Task 8 `pinned project finds old version`)
- 오프라인에서 `cineforge skills update --check` → 네트워크 오류 메시지와 종료 코드 1, 설정 파일 무변경. (Task 7 `network failure leaves state`)

---

## Part A — 발행 측

### Task 1: 스킬팩 릴리스 아카이브·노트·워크플로

**Files:**
- Create: `scripts/build_release.py`, `scripts/test_build_release.py`, `docs/release-notes.md`, `docs/release-notes/2.64.md`, `.github/RELEASE_TEMPLATE.md`, `.github/workflows/release.yml`
- Modify: `README.md`(설치 및 업데이트 절에 릴리스 다운로드·`cineforge skills update` 안내 2–4줄)

**Interfaces:**
- Produces: `build_release(repo_root: Path, out_dir: Path) -> tuple[Path, Path]` (tar.gz, sha256 경로); CLI `python scripts/build_release.py --out DIR [--tag vX.Y]` — `--tag`가 `manifest.json` version과 다르면 exit 2. `--notes` 검사: `docs/release-notes/<ver>.md`가 없거나 `## 요약` 또는 `## Summary`가 없으면 exit 3.

- [ ] **Step 1: worktree 생성** — `git -C <스킬팩> worktree add .worktrees/release-notes-sync -b feat/release-notes-sync origin/main`. Expected: `manifest.json` version `2.64`.
- [ ] **Step 2: 실패 테스트 작성** (`scripts/test_build_release.py`, `tmp_path` 사용)
  - `test_archive_layout`: 결과 tar의 모든 멤버가 `contents-production-skills-2.64/`로 시작, `contents-production-skills-2.64/manifest.json` 포함, manifest의 모든 skill에 대해 `<skill>/SKILL.md` 포함, `.git`/`qa/`/`.worktrees/` 미포함.
  - `test_sha256_file`: sha 파일 내용 == `f"{hashlib.sha256(tar).hexdigest()}  contents-production-skills-2.64.tar.gz\n"`.
  - `test_tag_mismatch_exit_2`, `test_missing_notes_exit_3`(notes 디렉터리를 임시 복사본에서 제거).
- [ ] **Step 3: 실행** `python -m pytest scripts/test_build_release.py -q` → FAIL(모듈 없음).
- [ ] **Step 4: 구현** — `install_package.install`(또는 `--skills-root` 서브프로세스)로 임시 루트에 설치한 뒤 그 루트를 `contents-production-skills-<ver>/` 접두로 `tarfile`(gzip, mtime 0, 정렬된 멤버 — 재현 가능)로 묶는다. v2.64 공개 아카이브와 멤버 목록이 같은지 Step 5에서 확인.
- [ ] **Step 5: 검증** — 테스트 PASS; `python scripts/build_release.py --out /tmp/cps && diff <(tar tzf /tmp/cps/*.tar.gz | sort) <(tar tzf /tmp/cps264/contents-production-skills-2.64.tar.gz | sort)` 차이 없음(공개 아카이브는 `gh release download v2.64 -R DeclanJeon/contents-production-skills -D /tmp/cps264`).
- [ ] **Step 6: 노트·템플릿** — `docs/release-notes.md`에 작성 규칙(사용자 관점, 고정 구획 제목, 내부 경로·QA 기록·토큰·미출시 내용 금지). `.github/RELEASE_TEMPLATE.md`는 고정 구획 빈 골격. `docs/release-notes/2.64.md`는 공개 v2.64 본문을 고정 구획으로 옮긴 것(ko+en).
- [ ] **Step 7: `release.yml`** — `on: push: tags: ['v*']`, `permissions: contents: write`. 단계: checkout → setup-python 3.12 → `pip install pytest Pillow "pydantic>=2,<3" typer` → `python scripts/check_versions.py` → `python -m pytest -q` → `python scripts/build_release.py --out dist --tag "$GITHUB_REF_NAME"` → `gh release create "$GITHUB_REF_NAME" dist/* --title "Contents Production Skills ${VER}" --notes-file docs/release-notes/${VER}.md` (VER = 태그에서 `v` 제거) → dispatch 단계: `LANDING_DISPATCH_TOKEN`이 있으면 `curl -fsS -X POST -H "Authorization: Bearer $TOKEN" https://api.github.com/repos/DeclanJeon/cineforge-landing/dispatches -d '{"event_type":"release-published","client_payload":{"product":"skills","version":"'$VER'"}}'`, 없으면 `echo "::warning::LANDING_DISPATCH_TOKEN not set"`.
- [ ] **Step 8: 정적 검증** — `actionlint .github/workflows/release.yml`(없으면 `python -c "import yaml;yaml.safe_load(open(...))"`) 통과, `python -m pytest -q` 전체 PASS.
- [ ] **Step 9: Commit** `git commit -m "Add reproducible release archive and release workflow"`

### Task 2: CineForge 변경 이력·노트·릴리스 워크플로

**Files:**
- Create: `CHANGELOG.md`, `docs/release-notes.md`, `docs/release-notes/0.1.1.md` … `0.1.5.md`(0.1.3 포함 5개), `.github/RELEASE_TEMPLATE.md`, `.github/workflows/release.yml`, `scripts/check_release.py`, `tests/test_release_files.py`

**Interfaces:**
- Produces: `python scripts/check_release.py <tag>` — 태그(`v` 제거) ≠ `pyproject.toml` version이면 exit 2, `docs/release-notes/<ver>.md` 없거나 `## 요약`/`## Summary` 없으면 exit 3, 아니면 0.

- [ ] **Step 1: 브랜치** `git switch -c feat/skill-pack-update` (미추적 파일은 그대로).
- [ ] **Step 2: 실패 테스트** `tests/test_release_files.py`
  - `test_every_tag_has_notes`: `git tag --list 'v*'`의 각 버전에 `docs/release-notes/<ver>.md` 존재하고 `## 요약`·`## Summary` 포함.
  - `test_changelog_lists_every_tag`: `CHANGELOG.md`에 각 태그 버전의 `## <ver>` 제목.
  - `test_check_release_exit_codes`: `v0.1.5` → 0, `v9.9.9` → 2, 노트 파일을 임시로 숨긴 복사 리포 → 3.
- [ ] **Step 3: 실행** `python -m pytest tests/test_release_files.py -q` → FAIL.
- [ ] **Step 4: 노트 작성** — 각 버전은 `git log --oneline vPREV..vX`와 기존 릴리스 본문(`gh release view`)에서 사용자 관점으로 작성, ko+en. `CHANGELOG.md`는 최신순으로 각 노트의 요약·새 기능 목록을 옮기고 노트 파일 링크.
- [ ] **Step 5: `check_release.py` 구현** (`tomllib`이 없는 3.10에서는 `version = "..."` 정규식).
- [ ] **Step 6: PASS 확인** 같은 명령.
- [ ] **Step 7: `release.yml`** — Task 1 Step 7과 같은 골격. 차이: `pip install -e '.[dev]' build` → `python scripts/check_release.py "$GITHUB_REF_NAME"` → `python -m pytest -q -m "not live"`(`test_live_openrouter.py`가 사용하는 마커/skip 조건을 확인해 맞춤) → `python -m build` → `gh release create ... dist/*.whl dist/*.tar.gz --title "CineForge v${VER}"` → dispatch payload `product: "cineforge"`.
- [ ] **Step 8: 정적 검증 + 전체 테스트** `python -m pytest -q` PASS(기존과 같은 skip 수).
- [ ] **Step 9: Commit** `git commit -m "Add changelog, release notes and release workflow"`

## Part B — 랜딩

### Task 3: 릴리스 동기화 스크립트

**Files:**
- Create: `.github/scripts/sync-releases.mjs`, `.github/scripts/release-notes.mjs`, `.github/scripts/release-notes.test.mjs`, `.github/scripts/fixtures/{cineforge,skills}-releases.json`, `src/data/releases.json`, `src/data/releases.ts`
- Modify: `package.json` (`"test": "node --test --experimental-strip-types .github/scripts/ src/lib/"`, `"sync:releases": "node .github/scripts/sync-releases.mjs"`)

**Interfaces:**
- Produces (`release-notes.mjs`): `parseNotes(body: string): { ko?: Notes; en?: Notes; source: "ko"|"en"; compat?: string }`; `stripHtml(s: string): string`; `toRelease(product, apiRelease, sha256ByAsset: Record<string,string>): Release`.
- Produces (`sync-releases.mjs`): `syncReleases({ fetch, readFile, writeFile, target }): Promise<"written"|"unchanged"|"kept">`, 파일로 실행 시 실제 `fetch` 사용. 저장소: `DeclanJeon/cineforge`, `DeclanJeon/contents-production-skills`, `per_page=30`, draft·prerelease 제외, 버전 내림차순.
- Produces (`src/data/releases.ts`): 스펙 §5.3 타입 export + `export const releases: ReleasesFile`(JSON import).

- [ ] **Step 1: 브랜치** `git switch -c feat/release-notes-sync`.
- [ ] **Step 2: 픽스처** — `gh api 'repos/DeclanJeon/cineforge/releases?per_page=30' > fixtures/cineforge-releases.json`, 스킬팩도 동일. 새 형식 본문 1개를 픽스처에 손으로 추가(`v9.0.0`, ko+en 구획, `<script>` 포함).
- [ ] **Step 3: 실패 테스트** (`release-notes.test.mjs`)
  - `parses sectioned body`: `v9.0.0` → `ko.added.length > 0`, `en.summary` 비어있지 않음, `source === "ko"`.
  - `parses legacy body`: `v0.1.4` 본문 → `ko`와 `en` 중 하나만, `summary` == 본문(HTML 제거) 전체, `added/improved/fixed` 빈 배열.
  - `strips html`: `stripHtml('a<script>x</script><b>b</b>') === 'ab'`.
  - `skills sha256 attached`: `toRelease("skills", v2.64, {"contents-production-skills-2.64.tar.gz": "6106d0b6…7217"})` → tar.gz asset에 그 sha256, `.sha256` 파일 자체는 assets에서 제외.
  - `drops download without sha`: sha 맵 비었으면 skills 릴리스의 `assets` 빈 배열.
  - `keeps file on rate limit`: 가짜 fetch가 403 → 반환 `"kept"`, writeFile 미호출.
  - `keeps file on empty`: 두 저장소 모두 `[]` → `"kept"`.
  - `unchanged when equal`: 같은 내용(updatedAt 제외 비교) → `"unchanged"`.
- [ ] **Step 4: 실행** `npm test` → FAIL.
- [ ] **Step 5: 구현** — 구획 분리는 `^## ` 줄 기준, 한국어 제목 → ko, 영어 제목 → en, 목록은 `^- ` 줄. 인라인 마크다운은 원문 유지(렌더는 Task 4). sha256은 `<name>.sha256` 첨부물의 `browser_download_url`을 fetch해 첫 토큰. 403/429/≥500/네트워크 예외 → `"kept"`.
- [ ] **Step 6: PASS 확인** `npm test`.
- [ ] **Step 7: 초기 데이터** `npm run sync:releases` → `src/data/releases.json` 생성, cineforge에 0.1.4, skills에 2.64(sha256 `6106d0b6…`) 포함 확인.
- [ ] **Step 8: Commit** `git commit -m "Add release notes sync script and initial snapshot"`

### Task 4: 개발노트 렌더 컴포넌트와 `/changelog/` 페이지

**Files:**
- Create: `src/lib/inline-md.tsx`, `src/components/ReleaseCard.tsx`, `src/components/ChangelogPreview.tsx`, `src/ChangelogPage.tsx`, `src/changelog-main.tsx`, `changelog/index.html`, `en/changelog/index.html`, `src/styles/changelog.css`
- Modify: `vite.config.ts`(input에 `changelog`, `enChangelog`), `src/i18n/index.ts`(`LANG_PATH`/`langFromPath`가 `/en/changelog/` → en, 경로 쌍 `CHANGELOG_PATH: Record<Lang,string> = { ko: "/changelog/", en: "/en/changelog/" }`), `src/i18n/ko.ts`·`en.ts`(`changelog` 키), `public/sitemap.xml`, `src/App.tsx`(Closing 앞 `<ChangelogPreview />`)

**Interfaces:**
- Consumes: `releases`, `Release` from `src/data/releases.ts`.
- Produces: `InlineMd({ text }: { text: string })` — 코드(`` ` ``), 굵게(`**`), 링크(`[t](https://…)`만, `rel="noopener noreferrer" target="_blank"`)만 렌더, 나머지는 텍스트; `ReleaseCard({ release, lang }: { release: Release; lang: Lang })` — id `${product}-${version}`, 날짜, 요약, 새 기능/개선/수정 목록(빈 목록 숨김), `source !== lang`이면 `원문 언어` 배지, GitHub 링크.

- [ ] **Step 1: 실패 테스트** — `.github/scripts/inline-md.test.mjs`는 쓸 수 없으므로(TSX) 대신 `src/lib/inline-md-tokens.ts`에 순수 함수 `tokenize(text): Token[]`를 두고 `src/lib/inline-md-tokens.test.ts`에서 `npm test`로 테스트: `` tokenize('a `b` **c** [d](https://e)') `` → 종류 `["text","code","text","bold","text","link"]`; `[x](javascript:alert(1))` → 단일 text 토큰. `InlineMd`는 `tokenize`를 렌더만 한다.
- [ ] **Step 2: 실행** → FAIL; **Step 3: 구현** → PASS.
- [ ] **Step 4: 페이지 구현** — `ChangelogPage`: 제품 탭(CineForge/스킬팩, `role="tablist"`, 해시 `#cineforge-0.1.5` 진입 시 해당 탭 선택 후 스크롤), 각 탭은 `ReleaseCard` 최신순. 상단에 `Chrome`, 하단에 기존 footer 재사용. 엔트리 HTML은 기존 `en/index.html`을 복제해 title/description/canonical만 바꿈. `ChangelogPreview`: 제품별 최신 3개 요약(버전·날짜·요약 한 줄) + `CHANGELOG_PATH[lang]` 링크.
- [ ] **Step 5: 빌드 검증** `npm run lint && npm run build` → `dist/changelog/index.html`, `dist/en/changelog/index.html` 존재.
- [ ] **Step 6: Commit** `git commit -m "Add changelog page and release preview"`

### Task 5: 기능·워크플로·시작하기·다운로드 섹션

**Files:**
- Create: `src/components/Features.tsx`, `src/components/Workflow.tsx`, `src/components/Guide.tsx`, `src/components/Downloads.tsx`, `src/components/CopyBlock.tsx`
- Modify: `src/App.tsx`(순서: …`Sound`, `Features`, `Workflow`, `Guide`, `Downloads`, `ChangelogPreview`, `Closing`), `src/i18n/ko.ts`·`en.ts`(`features`, `workflow`, `guide`, `downloads` 키, `nav.links`에 `#features` 기능, `#guide` 시작하기, `#downloads` 다운로드, `CHANGELOG_PATH` 개발노트), `src/styles/sections-b.css`

**Interfaces:**
- Consumes: `releases.skills[0]`, `releases.cineforge[0]`, `SectionHead`, `Icons`.
- Produces: `CopyBlock({ code, label }: { code: string; label: string })` — `<pre>` + 복사 버튼(`navigator.clipboard`, 실패 시 선택 상태로 둠, `aria-live="polite"` 상태 문구).

- [ ] **Step 1: 문구 작성** — 기능: CLI(route, 실행계획 승인, goal drive, 로컬 모션, 납품 게이트, verify, status, 스킬팩 pin) + 스킬 그룹 6개(기획·스토리, 카메라·공간, 3D·previs, 생성(Higgsfield), 오디오·음악, 기록·QA)를 스킬팩 `manifest.json` skills 목록에 맞게 배정. 워크플로 6단계: `cineforge route` → 기획·스토리보드 → `execution-plan` 승인(`authorize --approve-plan`) → 생성·편집 → `verify --attest` → 납품. 가이드 4단계 명령은 CineForge README "빠른 시작"·"스킬 연동"과 `cineforge skills update`(Task 7)를 그대로 사용 — 존재하지 않는 플래그 금지.
- [ ] **Step 2: Downloads** — 최신 스킬팩 버전·날짜·tar.gz 크기(MB, 소수 1자리)·SHA-256(앞 12자 + 전체 복사)·다운로드 버튼, 검증 명령 `CopyBlock`: `sha256sum -c contents-production-skills-<ver>.sha256`, 호환성 문구는 `release.compat`, 없으면 숨김. sha256 없으면 버튼 대신 GitHub 릴리스 링크.
- [ ] **Step 3: 검증** `npm run lint && npm run build` 성공; `ko.ts`가 타입 원본이므로 `en.ts` 누락 키는 빌드 실패로 잡힘.
- [ ] **Step 4: 시각 QA** — `npm run preview` 후 기존 `puppeteer-core`로 `/`, `/en/`, `/changelog/`, `/en/changelog/`를 360·768·1280에서 스크린샷(`/tmp/landing-qa/`), `axe-core` 위반 0(critical/serious). 스크린샷을 직접 열어 겹침·잘림 확인.
- [ ] **Step 5: Commit** `git commit -m "Add features, workflow, guide and downloads sections"`

### Task 6: 동기화 워크플로

**Files:**
- Create: `.github/workflows/sync-releases.yml`
- Modify: `.github/workflows/deploy.yml`(트리거 `workflow_dispatch` 유지 확인만), `README.md`(동기화 동작 3–5줄)

- [ ] **Step 1: 작성** — `on: repository_dispatch: types: [release-published]`, `schedule: cron "41 3 * * *"`, `workflow_dispatch`; `permissions: contents: write, actions: write`; `concurrency: sync-releases`. 단계: checkout → setup-node 22 → `npm ci` → `npm test` → `node .github/scripts/sync-releases.mjs` → `git status --porcelain src/data/releases.json`가 비면 종료 → bot 커밋 `chore(releases): sync release notes` → push → `gh workflow run deploy.yml --ref main`(env `GH_TOKEN: ${{ github.token }}`).
- [ ] **Step 2: 정적 검증** — actionlint(또는 YAML 파싱) 통과.
- [ ] **Step 3: Commit** `git commit -m "Sync release notes on release dispatch"`

## Part C — CineForge 업데이트 명령

### Task 7: 스킬팩 설치기

**Files:**
- Create: `cineforge/skill_store.py`, `tests/test_skill_store.py`

**Interfaces:**
- Produces:
  - `store_root() -> Path` (`$XDG_DATA_HOME/cineforge/skill-packs` 또는 `~/.local/share/cineforge/skill-packs`)
  - `pointer_path() -> Path` (`$XDG_CONFIG_HOME/cineforge/skill-pack.json` 또는 `~/.config/...`)
  - `read_pointer() -> dict | None`, `write_pointer(version: str, root: Path) -> None`(임시파일 후 `os.replace`)
  - `@dataclass ReleaseInfo(version: str, notes: str, archive_url: str, sha256_url: str, published: str)`
  - `fetch_release(version: str | None, *, opener=urllib.request.urlopen) -> ReleaseInfo` — `https://api.github.com/repos/DeclanJeon/contents-production-skills/releases/latest` 또는 `/tags/v<version>`; 첨부물 누락 → `SkillPackError('missing', ...)`, 네트워크 오류 → `SkillPackError('network', ...)`.
  - `install(info: ReleaseInfo, *, opener=...) -> Path` — 다운로드(임시 디렉터리) → sha256 비교(불일치 `SkillPackError('integrity', ...)`) → 멤버 검사(절대경로, `..`, 심볼릭/하드 링크, 접두 `contents-production-skills-<ver>/` 아닌 것 → `SkillPackError('unsafe', ...)`) → `store_root()/<ver>.partial`에 해제 → `read_manifest(root, 'manifest.json')` 성공 시 `<ver>`로 rename. 이미 있으면 재설치하지 않고 그 경로 반환. 실패 시 `.partial`·임시파일 삭제.
  - `installed_versions() -> list[str]`(버전 내림차순)

- [ ] **Step 1: 실패 테스트** (`tests/test_skill_store.py`, `monkeypatch`로 XDG 경로를 `tmp_path`에, `opener`는 바이트를 돌려주는 가짜; 정상 아카이브는 리포의 기존 팩 픽스처 또는 `tests/conftest.py`가 만드는 최소 v1 팩을 tar로 묶어 사용 — `test_skill_pack.py`의 팩 생성 헬퍼 재사용)
  - `test_install_verifies_and_extracts`: 반환 경로 == `store_root()/"2.64"`, `manifest.json` 존재.
  - `test_hash_mismatch_installs_nothing`: `SkillPackError` status `integrity`, `store_root()`에 항목 없음.
  - `test_rejects_path_traversal`, `test_rejects_symlink_member`, `test_rejects_absolute_member`: status `unsafe`, 설치 없음.
  - `test_network_failure_leaves_state`: opener가 `URLError` → status `network`, 포인터 파일 없음.
  - `test_pointer_roundtrip`: `write_pointer("2.64", p)` 후 `read_pointer() == {"version": "2.64", "root": str(p)}`.
- [ ] **Step 2: 실행** `python -m pytest tests/test_skill_store.py -q` → FAIL.
- [ ] **Step 3: 구현** — 위 인터페이스. `SkillPackError`의 status 값으로 `network`, `integrity`, `unsafe`를 추가(기존 status 문자열 사용 방식 확인 후).
- [ ] **Step 4: PASS 확인.**
- [ ] **Step 5: Commit** `git commit -m "Add verified skill pack store"`

### Task 8: 탐색 순서와 CLI 명령

**Files:**
- Modify: `cineforge/skills.py`(`discover`), `cineforge/cli.py`(`skills` 서브명령), `README.md`(스킬 연동 절), `tests/test_skill_pack.py`
- Create: `tests/test_skills_cli.py`

**Interfaces:**
- Consumes: Task 7 전체.
- Produces: CLI
  - `cineforge skills` / `cineforge skills check [--root]` — 기존 출력 그대로(하위 호환: 인자 없는 `cineforge skills`와 `--root` 유지).
  - `cineforge skills list` — JSON `{"active": str|null, "installed": [str]}`.
  - `cineforge skills update [--version X.Y] [--check] [--yes]` — 출력 JSON `{"current": str|null, "latest": str, "update_available": bool, "notes": str, "installed": str|null}`; `--check`는 조회만; 비대화·`--yes` 없음이면 설치하지 않고 exit 1과 안내; TTY면 `y/N` 확인. 설치 후 포인터 갱신.
  - `cineforge skills use <version>` — 설치돼 있지 않으면 exit 1, 있으면 포인터 갱신.

- [ ] **Step 1: 실패 테스트**
  - `test_skill_pack.py::test_pointer_precedes_default_roots`: 포인터가 가리키는 팩과 `~/.codex/skills`의 다른 버전 팩이 모두 있을 때 `discover()`가 포인터 쪽 반환; `CINEFORGE_SKILL_PACK` 설정 시 그쪽 우선.
  - `test_skill_pack.py::test_pinned_project_finds_old_version`: `store_root()`에 2.63·2.64 설치, 포인터 2.64, `discover(expected=<2.63 binding>)` → 2.63 경로.
  - `test_skills_cli.py::test_update_check_no_write`, `test_update_requires_yes_noninteractive`, `test_update_yes_installs_and_points`, `test_use_unknown_version_exit_1`, `test_bare_skills_command_unchanged`(기존 `cmd_skills` JSON 키 동일) — `fetch_release`/`install`은 monkeypatch.
- [ ] **Step 2: 실행** → FAIL.
- [ ] **Step 3: 구현** — `discover` 후보 = `(env,)` 또는 `(pointer_root, *DEFAULT_ROOTS)`; `expected`가 있으면 후보 뒤에 `store_root()/*` 추가. 활성 버전과 기존 루트가 같은 manifest 해시면 기존 중복 제거 로직(`setdefault`)이 처리하므로 `ambiguous`가 나지 않는지 테스트로 확인. 서브명령은 `skills`에 `add_subparsers(dest="skills_cmd")`, 미지정 시 check.
- [ ] **Step 4: 전체 테스트** `python -m pytest -q` PASS.
- [ ] **Step 5: 수동 확인** — 임시 HOME으로 `HOME=$(mktemp -d) cineforge skills update --check` → 실제 v2.64 조회 JSON, 파일 무변경; `--yes` → 설치·포인터 생성; `cineforge skills` → `status: ready`, version `2.64`.
- [ ] **Step 6: Commit** `git commit -m "Add explicit skill pack update, use and list commands"`

## Part D — 통합과 공개

### Task 9: 승인 후 공개와 종단 확인

- [ ] **Step 1: 사용자에게 승인 요청** — 아래를 한 번에 묻는다: (1) 세 브랜치를 각 `main`에 병합·push(랜딩 배포 발생), (2) CineForge `v0.1.5` 릴리스 발행(기존 태그로 `gh release create v0.1.5 --notes-file docs/release-notes/0.1.5.md` + 산출물; 태그 재생성 없음), (3) 다음 버전(CineForge `0.1.6`, 스킬팩 `2.65`)을 이번 변경으로 태그해 워크플로 실전 확인할지, (4) `LANDING_DISPATCH_TOKEN` PAT 생성·등록(사용자가 직접 생성, 등록은 `gh secret set`).
- [ ] **Step 2: 승인 범위만 실행.**
- [ ] **Step 3: 종단 확인** — 랜딩 `Sync releases` 실행 기록 성공, `src/data/releases.json` 갱신 커밋, 배포된 `/changelog/`에서 새 버전 앵커 표시, 다운로드 파일을 받아 `sha256sum -c` 통과, `cineforge skills update --check`가 새 버전 감지. 각 항목 PASS/FAIL/UNVERIFIED로 보고.
