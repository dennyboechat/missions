"use client";

// Components
import { Grid, Text } from "@radix-ui/themes";
import { InputTextField } from "../../ui/InputTextField";
import { Autocomplete } from "../../ui/Autocomplete";
import { SelectField } from "../../ui/SelectField";

// Types
import { ProjectFieldsProps } from "../types/ProjectFieldsProps";
import { AutocompleteItem } from "../../ui/Autocomplete/types/AutocompleteItem";
import { SelectFieldItem } from "../../ui/SelectField/types/SelectFieldProps";
import {
  ProjectLengthUnit,
  ProjectWeightUnit,
  ProjectTemperatureUnit,
  ProjectDateFormat,
} from "../../../types/ProjectTypes";

// Utils
import { getDateFormatExample } from "../../../utils/projectFormats";

// Spelled out rather than abbreviated: "in" alone in a dropdown reads as the
// preposition, and the example under each date order is what actually settles
// which one someone wants.
const LENGTH_UNIT_ITEMS: SelectFieldItem[] = [
  { value: "cm", label: "Centimetres (cm)" },
  { value: "in", label: "Inches (in)" },
];

const WEIGHT_UNIT_ITEMS: SelectFieldItem[] = [
  { value: "kg", label: "Kilograms (kg)" },
  { value: "lb", label: "Pounds (lb)" },
];

const TEMPERATURE_UNIT_ITEMS: SelectFieldItem[] = [
  { value: "C", label: "Celsius (°C)" },
  { value: "F", label: "Fahrenheit (°F)" },
];

const DATE_FORMAT_ITEMS: SelectFieldItem[] = [
  {
    value: "mm/dd/yyyy",
    label: `Month first — mm/dd/yyyy (${getDateFormatExample("mm/dd/yyyy")})`,
  },
  {
    value: "dd/mm/yyyy",
    label: `Day first — dd/mm/yyyy (${getDateFormatExample("dd/mm/yyyy")})`,
  },
];

// Database
import { updateProject } from "../../../database/project/UpdateProject";

// Utils
import { isValidProjectName } from "../../../utils/isValidProjectName";
import { isValidTimezone } from "../../../utils/isValidTimezone";
import {
  getCountries,
  getCountryCodeOfTimezone,
} from "../../../utils/getCountries";
import { getTimezoneLabel } from "../../../utils/getTimezoneLabel";
import {
  getCountryTimezoneOptions,
  findTimezoneOption,
} from "../../../utils/getCountryTimezoneOptions";

// Hooks
import { useState, useMemo, useEffect } from "react";
import { useSaveField } from "../../../lib/useSaveField";
import { useProject } from "../../../lib/ProjectContext";

export const ProjectFields = ({
  projectName,
  projectDescription,
  projectTimezone,
  projectLengthUnit,
  projectWeightUnit,
  projectTemperatureUnit,
  projectDateFormat,
  onProjectNameChange,
  onProjectDescriptionChange,
  onProjectTimezoneChange,
  onProjectLengthUnitChange,
  onProjectWeightUnitChange,
  onProjectTemperatureUnitChange,
  onProjectDateFormatChange,
  showPlaceholders,
  projectId,
  isProjectNameInvalid,
  isProjectTimezoneInvalid,
}: ProjectFieldsProps) => {
  const { setProject } = useProject();
  const { save } = useSaveField();
  const [isNameInvalid, setIsNameInvalid] = useState(isProjectNameInvalid);

  const countries = useMemo(() => getCountries(), []);
  const countryItems: AutocompleteItem[] = useMemo(
    () => countries.map(({ code, name }) => ({ id: code, name })),
    [countries]
  );

  // Which country is selected is derived from the saved timezone, so editing
  // an existing project shows the right country without storing it separately.
  const [countryCode, setCountryCode] = useState<string | undefined>(() =>
    getCountryCodeOfTimezone({ timezone: projectTimezone })
  );

  // Only adopt a country the timezone actually resolves to. Without the guard,
  // clearing the timezone on a country change would immediately wipe the
  // country the user just picked.
  useEffect(() => {
    const code = getCountryCodeOfTimezone({ timezone: projectTimezone });

    if (code) {
      setCountryCode(code);
    }
  }, [projectTimezone]);

  const countryName =
    countries.find(({ code }) => code === countryCode)?.name ?? "";
  // Zones that behave identically all year are collapsed into one choice, so
  // Brazil offers 4 options rather than 16 cities.
  const timezoneOptions = useMemo(
    () => getCountryTimezoneOptions({ countryCode }),
    [countryCode]
  );
  // 224 of the 247 countries end up with a single option, so the second field
  // only appears for the handful that genuinely need a choice.
  const needsTimezoneChoice = timezoneOptions.length > 1;
  // A timezone left over from a previously selected country is not a valid
  // value for this one, so it never renders as the current selection.
  const selectedOption = findTimezoneOption({
    options: timezoneOptions,
    timezone: projectTimezone,
  });
  const isTimezoneMissing = needsTimezoneChoice && !selectedOption;
  const timezoneItems: SelectFieldItem[] = useMemo(
    () => timezoneOptions.map(({ value, label }) => ({ value, label })),
    [timezoneOptions]
  );

  const onProjectNameChanged = async (
    e: React.FocusEvent<HTMLInputElement>
  ) => {
    if (onProjectNameChange) {
      onProjectNameChange(e);
    }
    const newValue = e.target.value;

    const isValidName = isValidProjectName({ projectName: newValue });
    setIsNameInvalid(!isValidName);

    if (isValidName && projectId && projectName !== newValue) {
      const updatedProject = await save(() =>
        updateProject({ projectId, field: "project_name", value: newValue })
      );

      if (updatedProject && setProject) {
        setProject(updatedProject);
      }
    }
  };

  const onProjectDescriptionChanged = async (
    e: React.FocusEvent<HTMLInputElement>
  ) => {
    if (onProjectDescriptionChange) {
      onProjectDescriptionChange(e);
    }

    if (projectId && projectDescription !== e.target.value) {
      await save(() =>
        updateProject({
          projectId,
          field: "project_description",
          value: e.target.value,
        })
      );
    }
  };

  const saveProjectTimezone = async (newValue: string) => {
    if (!isValidTimezone({ timezone: newValue })) {
      return;
    }

    onProjectTimezoneChange(newValue);

    if (projectId && projectTimezone !== newValue) {
      const updatedProject = await save(() =>
        updateProject({
          projectId,
          field: "project_timezone",
          value: newValue,
        })
      );

      if (updatedProject && setProject) {
        setProject(updatedProject);
      }
    }
  };

  /**
   * The notation settings save the same way as the timezone: immediately
   * on an existing project, and only into local state while a new one is still
   * being filled in (there is no row to write to yet).
   *
   * None of them touches a patient's stored figures -- see
   * utils/projectFormats.ts -- so switching one is reversible and needs no
   * confirmation.
   */
  const saveProjectSetting = async <Value extends string>({
    field,
    value,
    current,
    onChange,
  }: {
    field: string;
    value: Value;
    current: Value;
    onChange: (value: Value) => void;
  }) => {
    onChange(value);

    if (projectId && current !== value) {
      const updatedProject = await save(() =>
        updateProject({ projectId, field, value })
      );

      // Straight into context: every screen reads its units and date order from
      // the project there, so without this the change shows on this page and
      // nowhere else until a reload.
      if (updatedProject && setProject) {
        setProject(updatedProject);
      }
    }
  };

  const onCountrySearch = (keyword: string) => {
    if (keyword.trim()) {
      return;
    }

    // Emptying the country empties the timezone with it: whatever was chosen
    // belonged to the country that is no longer selected. Nothing is written
    // to the database, so an existing project keeps its saved zone until a
    // new one is picked.
    setCountryCode(undefined);
    onProjectTimezoneChange("");
  };

  const onCountrySelected = (item: AutocompleteItem) => {
    const code = item?.id;
    if (!code || code === countryCode) return;

    setCountryCode(code);

    const options = getCountryTimezoneOptions({ countryCode: code });

    if (options.length === 1) {
      // Unambiguous country, so the timezone is settled by the choice itself.
      saveProjectTimezone(options[0].value);
      return;
    }

    // Otherwise clear the timezone: the old country's zone is not a valid
    // answer here. Nothing is written to the database until a zone is picked,
    // so an existing project keeps its previous zone rather than an empty one.
    onProjectTimezoneChange("");
  };

  return (
    <Grid gap="10px" width={{ initial: "auto", sm: "500px" }}>
      <InputTextField
        label="Project name"
        placeholder={
          showPlaceholders ? "Hope Mission Africa, Med Aid Fiji" : undefined
        }
        value={projectName}
        autoFocus
        required
        onBlur={(e) => onProjectNameChanged(e)}
        errorMessage={isNameInvalid ? "Required field" : ""}
      />
      <InputTextField
        label="Project description"
        placeholder={
          showPlaceholders
            ? "Bringing better healthcare to underserved communities in Africa"
            : undefined
        }
        value={projectDescription}
        onBlur={(e) => onProjectDescriptionChanged(e)}
      />
      <Grid>
        <Text>{"Country *"}</Text>
        <Autocomplete
          items={countryItems}
          value={countryName}
          onSelect={onCountrySelected}
          onSearch={onCountrySearch}
        />
        {/* Only when no country is chosen at all. If one is selected but its
            zone is still missing, the time zone field below says so -- showing
            both would blame the field that is already filled in. */}
        {isProjectTimezoneInvalid && !countryCode && (
          <Text size="1" color="red">
            {"Select where the mission takes place."}
          </Text>
        )}
      </Grid>
      {needsTimezoneChoice && (
        <Grid>
          <SelectField
            label="Time zone"
            required
            items={timezoneItems}
            value={selectedOption?.value}
            placeholder="Select a time zone"
            onChange={saveProjectTimezone}
            errorMessage={
              isTimezoneMissing
                ? "Select the zone closest to the mission site."
                : ""
            }
          />
        </Grid>
      )}
      {!needsTimezoneChoice && projectTimezone && (
        <Text size="1" color="gray">
          {`Time zone: ${getTimezoneLabel({ timezone: projectTimezone })}`}
        </Text>
      )}

      {/* How this mission writes things down, not what it records: the figures
          are stored in centimetres and Celsius either way, so these can be
          changed at any point without altering a single patient's record. */}
      <Text size="2" weight="medium">
        {"Units and dates"}
      </Text>
      <SelectField
        label="Height and length"
        items={LENGTH_UNIT_ITEMS}
        value={projectLengthUnit}
        onChange={(value) =>
          saveProjectSetting({
            field: "project_length_unit",
            value: value as ProjectLengthUnit,
            current: projectLengthUnit,
            onChange: onProjectLengthUnitChange,
          })
        }
      />
      <SelectField
        label="Weight"
        items={WEIGHT_UNIT_ITEMS}
        value={projectWeightUnit}
        onChange={(value) =>
          saveProjectSetting({
            field: "project_weight_unit",
            value: value as ProjectWeightUnit,
            current: projectWeightUnit,
            onChange: onProjectWeightUnitChange,
          })
        }
      />
      <SelectField
        label="Temperature"
        items={TEMPERATURE_UNIT_ITEMS}
        value={projectTemperatureUnit}
        onChange={(value) =>
          saveProjectSetting({
            field: "project_temperature_unit",
            value: value as ProjectTemperatureUnit,
            current: projectTemperatureUnit,
            onChange: onProjectTemperatureUnitChange,
          })
        }
      />
      <SelectField
        label="Date format"
        items={DATE_FORMAT_ITEMS}
        value={projectDateFormat}
        onChange={(value) =>
          saveProjectSetting({
            field: "project_date_format",
            value: value as ProjectDateFormat,
            current: projectDateFormat,
            onChange: onProjectDateFormatChange,
          })
        }
      />
    </Grid>
  );
};
