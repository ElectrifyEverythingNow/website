# EEN Google Apps Script feedback endpoint

This folder contains the Google Apps Script web app that receives anonymous website feedback and appends it to the `Feedback` tab in the EEN Google Sheet.

## Target Sheet

`EEN Feedback + Agent Signals`

https://docs.google.com/spreadsheets/d/1GY3sYeB-YQuGHJO_2ct5lYJN3wXvM6FS9lNo9EAw8xo/edit

## Deploy settings

Use these settings when deploying the script as a web app:

- Execute as: **Me**
- Who has access: **Anyone**

The endpoint stores only the text fields submitted by the feedback widget. It does not receive or store photos.

## OAuth/API note

Hermes needs Apps Script API scopes to create and deploy this automatically. If those scopes are not present, re-authorize Hermes with:

- `https://www.googleapis.com/auth/script.projects`
- `https://www.googleapis.com/auth/script.deployments`
- `https://www.googleapis.com/auth/spreadsheets`

Once deployed, set the website feedback endpoint to the web app URL, either by:

1. adding `NEXT_PUBLIC_FEEDBACK_ENDPOINT` in Cloudflare Pages environment variables and redeploying, or
2. replacing the placeholder fallback in the feedback widget if we choose to hardcode the public URL.

## Expected fields

The web app appends rows with this schema:

```txt
timestamp
source
page_url
tool_id
result_type
usefulness_rating
user_goal
what_confused_you
what_would_make_this_better
email_optional
status
```
