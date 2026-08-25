# Charts

Astryx ships **no `Chart` component**, and its own templates use three mutually incompatible chart
stacks. Every decision below is therefore ours, and the whole page must make the same one.

## Choosing the stack

Use `recharts`. Add it as a dependency if it is missing. Pick it once per page: a page never ends up
with two chart technologies, and adding a chart to a page means matching the chart already there.

When an existing chart is hand-rolled and you need a second, replace the first as well so the page
ends with one approach. Two approaches side by side is the outcome to avoid.

## One component per shape

Each chart shape — line, bar, area — is one named local component in the page file, taking data and
series names as props. Two charts of the same shape use the same component twice.

## Series

- Colours come from `--color-data-categorical-*` in declared order, reserving red and green for
  series that mean bad and good. Never a raw hex, including in a `stroke`, `fill` or `tick` prop.
- Above six series, group the tail into one "Other" series rather than continuing down the palette.
- Every series carries a visible label in a legend when there is more than one.

## Axes and ticks

- The value axis starts at zero for counts and currency. It may start at the data floor for rates
  and indices, and the chart says so.
- Tick labels go through the page's formatter, the same one the rest of the page uses. Large values
  abbreviate — `12.4k`, `1.2M` — consistently across every axis on the page.
- The category axis labels every tick when they fit, and every other tick when they do not.

## States

A chart has the same three states as any other region.

- **Loading** — a `Skeleton` occupying the chart's final height, so the page does not jump.
- **Empty** — an `EmptyState` inside the chart's frame naming what has no data and the period.
- **Error** — a `Banner` inside the chart's frame saying which source failed. A chart whose data
  failed to load never draws an empty plot.

## Reading a chart without seeing it

Every chart carries a `<title>` describing what it shows, and the numbers behind it are reachable as
text on the page — a table, a caption or a summary line. A chart is never the only way to get a
number.
