import { describe, it, expect } from "vitest";

import {
  describeAuditEvent,
  describeAuditSubject,
  getFieldLabel,
  getValueLabel,
} from "../utils/describeAuditEvent";

// Types
import { AuditEventRecord } from "../../../types/AuditEventTypes";

const event = (overrides: Partial<AuditEventRecord> = {}): AuditEventRecord => ({
  auditEventId: "e-1",
  occurredAt: "2026-03-12T10:42:18.000Z",
  actorName: "Ana Reis",
  action: "changed",
  entity: "general appointment",
  patientName: "Joana Pires",
  field: "patient_weight",
  valueBefore: "48",
  valueAfter: "51",
  ...overrides,
});

describe("getFieldLabel", () => {
  it("uses the name on the field, not the name in the schema", () => {
    expect(getFieldLabel("patient_blood_pressure_systolic")).toBe(
      "Blood pressure (systolic)",
    );
    expect(getFieldLabel("instructions_usage")).toBe("Instructions");
  });

  it("falls back to a readable form of an unlabelled column", () => {
    // A column added later is still a true record of what changed, so the event
    // is shown rather than dropped for want of a label.
    expect(getFieldLabel("patient_new_measurement")).toBe(
      "patient new measurement",
    );
  });

  it("has nothing to say when there is no field", () => {
    expect(getFieldLabel()).toBe("");
  });
});

describe("getValueLabel", () => {
  it("shows an empty field as a dash", () => {
    // Not "empty" and not "null": a field that held nothing looks like a field
    // that held nothing.
    expect(getValueLabel(undefined)).toBe("—");
  });

  it("leaves a real value alone, including a falsy-looking one", () => {
    expect(getValueLabel("0")).toBe("0");
    expect(getValueLabel("no")).toBe("no");
  });
});

describe("describeAuditEvent", () => {
  it("reads as a sentence naming the author and the field", () => {
    expect(describeAuditEvent(event())).toBe("Ana Reis changed Weight");
  });

  it("names the kind of record for an addition or a deletion", () => {
    expect(
      describeAuditEvent(
        event({ action: "added", entity: "general prescription", field: undefined }),
      ),
    ).toBe("Ana Reis added a general prescription");

    expect(
      describeAuditEvent(
        event({ action: "deleted", entity: "patient", field: undefined }),
      ),
    ).toBe("Ana Reis deleted a patient");
  });

  it("survives an author whose account is gone", () => {
    // The trail keeps the row and loses only the name, which is the whole reason
    // the actor column is nullable.
    expect(describeAuditEvent(event({ actorName: undefined }))).toBe(
      "A removed user changed Weight",
    );
  });

  it("does not claim a field it was not given", () => {
    // A "changed" event with no field would otherwise read "changed " with a
    // hole in it.
    expect(describeAuditEvent(event({ field: undefined }))).toBe(
      "Ana Reis changed a general appointment",
    );
  });
});

describe("describeAuditSubject", () => {
  it("names whose record it was and which part", () => {
    expect(describeAuditSubject(event())).toBe("Joana Pires · general appointment");
  });

  it("leaves the patient out of a project-level event", () => {
    // Settings and people have no patient, and a stray separator would read as a
    // missing name.
    expect(
      describeAuditSubject(
        event({ entity: "project user", patientName: undefined }),
      ),
    ).toBe("project user");
  });
});
