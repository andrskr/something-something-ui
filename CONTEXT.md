# Something Something UI

A laboratory for one question: does a design-system layer authored on top of Astryx make a coding
agent build better interfaces, and can we prove it? This file is the shared vocabulary for that
work. It is a glossary only — no implementation detail, no plans.

## Language

### The thing under test

**Foundation**: Astryx — its component library, CLI, MCP server and templates. We build on it and we
do not evaluate it. _Avoid_: base, framework, vendor.

**Layer**: the material we author on top of the Foundation to teach an agent our product's design
language. Skills, `design.md`, reference docs, exemplars, templates, lint rules and always-on
instructions are all Layer material. _Avoid_: design system, guidance, docs.

**Delivery channel**: the route by which Layer material reaches an agent. Two exist —
**Claude-native** (files the agent reads from the repo) and **Astryx-native** (content the Astryx
CLI returns when the agent runs a command). _Avoid_: distribution, packaging.

**Arm**: one configuration of the Layer under test. Three exist — **Off** (Foundation alone),
**Always-on** (Layer material that cannot fail to load), **Full** (adds Layer material the agent
must discover). _Avoid_: variant, condition, target.

**Discovery**: whether an agent found and used Layer material at all, independent of whether it then
followed it. A Layer nobody invokes scores zero however well written it is.

### The evaluation material

**Fixture**: one evaluation unit — a prompt, an optional before-state, and grader-only expectations.
The unit the whole Instrument is organised around. _Avoid_: test case, eval, sample.

**Greenfield fixture**: a Fixture whose prompt asks for an interface built from nothing.

**Edit fixture**: a Fixture that supplies a before-state and asks for a change to it.

**Persona**: the voice a Fixture's prompt is written in — vague operator, precise analyst,
adversarial user. A property of the Fixture, not a separate axis of the Sweep.

**Expectation**: one free-text sentence that names a correct behaviour and the naive anti-pattern it
displaces. Grader-only; the agent never sees it. _Avoid_: assertion, rule, criterion.

**Ideal**: a curated reference rendering of what a Fixture's answer should look like. Grader-only.
_Avoid_: golden, snapshot, baseline.

**Holdout**: a Fixture deliberately withheld while the Layer is being iterated on, so the Layer
cannot be tuned to what it is graded on.

### Running and measuring

**Instrument**: the harness as a whole — everything that turns a Fixture into a number. Named this
way on purpose: its job is to report honestly, not to produce a win. _Avoid_: harness, pipeline,
framework.

**Run**: one agent invocation against one Fixture in one Arm.

**Repeat**: one of N identical Runs of the same Fixture in the same Arm. Repeats exist only to
measure Divergence.

**Sweep**: the full set of Runs across every Fixture, Arm and Repeat.

**Conformance**: how closely output follows our design language. Scored against the Layer's own
rubric, including for Arms that never saw it.

**Intrinsic quality**: how good an interface is on its own merits, judged with no knowledge of our
design language. Never merged with Conformance — the pair is the point.

**Divergence**: how much Repeats of one Fixture differ from each other. Low Divergence is the thing
a design system is supposed to buy. _Avoid_: variance, flakiness, consistency.

**Absolute judging**: scoring one Arm's output alone against a rubric.

**Comparative judging**: showing one judge every Arm's output for a Fixture together, unlabelled,
and asking it to rank them.

**Critic loop**: scripted follow-up rounds in which a judge rejects an answer and writes the
follow-up a real user would have sent. Measures rounds to acceptance. _Avoid_: retry, refinement.
