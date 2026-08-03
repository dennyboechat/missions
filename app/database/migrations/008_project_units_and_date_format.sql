-- How a project writes down what it measures.
--
-- A mission staffed from the US records a height in inches and a temperature in
-- Fahrenheit; one in Madagascar uses centimetres and Celsius. Neither is a
-- property of the patient, so none of it changes what is stored: heights stay in
-- centimetres and temperatures in Celsius, and these columns decide only how a
-- number is shown and how a typed one is read back.
--
-- That separation is the whole point. If a project switched to inches and the
-- stored figures were rewritten, every rounding would be permanent, and BMI, the
-- validation bounds and the CSV export would each need to know which unit any
-- given row happened to be written in. Converting at the edges keeps one basis
-- in the database and makes switching a project's units reversible.
--
-- The date format is display-only for the same reason: dates are stored as DATE
-- and TIMESTAMPTZ, and 03/04 versus 04/03 is a question about the reader, not
-- about the day.
--
-- CHECK constraints rather than trust: `field` in UpdateProject is interpolated
-- from a fixed list but the value is not, and a project carrying 'kelvin' would
-- break every screen that formats a temperature.
--
-- Existing projects keep what they already showed for units, and get the US
-- date order, which is what the previous en-US formatting already implied.
--
-- Safe to re-run.

ALTER TABLE project
  ADD COLUMN IF NOT EXISTS project_length_unit VARCHAR(2) NOT NULL DEFAULT 'cm',
  ADD COLUMN IF NOT EXISTS project_temperature_unit VARCHAR(1) NOT NULL DEFAULT 'C',
  ADD COLUMN IF NOT EXISTS project_date_format VARCHAR(10) NOT NULL DEFAULT 'mm/dd/yyyy';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_project_length_unit'
  ) THEN
    ALTER TABLE project ADD CONSTRAINT chk_project_length_unit
      CHECK (project_length_unit IN ('cm', 'in'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_project_temperature_unit'
  ) THEN
    ALTER TABLE project ADD CONSTRAINT chk_project_temperature_unit
      CHECK (project_temperature_unit IN ('C', 'F'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_project_date_format'
  ) THEN
    ALTER TABLE project ADD CONSTRAINT chk_project_date_format
      CHECK (project_date_format IN ('mm/dd/yyyy', 'dd/mm/yyyy'));
  END IF;
END $$;
