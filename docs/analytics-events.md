# Analytics Events

Cloudflare Web Analytics is enabled in Cloudflare Pages and should activate on the next production deployment. That covers basic traffic. Custom tool events still need a lightweight event path or a product analytics tool later.

## Traffic analytics

Cloudflare Web Analytics should be used for:

- Visitors
- Page views
- Referrers
- Top pages
- Geography
- Device/browser
- Basic performance

## Custom product events

For early product learning, track the following event names in a simple event sink or product analytics tool.

```txt
homepage_viewed
project_starter_started
project_starter_completed
tool_viewed
tool_started
tool_step_completed
tool_completed
tool_result_viewed
photo_upload_started
photo_upload_completed
photo_upload_failed
feedback_submitted
related_tool_clicked
related_article_clicked
share_clicked
print_clicked
homeowner_toggle_clicked
contractor_toggle_clicked
contractor_interest_clicked
report_interest_clicked
```

## Event properties

```txt
event_name
tool_id
step_id
project_type
result_type
source_page
utm_source
utm_medium
utm_campaign
anonymous_session_id
timestamp
```

## Daily Analytics Agent output

```txt
EEN Analytics Brief

1. Visitors:
2. Top sources:
3. Top landing pages:
4. Tool starts:
5. Tool completions:
6. Biggest drop-off:
7. Feedback count:
8. Best-performing hook/page:
9. Three recommended fixes:
10. Three experiments:
```

## Privacy posture

- Do not collect more than needed.
- Do not require signup to view results.
- Avoid storing photos unless explicitly necessary and consented to.
- Treat analytics as product learning, not user surveillance.
