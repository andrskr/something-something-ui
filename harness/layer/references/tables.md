# Tables

Astryx's `Table` decides structure. Alignment, sorting and states are ours: across 14 page
templates, not one sets column alignment, not one marks a column sortable, and not one renders an
error state.

## Columns

- **Right-align numeric, currency and percentage columns**, header included. Left-align text, dates
  and status.
- Every column declares an explicit width — `pixel()` for fixed content, `proportional()` for text
  that should absorb slack.
- Values go through the page's formatters, never formatted per cell.
- Long text truncates with its full value available on hover. Identifiers wrap rather than truncate.

## Sorting and paging

- Every column the reader could reasonably sort by is marked sortable, and the table opens on a
  default sort — usually the column the page is about, descending.
- Tables of more than 25 rows page, at 25 per page, with the control below the table.
- The result count sits above the table and says what was counted: "128 transactions".

## Row status

Status is a `StatusDot` carrying a text label. The dot alone is not the status; the label is.
`Badge` is for counts and enumerated states, not for status.

## Absent, zero and broken

These are three different rows and must look different.

- **Absent** — the record reported nothing. An em dash in
  `Text type="supporting" color="secondary"`.
- **Zero** — the record reported zero. The number `0`, formatted like any other number.
- **Broken** — the source failed. The page says so in a `Banner` above the table naming the source,
  and affected cells show the dash rather than a number.

A reader must never have to guess which of the three they are looking at.

## States

- **Loading** — `Skeleton` rows at the table's row height, header visible.
- **Empty** — an `EmptyState` naming what is empty and the next action, never a bare header row.
  When a filter caused it, say so and offer to clear it.
- **Error** — a `Banner` above the table. The table shows the rows it does have.
