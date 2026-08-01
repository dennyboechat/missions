-- Converts patient_date_of_birth from TIMESTAMP WITH TIME ZONE to DATE.
--
-- Why: a date of birth has no time and no timezone. Stored as timestamptz it
-- was written at midnight UTC, and read back through Intl.DateTimeFormat with
-- no timeZone it rendered in the viewer's zone -- so from anywhere west of
-- Greenwich every patient appeared to be born one day earlier. Viewed from
-- Fiji it looked correct, which is why it went unnoticed.
--
-- Verified before writing this: 553 of 554 rows are exactly 00:00:00 UTC, and
-- the single exception (patient "test" in the Test project, 2025-11-01
-- 02:00:00 UTC) converts to the same 2025-11-01. The conversion is lossless.

ALTER TABLE patient_personal
  ALTER COLUMN patient_date_of_birth TYPE DATE
  USING (patient_date_of_birth AT TIME ZONE 'UTC')::date;

SELECT
  COUNT(*) AS patients,
  COUNT(patient_date_of_birth) AS with_dob,
  MIN(patient_date_of_birth) AS earliest,
  MAX(patient_date_of_birth) AS latest
FROM patient_personal;
