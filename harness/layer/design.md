# Design language — analytics surfaces

How we build dashboards, reports, tables and settings in this product. Astryx decides most things
already; run `astryx docs <topic>` and follow it. This document covers only what Astryx leaves open,
and it wins where the two appear to differ.

## Priority order

When rules compete, the earlier one wins.

1. **Truth.** A number that might mislead is worse than no number. Absent, zero and broken are three
   different facts and never render alike.
2. **Legibility.** The reader finds the number they came for without hunting.
3. **Consistency.** The same idea looks the same everywhere on the page and across pages.
4. **Density.** Show more per screen, once the three above hold.

## The pass

Work in this order. Each pass finishes before the next begins.

1. **Frame.** Run `astryx build "<what you are making>"`. Pick the shell and budget the regions
   before writing content.
2. **Shape.** Name every value the page shows and its type — count, currency, percentage, delta,
   timestamp, status. Decide what each looks like when it is absent, and when its source failed.
3. **Compose.** Build the page from Astryx components.
4. **States.** Give every data region its loaded, empty and error state. A region without all three
   is unfinished.
5. **Re-read.** Open the file and check it against **Rejected defaults** below.

## One place

Every repeated idea is defined once in the file and reused.

- **Formatting.** One module-level formatter per value type, each with an explicit locale. Every
  number, currency, percentage and date on the page goes through them.
- **The KPI tile.** One component, ordering value, then label, then delta. Value is
  `Text type="display-3"`, label is `Text type="supporting" color="secondary"`, delta is
  `Text type="supporting"` with a direction icon.
- **The chart.** One named local chart component per chart shape. See
  [references/charts.md](references/charts.md).

When a page already defines one of these, extend it rather than adding a second.

## Colour

- **Series colour follows declared order.** Take `--color-data-categorical-*` in order: blue,
  orange, purple, green, pink, cyan, red, teal, brown, indigo. The first series takes the first
  colour.
- **Red and green are reserved.** `--color-data-categorical-red` and `-green` mean bad and good. An
  ordinary series skips them and takes the next colour along.
- **Direction is semantic.** Up and down, better and worse, use `--color-success` and
  `--color-error`.

## Numbers

- Every value goes through the page's formatter, with an explicit locale.
- Currency shows its symbol and a fixed two decimals. Percentages show one decimal and a sign when
  they express change.
- **Absent is not zero.** A value with no data renders as an em dash in
  `Text type="supporting" color="secondary"`. Zero renders as zero. A value whose source failed
  renders through the region's error state, never as a dash and never as zero.

## Page composition

- Exactly one `Heading level={1}` per page, in `LayoutHeader`. Every region title below it uses
  `Heading level={2}`.
- A dashboard page sets `contentWidth={1200}`. A settings or form page sets `contentWidth={640}`.
- One grouping strategy per page. Choose Card or Divider once, and every peer region uses it.

## Surfaces

Read the one you are building.

- **[references/charts.md](references/charts.md)** — any chart, sparkline, axis, legend or series.
- **[references/tables.md](references/tables.md)** — any table, list of records, sorting, paging,
  filtering or row status.
- **[references/settings.md](references/settings.md)** — any settings page, form or field the user
  edits in place.

## Rejected defaults

Read the finished file and replace each of these where it appears.

- A raw hex, pixel or font size anywhere, **including inside chart library props** — the most common
  place it survives. Use a token.
- A second formatter, KPI tile or chart implementation beside an existing one.
- A blank cell, `null`, `N/A` or a bare `0` standing in for a missing value.
- A table whose numeric columns are left-aligned.
- A data region with no empty state, or none for when its source failed.
- Two heading levels used for peer regions on one page.
