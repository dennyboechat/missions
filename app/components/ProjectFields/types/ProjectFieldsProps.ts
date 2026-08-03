// Types
import {
  ProjectName,
  ProjectDescription,
  ProjectTimezone,
  ProjectLengthUnit,
  ProjectWeightUnit,
  ProjectTemperatureUnit,
  ProjectDateFormat,
} from "../../../types/ProjectTypes";

export interface ProjectFieldsProps {
  projectName: ProjectName;
  projectDescription: ProjectDescription;
  projectTimezone: ProjectTimezone;
  projectLengthUnit: ProjectLengthUnit;
  projectWeightUnit: ProjectWeightUnit;
  projectTemperatureUnit: ProjectTemperatureUnit;
  projectDateFormat: ProjectDateFormat;
  onProjectNameChange: (event: React.FocusEvent<HTMLInputElement>) => void;
  onProjectDescriptionChange: (
    event: React.FocusEvent<HTMLInputElement>
  ) => void;
  onProjectTimezoneChange: (timezone: ProjectTimezone) => void;
  onProjectLengthUnitChange: (unit: ProjectLengthUnit) => void;
  onProjectWeightUnitChange: (unit: ProjectWeightUnit) => void;
  onProjectTemperatureUnitChange: (unit: ProjectTemperatureUnit) => void;
  onProjectDateFormatChange: (dateFormat: ProjectDateFormat) => void;
  showPlaceholders?: boolean;
  projectId?: string;
  isProjectNameInvalid?: boolean;
  isProjectTimezoneInvalid?: boolean;
}
