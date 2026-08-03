-- Weight in pounds, for the missions that write it that way.
--
-- The fourth notation setting, and it follows 008 exactly: weights stay stored in
-- kilograms and this column decides only what the field shows and how a typed
-- number is read. Nothing about a patient's record changes when a project
-- switches.
--
-- Kilograms is the right thing to keep in the column beyond the usual argument
-- about a single basis. BMI is defined as kg/m2, so the formula wants kilograms
-- whatever the field is captioned, and weight-based drug dosing -- if this app
-- ever calculates one rather than taking free text -- is defined per kilogram
-- too. Storing pounds would put a conversion inside every one of those, and one
-- of them would eventually be missed.
--
-- Existing projects keep kilograms, which is what they already showed.
--
-- Safe to re-run.

ALTER TABLE project
  ADD COLUMN IF NOT EXISTS project_weight_unit VARCHAR(2) NOT NULL DEFAULT 'kg';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_project_weight_unit'
  ) THEN
    ALTER TABLE project ADD CONSTRAINT chk_project_weight_unit
      CHECK (project_weight_unit IN ('kg', 'lb'));
  END IF;
END $$;
