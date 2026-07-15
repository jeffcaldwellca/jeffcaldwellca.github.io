# Project Info Card Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give each of the 9 projects listed on the homepage its own dedicated "info card" page (name, purpose, version, platforms, license, tech stack, optional screenshot, links out), reachable via a new small icon next to each homepage listing entry.

**Architecture:** A new Jekyll collection (`_projects/`, mirroring the existing `_blogs/` collection) holds one hand-authored markdown file per project. A new layout (`_layouts/project.html`) renders each into `/projects/<slug>/`, reusing the same two-column shell (`< back` link + `col-md-8` content / `col-md-4` sidebar) that `_layouts/blog.html` already uses. The homepage listing (`index.html`) stays hand-authored HTML — it just gains one more small icon per entry linking to the project's card page.

**Tech Stack:** Jekyll (Liquid templating, collections), Bootstrap 5 utility classes, plain CSS (`assets/css/style.css`). No JavaScript, no build tooling changes.

## Global Constraints

- The homepage listing (`index.html`) is NOT generated from the `projects` collection — it stays hand-authored HTML, per the approved design.
- The hero screenshot section renders only when `page.screenshot` is set in front matter; when absent, the section is omitted entirely — never a placeholder/broken-image box.
- The links row uses plain `text-danger` links (matching the site's existing link style everywhere else) — not buttons.
- The `status` badge reuses the site's existing `.beta-tag` CSS class (the same class already used for the `[beta]` tag on the "daily maze" homepage entry).
- The `< back` link on every project page points to `/` (the homepage) — same convention `_layouts/blog.html` uses for its own back link.
- Content is 100% hand-authored per project. No GitHub API auto-fetching at build time.
- Single hero screenshot only — no multi-image gallery.
- Any front-matter field with no real value for a given project (e.g. `license`, `repo_url`, `screenshot`, `version`) is omitted from that project's file, and the layout must render cleanly either way.

## Local Jekyll toolchain

This repo has no `Gemfile` — it relies on GitHub Pages' own build. For local testing, Jekyll is installed as a user gem (already done once for this plan; if a fresh machine needs it again: `gem install jekyll --user-install`). Every build/test command in this plan starts by putting the user gem bin dir on `PATH`:

```bash
export PATH="$(ruby -e 'puts Gem.user_dir')/bin:$PATH"
```

All test steps build into `/tmp/jekyll-plan-test` and assert against files under it.

---

### Task 1: Projects collection, layout, and CSS — proven with one seed project (teleport)

**Files:**
- Modify: `_config.yml`
- Create: `_layouts/project.html`
- Modify: `assets/css/style.css`
- Create: `_projects/teleport.md`

**Interfaces:**
- Produces: the `projects` Jekyll collection (`site.projects`), permalink pattern `/projects/:name/`, and the `project` layout — both consumed by every later task in this plan.
- Produces: front-matter schema every `_projects/*.md` file in Task 2 must follow: `name`, `title`, `description`, `status`, `purpose`, `version` (optional), `platforms` (array, optional), `license` (optional), `tech` (array, optional), `marketing_url`, `repo_url` (optional), `screenshot` (optional).

- [x] **Step 1: Write the failing test**

```bash
export PATH="$(ruby -e 'puts Gem.user_dir')/bin:$PATH"
rm -rf /tmp/jekyll-plan-test
jekyll build --destination /tmp/jekyll-plan-test
if [ -f /tmp/jekyll-plan-test/projects/teleport/index.html ]; then
  echo "FOUND (unexpected)"
else
  echo "NOT FOUND (expected)"
fi
```

- [x] **Step 2: Run test to verify it fails**

Run the Step 1 script.
Expected: `NOT FOUND (expected)` — the `projects` collection doesn't exist yet, so there's nothing to output.

- [x] **Step 3: Add the `projects` collection to `_config.yml`**

Modify `_config.yml`, changing:

```yaml
collections:
  blogs:
    output: true  # Generates individual blog post pages
    permalink: /blog/:name/
    sort_by: date
```

to:

```yaml
collections:
  blogs:
    output: true  # Generates individual blog post pages
    permalink: /blog/:name/
    sort_by: date
  projects:
    output: true  # Generates individual project info card pages
    permalink: /projects/:name/
```

- [x] **Step 4: Create `_layouts/project.html`**

```html
<!DOCTYPE html>
<html lang="en">
  {% include header.html %}
  <body>
    <main class="container">
      <p><a href="{{ '/' | relative_url }}" class="text-danger" aria-label="Back to projects">&lt; back</a></p>
      <div class="row align-items-start">
        <div class="col-12 col-md-8">
          {% if page.screenshot %}
            <img src="{{ page.screenshot | relative_url }}" alt="{{ page.name }} screenshot" class="project-hero">
          {% endif %}
          <h1>{{ page.name }}</h1>
          <p class="project-badges">
            {% if page.status %}<span class="beta-tag">{{ page.status }}</span>{% endif %}
            {% if page.version %}<span class="beta-tag">v{{ page.version }}</span>{% endif %}
            {% if page.platforms %}{% for platform in page.platforms %}<span class="beta-tag">{{ platform }}</span>{% endfor %}{% endif %}
            {% if page.license %}<span class="beta-tag">{{ page.license }}</span>{% endif %}
          </p>
          <p>{{ page.purpose }}</p>
          {{ content }}
          {% if page.tech %}
          <p class="project-tech">
            {% for t in page.tech %}<span class="beta-tag">{{ t }}</span>{% endfor %}
          </p>
          {% endif %}
          <p class="mt-3">
            <a href="{{ page.marketing_url }}" class="text-danger me-3" target="_blank" rel="noopener noreferrer">marketing site</a>
            {% if page.repo_url %}<a href="{{ page.repo_url }}" class="text-danger" target="_blank" rel="noopener noreferrer">github repo</a>{% endif %}
          </p>
        </div>
        <div class="col-12 col-md-4 sidebar-col">
          {% include sidebar.html %}
        </div>
      </div>
    </main>
    {% include footer.html %}
  </body>
</html>
```

- [x] **Step 5: Add project-page CSS to `assets/css/style.css`**

Add after the existing `.repo-link:hover { opacity: 0.75; }` rule:

```css
/* ── Project card page ── */
.project-hero {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.project-badges .beta-tag,
.project-tech .beta-tag {
  margin-right: 0.5em;
}
```

- [x] **Step 6: Create `_projects/teleport.md`**

```markdown
---
layout: project
title: "jeffcaldwell.ca // teleport"
description: "native macOS FTP, FTPS & SFTP client"
name: teleport
status: active
purpose: "native macOS FTP, FTPS & SFTP client"
version: "1.0"
platforms: [macOS]
license: GPL-3.0
tech: [Swift, SwiftUI]
marketing_url: "https://www.jeffcaldwell.ca/teleport/"
repo_url: "https://github.com/jeffcaldwellca/teleport"
---
```

- [x] **Step 7: Run test to verify it passes**

```bash
export PATH="$(ruby -e 'puts Gem.user_dir')/bin:$PATH"
rm -rf /tmp/jekyll-plan-test
jekyll build --destination /tmp/jekyll-plan-test
PAGE=/tmp/jekyll-plan-test/projects/teleport/index.html
test -f "$PAGE" && echo "PAGE OK" || echo "PAGE MISSING"
grep -q "native macOS FTP, FTPS & SFTP client" "$PAGE" && echo "PURPOSE OK" || echo "PURPOSE MISSING"
grep -q "GPL-3.0" "$PAGE" && echo "LICENSE OK" || echo "LICENSE MISSING"
grep -q "v1.0" "$PAGE" && echo "VERSION OK" || echo "VERSION MISSING"
grep -q "Swift" "$PAGE" && grep -q "SwiftUI" "$PAGE" && echo "TECH OK" || echo "TECH MISSING"
grep -q 'href="https://github.com/jeffcaldwellca/teleport"' "$PAGE" && echo "REPO LINK OK" || echo "REPO LINK MISSING"
grep -q 'href="https://www.jeffcaldwell.ca/teleport/"' "$PAGE" && echo "MARKETING LINK OK" || echo "MARKETING LINK MISSING"
if grep -q 'class="project-hero"' "$PAGE"; then echo "IMG UNEXPECTED"; else echo "NO IMG OK"; fi
```

Note: the sidebar include (`sidebar.html`) always renders an `<img>` for the bio photo, on every page — so checking for the absence of any `<img` tag would be a false positive. The check above is scoped to `class="project-hero"` specifically, which only the hero screenshot uses.

Expected: every line prints its `OK` branch (`PAGE OK`, `PURPOSE OK`, `LICENSE OK`, `VERSION OK`, `TECH OK`, `REPO LINK OK`, `MARKETING LINK OK`, `NO IMG OK`).

- [x] **Step 8: Test the screenshot-present branch with a throwaway fixture**

No real project has a screenshot asset yet (see Task 2), so this step exercises that code path directly and then cleans up after itself — it does not leave any file behind.

```bash
export PATH="$(ruby -e 'puts Gem.user_dir')/bin:$PATH"
cat > _projects/zzz-fixture.md <<'EOF'
---
layout: project
title: "jeffcaldwell.ca // fixture"
description: "fixture"
name: fixture
purpose: "fixture"
screenshot: "/assets/img/projects/fixture.png"
marketing_url: "https://example.com"
---
EOF
rm -rf /tmp/jekyll-plan-test
jekyll build --destination /tmp/jekyll-plan-test
PAGE=/tmp/jekyll-plan-test/projects/zzz-fixture/index.html
grep -q 'src="/assets/img/projects/fixture.png"' "$PAGE" && echo "SCREENSHOT BRANCH OK" || echo "SCREENSHOT BRANCH FAILED"
rm _projects/zzz-fixture.md
```

Expected: `SCREENSHOT BRANCH OK`, and `_projects/zzz-fixture.md` is deleted immediately after — confirm with `git status` that no fixture file remains before committing.

- [x] **Step 9: Commit**

```bash
git add _config.yml _layouts/project.html assets/css/style.css _projects/teleport.md
git commit -m "Add projects collection, info card layout, and seed teleport page"
```

---

### Task 2: Author the remaining 8 project info card files

**Files:**
- Create: `_projects/hivemind.md`
- Create: `_projects/backsies.md`
- Create: `_projects/canadia.md`
- Create: `_projects/daily-maze.md`
- Create: `_projects/macspanso.md`
- Create: `_projects/mkcertweb.md`
- Create: `_projects/muldoon.md`
- Create: `_projects/scout-portal.md`

**Interfaces:**
- Consumes: the `projects` collection config and `project` layout from Task 1 — no template changes in this task, content only.
- Produces: the full set of 9 project slugs (`hivemind`, `teleport`, `backsies`, `canadia`, `daily-maze`, `macspanso`, `mkcertweb`, `muldoon`, `scout-portal`) that Task 3 (sitemap) and Task 4 (homepage icons) both rely on by exact name.

Data sources: each project's own GitHub repo (language, license, latest tag/version, dependencies) and the short blurb already in `index.html` for `purpose`. `hivemind` and `backsies` and `canadia` and `daily-maze` have private repos, so they omit `license` and `repo_url`. `daily-maze`'s `package.json` version is an unbumped `0.0.0` placeholder, so `version` is omitted for it rather than shipping a meaningless number.

- [x] **Step 1: Write the failing test**

```bash
export PATH="$(ruby -e 'puts Gem.user_dir')/bin:$PATH"
rm -rf /tmp/jekyll-plan-test
jekyll build --destination /tmp/jekyll-plan-test
for slug in hivemind backsies canadia daily-maze macspanso mkcertweb muldoon scout-portal; do
  test -f "/tmp/jekyll-plan-test/projects/$slug/index.html" && echo "$slug FOUND (unexpected)" || echo "$slug NOT FOUND (expected)"
done
```

- [x] **Step 2: Run test to verify it fails**

Run the Step 1 script.
Expected: all 8 lines print `NOT FOUND (expected)`.

- [x] **Step 3: Create `_projects/hivemind.md`**

```markdown
---
layout: project
title: "jeffcaldwell.ca // hivemind"
description: "anonymous local sharing"
name: hivemind
status: active
purpose: "anonymous local sharing"
version: "1.7.1"
platforms: [iOS, Android]
tech: [React Native, Expo, TypeScript, GraphQL]
marketing_url: "https://www.gethivemind.net"
---
```

- [x] **Step 4: Create `_projects/backsies.md`**

```markdown
---
layout: project
title: "jeffcaldwell.ca // backsies"
description: "the backronym game"
name: backsies
status: active
purpose: "the backronym game"
version: "1.0.0"
platforms: [iOS, Android]
tech: [React Native, Expo, TypeScript, Supabase]
marketing_url: "https://www.backsies.app"
---
```

- [x] **Step 5: Create `_projects/canadia.md`**

```markdown
---
layout: project
title: "jeffcaldwell.ca // canadia"
description: "rebuild the true north"
name: canadia
status: active
purpose: "rebuild the true north"
version: "1.6.0"
platforms: [Web, Desktop, iOS]
tech: [JavaScript, Electron, Capacitor, Steamworks]
marketing_url: "https://truenorth.somecorp.dev"
---
```

- [x] **Step 6: Create `_projects/daily-maze.md`**

```markdown
---
layout: project
title: "jeffcaldwell.ca // daily maze"
description: "a new maze every day"
name: daily maze
status: beta
purpose: "a new maze every day"
platforms: [Web]
tech: [React, TypeScript, Vite, D3, Supabase]
marketing_url: "https://dailymaze.vercel.app"
---
```

- [x] **Step 7: Create `_projects/macspanso.md`**

```markdown
---
layout: project
title: "jeffcaldwell.ca // macspanso"
description: "mac gui for espanso"
name: macspanso
status: active
purpose: "mac gui for espanso"
version: "1.4.1"
platforms: [macOS]
license: MIT
tech: [Swift]
marketing_url: "https://www.jeffcaldwell.ca/macspanso/"
repo_url: "https://github.com/jeffcaldwellca/macspanso"
---
```

- [x] **Step 8: Create `_projects/mkcertweb.md`**

```markdown
---
layout: project
title: "jeffcaldwell.ca // mkcertWeb"
description: "web ui for mkcert"
name: mkcertWeb
status: active
purpose: "web ui for mkcert"
version: "4.2.0"
platforms: [Web]
license: GPL-3.0
tech: [Node.js, Express, JavaScript]
marketing_url: "https://www.jeffcaldwell.ca/mkcertWeb/"
repo_url: "https://github.com/jeffcaldwellca/mkcertWeb"
---
```

- [x] **Step 9: Create `_projects/muldoon.md`**

```markdown
---
layout: project
title: "jeffcaldwell.ca // muldoon"
description: "wordpress domain mapping plugin"
name: muldoon
status: active
purpose: "wordpress domain mapping plugin"
version: "2.0"
platforms: [WordPress]
license: GPL-3.0
tech: [PHP, WordPress]
marketing_url: "https://www.jeffcaldwell.ca/muldoon/"
repo_url: "https://github.com/jeffcaldwellca/muldoon"
---
```

- [x] **Step 10: Create `_projects/scout-portal.md`**

```markdown
---
layout: project
title: "jeffcaldwell.ca // scout-portal"
description: "freescout end user support portal"
name: scout-portal
status: active
purpose: "freescout end user support portal"
version: "1.0"
platforms: [Web]
license: GPL-3.0
tech: [PHP, Slim Framework]
marketing_url: "https://www.jeffcaldwell.ca/scout-portal/"
repo_url: "https://github.com/jeffcaldwellca/scout-portal"
---
```

- [x] **Step 11: Run test to verify it passes**

```bash
export PATH="$(ruby -e 'puts Gem.user_dir')/bin:$PATH"
rm -rf /tmp/jekyll-plan-test
jekyll build --destination /tmp/jekyll-plan-test
for slug in hivemind backsies canadia daily-maze macspanso mkcertweb muldoon scout-portal; do
  test -f "/tmp/jekyll-plan-test/projects/$slug/index.html" && echo "$slug OK" || echo "$slug MISSING"
done
HIVEMIND=/tmp/jekyll-plan-test/projects/hivemind/index.html
if grep -q "github repo" "$HIVEMIND"; then echo "HIVEMIND REPO LINK UNEXPECTED"; else echo "HIVEMIND REPO OMITTED OK"; fi
MAZE=/tmp/jekyll-plan-test/projects/daily-maze/index.html
if grep -q ">v<" "$MAZE"; then echo "MAZE EMPTY VERSION UNEXPECTED"; else echo "MAZE VERSION OMITTED OK"; fi
```

Expected: all 8 slugs print `OK`, plus `HIVEMIND REPO OMITTED OK` and `MAZE VERSION OMITTED OK`.

- [x] **Step 12: Commit**

```bash
git add _projects/hivemind.md _projects/backsies.md _projects/canadia.md _projects/daily-maze.md _projects/macspanso.md _projects/mkcertweb.md _projects/muldoon.md _projects/scout-portal.md
git commit -m "Author remaining 8 project info card pages"
```

---

### Task 3: Register project pages in the sitemap

**Files:**
- Modify: `sitemap-main.xml`

**Interfaces:**
- Consumes: `site.projects` (from Task 1's collection config) and all 9 slugs from Tasks 1–2.

- [x] **Step 1: Write the failing test**

```bash
export PATH="$(ruby -e 'puts Gem.user_dir')/bin:$PATH"
rm -rf /tmp/jekyll-plan-test
jekyll build --destination /tmp/jekyll-plan-test
grep -q "/projects/teleport/" /tmp/jekyll-plan-test/sitemap-main.xml && echo "FOUND (unexpected)" || echo "NOT FOUND (expected)"
```

- [x] **Step 2: Run test to verify it fails**

Run the Step 1 script.
Expected: `NOT FOUND (expected)`.

- [x] **Step 3: Add a `site.projects` loop to `sitemap-main.xml`**

Modify `sitemap-main.xml`, changing:

```xml
  {%- for post in site.blogs %}
  <url>
    <loc>{{ post.url | absolute_url }}</loc>
    <lastmod>{{ post.date | date_to_xmlschema }}</lastmod>
  </url>
  {%- endfor %}
</urlset>
```

to:

```xml
  {%- for post in site.blogs %}
  <url>
    <loc>{{ post.url | absolute_url }}</loc>
    <lastmod>{{ post.date | date_to_xmlschema }}</lastmod>
  </url>
  {%- endfor %}
  {%- for project in site.projects %}
  <url>
    <loc>{{ project.url | absolute_url }}</loc>
  </url>
  {%- endfor %}
</urlset>
```

- [x] **Step 4: Run test to verify it passes**

```bash
export PATH="$(ruby -e 'puts Gem.user_dir')/bin:$PATH"
rm -rf /tmp/jekyll-plan-test
jekyll build --destination /tmp/jekyll-plan-test
for slug in hivemind teleport backsies canadia daily-maze macspanso mkcertweb muldoon scout-portal; do
  grep -q "/projects/$slug/" /tmp/jekyll-plan-test/sitemap-main.xml && echo "$slug OK" || echo "$slug MISSING"
done
```

Expected: all 9 slugs print `OK`.

- [x] **Step 5: Commit**

```bash
git add sitemap-main.xml
git commit -m "Include project info card pages in sitemap"
```

---

### Task 4: Wire the homepage listing to the new info card pages

**Files:**
- Modify: `assets/css/style.css`
- Modify: `index.html`

**Interfaces:**
- Consumes: all 9 project slugs and their `/projects/<slug>/` URLs from Tasks 1–2.

- [x] **Step 1: Write the failing test**

```bash
export PATH="$(ruby -e 'puts Gem.user_dir')/bin:$PATH"
rm -rf /tmp/jekyll-plan-test
jekyll build --destination /tmp/jekyll-plan-test
grep -c 'class="info-link"' /tmp/jekyll-plan-test/index.html
```

- [x] **Step 2: Run test to verify it fails**

Run the Step 1 script.
Expected: `0` (no `.info-link` icons exist yet).

- [x] **Step 3: Extend `.repo-link` CSS rules to cover `.info-link` too**

Modify `assets/css/style.css`, changing:

```css
/* ── Repo link icon (project listings) ── */
.repo-link {
  display: inline-block;
  width: 0.85em;
  height: 0.85em;
  margin-left: 0.3em;
  vertical-align: -0.05em;
  color: var(--bs-tertiary-color, #767676);
}

.repo-link:hover {
  opacity: 0.75;
}
```

to:

```css
/* ── Repo / info link icons (project listings) ── */
.repo-link,
.info-link {
  display: inline-block;
  width: 0.85em;
  height: 0.85em;
  margin-left: 0.3em;
  vertical-align: -0.05em;
  color: var(--bs-tertiary-color, #767676);
}

.repo-link:hover,
.info-link:hover {
  opacity: 0.75;
}
```

- [x] **Step 4: Add an info-card icon to each of the 9 entries in `index.html`**

Modify `index.html`. The "current projects" list — changing:

```html
        <li><a href="https://www.gethivemind.net" class="text-danger" target="_blank" rel="noopener noreferrer">hivemind</a> - anonymous local sharing</li>
        <li><a href="https://www.jeffcaldwell.ca/teleport/" class="text-danger" target="_blank" rel="noopener noreferrer">teleport</a><a href="https://github.com/jeffcaldwellca/teleport" class="repo-link" target="_blank" rel="noopener noreferrer" aria-label="teleport on GitHub"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/></svg></a> - native macOS FTP, FTPS &amp; SFTP client</li>
```

to:

```html
        <li><a href="https://www.gethivemind.net" class="text-danger" target="_blank" rel="noopener noreferrer">hivemind</a><a href="/projects/hivemind/" class="info-link" aria-label="hivemind project details"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/></svg></a> - anonymous local sharing</li>
        <li><a href="https://www.jeffcaldwell.ca/teleport/" class="text-danger" target="_blank" rel="noopener noreferrer">teleport</a><a href="https://github.com/jeffcaldwellca/teleport" class="repo-link" target="_blank" rel="noopener noreferrer" aria-label="teleport on GitHub"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/></svg></a><a href="/projects/teleport/" class="info-link" aria-label="teleport project details"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/></svg></a> - native macOS FTP, FTPS &amp; SFTP client</li>
```

The "game releases" list — changing:

```html
        <li><a href="https://www.backsies.app" class="text-danger" target="_blank" rel="noopener noreferrer">backsies</a> - the backronym game</li>
        <li><a href="https://truenorth.somecorp.dev" class="text-danger" target="_blank" rel="noopener noreferrer">canadia</a> - rebuild the true north</li>
        <li><a href="https://dailymaze.vercel.app" class="text-danger" target="_blank" rel="noopener noreferrer">daily maze</a> <span class="beta-tag">[beta]</span> - a new maze every day</li>
```

to:

```html
        <li><a href="https://www.backsies.app" class="text-danger" target="_blank" rel="noopener noreferrer">backsies</a><a href="/projects/backsies/" class="info-link" aria-label="backsies project details"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/></svg></a> - the backronym game</li>
        <li><a href="https://truenorth.somecorp.dev" class="text-danger" target="_blank" rel="noopener noreferrer">canadia</a><a href="/projects/canadia/" class="info-link" aria-label="canadia project details"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/></svg></a> - rebuild the true north</li>
        <li><a href="https://dailymaze.vercel.app" class="text-danger" target="_blank" rel="noopener noreferrer">daily maze</a><a href="/projects/daily-maze/" class="info-link" aria-label="daily maze project details"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/></svg></a> <span class="beta-tag">[beta]</span> - a new maze every day</li>
```

The "open source" list — changing:

```html
        <li><a href="https://www.jeffcaldwell.ca/macspanso/" class="text-danger" target="_blank" rel="noopener noreferrer">macspanso</a><a href="https://github.com/jeffcaldwellca/macspanso" class="repo-link" target="_blank" rel="noopener noreferrer" aria-label="macspanso on GitHub"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/></svg></a> - mac gui for espanso</li>
        <li><a href="https://www.jeffcaldwell.ca/mkcertWeb/" class="text-danger" target="_blank" rel="noopener noreferrer">mkcertWeb</a><a href="https://github.com/jeffcaldwellca/mkcertWeb" class="repo-link" target="_blank" rel="noopener noreferrer" aria-label="mkcertWeb on GitHub"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/></svg></a> - web ui for mkcert</li>
        <li><a href="https://www.jeffcaldwell.ca/muldoon/" class="text-danger" target="_blank" rel="noopener noreferrer">muldoon</a><a href="https://github.com/jeffcaldwellca/muldoon" class="repo-link" target="_blank" rel="noopener noreferrer" aria-label="muldoon on GitHub"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/></svg></a> - wordpress domain mapping plugin</li>
        <li><a href="https://www.jeffcaldwell.ca/scout-portal/" class="text-danger" target="_blank" rel="noopener noreferrer">scout-portal</a><a href="https://github.com/jeffcaldwellca/scout-portal" class="repo-link" target="_blank" rel="noopener noreferrer" aria-label="scout-portal on GitHub"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/></svg></a> - freescout end user support portal</li>
```

to:

```html
        <li><a href="https://www.jeffcaldwell.ca/macspanso/" class="text-danger" target="_blank" rel="noopener noreferrer">macspanso</a><a href="https://github.com/jeffcaldwellca/macspanso" class="repo-link" target="_blank" rel="noopener noreferrer" aria-label="macspanso on GitHub"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/></svg></a><a href="/projects/macspanso/" class="info-link" aria-label="macspanso project details"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/></svg></a> - mac gui for espanso</li>
        <li><a href="https://www.jeffcaldwell.ca/mkcertWeb/" class="text-danger" target="_blank" rel="noopener noreferrer">mkcertWeb</a><a href="https://github.com/jeffcaldwellca/mkcertWeb" class="repo-link" target="_blank" rel="noopener noreferrer" aria-label="mkcertWeb on GitHub"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/></svg></a><a href="/projects/mkcertweb/" class="info-link" aria-label="mkcertWeb project details"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/></svg></a> - web ui for mkcert</li>
        <li><a href="https://www.jeffcaldwell.ca/muldoon/" class="text-danger" target="_blank" rel="noopener noreferrer">muldoon</a><a href="https://github.com/jeffcaldwellca/muldoon" class="repo-link" target="_blank" rel="noopener noreferrer" aria-label="muldoon on GitHub"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/></svg></a><a href="/projects/muldoon/" class="info-link" aria-label="muldoon project details"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/></svg></a> - wordpress domain mapping plugin</li>
        <li><a href="https://www.jeffcaldwell.ca/scout-portal/" class="text-danger" target="_blank" rel="noopener noreferrer">scout-portal</a><a href="https://github.com/jeffcaldwellca/scout-portal" class="repo-link" target="_blank" rel="noopener noreferrer" aria-label="scout-portal on GitHub"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/></svg></a><a href="/projects/scout-portal/" class="info-link" aria-label="scout-portal project details"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/></svg></a> - freescout end user support portal</li>
```

- [x] **Step 5: Run test to verify it passes**

```bash
export PATH="$(ruby -e 'puts Gem.user_dir')/bin:$PATH"
rm -rf /tmp/jekyll-plan-test
jekyll build --destination /tmp/jekyll-plan-test
grep -c 'class="info-link"' /tmp/jekyll-plan-test/index.html
for slug in hivemind teleport backsies canadia daily-maze macspanso mkcertweb muldoon scout-portal; do
  grep -q "href=\"/projects/$slug/\"" /tmp/jekyll-plan-test/index.html && echo "$slug LINK OK" || echo "$slug LINK MISSING"
done
```

Expected: the count is `9`, and every slug prints `LINK OK`.

- [x] **Step 6: Commit**

```bash
git add assets/css/style.css index.html
git commit -m "Add info card links to homepage project listings"
```

---

### Task 5: Full-site verification and manual browser check

**Files:** none (verification only)

- [x] **Step 1: Clean full build with no errors or warnings**

```bash
export PATH="$(ruby -e 'puts Gem.user_dir')/bin:$PATH"
rm -rf /tmp/jekyll-plan-test
jekyll build --destination /tmp/jekyll-plan-test --strict_front_matter 2>&1
```

Expected: build completes with no `Error:` or `Deprecation` output, and exit code 0 (check with `echo $?`).

- [x] **Step 2: Assert all 9 project pages and the homepage all exist together**

```bash
for slug in hivemind teleport backsies canadia daily-maze macspanso mkcertweb muldoon scout-portal; do
  test -f "/tmp/jekyll-plan-test/projects/$slug/index.html" && echo "$slug OK" || echo "$slug MISSING"
done
test -f /tmp/jekyll-plan-test/index.html && echo "homepage OK" || echo "homepage MISSING"
```

Expected: all 10 lines print `OK`.

- [x] **Step 3: Manual browser check**

```bash
export PATH="$(ruby -e 'puts Gem.user_dir')/bin:$PATH"
jekyll serve --port 4444
```

With the server running, open these in a browser and confirm visually:
- `http://localhost:4444/` — all 9 listing entries show the new info-link icon (and existing repo-link icons are unchanged); every icon is clickable.
- `http://localhost:4444/projects/teleport/` — full data project: status/version/platform/license badges, tech tags, both "marketing site" and "github repo" links present, sidebar (bio + nav) shown on the right, no broken image (no `screenshot` set).
- `http://localhost:4444/projects/hivemind/` — closed-source project: no "github repo" link, no license badge, other fields present.
- `http://localhost:4444/projects/daily-maze/` — beta project: no version badge shown, `status` badge reads "beta".
- `< back` link on any project page returns to `/`.

Stop the server (Ctrl-C) once confirmed.

- [x] **Step 4: No commit needed** — this task is verification-only.
