import { describe, it, expect, vi, beforeEach } from "vitest";

// The database module is a server action reaching for @vercel/postgres and
// Clerk; the point of these tests is the caching in front of it.
const getPatientSummary = vi.fn();

vi.mock("../../database/patient-summary/GetPatientSummary", () => ({
  getPatientSummary: (args: { patientPersonalId: string }) =>
    getPatientSummary(args),
}));

const {
  rememberPatientSummaries,
  recallPatientSummary,
  startPatientSummary,
} = await import("../patientSummaryRequest");

// Types
import { PatientPersonalSummary } from "../../types/PatientPersonalSummary";
import { actionOk, actionFailed } from "../../types/ActionResult";

const summary = (
  patientPersonalId: string,
  patientFullName = "Ana Costa"
): PatientPersonalSummary => ({
  patientPersonalId,
  projectId: "project-1",
  patientFullName,
  isPatientMale: false,
  patientDateOfBirth: "1990-03-04",
  patientPhoneNumber: "+679 555 0123",
});

beforeEach(() => {
  getPatientSummary.mockReset();
  getPatientSummary.mockImplementation(async ({ patientPersonalId }) =>
    actionOk(summary(patientPersonalId))
  );
});

describe("rememberPatientSummaries", () => {
  it("hands back the row the clinician was just reading", () => {
    // The patients list has already read every field the sidebar shows, so a
    // record opened from that list needs no wait at all.
    rememberPatientSummaries([summary("remember-1", "Ana Costa")]);

    expect(recallPatientSummary("remember-1")?.patientFullName).toBe("Ana Costa");
  });

  it("remembers a whole page of patients at once", () => {
    rememberPatientSummaries([
      summary("remember-page-1", "Ana Costa"),
      summary("remember-page-2", "Bruno Lima"),
    ]);

    expect(recallPatientSummary("remember-page-1")?.patientFullName).toBe("Ana Costa");
    expect(recallPatientSummary("remember-page-2")?.patientFullName).toBe("Bruno Lima");
  });

  it("takes the newer reading of a patient it already knew", () => {
    rememberPatientSummaries([summary("remember-2", "Ana Costa")]);
    rememberPatientSummaries([summary("remember-2", "Ana Costa Silva")]);

    expect(recallPatientSummary("remember-2")?.patientFullName).toBe("Ana Costa Silva");
  });

  it("skips a row with no id rather than filing it under one", () => {
    expect(() =>
      rememberPatientSummaries([
        { ...summary("x"), patientPersonalId: undefined as never },
      ])
    ).not.toThrow();

    expect(recallPatientSummary(undefined as never)).toBeUndefined();
  });

  it("does not mind an empty list", () => {
    expect(() => rememberPatientSummaries([])).not.toThrow();
  });

  it("knows nothing about a patient nobody looked at, and never guesses", () => {
    // A cold arrival -- a scanned code, a pasted link -- has to wait for the
    // read. Answering here with the wrong patient's name would be worse.
    expect(recallPatientSummary("never-seen")).toBeUndefined();
    expect(recallPatientSummary(undefined)).toBeUndefined();
    expect(recallPatientSummary("")).toBeUndefined();
  });

  it("reads nothing from the database", () => {
    rememberPatientSummaries([summary("remember-3")]);
    recallPatientSummary("remember-3");

    expect(getPatientSummary).not.toHaveBeenCalled();
  });
});

describe("startPatientSummary", () => {
  it("asks the database for the patient and answers with what came back", async () => {
    const result = await startPatientSummary("start-1");

    expect(getPatientSummary).toHaveBeenCalledWith({ patientPersonalId: "start-1" });
    expect(result?.ok).toBe(true);
  });

  it("asks once however many times it is called, so an early and a late asker share a read", async () => {
    // Called from render, which React may run more than once: twice on mount in
    // development, and again on any state change before the answer arrives.
    const first = startPatientSummary("start-2");
    const second = startPatientSummary("start-2");

    expect(first).toBe(second);

    await first;

    expect(getPatientSummary).toHaveBeenCalledTimes(1);
  });

  it("keeps two patients' reads apart", async () => {
    const ana = startPatientSummary("start-3a");
    const bruno = startPatientSummary("start-3b");

    expect(ana).not.toBe(bruno);
    await Promise.all([ana, bruno]);

    expect(getPatientSummary).toHaveBeenCalledTimes(2);
  });

  it("asks for nothing when there is no patient to ask about", () => {
    expect(startPatientSummary()).toBeUndefined();
    expect(startPatientSummary("")).toBeUndefined();
    expect(getPatientSummary).not.toHaveBeenCalled();
  });

  it("reads the record again on a later visit rather than reusing the last answer", async () => {
    // Only the wait is being saved, never the record. A patient whose weight was
    // corrected between visits must not come back as they were.
    await startPatientSummary("start-4");

    getPatientSummary.mockImplementation(async () =>
      actionOk(summary("start-4", "Ana Costa Silva"))
    );

    const second = await startPatientSummary("start-4");

    expect(getPatientSummary).toHaveBeenCalledTimes(2);
    expect(second?.ok && second.data.patientFullName).toBe("Ana Costa Silva");
  });

  it("passes a failure through to the caller instead of swallowing it", async () => {
    getPatientSummary.mockImplementation(async () => actionFailed("denied"));

    const result = await startPatientSummary("start-5");

    expect(result?.ok).toBe(false);
    expect(result?.ok === false && result.reason).toBe("denied");
  });

  it("does not get stuck on a read that threw", async () => {
    // The entry is dropped whichever way the promise settles, so a network
    // failure does not leave a patient permanently unreadable in this tab.
    getPatientSummary.mockImplementation(async () => {
      throw new Error("the database was unreachable");
    });

    await expect(startPatientSummary("start-6")).rejects.toThrow("unreachable");

    getPatientSummary.mockImplementation(async ({ patientPersonalId }) =>
      actionOk(summary(patientPersonalId))
    );

    await expect(startPatientSummary("start-6")).resolves.toMatchObject({ ok: true });
    expect(getPatientSummary).toHaveBeenCalledTimes(2);
  });

  it("shares the read with a caller that arrives while it is still in flight", async () => {
    let settle: (value: unknown) => void = () => {};
    getPatientSummary.mockImplementation(
      () => new Promise((resolve) => { settle = resolve; })
    );

    const first = startPatientSummary("start-7");
    const second = startPatientSummary("start-7");

    settle(actionOk(summary("start-7")));

    expect(await first).toBe(await second);
    expect(getPatientSummary).toHaveBeenCalledTimes(1);
  });
});
