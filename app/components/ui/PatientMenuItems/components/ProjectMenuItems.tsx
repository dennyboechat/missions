"use client";

// Components
import { MenuItem } from "react-pro-sidebar";
import { PersonIcon } from "@radix-ui/react-icons";

// Types
import { PatientMenuItemsProps } from "../types/PatientMenuItemsProps";

export const ProjectMenuItems = ({
  patientPersonalId,
  activeMenuItem,
}: PatientMenuItemsProps) => {
  const personalIcon = <PersonIcon />;

  return (
    <MenuItem
      icon={personalIcon}
      href={`/patients-personal/${patientPersonalId}`}
      active={activeMenuItem === "patients-personal"}
    >
      {"Patients"}
    </MenuItem>
  );
};
