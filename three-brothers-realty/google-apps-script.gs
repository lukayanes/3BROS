/**
 * Three Brothers Realty — website lead capture into Google Sheets.
 *
 * Paste this whole file into the Apps Script editor attached to your Sheet
 * (Extensions ▸ Apps Script), then deploy it as a Web App.
 * Full instructions are in GOOGLE-SHEETS-SETUP.md.
 */

var SHEET_NAME = "Leads";

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000); // avoid two submissions writing at once

  try {
    var p = (e && e.parameter) ? e.parameter : {};

    // Honeypot: bots fill the hidden "_gotcha" field. Silently ignore them.
    if (p._gotcha) {
      return ContentService.createTextOutput("ok");
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    // Write the header row once.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Full Name",
        "Phone",
        "Email",
        "Property Address",
        "Reason for Selling",
        "Asking Price",
        "Message",
        "Source"
      ]);
    }

    sheet.appendRow([
      new Date(),
      p.fullName || "",
      p.phone || "",
      p.email || "",
      p.address || "",
      p.reasonForSelling || "",
      p.askingPrice || "",
      p.message || "",
      p._subject || ""
    ]);

    return ContentService.createTextOutput("ok");

  } catch (err) {
    return ContentService.createTextOutput("error: " + err);
  } finally {
    lock.releaseLock();
  }
}

// Lets you open the Web App URL in a browser to confirm it's live.
function doGet() {
  return ContentService.createTextOutput("Three Brothers Realty lead endpoint is running.");
}
