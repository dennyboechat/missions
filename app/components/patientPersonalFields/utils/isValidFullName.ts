// Types
import { PatientPersonalFullName } from "../../../types/PatientPersonalTypes";

export const isValidFullName = ({ fullName }: { fullName: PatientPersonalFullName }) =>
    fullName && fullName.trim() !== "";
