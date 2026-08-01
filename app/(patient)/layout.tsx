"use client";

// Multivariate Dependencies
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

// Components
import { SideMenuLayout } from "../components/ui/SideMenuLayout";
import { PatientMenuItems } from "../components/PatientMenuItems";

// Database
import { getPatientSummary } from "../database/patient-summary/GetPatientSummary";

// Types
import { PatientPersonalSummary } from "../types/PatientPersonalSummary";
import { PatientMenuItemsProps } from "../components/PatientMenuItems/types/PatientMenuItemsProps";
import { actionData } from "../types/ActionResult";

// Utils
import { getSideMenuSubHeader } from "../utils/getSideMenuSubHeader";
import { getSideMenuSubHeaderFooter } from "../utils/getSideMenuSubHeaderFooter";

type ActiveMenuItem = PatientMenuItemsProps["activeMenuItem"];

const MENU_ITEM_BY_SEGMENT: Record<string, ActiveMenuItem> = {
  "patient-summary": "patient-summary",
  "patient-general": "patient-general",
  "patient-dentistry": "patient-dentistry",
  "patient-personal": "patient-personal",
};

/**
 * The chrome for every patient page: the sidebar, the patient's name and the
 * tab menu.
 *
 * It lives in a layout rather than in each page so that moving between tabs
 * swaps only the content. When each page rendered its own copy, React tore the
 * menu down and rebuilt it on every click -- which read as a page refresh, and
 * made a quick second click land on whichever item had shifted under the
 * cursor.
 *
 * The route group keeps the URLs exactly as they were.
 */
export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [, segment, patientPersonalId] = pathname.split("/");
  const activeMenuItem = MENU_ITEM_BY_SEGMENT[segment];

  const [patient, setPatient] = useState<PatientPersonalSummary>();

  useEffect(() => {
    let isCurrent = true;

    const loadPatient = async () => {
      if (!patientPersonalId) return;

      const summary = actionData(
        await getPatientSummary({ patientPersonalId }),
      );

      // Ignore a response for a patient the user has already navigated away
      // from.
      if (isCurrent) {
        setPatient(summary);
      }
    };

    loadPatient();

    return () => {
      isCurrent = false;
    };
  }, [patientPersonalId]);

  return (
    <SideMenuLayout
      menuItems={
        <PatientMenuItems
          patientPersonalId={patientPersonalId}
          activeMenuItem={activeMenuItem}
        />
      }
      header={patient?.patientFullName ?? ""}
      subHeader={getSideMenuSubHeader({
        patientDateOfBirth: patient?.patientDateOfBirth,
      })}
      subHeaderFooter={getSideMenuSubHeaderFooter({
        isPatientMale: patient?.isPatientMale,
      })}
      isBoldHeader
    >
      {children}
    </SideMenuLayout>
  );
}
