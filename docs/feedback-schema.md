# Feedback Schema

Early feedback should go to the Google Sheet named `EEN Feedback + Agent Signals`.

## Current Google Sheet

Spreadsheet ID:

```txt
1GY3sYeB-YQuGHJO_2ct5lYJN3wXvM6FS9lNo9EAw8xo
```

Tabs:

1. Feedback
2. Agent Daily Briefs
3. Backlog Signals
4. Traffic Snapshots
5. Launch Experiments

## Feedback fields

```txt
timestamp
source
tool_id
page_url
project_type
result_type
usefulness_rating
user_goal
what_confused_you
what_would_make_this_better
email_optional
status
assigned_issue_url
notes
```

## Result-page prompt

Use this after tool results:

```txt
Was this useful?
[Yes] [Kind of] [No]

What were you trying to figure out?
[free text]

What would have made this more useful?
[free text]

Optional: want to hear when better homeowner electrification tools launch?
[email]
```

Do not gate results behind email.

## Coming-soon tool prompt

```txt
I am building this tool now. What question do you want it to answer?
[free text]
```

## Feedback Intake Agent output

```txt
Top themes:
1.
2.
3.

Exact user language:
- "..."
- "..."

Bugs:
- ...

UX fixes:
- ...

New tool ideas:
- ...

GitHub-ready issues:
- ...
```

## Website wiring note

To write website feedback directly to Google Sheets, the production site will need a secure server-side path. Do not put Google credentials in client-side code.

Possible options:

1. Cloudflare Pages Function with a service account or Apps Script endpoint
2. Google Apps Script web app that appends rows to the Sheet
3. A lightweight form provider that writes to Google Sheets
4. PostHog or another event tool for non-free-text events, with Sheets reserved for comments

Default next step: start with a simple secure endpoint or Apps Script, then wire the FeedbackWidget to it.
