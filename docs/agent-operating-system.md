# Agent Operating System

This repo includes a lightweight agent-company structure in `/agents`.

Josh is the founder, editor, orchestrator, distribution lead, and chair of the advisory board. Agents draft, research, prioritize, build, polish, analyze, and surface decisions.

## Agent roster

- Chief of Staff
- Product Roadmap
- Tool Builder
- UX + Trust
- Photo / Vision
- Content
- Distribution
- Analytics
- Feedback Intake
- Monetization Watch
- Contractor Lens
- Market Research
- Janitor
- Meta-Agent / AgentOps
- Board of Directors

## Dashboard

The local dashboard currently lives outside the repo at:

```txt
~/ElectrifyEverythingNow/dashboard/een-agent-dashboard.html
```

Run locally:

```bash
cd ~/ElectrifyEverythingNow/dashboard
python3 -m http.server 8787
```

Open:

```txt
http://localhost:8787/een-agent-dashboard.html
```

## Status colors

- Green: running, unblocked, or recently verified
- Yellow: planned, active, or needs review soon
- Red: blocked, missing access, broken, or needs Josh input

## Daily operating loop

```txt
Morning:
- Chief of Staff brief
- Analytics brief
- Feedback summary
- Product recommendation

Midday:
- Build/improve one tool or article
- UX/trust review
- Add feedback and analytics hooks

Afternoon:
- Distribution drafts
- Josh posts manually
- Capture feedback and market signals
```

## Recurring agents

Good candidates for cron jobs:

- Market Research Agent: every other day at 8 AM
- Creative Ideas Agent: daily
- Analytics Agent: daily once traffic exists
- Feedback Intake Agent: daily once forms are wired
- Product Roadmap Agent: weekly
- Meta-Agent: weekly
