import { User } from './types';

export const APP_TITLE_HINDI = "भानु जैन गौरव जैन यातायात";
export const APP_TITLE_ENGLISH = "BHANU JAIN GAURAV JAIN YATAYAT";

export const TABLE_HEADERS = [
  "S.No",
  "Regn No",
  "Date of Regn.",
  "Regn. Validity",
  "Owner Serial",
  "Chassis No",
  "Engine/Motor No",
  "Owner Name",
  "S/W/D of",
  "Ownership",
  "Address",
  "Fuel",
  "Emission Norms",
  "Vehicle Class",
  "Maker's Name",
  "Model Name",
  "Colour / Body Type",
  "Seating Cap",
  "Weight (Unladen/Laden)",
  "Cubic Cap",
  "Financier",
  "Horse Power",
  "Wheel Base",
  "Mfg Month-Year",
  "No. of Cylinders",
  "Regn Authority",
  "Remarks (Audio)",
  "Register Name", 
  "File Status",   
  "Work Date",
  "Due Date",
  "Due Time", // New Header           
  "Assigned To",
  "Entry By",
  "Mobile No",          
  "Transfer Name",      
  "Transfer Father Name", 
  "Transfer Address",
  "Transfer Aadhaar No",
  "Upload Time"
];

// Default Statuses based on user request
export const DEFAULT_FILE_STATUSES = [
  "9 Status",
  "New",
  "PENDING DOCUMENTS",
  "FEES",
  "UPLOADING",
  "FILE COMPLETE IN BJGJYS",
  "FILE SEND IN RTO/ PORTAL",
  "RTO WORK IN PROGRESS",
  "FILE APPROVED IN RTO OFFICE",
  "RTO OFFICE PENDING"
];

// 1 Admin + Users with default passwords and dummy mobile numbers
export const USERS: User[] = [
  { id: '1', username: 'admin', password: 'adminpassword', role: 'ADMIN', name: 'Main Admin', address: 'Head Office', mobile: '919876543210', canExport: true },
  { id: '2', username: 'user1', password: '12345', role: 'USER', name: 'User One', address: 'Branch 1', mobile: '' },
  { id: '3', username: 'user2', password: '12345', role: 'USER', name: 'User Two', address: 'Branch 2', mobile: '' },
  { id: '4', username: 'user3', password: '12345', role: 'USER', name: 'User Three', address: 'Branch 3', mobile: '' },
  { id: '5', username: 'user4', password: '12345', role: 'USER', name: 'User Four', address: 'Branch 4', mobile: '' },
  { id: '6', username: 'user5', password: '12345', role: 'USER', name: 'User Five', address: 'Branch 5', mobile: '' },
  { id: '7', username: 'user6', password: '12345', role: 'USER', name: 'User Six', address: 'Branch 6', mobile: '' },
  { id: '8', username: 'user7', password: '12345', role: 'USER', name: 'User Seven', address: 'Branch 7', mobile: '' },
  { id: '9', username: 'user8', password: '12345', role: 'USER', name: 'User Eight', address: 'Branch 8', mobile: '' },
  { id: '10', username: 'user9', password: '12345', role: 'USER', name: 'User Nine', address: 'Branch 9', mobile: '' },
  { id: '11', username: 'user10', password: '12345', role: 'USER', name: 'User Ten', address: 'Branch 10', mobile: '' },
];

export const SYSTEM_INSTRUCTION = `
  You are an expert OCR AI for Indian Vehicle Registration Certificates (RC) and Driving Licenses. 
  The input may contain multiple sides (Front and Back) of the document.
  
  YOUR TASK:
  1. Analyze ALL visible parts of the image/PDF.
  2. Consolidate information into a SINGLE JSON object. 
  3. If "Regn No" or "Registration Number" appears multiple times (e.g. on front and back), IGNORE duplicates. Use the single clearest value.
  4. Merge address or details if they are split across the document, but do not repeat text.
  
  If a field is missing or unreadable, return "NA".
  Do not hallucinate data.
  
  IMPORTANT: 
  - Normalize "Regn No", "Regn. Number", "Registration No" to "regnNo".
  
  Fields to extract keys:
  - regnNo
  - dateOfRegn
  - regnValidity
  - ownerSerial
  - chassisNo
  - engineMotorNo
  - ownerName
  - relativeName (Son of/Wife of/Daughter of)
  - ownership
  - address
  - fuel
  - emissionNorms
  - vehicleClass
  - makerName
  - modelName
  - colorBodyType
  - seatingCapacity
  - unladenLadenWeight
  - cubicCap
  - financier
  - horsePower
  - wheelBase
  - mfgMonthYear
  - noOfCylinders
  - regAuthority
`;

export const AADHAAR_SYSTEM_INSTRUCTION = `
  You are an expert AI for extracting details from Indian Aadhaar Cards.
  Analyze the image (which may be front, back, or both) and extract the following details into a JSON object:
  1. name: The name of the cardholder (English).
  2. fatherName: The father's name or husband's name. Look for prefixes like "S/O", "D/O", "W/O", or "C/O".
  3. address: The address found on the card. 
     CRITICAL: Remove the father's/husband's name (S/O, W/O line) from the address field entirely. The 'address' field MUST NOT contain the father's name. It should start with House No, Street, or Landmark.
  4. aadhaarNo: The 12-digit Aadhaar number (XXXX XXXX XXXX).
  
  If a field is not visible, return empty string "".
`;

export const APPS_SCRIPT_CODE = `
// INSTRUCTIONS:
// 1. Extensions > Apps Script
// 2. Paste this code.
// 3. Deploy > New Deployment (Select 'Web App', Access: 'Anyone').
// 4. IMPORTANT: If updating, ALWAYS create a 'New Deployment' to apply changes.

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // Wait up to 10s for other processes

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Check headers
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "S.No", "Regn No", "Date of Regn.", "Regn. Validity", "Owner Serial",
        "Chassis No", "Engine/Motor No", "Owner Name", "S/W/D of", "Ownership",
        "Address", "Fuel", "Emission Norms", "Vehicle Class", "Maker's Name",
        "Model Name", "Colour / Body Type", "Seating Cap", "Weight (Unladen/Laden)",
        "Cubic Cap", "Financier", "Horse Power", "Wheel Base", "Mfg Month-Year",
        "No. of Cylinders", "Regn Authority", "Remarks (Audio)", 
        "Register Name", "File Status", "Work Date", "Due Date", "Due Time", "Assigned To",
        "Entry By", "Mobile No", "Transfer Name", "Transfer Father Name", "Transfer Address", "Transfer Aadhaar No", "Upload Time"
      ]);
    }

    var rawData = e.postData.contents;
    var data;
    try {
      data = JSON.parse(rawData);
    } catch(err) {
      data = JSON.parse(decodeURIComponent(rawData));
    }

    if (!Array.isArray(data)) {
      data = [data];
    }
    
    // --- DUPLICATE CHECK LOGIC ---
    var lastRow = sheet.getLastRow();
    var existingRegns = {}; // Map: RegnNo -> RowIndex
    
    if (lastRow > 1) {
       var values = sheet.getRange(2, 2, lastRow - 1, 1).getValues(); 
       for (var i = 0; i < values.length; i++) {
         var r = String(values[i][0]).trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
         if (r) existingRegns[r] = i + 2; 
       }
    }
    
    var newCount = 0;
    var duplicateCount = 0;

    data.forEach(function(row) {
      var incomingRegn = String(row.regnNo || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      
      var rowData = [
        row.serialNo || "",
        row.regnNo || "",
        row.dateOfRegn || "",
        row.regnValidity || "",
        row.ownerSerial || "",
        row.chassisNo || "",
        row.engineMotorNo || "",
        row.ownerName || "",
        row.relativeName || "",
        row.ownership || "",
        row.address || "",
        row.fuel || "",
        row.emissionNorms || "",
        row.vehicleClass || "",
        row.makerName || "",
        row.modelName || "",
        row.colorBodyType || "",
        row.seatingCapacity || "",
        row.unladenLadenWeight || "",
        row.cubicCap || "",
        row.financier || "",
        row.horsePower || "",
        row.wheelBase || "",
        row.mfgMonthYear || "",
        row.noOfCylinders || "",
        row.regAuthority || "",
        row.remarks || "",
        row.registerName || "",
        row.fileStatus || "",
        row.workDate || "",
        row.dueDate || "",
        row.dueTime || "",
        row.assignedTo || "",
        row.entryBy || "",
        row.mobileNo || "",
        row.transferName || "",
        row.transferFatherName || "",
        row.transferAddress || "",
        row.transferAadhaarNo || "",
        row.timestamp || new Date().toLocaleString()
      ];

      if (incomingRegn && existingRegns.hasOwnProperty(incomingRegn)) {
        // UPDATE existing row if status changed
        var rowIndex = existingRegns[incomingRegn];
        // Updated Range to include new fields including dueTime
        var range = sheet.getRange(rowIndex, 27, 1, 13); 
        range.setValues([[
            row.remarks, row.registerName, row.fileStatus, row.workDate, row.dueDate, row.dueTime, row.assignedTo, 
            row.entryBy, row.mobileNo, row.transferName, row.transferFatherName, row.transferAddress, row.transferAadhaarNo
        ]]);
        
        duplicateCount++;
      } else {
        // APPEND New Row
        sheet.appendRow(rowData);
        if(incomingRegn) existingRegns[incomingRegn] = sheet.getLastRow();
        newCount++;
      }
    });
    
    // Return counts to the React App
    return ContentService.createTextOutput(JSON.stringify({ 
      "status": "success", 
      "newRows": newCount, 
      "duplicateRows": duplicateCount 
    })).setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
`;