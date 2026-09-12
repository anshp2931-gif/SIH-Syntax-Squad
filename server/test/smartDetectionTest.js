import assert from "assert";
import { detectDocument, DOCUMENT_NAMES, getDocumentName } from "../services/documentDetector.js";
import { validateDocument } from "../utils/validators.js";

console.log("===============================================================");
console.log("🧪 RUNNING PRAMAANSETU SMART DOCUMENT-TYPE DETECTION TEST SUITE");
console.log("===============================================================\n");

let passed = 0;
let total = 0;

function runTest(name, fn) {
  total++;
  try {
    fn();
    console.log(`✅ [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`❌ [FAIL] ${name}:`, err.message);
  }
}

// 1. PAN Text Sample
const samplePanText = `
INCOME TAX DEPARTMENT
GOVT. OF INDIA
PERMANENT ACCOUNT NUMBER
ABCDE1234F
NAME: RAHUL SHARMA
FATHER'S NAME: SURESH SHARMA
DOB: 12/05/2001
`;

// 2. Aadhaar Text Sample
const sampleAadhaarText = `
GOVERNMENT OF INDIA
UNIQUE IDENTIFICATION AUTHORITY OF INDIA
MERA AADHAAR, MERI PEHCHAN
PRIYA VERMA
DOB: 15/03/1998
FEMALE
9999 8888 7778
VID: 9199 8888 7778 1234
`;

// 3. Driving Licence Text Sample
const sampleDlText = `
UNION OF INDIA DRIVING LICENCE
TRANSPORT DEPARTMENT DELHI
DL NO: DL1420110012345
NAME: VIKRAM SINGH
DOB: 20/08/1995
VALID TILL: 19/08/2035
AUTHORISATION TO DRIVE: LMV, MCWG
`;

// 4. Passport Text Sample
const samplePassportText = `
PASSPORT
REPUBLIC OF INDIA
TYPE: P  CODE: IND  PASSPORT NO: Z1234567
SURNAME: MEHTA
GIVEN NAME: ROHAN
NATIONALITY: INDIAN
DATE OF BIRTH: 10/12/1992
P<INDMEHTA<<ROHAN<<<<<<<<<<<<<<<<<<<<<<<<<<<
Z1234567<5IND9212104M3212108<<<<<<<<<<<<<<0
`;

// 5. Indian Visa Text Sample
const sampleVisaText = `
REPUBLIC OF INDIA VISA
INDIAN VISA
VISA NO: V1234567
PASSPORT NO: Z9876543
VISA TYPE: TOURIST / E-VISA
NUMBER OF ENTRIES: MULTIPLE
VALID FOR JOURNEY TO INDIA
DATE OF EXPIRY: 25/12/2027
BUREAU OF IMMIGRATION
`;

// 6. Permit Text Sample
const samplePermitText = `
GOVERNMENT OF DELHI
MOTOR VEHICLES DEPARTMENT
GOODS CARRIAGE PERMIT
FORM 26 (RULE 53)
PERMIT NO: DL2023-GC-001234
VEHICLE NO: DL01AB1234
VALID UPTO: 31/12/2028
SEATING CAPACITY: 3
AUTHORISATION FOR NATIONAL PERMIT
`;

// 7. Unsupported Document Sample (Electricity Bill / Invoice)
const sampleUnsupportedBill = `
BSES RAJDHANI POWER LIMITED
ELECTRICITY BILL / TAX INVOICE
CONSUMER NO: 1002345678
BILL DATE: 05/08/2024
DUE DATE: 20/08/2024
TARIFF: DOMESTIC SUPPLY
TOTAL AMOUNT DUE: RS 4,320.00
POWER DISTRIBUTION UTILITY BILL
`;

// 8. Low Confidence Document Sample (Blurry noise / garbled text)
const sampleLowConfidenceText = `
X# 9! ~?
`;

// TEST 1: Detect Aadhaar accurately with high confidence
runTest("Detect Aadhaar document with >= 95% confidence", () => {
  const det = detectDocument(sampleAadhaarText);
  assert.strictEqual(det.documentType, "AADHAAR");
  assert.strictEqual(det.isSupported, true);
  assert.strictEqual(det.isLowConfidence, false);
  assert(det.confidence >= 95, `Expected >= 95 confidence, got ${det.confidence}`);
  assert.strictEqual(det.documentName, "Aadhaar Card");
});

// TEST 2: Detect PAN accurately with high confidence
runTest("Detect PAN Card with >= 95% confidence", () => {
  const det = detectDocument(samplePanText);
  assert.strictEqual(det.documentType, "PAN");
  assert.strictEqual(det.isSupported, true);
  assert.strictEqual(det.isLowConfidence, false);
  assert(det.confidence >= 95, `Expected >= 95 confidence, got ${det.confidence}`);
  assert.strictEqual(det.documentName, "PAN Card");
});

// TEST 3: Detect Driving Licence with high confidence
runTest("Detect Driving Licence with >= 95% confidence", () => {
  const det = detectDocument(sampleDlText);
  assert.strictEqual(det.documentType, "DRIVING_LICENSE");
  assert.strictEqual(det.isSupported, true);
  assert(det.confidence >= 95, `Expected >= 95 confidence, got ${det.confidence}`);
});

// TEST 4: Detect Passport with high confidence
runTest("Detect Passport with >= 95% confidence", () => {
  const det = detectDocument(samplePassportText);
  assert.strictEqual(det.documentType, "PASSPORT");
  assert.strictEqual(det.isSupported, true);
  assert(det.confidence >= 95, `Expected >= 95 confidence, got ${det.confidence}`);
});

// TEST 5: Detect Indian Visa
runTest("Detect Indian Visa", () => {
  const det = detectDocument(sampleVisaText);
  assert.strictEqual(det.documentType, "VISA");
  assert.strictEqual(det.isSupported, true);
  assert(det.confidence >= 80, `Expected >= 80 confidence, got ${det.confidence}`);
});

// TEST 6: Detect Commercial / Transport Permit
runTest("Detect Commercial Transport Permit", () => {
  const det = detectDocument(samplePermitText);
  assert.strictEqual(det.documentType, "PERMIT");
  assert.strictEqual(det.isSupported, true);
  assert(det.confidence >= 80, `Expected >= 80 confidence, got ${det.confidence}`);
});

// TEST 7: Detect Unsupported Document (Electricity Bill)
runTest("Classify Utility Bill / Invoice as UNSUPPORTED", () => {
  const det = detectDocument(sampleUnsupportedBill);
  assert.strictEqual(det.documentType, "UNSUPPORTED");
  assert.strictEqual(det.isSupported, false);
  assert.strictEqual(det.isLowConfidence, false);
});

// TEST 8: Detect Low-Confidence Garbled Document
runTest("Flag blurry / noisy text as LOW_CONFIDENCE without guessing", () => {
  const det = detectDocument(sampleLowConfidenceText);
  assert.strictEqual(det.documentType, "UNKNOWN");
  assert.strictEqual(det.isLowConfidence, true);
  assert(det.confidence < 40, `Expected < 40 confidence, got ${det.confidence}`);
});

// TEST 9: PAN selected + Aadhaar upload -> Mismatch condition
runTest("Scenario 1: User selects PAN Card but uploads Aadhaar -> MISMATCH detected", () => {
  const selectedCategory = "PAN";
  const det = detectDocument(sampleAadhaarText);
  
  const isMismatch = selectedCategory !== det.documentType;
  assert.strictEqual(isMismatch, true);
  assert.strictEqual(det.documentType, "AADHAAR");
  assert.strictEqual(getDocumentName(selectedCategory), "PAN Card");
  assert.strictEqual(getDocumentName(det.documentType), "Aadhaar Card");
  assert(det.confidence >= 95);
});

// TEST 10: Aadhaar selected + PAN upload -> Mismatch condition
runTest("Scenario 2: User selects Aadhaar Card but uploads PAN -> MISMATCH detected", () => {
  const selectedCategory = "AADHAAR";
  const det = detectDocument(samplePanText);

  const isMismatch = selectedCategory !== det.documentType;
  assert.strictEqual(isMismatch, true);
  assert.strictEqual(det.documentType, "PAN");
  assert.strictEqual(getDocumentName(selectedCategory), "Aadhaar Card");
  assert.strictEqual(getDocumentName(det.documentType), "PAN Card");
  assert(det.confidence >= 95);
});

// TEST 11: DL selected + Passport upload -> Mismatch condition
runTest("Scenario 3: User selects Driving Licence but uploads Passport -> MISMATCH detected", () => {
  const selectedCategory = "DRIVING_LICENSE";
  const det = detectDocument(samplePassportText);

  const isMismatch = selectedCategory !== det.documentType;
  assert.strictEqual(isMismatch, true);
  assert.strictEqual(det.documentType, "PASSPORT");
});

// TEST 12: Rule 6 - Never run PAN validation rules on Aadhaar
runTest("Rule 6 Guarantee: PAN validation on Aadhaar data fails correctly", () => {
  // If someone wrongly ran PAN validator on Aadhaar number
  const aadhaarNumber = "999988887778";
  const panValidation = validateDocument("PAN", { pan: aadhaarNumber });
  assert.strictEqual(panValidation.valid, false, "PAN validation should fail on Aadhaar number");
});

// TEST 13: Category Match continues normally
runTest("Category Match: User selects PAN and uploads PAN -> Continues normally", () => {
  const selectedCategory = "PAN";
  const det = detectDocument(samplePanText);
  assert.strictEqual(selectedCategory, det.documentType);
  const validation = validateDocument("PAN", { pan: "ABCDE1234F" });
  assert.strictEqual(validation.valid, true);
});

console.log(`\n===============================================================`);
console.log(`RESULTS: ${passed}/${total} TESTS PASSED`);
console.log(`===============================================================\n`);

if (passed === total) {
  process.exit(0);
} else {
  process.exit(1);
}
