"use client";

// Components
import { Dialog, Button, Flex } from "@radix-ui/themes";
import { PatientLabel } from "./PatientLabel";
import { Icon } from "../../ui/Icon";

// Types
import { PatientLabelDialogProps } from "../types/PatientLabelProps";

// Styles
import styles from "../styles/PatientLabel.module.css";

/**
 * The patient's card, opened from the QR code in the sidebar.
 *
 * The code was already the thing on that panel that looks like it does
 * something, so it is what opens this rather than a button added beside it.
 *
 * Printing is the browser's own dialog, reached through `window.print()`. The
 * card on screen is the element that gets printed -- there is no second copy
 * built for the printer that could drift from this one -- and the stylesheet
 * clears everything else off the sheet. That also means the print preview is an
 * honest one: paper size, margins and the printer itself stay where the person
 * printing can see them, which matters when the printer in the room is whatever
 * was available.
 *
 * The trigger waits for the record. The code itself only needs the id from the
 * URL, but the card is the name, the date of birth, the sex and the phone
 * number; opening it a second early would show a card with three blanks on it.
 */
export const PatientLabelDialog = ({
  patientPersonalId,
  patient,
  projectName,
  children,
}: PatientLabelDialogProps) => {
  const patientFullName = patient?.patientFullName;

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <button
          type="button"
          className={styles.trigger}
          disabled={!patient}
          aria-label={
            patientFullName
              ? `Show the printable card for ${patientFullName}`
              : "Show this patient's printable card"
          }
        >
          {children}
        </button>
      </Dialog.Trigger>
      <Dialog.Content
        width="fit-content"
        maxWidth="94vw"
        // Carries a class of ours purely so the print stylesheet has something
        // of its own to reach for on this element. See .dialog there.
        className={styles.dialog}
      >
        <Dialog.Title size="4">{"Patient card"}</Dialog.Title>
        <Dialog.Description size="2" color="gray">
          {"What this patient carries away with them."}
        </Dialog.Description>

        <div className={styles.preview}>
          <PatientLabel
            patientPersonalId={patientPersonalId}
            patient={patient}
            projectName={projectName}
          />
        </div>

        <Flex gap="3" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              {"Close"}
            </Button>
          </Dialog.Close>
          <Button onClick={() => window.print()}>
            <Icon name="print" size={17} />
            {"Print"}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};
