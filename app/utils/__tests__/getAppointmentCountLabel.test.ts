import { describe, it, expect } from "vitest";

import { getAppointmentCountLabel } from "../getAppointmentCountLabel";

describe("getAppointmentCountLabel", () => {
  it("counts, and agrees with itself about the plural", () => {
    expect(getAppointmentCountLabel({ count: 1 })).toBe(
      "1 appointment on this mission.",
    );
    expect(getAppointmentCountLabel({ count: 9 })).toBe(
      "9 appointments on this mission.",
    );
  });

  // A patient really seen no times, which is a fact about the patient.
  it("says none when there are none", () => {
    expect(getAppointmentCountLabel({ count: 0 })).toBe(
      "0 appointments on this mission.",
    );
  });

  /* The distinction the whole helper exists for. The tab paints before its query
     returns, and in that gap "0 appointments" states that this patient has never
     been seen -- of a patient who may have been seen an hour ago. Empty claims
     nothing.

     Empty rather than undefined, so ContentHeader keeps the line's height and the
     heading does not step down when the figure lands. */
  it("claims nothing while the count is unknown", () => {
    expect(getAppointmentCountLabel({})).toBe("");
    expect(getAppointmentCountLabel({ count: undefined })).toBe("");
  });
});
