# Astryx: settled opinions, open choices, and silences

Research for [#16](https://github.com/andrskr/something-something-ui/issues/16). Part of
[#1](https://github.com/andrskr/something-something-ui/issues/1).

This document supplies the raw material for `design.md` ([#9](https://github.com/andrskr/something-something-ui/issues/9)).
Read it with one question in mind: **what does the Foundation not decide for you?** A prior baseline
showed that the Foundation alone already writes idiomatic, building code. Any rule that restates what
the Foundation already gets right will score at the ceiling in every Arm. Only Buckets B, C and D earn
their place.

The material sorts into four buckets. **A** is settled and we adopt it verbatim. **B** is open, so we
pick one. **C** is silent, so we author from nothing. **D** routes the agent to a command instead of
paraphrasing what the command would say — the cheapest rules of all, because they never go stale.

Terms follow `CONTEXT.md`. **Foundation** means Astryx. **Layer** means the material we author.
**Delivery channel** means the route by which Layer material reaches an agent.

---

## Method and provenance

| Item | Value |
| --- | --- |
| `@astryxdesign/core` | 0.3.0 (`apps/web/package.json`, catalog pin) |
| `@astryxdesign/cli` | 0.3.0 |
| CLI invocation | `pnpm exec astryx <cmd>` from `apps/web` |
| Components in catalog | 155 |
| Page templates | 43 (3 marked `isReady: false`) |
| Block templates | 614 |
| Public site | <https://astryx.atmeta.com> |
| Date gathered | 2026-08-25 |

Every claim carries a mark:

- **VERIFIED** — I ran the command or read the file myself, or a sub-agent ran it and I re-ran the
  load-bearing part.
- **INFERRED** — a conclusion drawn from verified evidence, not stated by the Foundation.
- **NOT FOUND** — I looked in named places and found nothing.

### CLI output flags (VERIFIED)

`astryx --help` lists these global flags. They matter for the Instrument, because token cost per Run
is an in-Run efficiency proxy.

- `--json` — typed JSON. Success envelope `{ type, data }`, error envelope `{ error, suggestions? }`.
  Works on `docs`, `component`, `template --list`, `search`. Reliable for machine reading.
- `--dense` — compressed output. `astryx docs layout` is 5432 bytes plain and 3850 bytes dense, a
  29% saving. VERIFIED by byte count.
- `--detail <full|compact|brief>` — works on `component`. **Broken on `docs` in 0.3.0**: both
  `--detail brief` and `--detail compact` return 0 bytes for `astryx docs layout`. VERIFIED.
- `astryx docs <topic> <section>` takes a section name and prints only that section. VERIFIED with
  `astryx docs layout "Cards vs Rows"`.

### The two Delivery channels disagree (VERIFIED)

The CLI and the website are **different documents**, not two renderings of one document. This is a
version skew: `/docs/cli` on the site states CLI v0.5.0, and we run 0.3.0.

`astryx docs layout --json` reports these sections: `Frame First`, `App Archetypes`,
`Cards vs Rows`, `Panels and Inspectors`, `Responsive Contract`.

The website's `/docs/layout` instead carries `Scaffold`, `Structure`, `Spacing`, `Breakpoints`.

Neither is a subset of the other. The CLI has the **App Archetypes** table, which the site does not.
The site has the **container ladder** and the `contentWidth` numbers, which the CLI does not.

**Consequence for the Instrument.** An agent in Arm 1 (Off) reads only the CLI. It never sees the
container ladder, the 40-60 character measure, or the `contentWidth` values. Do not assume the
Foundation supplies website content to a Run. Cite the CLI when a rule must hold in Arm 1.

---

## Headline: the ten strongest candidate rules

Ranked by how much each would change generated output. Rank is INFERRED from the template evidence in
the cross-check section, not measured.

| # | Candidate rule | Bucket | Why it moves output |
| --- | --- | --- | --- |
| 1 | Build every chart with one named local component and assign series colors from `--color-data-categorical-*` in declared order. | C | No `Chart` component exists in core 0.3.0. Astryx's own templates use three incompatible chart stacks, none installed. Every Run invents its own. Largest single source of Divergence. |
| 2 | Right-align numeric and currency table columns. Left-align text. Left-align dates. | C | `grep "align:"` across all 29 scaffolded templates returns nothing. Zero prior art, one line to check, visible in a screenshot. |
| 3 | Format every number through one module-level `Intl.NumberFormat` with an explicit locale. Never call `toLocaleString()` with no argument. | C | Templates hand-roll five different ways, including SSR-unsafe `toLocaleString()`. |
| 4 | Give every data region all three states: loaded, empty, and error. Render `EmptyState` when a filter matches nothing. | C | No page template has an error state. Only one has an empty state. Filter to zero rows and you get a bare header. |
| 5 | Pass semantic icon name strings. Never import an icon package into a page. | B | 18 of 29 templates import `@heroicons/react`, which does not resolve here. This is the difference between code that builds and code that does not. |
| 6 | Every page starts with exactly one `Heading level={1}` inside `LayoutHeader`. | C | The `dashboard` template has no `h1` at all and starts at `h3`. `dashboard-portfolio` has two `h1`s. |
| 7 | Build the KPI tile once as a named local component. Order it value, then label, then delta. | C | Astryx builds this three incompatible ways, twice within one file. |
| 8 | Set `LayoutContent padding={4}` and one outer `VStack gap={6}` on every page. Vary nothing else. | C | Template padding is 0, 3, 4, 6, or omitted with no stated reason. |
| 9 | Sort every table by default on its most meaningful column, and mark that column sortable. | C | Not one of the 14 page templates sets `sortable` on a single column. |
| 10 | Encode trend direction with `--color-success` and `--color-error`, never with a categorical data token. | C | `dashboard-portfolio` uses both vocabularies for the same up/down concept in one file. |

The ranking above covers Buckets B and C only. Two Bucket D rules would displace items 8 and 9 if D
were included: **D14** (never use a template scaffold as code — strip six specific things first) and
**D2** (when `astryx build` reports "No exact match", do not scaffold its fallback). Both change
whether the output compiles at all, which outranks anything that changes only how it looks.

---

## Bucket A — settled opinions, adopt verbatim

The Foundation has a clear, documented position on each of these. `design.md` should cite or restate
them and must never contradict them. **These are the entries that will score at the ceiling in every
Arm.** Keep them short in `design.md` or cite them by command instead of repeating them.

Source for each is the command that produced it.

### A1. Frame first (`astryx docs layout`, `astryx docs principles`) — VERIFIED

> "Decide the frame before writing any content. Real applications are built top-down: pick the shell,
> name its regions, give each region an explicit size budget, then fill regions with content.
> Content-first layout (writing sections and wrapping each one in a Card) produces a padded scroll
> column that reads as a prototype, not a product."

Named budgets: side nav 240-280, icon rail 64-72, detail/inspector panel 340-420, filter/facet rail
220-260.

### A2. App archetype decides the container policy (`astryx docs layout`) — VERIFIED

The table is decisive, and the analytics row is the one we care about.

> "Console / observability (metrics, logs, deploys) | AppShell + SideNav or TopNav + TabList | Card
> grid for dashboard widgets; Table for everything else"

The doc adds: "container choice tracks the archetype, not personal preference."

This is the single most useful settled statement for a generic analytics surface. It settles the
Card-versus-Table question at page level.

### A3. Cards versus rows (`astryx docs layout`) — VERIFIED

> "Card is a widget container, not a list-item wrapper. The fastest way to make an app look like a
> generic AI prototype is to wrap every record in a Card with a Badge."

Do: Table for columnar records; List/Item for scannable single-line records; Card for self-contained
widgets (KPI tiles, chart panels, gallery entries, settings groups); "EmptyState inside the region
when a filter matches nothing"; rows edge-to-edge with dividers and 32-40px row height.

Don't: card soup, full-width Card stacks as page structure, Cards inside Cards, Badge as decoration.

### A4. Card versus Section has a decision test (`astryx component Card`) — VERIFIED

> "Ask 'could I reorder or remove this independently?' If yes, it's a card. If no, it's just a section
> of the page: use a heading + Stack or Section."

Also: "Cards should be the exception, not the default." And: "Spacing and alignment alone create
visual grouping. Not everything needs a container; try removing the card and see if the grouping is
still clear from whitespace and typography."

`astryx component Section` agrees: "Use Card when you mean Section" is listed as a Don't.

Note that the website states this differently, as a container ladder — "Reach for the weakest
container that reads as a group, and escalate only when it fails", spacing/gap then Divider then
Section then Card. The CLI test and the website ladder agree in outcome.

### A5. Badge discipline (`astryx component Badge`) — VERIFIED

Unusually strong, and directly relevant to a data table.

> "Every status badge steals attention. Only badge states where the user needs to notice or act."
> "Don't: Apply a 'success' badge to every healthy/active/normal item. If all rows show green
> 'Active' badges, none stand out."
> "Don't: Repeat the same badge in every row of a table or list. If the same value appears in most
> rows, it's not adding information; use plain text for common states and reserve badges for the
> exceptional ones."
> "Don't: Use badges for metadata. Durations ('6h window'), counts ('12 trigger types'), dates, and
> descriptions are not statuses or categories; use description text (Text with type='supporting')
> instead."
> "Don't: Make badges clickable; they are read-only indicators."

### A6. StatusDot always carries a text label (`astryx component StatusDot`) — VERIFIED

> "Always pair with a visible text label so status is not conveyed by color alone."

### A7. Every table column gets an explicit width (`astryx component Table`) — VERIFIED

> "Set explicit width on every column using proportional() or pixel(). proportional(1) gives equal
> flex distribution with a 120px minimum that prevents columns from collapsing on narrow viewports.
> Omitting width skips the minimum."
> "Don't: Omit width on text-heavy columns."

### A8. Table only for uniform columns (`astryx component Table`) — VERIFIED

> "Don't: Use a table for data without consistent columns. Use a list or card layout for
> heterogeneous content."
> "Don't: Enable every plugin at once."

### A9. Pagination sits below the content (`astryx component Pagination`) — VERIFIED

> "Place pagination below the content it controls so users see results before navigating."
> "Don't: Place pagination above the content."
> "Don't: Show pagination when all items fit on a single page."

Variant guidance exists for three of six variants: `pages` for data tables, `count` with a page-size
selector, `dots` for carousels and no more than about 10 pages.

### A10. Empty states must name what is empty and what to do (`astryx component EmptyState`) — VERIFIED

> "Don't: Use a generic message like 'No data'; be specific about what is empty and why."
> "Don't: Leave an empty state without guidance; always explain what happened and what the user can
> do next."
> "Don't: Use an EmptyState for error messages that require immediate action; use a Banner instead."
> "Do: Use the compact variant inside cards or sidebars where space is limited."

### A11. Skeleton versus Spinner is decided (`astryx component Skeleton`) — VERIFIED

> "Don't: Use when the content dimensions are unknown; use Spinner instead."
> "Don't: Combine with a Spinner on the same content area; pick one loading pattern."
> "Don't: Show skeletons indefinitely; if loading takes too long, show an error or empty state
> instead."
> "Do: Stagger multiple skeletons with the `index` prop."

### A12. Banner versus Toast is decided (`astryx component Banner`) — VERIFIED

> "Don't: Use Banner for short-lived messages that disappear on their own; use Toast instead."
> "Do: Make info and success banners dismissable. Keep error banners visible until the user fixes the
> issue."
> "Do: Keep titles short and scannable: 'Payment failed' not 'There was a problem processing your
> most recent payment.'"
> "Don't: Stack multiple banners with the same status; combine related messages into one banner."

### A13. Dates always go through `Timestamp` (`astryx component Timestamp`) — VERIFIED

> "Don't: Don't display raw Unix timestamps or ISO strings to users; always pass them through
> Timestamp."
> "Do: Keep formatting consistent within the same list or table; mixing relative and absolute
> timestamps in the same column confuses scanning."
> "Do: Use the auto format in feeds and lists."
> "Do: Use isLive for active dashboards or real-time feeds."
> "Don't: Don't pass a fixed-offset abbreviation like 'EST' as timezoneID... Use the region id,
> 'America/New_York'."
> "Don't: Avoid system_date or system_time formats in user-facing UI."

This is the **only** display-formatting doctrine the Foundation has. It covers dates and nothing else.
See C1 to C4.

### A14. Tokens for every value (`astryx docs principles`, `astryx docs color`) — VERIFIED

Anti-patterns, verbatim: "Inline styles on raw elements. Use xstyle on components"; "Hardcoded colors
(#fff)"; "Hardcoded spacing (16px)"; "Hardcoded `<a>` elements"; "Inventing props. Read component docs
first".

Colour best practice: "Use status colors (success, error, warning) only for their semantic meaning";
"Rely on the surface hierarchy (body -> surface -> card -> popover) for layering"; "Don't: Mix accent
colors with status colors in the same context."

### A15. The spacing scale (`astryx docs spacing`) — VERIFIED

One 4px scale, `--spacing-0` through `--spacing-12`, plus half steps at 0.5 and 1.5.

> "Use smaller steps (0.5-2) for tight internal spacing and larger steps (4-8) for section gaps."
> "Stick to the scale for consistency. If a value isn't on the scale, reconsider the design."
> "Don't: Mix spacing tokens with raw px/rem values in the same component."

The website adds, and the CLI does not: "The container owns padding and child gaps; children zero
their margins." Also: "Grouping comes from contrast between tight and generous gaps, not one repeated
value."

### A16. Typography (`astryx docs typography`) — VERIFIED

> "Use Heading for document headings and Text for everything else."
> "Use display types for hero banners, marketing headlines, and data callouts, not for document
> headings."
> "Use the supporting type for secondary information: timestamps, helper text, metadata, captions."
> "Don't: Set font-size or line-height manually."
> "Don't: Skip heading levels (e.g. h1 to h3); screen readers rely on an unbroken hierarchy. Use
> accessibilityLevel to decouple visual from semantic level."
> "Don't: Use raw numeric font-weight values (400, 600)."

The doc gives the KPI value its own worked example: `<Text type="display-2">$1.2M Revenue</Text>` and
`<Heading level={2} type="display-2">$1.2M Revenue</Heading>`. This is the closest thing to a settled
answer for a metric value. **No Astryx template follows it** — see the cross-check.

### A17. Elevation is a four-step rule (`astryx docs elevation`, site `/docs/elevation`) — VERIFIED

`none` when flat or embedded, `low` when in-flow but distinct, `med` when over page content, `high`
when over the whole UI. A non-overlapping surface is `none` or `low`, never `med` or `high`.

### A18. Radius by role (`astryx docs shape`) — VERIFIED

`--radius-element` for interactive controls; `--radius-container` for content containers;
`--radius-full` for pills. Don't use `--radius-page` for small elements. Don't hardcode radius.

### A19. Motion (`astryx docs motion`) — VERIFIED

Fast tokens for small frequent interactions, medium tokens for larger transitions that rearrange the
layout. Honour reduced motion at the OS level. One easing token, `--ease-standard`.

### A20. Illustrations (`astryx docs illustrations`) — VERIFIED

Sized 120-240px: 120px for inline empty states, 240px for full-page onboarding. Centred, with
supporting text below. "Always pair the illustration with a heading and optional body text to explain
what the user should do next." Named contexts include "Error states | Permission denied, not found,
service unavailable."

### A21. Panels and inspectors (`astryx docs layout`) — VERIFIED

> "Master-detail is the backbone of tool UIs: selecting a row opens a fixed-width inspector panel
> rather than navigating away."

Use `LayoutPanel` in the end slot with an explicit width budget. Let the panel overlay the content
region below about 1024px rather than compressing it.

### A22. The responsive contract is a comment (`astryx docs layout`) — VERIFIED

> "Declare breakpoint behavior as a contract before building, and keep it in a comment at the frame
> root."

Typical contract: full frame above 1024px; inspector panels overlay at 1024px and below; side nav
collapses into `MobileNav` at 768px and below.

### A23. Navigation and forms (`astryx docs principles`) — VERIFIED

Rule 7: "Form inputs are controlled (value + onChange)." Rule 8: "Use useLinkComponent() for
navigation so consumers can plug in their framework router via LinkProvider."

### A24. There is a semantic icon registry (`astryx docs icons`) — VERIFIED

28 semantic names resolve through the global registry, including the ones an analytics surface needs:
`arrowUp` "Sort ascending", `arrowDown` "Sort descending", `arrowsUpDown` "Sortable column indicator",
`funnel` "Filter controls", `viewColumns` "Column visibility settings", `eyeSlash`, `search`,
`calendar`, `clock`, `moreHorizontal`, `externalLink`, `success`, `error`, `warning`, `info`.

> "Components that accept an icon prop use IconType: either a semantic name string or a direct SVG
> component."

This is settled, and it is also the escape hatch from the `@heroicons/react` breakage. See B12.

### A25. Chart series use data tokens, not UI colours (`astryx hook useTheme`) — VERIFIED

The **only** normative sentence about charts anywhere in the CLI:

> "Do: Use data visualization tokens such as --color-data-categorical-blue for chart series instead of
> arbitrary UI colors."
> "Don't: Hardcode light/dark colors in data visualizations: resolve them through the current theme
> instead."

It is buried in a hook doc. `astryx docs color` never mentions it. See C25.

### A26. The generated agent brief in `apps/web/AGENTS.md` — VERIFIED

The block between `<!-- ASTRYX:START -->` and `<!-- ASTRYX:END -->` is Astryx's own generated brief.
It is regenerated verbatim by `astryx init --features agents`, so it is Foundation material and it is
settled. `astryx doctor` checks for it and reports "Astryx agent docs section present in AGENTS.md,
CLAUDE.md". VERIFIED.

`design.md` must not restate any of it. What it already says, verbatim:

> "No `<div>` — components do all layout/spacing. Full page → AppShell; sidebar nav → SideNav."
> "Frame first: pick the shell (AppShell / Layout+LayoutPanel) and budget regions in px BEFORE
> writing content."
> "Dense data = rows (Table, List/Item) edge-to-edge — never Card-wrapped list items. Card = dashboard
> widgets, galleries, settings groups only."
> "Status → StatusDot/Token; Badge only for counts and enumerated states, never decoration."
> "Custom styling: component props first; else the xstyle prop / StyleX tokens. No raw hex/px."
> "Tokens for every value. Brand/accent via `astryx theme` — never override `--color-*` in `:root`."
> "SELF-CHECK before you finish: re-read the file and replace any `className=`, `style={{…}}`, raw
> `<div>`/`<span>` layout, imported `.css`/`@apply`, or hardcoded `#hex`/`px` with the component or the
> xstyle prop + a token."

Note what this block **already settles that Bucket B lists as open**: it says "Full page → AppShell",
which decides B2, and "component props first; else the xstyle prop", which decides B1. Both are
therefore Arm-2 material we get for free — the always-on channel already carries them. **Do not spend
`design.md` ink on B1 or B2.** They are listed in Bucket B because the CLI and the templates leave
them open; `AGENTS.md` closes them.

Note also what it leaves out: it names `docs <topic>` as a flat list of 15 topics with no routing, and
it never mentions `astryx search`, `astryx doctor`, `astryx manifest`, `astryx hook`, `astryx blog`,
or `astryx layout`. See Bucket D.

### A27. The order of operations before writing UI (`astryx build`, no args) — VERIFIED

`astryx build` with no arguments prints the workflow playbook. This is the Foundation's own stated
order, and it is settled:

> "1. Find a starting point for what you're building: `astryx build "<what you're building>"` — returns
> the closest [page] template, the [block]s that cover parts, and the [component]s to fill the gaps."
> "2. If a [page] template matches → scaffold it and adapt: `astryx template <name> [path]`"
> "3. If nothing matches exactly → compose: `astryx template <name> --skeleton` to study a close page's
> layout; `astryx template <BlockName>` to drop in each block from the kit; `astryx component <Name>`
> to fill remaining gaps."
> "Tip: `astryx build "<idea>"` is the fastest way in. For a neutral lookup of any
> component/doc/template, use `astryx search <query>`."

`apps/web/AGENTS.md` states the same three steps and adds "discover, don't guess".

---

## Bucket B — open choices, we must pick one

Each entry names two or more sanctioned ways to do the same thing, with nothing to break the tie.
Each carries a candidate rule in the imperative register, and each candidate rule is checkable by
reading generated code or a screenshot, so it can carry an Expectation.

**Count: 20 entries.**

### B1. Styling approach — VERIFIED open

The Foundation refuses to choose. `astryx docs principles` rule 4: "StyleX or Tailwind for custom
styling; both are first-class." The site's `/docs/styling` says "All approaches resolve to the same
design tokens, so theming and dark mode work regardless of which you choose." StyleX, Tailwind,
`className`, and token aliases for Panda, Chakra, MUI, Emotion, styled-components, UnoCSS, CSS
Modules and Sass are all sanctioned. The only narrowing is "For component-specific overrides, prefer
`xstyle`."

> **Candidate rule.** Use component props first. When a prop does not exist, use the `xstyle` prop
> with `stylex.create()` and token imports from `@astryxdesign/core/theme/tokens.stylex`. Never use
> `className`, never use a `style` object, never import a `.css` file.

**Already closed by A26.** The `AGENTS.md` block says "component props first; else the xstyle prop",
so Arm 2 gets this for free. Do not spend `design.md` ink here. It stays in Bucket B because the CLI
and the templates leave it open.

*Expectation hook.* Grep the generated file for `className=`, `style={{`, and `.css`. All three must
be absent.

### B2. `AppShell` versus `Layout` for a full page — VERIFIED open

`astryx docs layout` names three frames with no tie-breaker for a dashboard: AppShell, Layout with
LayoutPanel, or a plain content column. `apps/web/AGENTS.md` says "Full page -> AppShell". But **all
14 page templates use `Layout` with slot props and none uses `AppShell`**; `AppShell` appears only in
block templates. The Foundation's own instruction and its own examples disagree.

> **Candidate rule.** Wrap every page in `AppShell` with a `SideNav`. Inside it, use `Layout` with
> `LayoutHeader`, `LayoutContent`, and an optional end-slot `LayoutPanel`.

*Expectation hook.* The generated route file contains `<AppShell` and `<LayoutHeader`.

**Already closed by A26.** The `AGENTS.md` block says "Full page → AppShell; sidebar nav → SideNav",
so Arm 2 gets this for free. It stays in Bucket B because all 14 page templates contradict it, which
makes it a live Divergence risk in Arm 1.

### B3. `SideNav` versus `TopNav` — VERIFIED open

The site says "default to `SideNav`: it absorbs destinations you have not planned yet", then
describes TopNav for shallow navigation, then "Both bars" for ecosystem layers. `astryx docs layout`
offers "AppShell + SideNav or TopNav + TabList" for the console archetype. Two sanctioned answers for
our exact archetype.

> **Candidate rule.** Use `SideNav` for the analytics surface. Do not use `TopNav`. Do not use both.

### B4. Table and List density — VERIFIED open

`density: 'compact' | 'balanced' | 'spacious'`, defaulting to `balanced`. The site gives per-region
heuristics but no page-level rule. Astryx's own templates use all three, and omit the prop entirely on
8 of 13 table renders.

> **Candidate rule.** Set `density="compact"` on every `Table` and `List` on the analytics surface.
> Never omit the prop.

*Expectation hook.* Every `<Table` and `<List` in the output carries an explicit `density`.

### B5. Pagination variant — VERIFIED open

Six variants: `pages | count | compact | dots | input | none`. `astryx component Pagination` gives a
rule for three of them. `compact`, `input` and `none` have no selection rule.

> **Candidate rule.** Use `variant="pages"` with `totalItems` for every paginated table. Do not use
> `compact`, `input`, `dots`, or `none`.

### B6. `Card` and `Section` padding have no default — VERIFIED open

`astryx component Card --json` and `astryx component Section --json` both report `padding` with the
type `0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10` and **`default = None`**. The Foundation
publishes eleven sanctioned values and does not say which one to use. Astryx's own templates use bare
`<Card>`, `<Card padding={3}>`, and `<Section variant="transparent" padding={4}>`.

> **Candidate rule.** Use `padding={4}` on every `Card` and every `Section`. Never omit it. Never use
> another value.

*Expectation hook.* Every `<Card` and `<Section` carries `padding={4}`.

### B7. `Section` variant — VERIFIED open

`'section' | 'transparent' | 'muted'`, no documented default. `astryx component Section` says "Start
with the default variant. Use muted only to call attention to a specific region", which names a
default without naming which literal it is.

> **Candidate rule.** Omit the `variant` prop on `Section`. Never use `muted` or `transparent` on the
> analytics surface.

### B8. `Table` has two invocation forms — VERIFIED open

The declarative form takes `data`, `columns` and `idKey`. The children form takes `columns` and JSX
rows, plus a hand-written `<colgroup>` and a manual `resolveColumnWidths(columns)` call. Astryx uses
the declarative form 12 times and the children form once, in `table-grouped`.

> **Candidate rule.** Always call `Table` with `data`, `columns` and `idKey`. Never pass `TableRow`
> children. Never hand-write a `colgroup`.

*Expectation hook.* No `<TableRow` or `<colgroup` appears in the output.

### B9. Table pagination: plugin or sibling — VERIFIED open

Two block templates disagree. `TablePaginatedTable` uses `useTablePagination` and renders pagination
through the `Table` plugin slot. `PaginationWithTable` slices the array by hand and mounts
`<Pagination>` as a sibling below. The callback prop is even named differently: `onPageChange` in one,
`onChange` in the other.

> **Candidate rule.** Paginate with the `useTablePagination` plugin, passed through
> `plugins={{pagination}}`. Never render `Pagination` as a sibling of a `Table`.

### B10. `textOverflow` wrap or truncate — VERIFIED open

`Table` accepts `textOverflow: 'wrap' | 'truncate'` and **defaults to `wrap`**. Header cells always
truncate. The Foundation gives no rule for body cells. Exactly one template sets it.

> **Candidate rule.** Set `textOverflow="truncate"` on every `Table`. Truncated cells must show the
> full value on hover.

### B11. Demote text by weight or by colour — VERIFIED open

The site says rank content "with weight and color rather than size", and offers both without saying
which leads.

> **Candidate rule.** Demote secondary text with `color="secondary"` on `Text type="supporting"`.
> Never demote by changing `weight` alone. Never demote by changing size.

### B12. Icon prop form — VERIFIED open, and load-bearing

Three sanctioned forms appear in Astryx's own code: `icon={HomeIcon}` (a component),
`icon={<Icon icon={FunnelIcon} size="sm" />}` (an element), and `startIcon={MagnifyingGlassIcon}`.
`astryx docs icons` sanctions a fourth: a semantic name string. The doc's own custom-icon example
imports from `@heroicons/react` and `lucide-react`.

This is not cosmetic. Choosing the semantic-name form is the difference between code that builds here
and code that does not. See the cross-check.

> **Candidate rule.** Pass semantic icon names as strings, from the 28 names in `astryx docs icons`.
> Never import from `@heroicons/react` or `lucide-react`. When no semantic name fits, import the icon
> from `@phosphor-icons/react` and pass the component.

*Expectation hook.* No `@heroicons/react` or `lucide-react` import appears anywhere in the output.

### B13. Divider prop spelling — VERIFIED open

Four spellings for one idea: `hasDivider` on `LayoutHeader`, `LayoutPanel`, `LayoutFooter` and
`TabList`; `hasDividers` on `List`; `dividers="rows"` on `Table`; `dividers={['bottom']}` on
`Toolbar`.

This is a Foundation API inconsistency we cannot fix, but we can force a consistent posture.

> **Candidate rule.** Set `hasDivider` on `LayoutHeader`. Set `dividers="rows"` on every `Table`. Set
> `hasDividers` on every `List`. Do not add dividers anywhere else.

### B14. `Grid` column expression — VERIFIED open

Two sanctioned forms: `columns={4}` (fixed) and `columns={{minWidth: 320, repeat: 'fit'}}`
(responsive). Astryx's templates use both, and two of them nest a second `Grid` inside the first to
force KPI pairs, with different arithmetic each time.

> **Candidate rule.** Lay out the KPI row with `<Grid columns={{minWidth: 240, repeat: 'fit'}}
> gap={4}>`. Never nest a `Grid` inside a `Grid`.

*Expectation hook.* No `<Grid` appears as a descendant of another `<Grid` in the output.

### B15. `Table` versus `List` for records — VERIFIED open

`astryx docs layout` says Table for columnar records and List for "scannable single-line records".
`astryx component Table` says "for simpler or inconsistent data, consider a list or card layout
instead". The boundary is a judgement call the Foundation leaves to the reader.

> **Candidate rule.** Use `Table` whenever a record has two or more attributes worth comparing across
> rows. Use `List` only when a record renders as one line of text plus one status.

### B16. `Layout contentWidth` — VERIFIED open

The site names 640 for forms and settings and 960 for content pages. The templates use 1000, 1200 and
1440, and omit the prop nine times out of twelve.

> **Candidate rule.** Omit `contentWidth` on dashboards, reports and tables; those regions fill.
> Set `contentWidth={640}` on settings and form pages.

### B17. Heading level for a region title — VERIFIED open

`settings` titles regions with `Heading level={3}`. `settings-sidebar` titles the same kind of region
with `Heading level={2}`. Both dashboards use `level={3}` for widget titles but `level={4}` for KPI
labels.

> **Candidate rule.** Use `Heading level={1}` for the page title, `level={2}` for a page region, and
> `Heading level={3}` for a widget title inside a region. Never use `level={4}` or lower.

*Expectation hook.* No `level={4}`, `level={5}` or `level={6}` appears; exactly one `level={1}`.

### B18. `Badge` versus `StatusDot` for a row status — VERIFIED open

`astryx docs layout` says "Status -> StatusDot/Token; Badge only for counts and enumerated states".
`astryx component Badge` says success/warning/error variants are for "system status that demands
attention". Astryx's own templates use `Badge` in four table templates and `StatusDot` in
`table-grouped`, for the same job.

> **Candidate rule.** Show row status with `StatusDot` and a text label. Use `Badge` only when the
> state is exceptional and needs action, and never on more than a minority of rows.

### B19. Filter and toolbar placement — VERIFIED open

Three sanctioned placements appear: inside `LayoutContent` above the table (`table-page`); inside
`LayoutHeader` on a second row under the title (`table-grouped`); inside a `Toolbar` with
`startContent` and `endContent` (`ToolbarTableFilter`). A fourth construct, `PowerSearch`, exists with
five blocks of its own.

> **Candidate rule.** Put filters in a `Toolbar` as the first child of `LayoutContent`, above the
> table. Never put filters in `LayoutHeader`.

### B20. Card elevation on a dashboard widget — VERIFIED open

`Card` accepts `elevation: 'none' | 'low' | 'med' | 'high'` with no documented default.
`astryx docs elevation` gives the rule for overlapping surfaces, and a dashboard widget does not
overlap, which leaves `none` and `low` both valid.

> **Candidate rule.** Omit `elevation` on dashboard widget cards. Never set `med` or `high` on a card
> that sits in the page flow.

---

## Bucket C — silences, we must author from nothing

The Foundation says nothing. This is the richest bucket, and the one where `design.md` has no
competition. Each entry is a candidate rule.

**Count: 38 entries.**

### Numbers and formatting

The Foundation's only display-formatting doctrine is `Timestamp` (A13). Everything below is NOT FOUND.

**C1. Number formatting.** NOT FOUND. Checked `astryx docs internationalization` (209 lines, grep for
`number`, `currency`, `percent`, `decimal`, `plural`, `Intl.` — only `Intl.Locale.getTextInfo` for RTL
direction), `astryx docs tokens`, `astryx docs typography`, site `/docs/internationalization`, site
`/docs/content` (404). `astryx search "number currency date percentage formatting"` returns only
input components (`NumberInput`, `DateInput`) and `Timestamp`. **There is no display component and no
doc for numbers.**

> **Candidate rule.** Declare one module-level `Intl.NumberFormat` per format and reuse it. Always
> pass an explicit locale. Never call `toLocaleString()` without arguments, because it renders
> differently on the server and the client.

*Expectation hook.* Grep for `toLocaleString()` with no argument. It must be absent.

**C2. Currency.** NOT FOUND.

> **Candidate rule.** Render currency with `Intl.NumberFormat(locale, {style: 'currency', currency})`.
> Never build a currency string by concatenating a `$`.

**C3. Percentages and deltas.** NOT FOUND.

> **Candidate rule.** Render a percentage with `style: 'percent'` and one decimal place. Always show
> an explicit sign on a delta, and always state the comparison period next to it.

**C4. Large-number abbreviation.** NOT FOUND.

> **Candidate rule.** Abbreviate a KPI value above 10,000 with
> `notation: 'compact', maximumFractionDigits: 1`. Never abbreviate inside a table cell.

**C5. Numeric column alignment.** NOT FOUND. `TableColumn` exposes an `align` field, but no doc names
a rule and `grep "align:"` across all 29 scaffolded templates returns nothing. Every numeric column in
every Astryx template is left-aligned by default.

> **Candidate rule.** Right-align numeric, currency and percentage table columns. Left-align text and
> dates. Right-align the matching column header.

*Expectation hook.* Every numeric `TableColumn` carries `align: 'end'`. Visible in a screenshot too.

**C6. Missing and null values.** NOT FOUND as guidance. Handled exactly once in Astryx's own code,
in `table-grouped`, which renders an em dash in `Text type="supporting" color="secondary"`.

> **Candidate rule.** Render a missing value as an em dash in `Text type="supporting"
> color="secondary"`. Never render an empty cell, `null`, `undefined`, `0`, or `N/A`.

**C7. Rounding and precision.** NOT FOUND.

> **Candidate rule.** Use the same number of decimal places for every value in a column. Choose the
> precision once per column, not per row.

### Charts

**There is no chart component in `@astryxdesign/core@0.3.0`.** `astryx component Chart` returns
`Error: No component named "Chart"`. VERIFIED. `astryx build "chart"` reports "No exact match".
VERIFIED. The website has no `/docs/charts` and no `/docs/data-visualization`; both 404. VERIFIED.

The data tokens **do ship** in the installed package, at
`@astryxdesign/core/dist/theme/domainTokens/dataTokens.ts`. VERIFIED by reading the file. But
`astryx docs color --json` reports only four sections — `Overview`, `Surface Colors`, `Usage`,
`Best Practices` — and none of them mentions a data token. VERIFIED. The tokens appear in the CLI
corpus only inside a `useTheme` code example.

**The silence spans both Delivery channels.** I checked the MCP server, which serves the website's
corpus. `mcp__astryx__get("color", {section: "data"})` errors and lists the available sections as
`["Overview", "Surface Colors", "Usage", "Best Practices"]` — identical to the CLI.
`mcp__astryx__get("tokens", {section: "data"})` errors and lists fourteen sections, none of them about
data. VERIFIED. **Correction:** a first pass reported that the website's `/docs/color` lists the
data-viz tokens with no prose. It does not list them at all. Neither channel documents them.

The source file's header comment is the closest thing to chart doctrine that exists:

> "Categorical: one accent per category (use for distinct series/dimensions)"
> "Neutral: a single neutral tone (use for labels, reference lines, empty states)"
> "Sequential ramps (color-5 -> color-1): darkest -> lightest within a hue. Use for
> ordered/quantitative scales, heatmaps, choropleth maps."

The categorical palette is declared in this order: blue, orange, purple, green, pink, cyan, red, teal,
brown, indigo. Ten colours. Each is declared as `light-dark(X, X)` — **the same value in both modes**,
so categorical tokens do not adapt to dark mode. INFERRED consequence: "resolve through the theme"
buys nothing for categorical series, only for text, grid and axis colours.

**C8. Which chart library.** NOT FOUND, and actively broken. Astryx ships three mutually incompatible
chart stacks across its own templates.

> **Candidate rule.** Render every chart from one named local component. Never import a chart library
> directly into a route file.

**C9. Series colour assignment.** NOT FOUND.

> **Candidate rule.** Assign series colours from `--color-data-categorical-*` in the declared order:
> blue, orange, purple, green, pink, cyan, red, teal, brown, indigo. Never pick a colour by hand.
> Never use a raw hex.

*Expectation hook.* Grep for `#` followed by six hex digits in the chart file. It must be absent.

**C10. Reserved colours.** NOT FOUND. The categorical palette contains `green` at position 4 and `red`
at position 7, which collide with `--color-success` and `--color-error`.

> **Candidate rule.** Never use `--color-data-categorical-red` or `--color-data-categorical-green` for
> an ordinary series. Reserve red and green for series that mean bad and good.

**C11. Categorical versus sequential.** NOT FOUND in any doc; present only in the source comment.

> **Candidate rule.** Use categorical tokens for distinct series. Use a sequential ramp for an ordered
> quantity, a heatmap, or a choropleth. Never mix a categorical token into a sequential ramp.

**C12. Many series.** NOT FOUND.

> **Candidate rule.** Show at most six series in one chart. Above six, group the remainder into an
> "Other" series coloured `--color-data-neutral`.

**C13. Axis conventions.** NOT FOUND. Astryx's own templates hardcode the axis domain to the fixture
data, so the chart silently clips when the data changes.

> **Candidate rule.** Derive every axis domain from the data. Start a bar-chart value axis at zero.
> Never hardcode a domain or a tick array.

**C14. Axis tick formatting.** NOT FOUND. Two Astryx templates format the same revenue axis two
different ways.

> **Candidate rule.** Format axis ticks with the same `Intl.NumberFormat` instance the chart's
> tooltip uses.

**C15. Legend.** NOT FOUND. One Astryx template hand-rolls a legend; the other three have none.

> **Candidate rule.** Show a legend when a chart has two or more series. Omit it for one series and
> name the series in the widget title instead. Place the legend above the plot area.

**C16. Chart tooltip.** NOT FOUND. Two Astryx templates hand-build one; two have none.

> **Candidate rule.** Give every chart a tooltip that names the series, the x value, and the formatted
> y value.

**C17. Chart empty, loading and error states.** NOT FOUND.

> **Candidate rule.** A chart with no data renders an `EmptyState` in the chart's own region, at the
> chart's own height, so the layout does not jump.

**C18. Sparklines.** NOT FOUND. Astryx defines three near-duplicate sparkline components across two
templates.

> **Candidate rule.** Draw a sparkline with no axes, no gridlines and no tooltip. Colour it with the
> same token as the metric's trend.

**C19. An accessible alternative to a chart.** NOT FOUND.

> **Candidate rule.** Give every chart an accessible name and a text summary of its headline
> movement.

### Tables

**C20. Table empty state.** NOT FOUND in any of the 14 page templates. `astryx docs layout` does say
"EmptyState inside the region when a filter matches nothing", which is the closest the Foundation
gets, but no template obeys it and `astryx component Table` never mentions it.

> **Candidate rule.** Render an `EmptyState` inside the table's region when the row set is empty. When
> a filter caused it, the primary action is "Clear filters".

*Expectation hook.* The generated file branches on `rows.length === 0`.

**C21. Table loading state.** NOT FOUND in any page template.

> **Candidate rule.** While rows load, render `Skeleton` rows at the table's own row height and column
> count. Never render a `Spinner` in place of a table.

**C22. Table error state.** NOT FOUND anywhere in any of the 29 scaffolded files. No `Banner`, no
`Toast`, no error boundary, no retry.

> **Candidate rule.** When a fetch fails, render an error `Banner` above the region with a retry
> action, and keep the region's frame in place.

**C23. Default sort.** NOT FOUND. Not one page template marks a single column sortable.

> **Candidate rule.** Sort every table by default on its most meaningful column, and state the
> direction with `defaultSort`. Mark every column sortable except free-text and action columns.

**C24. Default page size.** NOT FOUND. `Pagination` defaults `pageSize` to 10; `Table` has no default.

> **Candidate rule.** Paginate any table that can exceed 50 rows. Use a page size of 25. Never use
> infinite scroll on the analytics surface.

**C25. Column header treatment.** NOT FOUND. `renderHeader` is never used in any template, so there is
no worked example of a unit suffix, a sort chevron, or a header tooltip.

> **Candidate rule.** Write column headers in sentence case. Put the unit in the header, not in every
> cell. Never repeat a unit in a cell.

**C26. Result count.** NOT FOUND as a rule. `PowerSearch` accepts `resultCount`, and Astryx passes it
a number in one template and a hand-pluralised string in another.

> **Candidate rule.** Show the result count next to the filters, and state the total when the view is
> filtered.

### Page composition

**C27. The page title.** NOT FOUND as a rule, and Astryx's own templates break its own typography
doctrine. The `dashboard` template has **no `h1` at all** and starts at `Heading level={3}`.
`dashboard-portfolio` has **two `Heading level={1}`** on one page. VERIFIED by grep.

> **Candidate rule.** Every page has exactly one `Heading level={1}`, and it sits in `LayoutHeader`.

*Expectation hook.* Count `level={1}` in the output. It must equal 1.

**C28. The page header construct.** NOT FOUND. There is no `PageHeader` component, and no template
defines one. Astryx composes the page header four different ways.

> **Candidate rule.** Compose the page header as `LayoutHeader hasDivider` containing an `HStack` with
> `hAlign="between"`: the title and its supporting line on the left, at most one primary action on the
> right.

**C29. The KPI tile construct.** NOT FOUND. There is no metric, stat or KPI component in the 155-component
catalog. Astryx builds the tile three incompatible ways.

> **Candidate rule.** Build one KPI tile component and reuse it. Order it value, label, delta. Render
> the value as `Text type="display-3"`, the label as `Text type="supporting" color="secondary"`, and
> the delta as `Text type="supporting"` with a direction icon.

**C30. Page-level density budget.** NOT FOUND. `/docs/density` on the site is a 404. The Foundation has
per-component density and per-region heuristics, and no page-level budget. Astryx's own
`LayoutContent padding` is 0, 3, 4, 6, or omitted, with no stated reason. Outer `VStack gap` is 0, 4,
or 6.

> **Candidate rule.** Set `LayoutContent padding={4}`. Separate page regions with one outer
> `VStack gap={6}`. Use `gap={4}` inside a region and `gap={2}` inside a widget. Use no other spacing
> values on a page.

*Expectation hook.* Collect every `gap` and `padding` literal in the output. The set must be a subset
of {2, 4, 6}.

**C31. Widgets per screen.** NOT FOUND.

> **Candidate rule.** Show at most four KPI tiles in the top row and at most six widgets above the
> fold.

**C32. Page-level error state.** NOT FOUND. The Foundation routes error states to `Banner` at the
component level and names "Permission denied, not found, service unavailable" only as illustration
contexts. `astryx build "error state"` recommends the `editor` page template, which contains no error
state at all. VERIFIED — the Foundation actively misroutes here.

> **Candidate rule.** A page-level failure renders a centred `EmptyState` with an error illustration
> and a retry action. A region-level failure renders a `Banner` inside the region.

**C33. Loading latency threshold.** NOT FOUND. `Skeleton` and `Spinner` say which to use, never when.

> **Candidate rule.** Show a loading state only after 200ms. Once shown, keep it for at least 400ms so
> it does not flash.

**C34. Data freshness.** NOT FOUND.

> **Candidate rule.** Show the time the data was last refreshed in `LayoutHeader`, using `Timestamp`
> with the auto format.

**C35. Scroll ownership.** NOT FOUND. `LayoutPanel` has `isScrollable`; nothing says which region owns
the page scroll.

> **Candidate rule.** `LayoutContent` owns the only vertical scroll on a page. `LayoutHeader` never
> scrolls. A table scrolls its body with a sticky header, not the page.

### Copy and tone

There is no writing, content, voice or microcopy page. `/docs/content` and `/docs/writing` are both
404 and neither appears in the site navigation. VERIFIED. What exists is scattered across component
docs: the Banner title example, the `EmptyState` "No projects yet" example, and the Badge label limit.

**C36. Case.** NOT FOUND.

> **Candidate rule.** Write every label, column header, button and page title in sentence case. Never
> use title case. Never use all caps.

**C37. Metric labels.** NOT FOUND.

> **Candidate rule.** Name a metric with a noun phrase and no verb. State the period in the label or
> immediately below it. Never abbreviate a metric name in a KPI tile.

**C38. Button verbs.** NOT FOUND.

> **Candidate rule.** Label an action button with a verb and its object, at most three words. Never
> label a button "Submit", "OK", or "Click here".

---

## Bucket D — discovery guidance, when should an agent run what?

Astryx's position is that the CLI is the documentation and the source of truth. Our cheapest,
highest-leverage rules are therefore ones that **send the agent to a command instead of paraphrasing
what it would find there**. A rule that routes costs one line and never goes stale. A rule that
restates goes stale on the next `@astryxdesign/core` bump.

This bucket does not author or register anything into Astryx. Registering our own material stays out
of scope per [#5](https://github.com/andrskr/something-something-ui/issues/5).

**Count: 14 candidate rules.**

### D-a. What each command is actually best at

VERIFIED by running each. "Disappoints" is the part a routing rule has to work around.

| Command | Best at | Disappoints |
| --- | --- | --- |
| `astryx build "<idea>"` | The one-shot way in. Returns RECOMMENDED START, PAGE TEMPLATES, BLOCKS, DOMAIN COMPONENTS, FRAME + FOUNDATION in one call. | Always recommends *something*. For `"chart"` and `"error state"` it says "No exact match" and then recommends a template that does not contain the thing asked for. Its recommendation for `"analytics dashboard"` does not build in this repo. |
| `astryx search "<query>"` | Neutral ranked lookup across components, hooks, docs and templates in one list, with a `command:` line per hit. Best when you do not know which *kind* of thing you need. | Flat list, no grouping by relevance to a task. Returns 20 hits by default. |
| `astryx component <Name>` | Props, defaults, best practices, and worked examples. The only reliable source for what a prop accepts. | Many props report `default = None` even where a default exists in behaviour. `--detail compact` works here but not on `docs`. |
| `astryx component --list` | The 155-component inventory. | Flat alphabetical, no categories, ~2000 lines. Use `search` instead unless you need the whole inventory. |
| `astryx template --list` | The 43 page recipes and 614 block recipes. `--json` gives the real ids. | **The display name is not the id.** `astryx template "Analytics Dashboard"` fails; you must pass `dashboard`. Three page templates are `isReady: false`. |
| `astryx template <name> [--skeleton]` | Real composed reference code. `--skeleton` shows structure without content, which is the cheap read. | The scaffolded code does not build here and does not lint. See the cross-check. |
| `astryx docs <topic> [section]` | Doctrine, not API. The section argument keeps it cheap. | Only 15 topics, and the routing between them is not obvious. `--detail brief\|compact` returns 0 bytes. |
| `astryx hook <Name>` | Hook docs. Holds the **only** normative sentence about chart colour, under `useTheme`. | Not mentioned in `apps/web/AGENTS.md` at all, so an agent has no reason to run it. |
| `astryx doctor` | Preconditions: Node version, core/CLI alignment, theme wiring, whether the agent docs block is present. Six checks, all `[ok]` here. | Says nothing about whether template dependencies resolve. |
| `astryx manifest --json` | The machine-readable capability surface: `name`, `version`, `apiVersion`, `globalOptions`, `commands`, `jsonSupported`, `responseTypes`. The right thing for the Instrument to parse. | Not mentioned in `apps/web/AGENTS.md`. |
| `astryx layout expand\|check\|grammar` | A layout DSL that claims to emit *validated* TSX from a compressed expression. | **Broken in 0.3.0 — see D-e.** |
| `astryx discover` | Nothing here. Returns "No integrations configured." | — |

> **D1.** Start every UI task with `astryx build "<what you are building>"`. Read the whole kit before
> writing any code.

> **D2.** When `astryx build` reports "No exact match", do not scaffold the template it falls back to.
> Compose from the BLOCKS and DOMAIN COMPONENTS sections instead.

*Expectation hook.* For a Fixture whose subject has no matching template — a chart, an error state —
the transcript shows a `build` call and no `template` scaffold of the fallback.

> **D3.** Pass template ids, never display names. Get ids from `astryx template --list --json`.

> **D4.** Run `astryx component <Name>` before using any component for the first time in a file. Never
> guess a prop name. `astryx docs principles` lists "Inventing props" as an anti-pattern.

*Expectation hook.* Every Astryx component in the output uses only props that
`astryx component <Name> --json` reports.

### D-b. Routing table: which `astryx docs <topic>` answers which design question

VERIFIED — all 15 topics read. This table is the deliverable a routing rule cites, so `design.md`
never has to paraphrase the content.

| Design question | Topic | What you get |
| --- | --- | --- |
| Which shell? How wide is a region? How does it collapse? | `layout` | Frame First, App Archetypes, Cards vs Rows, Panels and Inspectors, Responsive Contract |
| Card or rows? Card or Section? | `layout` (`Cards vs Rows`) then `component Card` | The archetype table, then the "could I reorder it independently?" test |
| What are the non-negotiables? | `principles` | 8 rules and 7 anti-patterns |
| How much space? | `spacing` | The 4px scale, 0 to 12, and the step heuristic |
| Which text style? Heading or Text? | `typography` | Type scale, the Heading/Text split, the display-for-data-callouts rule |
| Which colour? | `color` | Semantic surface, text, icon, border and status tokens. **Not** data-viz tokens |
| Which shadow? | `elevation` | The four-step none/low/med/high rule |
| Which corner radius? | `shape` | inner / element / container / page / full |
| How fast should it animate? | `motion` | Duration and easing tokens, reduced-motion |
| Which icon? | `icons` | 28 semantic names, including `arrowsUpDown`, `funnel`, `viewColumns` |
| What goes in an empty state? | `illustrations` + `component EmptyState` | 120-240px sizing; title and next step |
| What is the full token list? | `tokens` | Every token by family. **No data-viz family** |
| How do I style something a prop does not cover? | `styling` | xstyle, StyleX, Tailwind, className, data attributes, "What NOT to Do" |
| How do I change the brand? | `theme` | `defineTheme`, `resolveThemeTokens`, `useTheme` |
| RTL, locales, translations? | `internationalization` | Direction, catalogs, react-intl interop. **No number or currency formatting** |
| Coming from Tailwind or shadcn? | `migration` | Incremental migration order |

Three questions an analytics surface asks that **no topic answers**: how to format a number, how to
build a chart, and how to write a label. Those are Bucket C.

> **D5.** For any question about spacing, colour, type, radius, elevation, motion, icons or layout,
> run `astryx docs <topic>` and follow what it says. Do not reason from memory about what a design
> system usually does.

> **D6.** Pass the section argument on large topics: `astryx docs theme "defineTheme"`, not
> `astryx docs theme`. `theme` is 288 lines and `tokens` is 251.

> **D7.** For chart colour, run `astryx hook useTheme`. It is the only place the Foundation says
> anything normative about chart series, and `astryx docs color` does not link to it.

### D-c. MCP versus CLI

This session reaches Astryx two ways. `.mcp.json` configures `astryx` as an **HTTP server at
`https://astryx.atmeta.com/mcp`** — it is the *website's* corpus, not the installed package. VERIFIED
by reading `.mcp.json`. It exposes exactly two tools, `search(query, limit)` and
`get(name, section?)`.

**What MCP returns that the CLI does not.** VERIFIED, and this is the finding that matters.

`mcp__astryx__search("dashboard template")` returns three analytics page templates that **do not
exist in the installed CLI**: `dashboard-data` ("Data Dashboard — filter bar, overview KPI cards with
sparklines and d/d, w/w, m/m, y/y deltas, active-users-by-device trend, audience demographics and
acquisition channels"), `dashboard-cohort-funnel` ("conversion-rate KPIs, a multi-stage conversion
funnel with drop-off cards, a conversion-over-time trend chart, and a weekly cohort retention grid
rendered as a colour-coded heatmap table"), and `dashboard-project-status`.

`pnpm exec astryx template dashboard-data <path>` returns `Error: Unknown template "dashboard-data"`.
VERIFIED.

These are the three most analytics-relevant templates in the whole catalog, and they are **readable
via MCP but not scaffoldable via the CLI**. `mcp__astryx__get("dashboard-data")` returns the source.

MCP search results also carry `relatedComponents` and `relatedHooks` fields, which the CLI's `search`
does not.

**What the CLI does better.** MCP search ranks components above templates and docs unless the query
literally contains the word "template" or a doc-topic word. On
`"analytics dashboard with KPI tiles and a data table"` MCP returned eight components and zero
templates. The CLI's `search` on the identical string returned `dashboard` and `dashboard-portfolio`
as the top two hits. VERIFIED, same query both ways. On
`"chart series color data visualization"` MCP returned `Grid`, `useImageMode`, `Blockquote` and
`Badge`; the CLI returned `useTheme` first, then the three chart templates.

**The name-collision trap.** `mcp__astryx__get("layout")` returns the **`Layout` component**, not the
`layout` doc topic. There is no way to disambiguate — `get` takes one name space. The CLI separates
them by command: `astryx docs layout` and `astryx component Layout` resolve differently and both
work. VERIFIED. An agent that asks MCP for layout doctrine silently gets component props instead.

**Version skew is asymmetric.** MCP *templates* are newer than the installed CLI, but MCP *docs* match
it: `get("color")` reports the same four sections as `astryx docs color`. MCP's `tokens` doc has a
`Focus Tokens` section the CLI 0.3.0 lacks, so there is some drift. One thing MCP *does* carry that
the CLI 0.3.0 does not: the `Layout` `contentWidth` prop, whose description holds the "640 for forms,
settings, and text-focused pages; 960 for content pages" guidance. `astryx component Layout --json`
on 0.3.0 does not report `contentWidth` at all. VERIFIED.

> **D8.** Use the CLI as the source of truth for anything you will write into this repo. Its answers
> match the installed `@astryxdesign/core@0.3.0`; the MCP server's do not.

> **D9.** Use `mcp__astryx__search` only to *find* material, and only with the word "template" in the
> query when you want templates. Confirm anything it names against `astryx template --list` before
> you rely on it. A template MCP knows about may not be installable.

> **D10.** Never call `mcp__astryx__get` for a doc topic whose name is also a component name —
> `layout`, `theme`, `icons`. Use `astryx docs <topic>` for doctrine and `astryx component <Name>` for
> props.

*Expectation hook.* The transcript contains no `mcp__astryx__get("layout")` call.

### D-d. Machine-readable and dense output

The Instrument will parse this output, so the flags matter. All VERIFIED.

| Flag | Status | Note |
| --- | --- | --- |
| `--json` | Works | `{ type, data }` on success, `{ error, suggestions? }` on error. Works on `docs`, `component`, `template --list`, `search`, `manifest`. The error envelope for `get`-style misses lists valid alternatives, which is useful for recovery |
| `--dense` | Works | `astryx docs layout` is 5432 bytes plain, 3850 dense — 29% saving |
| `--detail full\|compact\|brief` | **Partly broken** | Works on `component`. On `docs`, both `brief` and `compact` return **0 bytes** |
| `astryx docs <topic> <section>` | Works | Cheapest way to read one part of a large topic |
| `astryx manifest --json` | Works | The capability surface, including `jsonSupported` and `responseTypes` |
| `--zh` / `--lang` | Present | Not relevant here |

> **D11.** Read docs with `astryx docs <topic> <section>` or `--dense`. Never pass `--detail brief` or
> `--detail compact` to `docs`; it returns nothing and you will conclude the topic is empty.

> **D12.** Parse CLI output with `--json`, never by scraping the text form.

### D-e. Where the CLI is wrong, and the Layer must warn rather than route

Routing an agent to a command that emits broken code is worse than saying nothing. These need a
warning in `design.md`, not a pointer.

**`astryx layout expand` emits code that does not compile.** VERIFIED, and this is the sharpest
example. Running:

```
astryx layout expand 'A[cp0 @sideNav=SN] > L > LH"Revenue" + LC > S[p4] > (C[p4]*4) + T'
```

emits six imports, and **every one of them is wrong**:

```tsx
import {XDSAppShell} from '@astryxdesign/core/AppShell';
import {XDSCard} from '@astryxdesign/core/Card';
import {XDSLayout, XDSLayoutContent, XDSLayoutHeader} from '@astryxdesign/core/Layout';
import {XDSSection} from '@astryxdesign/core/Section';
import {XDSSideNav} from '@astryxdesign/core/SideNav';
import {XDSTable} from '@astryxdesign/core/Table';
```

I imported each subpath at runtime and checked its exported keys. Every module exports the unprefixed
name and **no `XDS`-prefixed name**:

```
@astryxdesign/core/AppShell  | has AppShell: true | has XDSAppShell: false
@astryxdesign/core/Card      | has Card: true     | has XDSCard: false
@astryxdesign/core/Layout    | has Layout: true   | has XDSLayout: false
@astryxdesign/core/Table     | has Table: true    | has XDSTable: false
@astryxdesign/core/Section   | has Section: true  | has XDSSection: false
@astryxdesign/core/SideNav   | has SideNav: true  | has XDSSideNav: false
```

Only three `XDS`-prefixed symbols exist anywhere in `dist`, and none of them is one of these. The
command's own banner claims the output is "validated". It is not.

Two further problems with the same command. It refuses an absolute output path —
"absolute paths are not allowed. Use a path relative to the project root" — so it **cannot write
outside the repository**, which makes it unusable for scratch exploration. And its own
`astryx layout grammar` cheatsheet uses `{kpi-card}` as its worked example of a block reference;
`astryx layout check` rejects that expression with
`Unknown block '{kpi-card}' - block hints must name an existing template block`. VERIFIED. There is no
KPI card block, which independently confirms C29.

> **D13.** Never run `astryx layout expand` or `astryx layout check`. The generated imports do not
> resolve in v0.3.0. Compose the frame by hand from `astryx docs layout`.

**The other warnings, carried over from the cross-check.** Each is a case where the Foundation points
somewhere it should not.

> **D14.** Treat every `astryx template` scaffold as reading material, not as code. Before you use any
> of it: delete the `'use client'` directive and the Meta copyright header, replace every
> `@heroicons/react` import with a semantic icon name, remove every `recharts`,
> `@astryxdesign/charts` and `@astryxdesign/lab` import, replace every inline `style={{…}}` with an
> `xstyle` prop and a token, and rename block files to kebab-case. Never commit a scaffold.

*Expectation hook.* For an edit Fixture seeded from a scaffold, the output contains no `'use client'`,
no `Copyright (c) Meta Platforms`, no `@heroicons/react`, and no `style={{`.
---

## Cross-check against reality

### What breaks when you take a template at face value

`astryx build "analytics dashboard"` recommends `pnpm exec astryx template dashboard <path>` as its
RECOMMENDED START. VERIFIED. That template does not build in this repo.

**Missing packages.** VERIFIED by `require.resolve` from `apps/web`:

| Package | Resolves? | Templates that need it |
| --- | --- | --- |
| `@heroicons/react` | **MISSING** | 18 of 29 scaffolded files, 21 import statements |
| `recharts` | **MISSING** | `dashboard`, `dashboard-portfolio` |
| `@astryxdesign/charts` | **MISSING** | `table-page-chart`, `table-page-shoe-store-heatmap` |
| `@astryxdesign/lab` | **MISSING** | `table-page-heatmap-status` |

`apps/web` depends on `@phosphor-icons/react`, which **no template imports**.

Worse for the chart packages: `npm view` reports `latest` for both `@astryxdesign/charts` and
`@astryxdesign/lab` as `0.0.0-bootstrap.0`, a placeholder stub. Real code ships only on the `canary`
tag. So installing them does not fix the templates. Reported by the template sub-agent; I did not
re-run `npm view`, so treat the registry detail as **NOT VERIFIED by me** while the resolution failure
itself is VERIFIED.

**TypeScript.** 26 errors across the 29 files, and **every one is `TS2307 Cannot find module`** for
the four packages above. Zero prop-type mismatches, zero missing exports, zero API drift against
`@astryxdesign/core@0.3.0`. The templates are type-correct against the installed Foundation. Only the
uninstalled packages break. Reported by the sub-agent with `skipLibCheck: true`, matching
`apps/web/tsconfig.json`.

**Lint.** 396 errors across all 29 files. **Zero files pass.** Top rules:

| Count | Rule |
| --- | --- |
| 93 | `react-perf(jsx-no-jsx-as-prop)` |
| 85 | `typescript(no-unsafe-assignment)` |
| 76 | `typescript(no-confusing-void-expression)` |
| 53 | `unicorn(numeric-separators-style)` |
| 15 | `unicorn(filename-case)` |
| 8 | `unicorn(no-zero-fractions)` |
| 8 | `typescript(strict-boolean-expressions)` |
| 6 | `react(no-array-index-key)` |
| 6 | `jsx-a11y(prefer-tag-over-role)` |
| 4 | `import(no-duplicates)` |

Three of these matter structurally.

1. **`react-perf(jsx-no-jsx-as-prop)` collides head-on with the Foundation's core idiom.** The repo
   disables `jsx-no-new-array/function/object-as-prop` but leaves `jsx-no-jsx-as-prop` on via
   `categories.perf: 'error'`. Astryx's `Layout` slot API *requires* JSX in props:
   `header={<LayoutHeader …>}`, `content={<LayoutContent …>}`, `Button icon={<Icon …/>}`,
   `EmptyState actions={…}`, `Toolbar startContent`, `Popover content`. **There is no way to write an
   Astryx page shell that passes this rule as configured.** This needs a decision before any Fixture
   can grade on lint: either disable the rule for route files, or accept it as noise the Instrument
   ignores. Flagging it rather than deciding it, since it is a repo-configuration call.
2. **`unicorn(filename-case)` fails on every block template, one error each.**
   `astryx template TableInCard ./x` writes `TableInCard.tsx`; the repo mandates kebab-case. Page
   templates write `page.tsx` and are unaffected.
3. **`typescript(no-confusing-void-expression)` (76)** rejects the ubiquitous
   `onClick={() => setState(x)}` shorthand.

**Two payloads on every scaffolded file.** All 29 begin with a
`// Copyright (c) Meta Platforms, Inc. and affiliates.` header and a `'use client';` directive. The
directive is meaningless in this TanStack Start app. The CLI mentions neither. This is why the map
records that templates are reference code only, never committed.

### Inconsistencies between Astryx's own templates

Inconsistency between the Foundation's own examples is the strongest evidence that a rule is needed.
Sixteen found. All from source read by the template sub-agent; I re-verified items 2, 4 and 8 myself.

1. **Three chart stacks.** `recharts` in `dashboard` and `dashboard-portfolio`;
   `@astryxdesign/charts` in `table-page-chart` and `table-page-shoe-store-heatmap`;
   `@astryxdesign/lab` in `table-page-heatmap-status`. The `Chart` from `charts` and the `Chart` from
   `lab` are **different components with incompatible APIs** — one takes series as a prop array and
   axes as a render prop, the other takes series as children with a `yKeys` prop and no `grid` or
   `axes` prop.
2. **The KPI tile, three ways.** VERIFIED by grep. `dashboard` renders label above value, label as
   `Heading level={4}`, value as `Heading level={2}`, and takes delta direction from an explicit
   `positive: boolean` field. `dashboard-portfolio` renders value above label, value as
   `Text type="display-3" weight="bold"`, and infers direction with
   `const positive = !change.startsWith('-')`. `GridDashboardLayout` renders the value as
   `Text type="label"`, which is *smaller* than its own label. Prop shape differs too:
   `{label, value, change, positive, sparkline}` versus `{value, change, label}`. **None of the three
   follows `astryx docs typography`, which shows `<Text type="display-2">$1.2M Revenue</Text>` for
   exactly this case.**
3. **Three sparklines.** `dashboard-portfolio` defines `Sparkline` and `TrendSparkline` in one file,
   byte-identical apart from `height` and `strokeWidth`. `dashboard` defines a third.
4. **Chart colour tokens contradict themselves inside one file.** VERIFIED.
   `dashboard-portfolio` writes `var(--color-data-categorical-green, #22c55e)` at one line and
   `var(--color-data-categorical-green, #0B991F)` sixty lines later — same token, two different
   fallback hexes. The `@astryxdesign/charts` templates use **no tokens at all**, just raw `'#14b8a6'`
   and `'#3b82f6'` for the same revenue-area-chart recipe.
5. **`Table` invoked two ways.** Declarative in 12 renders; children plus a hand-written `colgroup`
   plus a manual `resolveColumnWidths()` in `table-grouped`.
6. **Two pagination recipes that contradict each other**, down to the callback name: `onChange`
   versus `onPageChange`. See B9.
7. **No page template uses `AppShell`**, even though `apps/web/AGENTS.md` says "Full page ->
   AppShell". All 14 use `Layout` with slot props. Two of the six `AppShell*` blocks each describe
   themselves as "the most common layout".
8. **The page header, four ways.** VERIFIED by grep. `LayoutHeader` plus `Heading level={1}` in eight
   templates; `LayoutHeader` plus `Text type="large" weight="semibold"` in `table`; hand-composed
   inside `LayoutContent` with no `LayoutHeader` in `dashboard-portfolio`; and **no page title at all**
   in `dashboard`, whose first heading is `Heading level={3} Active users`. `dashboard-portfolio` has
   two `Heading level={1}` on one page.
9. **Grouping, three ways for one problem.** Three settings templates give three answers.
   `settings` uses `Grid` plus bare `Divider` and zero Cards and zero Sections. `settings-sidebar`
   uses `VStack gap={0}` plus `Heading level={3}` plus `Divider`. `settings-dialog` uses five Cards.
   Section headings are `level={3}` in one and `level={2}` in the other.
10. **`Section` used for page regions in exactly one template.** `detail-page` uses three. All five
    table pages and both dashboards use zero.
11. **Three import specifiers for the same symbols.** `VStack`/`HStack` come from
    `@astryxdesign/core/Layout` in six files, `@astryxdesign/core/Stack` in two, and the root barrel
    in one. `table` splits the root barrel into seven separate import statements from the identical
    specifier, which trips `import(no-duplicates)`.
12. **Icon prop, three forms**, sometimes in one file. See B12.
13. **Divider prop, four spellings.** See B13.
14. **Filter placement, three placements**, plus `resultCount` passed as a number in one template and
    a hand-pluralised string in another.
15. **Grid, two forms plus a nested-Grid hack** with different arithmetic in each dashboard. See B14.
16. **Zero `xstyle` usage.** No template imports `@stylexjs/stylex` or uses an `xstyle` prop, despite
    `astryx docs principles` naming inline styles on raw elements as an anti-pattern and
    `apps/web` depending on `@stylexjs/stylex` directly. Instead the templates use raw `style={}`,
    organised four different ways. `settings-sidebar` has 17 inline `style=` attributes.

### Where the Foundation contradicts itself

Seven self-contradictions worth citing in `design.md`, because they prove the Layer is needed rather
than merely nice.

1. **`astryx docs illustrations` violates `astryx docs principles`.** Its worked example renders a raw
   `<img>` with `style={{ width: 200, height: 200 }}` — a raw element, an inline style, and two raw px
   values, in a doc whose sibling lists all three as anti-patterns. VERIFIED.
2. **`astryx docs icons` recommends the import that breaks this repo.** Its custom-icon example imports
   from `@heroicons/react` and `lucide-react`. VERIFIED.
3. **The data tokens ship but are undocumented in the CLI channel.** `dataTokens.ts` is present in
   `@astryxdesign/core@0.3.0` with 10 categorical tokens, a neutral, and 9 five-step sequential ramps.
   `astryx docs color --json` reports four sections and none of them is about data. The only normative
   sentence lives in `astryx hook useTheme`. VERIFIED. An agent following the documented workflow will
   never learn these tokens exist.
4. **`astryx build "error state"` recommends a template with no error state.** VERIFIED for the
   recommendation; the absence was reported by the template sub-agent across all 29 files.
5. **`astryx layout expand` calls its own output "validated" and emits imports that do not resolve.**
   All six emitted `XDS`-prefixed names are absent from the packages they are imported from. VERIFIED
   by importing each subpath and reading its exported keys. See D-e.
6. **`astryx layout grammar` uses a block in its worked example that does not exist.** Its
   `{kpi-card}` reference is rejected by `astryx layout check` with "Unknown block '{kpi-card}'".
   VERIFIED.
7. **`astryx build`'s own playbook says "No `style={{}}`", and every template uses it.**
   `settings-sidebar` alone has 17 inline `style=` attributes, and no template uses `xstyle` at all.
   VERIFIED for the playbook text; the counts came from the template sub-agent.

### Bucket counts

| Bucket | Entries |
| --- | --- |
| A — settled opinions, adopt verbatim | 27 |
| B — open choices, we pick one | 20 |
| C — silences, we author from nothing | 38 |
| D — discovery guidance, route to a command | 14 |
| Template inconsistencies | 16 |
| Foundation self-contradictions | 7 |

---

## What I could not verify

- **Runtime and visual behaviour.** Nothing was rendered. Every finding comes from CLI output, source,
  `tsc` and `oxlint`. Any Expectation phrased against a screenshot still needs a rendered Ideal.
- **Whether a canary `@astryxdesign/charts` would satisfy the template imports.** Installing packages
  was out of scope. Only the resolution failure is VERIFIED.
- **Whether any template targets a 0.4 or 0.5 core API.** Everything typechecked cleanly against the
  pinned 0.3.0, so no drift is observable from here. `@astryxdesign/core` on npm is at 0.5.0.
- **Component-level quotes from the website.** The site's `/components/*` pages are client-rendered and
  WebFetch returns only the shell. The sub-agent read them through the site's own MCP endpoint at
  `https://astryx.atmeta.com/mcp`. Where a website quote and a CLI quote agree, I cite the CLI.
- **The `jsx-no-jsx-as-prop` decision.** Flagged, not resolved. It is a repo-configuration call, and it
  blocks any Fixture that grades on a clean lint pass.
- **Whether the three MCP-only dashboard templates are worth having.** I read their descriptions, not
  their source. `dashboard-data` and `dashboard-cohort-funnel` sound like the most analytics-relevant
  material in the whole catalog, and they cannot be scaffolded from the installed CLI. Reading them
  through `mcp__astryx__get` is possible and may be worth a follow-up.
- **Whether `astryx layout expand` is broken in later versions.** VERIFIED broken on 0.3.0. Not checked
  against 0.5.0.
- **Whether a Run can reach the MCP server at all.** `.mcp.json` configures it for this session. Whether
  an Arm-1 Run inside the Instrument gets the same MCP configuration is an orchestration question, not
  a research one, and it decides whether D8 to D10 are rules or dead letters.

## Scope note

This document gathers material. It does not author `design.md`, and it registers nothing into the
Foundation — Astryx extensibility is out of scope per
[#5](https://github.com/andrskr/something-something-ui/issues/5). Templates were scaffolded to a
scratch path outside the repository and are reference code only.

Bucket D routes an agent to Astryx's own commands. It adds nothing to Astryx's catalog and writes
nothing to `astryx.config.mjs`. One capability found during the probe does fall on the far side of
that line and was deliberately left alone: `astryx layout` supports registering local components under
`experimental.xle.components` in `astryx.config.mjs`, so that `{kpi-card}` would resolve to our own
component. That is registering our material into the Foundation, so it stays out of scope.
