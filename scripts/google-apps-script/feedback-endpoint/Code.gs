const SPREADSHEET_ID = '1GY3sYeB-YQuGHJO_2ct5lYJN3wXvM6FS9lNo9EAw8xo';
const FEEDBACK_SHEET_NAME = 'Feedback';

function doPost(e) {
  try {
    const params = e && e.parameter ? e.parameter : {};
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(FEEDBACK_SHEET_NAME);

    if (!sheet) {
      throw new Error('Sheet not found: ' + FEEDBACK_SHEET_NAME);
    }

    const row = [
      new Date().toISOString(),
      clean(params.source),
      clean(params.page_url),
      clean(params.tool_id),
      clean(params.result_type),
      clean(params.usefulness_rating),
      clean(params.user_goal),
      clean(params.what_confused_you),
      clean(params.what_would_make_this_better),
      clean(params.email_optional),
      'new'
    ];

    sheet.appendRow(row);

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error && error.message ? error.message : error) });
  }
}

function doGet() {
  return jsonResponse({ ok: true, service: 'EEN feedback endpoint' });
}

function clean(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim().slice(0, 5000);
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
