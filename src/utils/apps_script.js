// ==========================================
// GOOGLE APPS SCRIPT — KURUVAI DASHBOARD
// ==========================================
// HOW TO DEPLOY (do this every time you update the script):
// 1. Open your Google Sheet.
// 2. Go to Extensions → Apps Script.
// 3. Replace ALL existing code with the function below (between the /* */ block).
// 4. Click 'Deploy' → 'Manage deployments' → Edit (pencil icon).
// 5. Change "Version" to "New version".
// 6. Click "Deploy". Copy the Web App URL.
// 7. Paste it in your .env as VITE_GOOGLE_SHEETS_URL=<url>
//
// ⚠️  IMPORTANT: Execute as = "Me", Who has access = "Anyone"
// ⚠️  After every code change you MUST create a "New version" — otherwise
//     changes won't take effect on the live URL.

/* ── COPY EVERYTHING BELOW THIS LINE INTO APPS SCRIPT ─────────────────────

function doGet(e) {
  // ── CORS headers so the browser can read the response ──────────────────
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // ── Helper: read a named sheet into an array of row-objects ────────────
    function readSheet(sheetName) {
      var sheet = ss.getSheetByName(sheetName);
      if (!sheet) return [];

      var data = sheet.getDataRange().getValues();
      if (data.length < 2) return []; // only headers or empty

      var headers = data[0];
      var rows = [];

      for (var i = 1; i < data.length; i++) {
        var row = data[i];

        // Skip rows where the first cell (Farmer name) is blank
        if (!row[0] || row[0].toString().trim() === '') continue;

        var record = {};
        for (var j = 0; j < headers.length; j++) {
          var key   = headers[j] ? headers[j].toString().trim() : ('col_' + j);
          var value = row[j];

          // Convert Date objects to readable ISO strings
          if (value instanceof Date) {
            record[key] = Utilities.formatDate(
              value,
              Session.getScriptTimeZone(),
              "yyyy-MM-dd"
            );
          } else {
            record[key] = value;
          }
        }
        record['rowNumber'] = i + 1;
        rows.push(record);
      }
      return rows;
    }

    // ── Read both sheets ───────────────────────────────────────────────────
    var allFarmers     = readSheet('ALL');
    var deletedFarmers = readSheet('Deleted farmers');

    var result = {
      allFarmers:     allFarmers,
      deletedFarmers: deletedFarmers,
      fetchedAt:      new Date().toISOString(),
      counts: {
        active:  allFarmers.length,
        deleted: deletedFarmers.length
      }
    };

    output.setContent(JSON.stringify(result));
    return output;

  } catch (err) {
    output.setContent(JSON.stringify({ error: err.toString() }));
    return output;
  }
}

// ── COPY EVERYTHING ABOVE THIS LINE INTO APPS SCRIPT ─────────────────────
*/
