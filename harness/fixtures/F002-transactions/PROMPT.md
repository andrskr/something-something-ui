<!-- Persona: experienced. Collapses the dense-table and absent-data shapes: a table is exactly
     where "no data" and "this source failed" surface naturally, rather than being bolted on. -->

I need a page at `/transactions` for reviewing last month's transactions across all sites.

Show me each transaction with its site, timestamp, amount, discount applied and current status. I
need to sort by any column, and filter down to a single site or status. There will be a few thousand
rows, so it has to page.

Two things that matter and usually get missed. Some sites did not report at all last month — that is
not the same as reporting zero, and I must be able to tell the difference. And the discount feed is
flaky; when it fails I need the page to tell me it failed rather than quietly showing blanks.

Use realistic sample data. It needs to build.
