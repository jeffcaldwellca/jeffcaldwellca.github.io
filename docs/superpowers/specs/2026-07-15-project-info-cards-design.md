# Project info card pages — design

## Goal

Each project listed on the homepage (current projects, game releases, open
source) gets its own dedicated "info card" page — a small profile with name,
purpose, version, screenshot, tech stack, and a few other metadata fields.
The homepage listing itself stays as-is (name → marketing site, small
GitHub icon → repo) and gains one more small icon linking to the project's
info card page.

## Scope

All 9 currently listed projects get a card: hivemind, teleport, backsies,
canadia, daily maze, macspanso, mkcertWeb, muldoon, scout-portal. Closed-source
projects (hivemind, backsies, canadia, daily maze) get a card too — they just
omit the repo link and license field, since there's no public repo to point to.

## Data model

A new Jekyll collection, `_projects/`, one markdown file per project (e.g.
`_projects/teleport.md`), mirroring the existing `_blogs/` collection.

`_config.yml` gains:

```yaml
collections:
  projects:
    output: true
    permalink: /projects/:name/
```

Front matter per project file:

```yaml
---
name: Teleport
status: active            # active | beta | archived
purpose: "Native macOS FTP, FTPS & SFTP client"
version: "1.2.0"
platforms: [macOS]
license: MIT               # omit for closed-source projects
tech: [Swift, SwiftUI]
marketing_url: "https://www.jeffcaldwell.ca/teleport/"
repo_url: "https://github.com/jeffcaldwellca/teleport"   # omit if private
screenshot: "/assets/img/projects/teleport.png"            # omit if none yet
---
```

An optional markdown body below the front matter allows a longer write-up,
same pattern as `_blogs/*.md` already uses for post content.

Fields with no value for a given project (e.g. `license`, `repo_url`,
`screenshot`) are simply omitted from that project's front matter — the
layout must render cleanly whether or not they're present (see Page layout).

## Page layout

New layout `_layouts/project.html`, structurally mirroring the existing
`_layouts/blog.html` (same `< back` link + two-column
`col-12 col-md-8` / `col-12 col-md-4 sidebar-col` shell, same
`{% include sidebar.html %}` in the right column — the site's bio/nav
sidebar is unchanged and appears on project pages too).

Main column, top to bottom:

1. **Hero screenshot** — rendered only if `page.screenshot` is set. No
   placeholder box when absent; the section is skipped entirely.
2. **Title + badge row** — project name as heading, followed by small
   badges for `status` (reusing the existing `.beta-tag` CSS styling used
   for the `[beta]` tag today), `platforms`, and `license` (badge omitted
   if the field is absent).
3. **Purpose / description** — the `purpose` front-matter string; the
   optional markdown body renders below it if present.
4. **Tech stack** — `tech` array rendered as small inline tags, visually
   consistent with the badge row above.
5. **Links row** — "marketing site" and "github repo" (omitted if no
   `repo_url`) as plain `text-danger` links, matching the site's existing
   link styling — not buttons.

`< back` link points to `/` (the homepage), same convention as
`blog.html`'s back link.

## Homepage listing integration (`index.html`)

No structural rewrite of the existing hand-authored `<li>` markup. Each
entry gains a **third small icon** — visually consistent with the existing
`.repo-link` icon (same size/color treatment) — linking to the project's
`/projects/<slug>/` page. This new icon is added even for closed-source
projects (they still get a card). The existing name → marketing-site link
and GitHub icon → repo link (where public) are unchanged.

A new CSS class alongside `.repo-link` (e.g. `.info-link`) reuses the same
sizing/hover rules with a different (info-style) inline SVG icon.

## Sitemap

`sitemap-main.xml` currently loops `site.pages` and `site.blogs`. Jekyll
collections aren't included in `site.pages` automatically, so a
`{%- for project in site.projects %}` loop (same shape as the existing
`site.blogs` loop) is added to include project card URLs.

## Content rollout

One `_projects/*.md` file per existing listed project. `purpose` can reuse
the short blurb text already present in `index.html` for that project.
`version`, `tech`, `platforms`, `license`, and `screenshot` are filled in
per project by hand; `screenshot` may be left unset initially for projects
without one ready yet.

## Out of scope

- Auto-fetching data from the GitHub API (repo description, releases,
  topics) — explicitly hand-authored per the data-source decision.
- Multiple screenshots / gallery per project — single hero image only, for
  now.
- Changing how the homepage listing is structured or sourced (it stays
  hand-authored HTML, not generated from the `projects` collection).
