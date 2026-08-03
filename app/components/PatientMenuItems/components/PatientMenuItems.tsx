"use client";

// Components
import { MenuItem } from "react-pro-sidebar";
import Link from "next/link";
import { Icon } from "../../ui/Icon";

// Types
import { PatientMenuItemsProps } from "../types/PatientMenuItemsProps";

// Hooks
import { useMenuNavigation } from "../../../lib/useMenuNavigation";

const ITEMS = [
  { key: "patient-summary", label: "Summary", icon: "summary" },
  { key: "patient-general", label: "General", icon: "general" },
  { key: "patient-dentistry", label: "Dental", icon: "dental" },
  { key: "patient-personal", label: "Personal", icon: "personal" },
] as const;

export const PatientMenuItems = ({
  patientPersonalId,
  activeMenuItem,
}: PatientMenuItemsProps) => {
  const { activeItem, navigate } = useMenuNavigation(activeMenuItem);

  return (
    <>
      {ITEMS.map(({ key, label, icon }) => {
        const href = `/${key}/${patientPersonalId}`;

        return (
          <MenuItem
            key={key}
            icon={<Icon name={icon} />}
            component={
              // Collapsed to the icon rail the label is off screen, so the
              // title is the only thing naming the icon on hover.
              <Link
                href={href}
                prefetch
                title={label}
                onClick={navigate(href, key)}
              />
            }
            active={activeItem === key}
          >
            {label}
          </MenuItem>
        );
      })}
    </>
  );
};
