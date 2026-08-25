# Settings and forms

Astryx's three settings templates give three different answers to grouping, and its own width
guidance contradicts its templates. Pick once, here.

## Frame

- `contentWidth={640}`. Settings and forms are read in a single column, not across a dashboard
  width.
- Sections are switched by a `SideNav` when there are more than four, and stacked when there are
  fewer.
- One grouping strategy for the whole page: every section is a `Card`, or every section is separated
  by a `Divider`. Mixing the two on one page is the outcome to avoid.
- Section titles are all `Heading level={2}`, one below the page's single `Heading level={1}`.

## Rows

A settings row is a label, the current value, and one action.

- **Every field has a persistent visible label.** A placeholder is not a label; it disappears
  exactly when the reader needs it.
- A field with no value says what that means — "Not provided" — rather than sitting blank.
- The row states its current value in `Text type="body"` and its label in
  `Text type="supporting" color="secondary"`.

## Editing in place

- Entering and leaving an edit holds the row's height, so rows below stay where they were. Reserve
  the editing control's height in the resting state.
- One row is in edit at a time. Opening a second closes the first.
- Save and cancel sit in the row being edited. A save that fails keeps the entered value and says
  why.

## Sensitive values

Values that identify a person — email, phone, payment details — are masked by default, and the page
says why in one line near them. Revealing is a deliberate action, never the default state.

## Destructive actions

- They live in their own section at the end, apart from ordinary settings.
- The action names its object: "Delete workspace", not "Delete".
- The confirmation restates what will be lost, and confirms with the object's name rather than a
  bare yes.
