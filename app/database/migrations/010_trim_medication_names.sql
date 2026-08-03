-- Whitespace in stored medication names.
--
-- The medication report groups by the stored name, so "Ibuprofen " with a
-- trailing space is a row of its own beside "Ibuprofen" -- which is how 9 of 71
-- ibuprofen prescriptions came to be reported separately, and the same for
-- metformin, loratadine, Tylenol and multivitamin. The insert actions did not
-- trim (the update actions always did); they do now, so this is the existing
-- rows catching up.
--
-- Whitespace only. Nothing here rewrites what a clinician chose: "Tylenol" is
-- left as "Tylenol" even though the field would now store "Paracetamol" for it,
-- because a prescription record should say what was written at the time. Going
-- forward the aliases in utils/drugs.ts keep the report from splitting; the
-- history stays as it is.
--
-- Empty strings become NULL: a name of nothing is an absence, and the report
-- reads NULL as absent but "" as a drug with no name.
--
-- Safe to re-run.

UPDATE patient_general_prescribed_medication
SET drug_name = NULLIF(BTRIM(drug_name), '')
WHERE drug_name IS DISTINCT FROM NULLIF(BTRIM(drug_name), '');

UPDATE patient_dentistry_prescribed_medication
SET drug_name = NULLIF(BTRIM(drug_name), '')
WHERE drug_name IS DISTINCT FROM NULLIF(BTRIM(drug_name), '');

-- The other free-text columns on the same rows, for the same reason: the CSV
-- export prints them, and a leading space is noise in a spreadsheet cell.
UPDATE patient_general_prescribed_medication
SET dose = NULLIF(BTRIM(dose), ''),
    instructions_usage = NULLIF(BTRIM(instructions_usage), '')
WHERE dose IS DISTINCT FROM NULLIF(BTRIM(dose), '')
   OR instructions_usage IS DISTINCT FROM NULLIF(BTRIM(instructions_usage), '');

UPDATE patient_dentistry_prescribed_medication
SET dose = NULLIF(BTRIM(dose), ''),
    instructions_usage = NULLIF(BTRIM(instructions_usage), '')
WHERE dose IS DISTINCT FROM NULLIF(BTRIM(dose), '')
   OR instructions_usage IS DISTINCT FROM NULLIF(BTRIM(instructions_usage), '');
