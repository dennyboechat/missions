// Multivariate dependency
import { Dispatch, SetStateAction } from "react";
import { ProjectUserFieldsTypes } from "../../../types/ProjectUserTypes";

export interface ProjectUserFieldsProps {
  projectUserFields: ProjectUserFieldsTypes;
  setProjectUserlFields: Dispatch<SetStateAction<ProjectUserFieldsTypes>>;
  isProjectUserNameInvalid?: boolean;
  isProjectUserEmailInvalid?: boolean;
}
