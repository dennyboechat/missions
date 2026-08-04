// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Theme } from "@radix-ui/themes";

import { actionOk } from "../../../types/ActionResult";

// Types
import { AuditEventRecord } from "../../../types/AuditEventTypes";

const getProjectAuditEvents = vi.fn();

vi.mock("../../../database/audit/GetProjectAuditEvents", () => ({
  getProjectAuditEvents: () => getProjectAuditEvents(),
}));
// No settings loaded, so the trail reads in the shipped default date order.
vi.mock("../../../lib/ProjectContext", () => ({
  useProject: () => ({ project: undefined, setProject: vi.fn() }),
}));

const { ProjectAudit } = await import("../components/ProjectAudit");

const event = (overrides: Partial<AuditEventRecord> = {}): AuditEventRecord => ({
  auditEventId: "e-1",
  occurredAt: "2026-08-03T22:54:54.182Z",
  actorName: "Ana Reis",
  action: "changed",
  entity: "general appointment",
  patientName: "Joana Pires",
  field: "patient_weight",
  valueBefore: "48",
  valueAfter: "51",
  ...overrides,
});

const originalTimezone = process.env.TZ;

beforeEach(() => {
  getProjectAuditEvents.mockReset();
});

afterEach(() => {
  cleanup();
  process.env.TZ = originalTimezone;
});

const renderAudit = () =>
  render(
    <Theme>
      <ProjectAudit params={{ id: "project-1" }} />
    </Theme>
  );

describe("when an event happened", () => {
  // The stored instant is UTC and the time of day is shown in the reader's own
  // zone, so the date beside it has to be the reader's date too. Auckland in
  // August is UTC+12, which puts this event on the evening of the 3rd in UTC and
  // the morning of the 4th where it is being read.
  it("dates an event by the same clock the time of day is shown on", async () => {
    process.env.TZ = "Pacific/Auckland";
    getProjectAuditEvents.mockResolvedValue(
      actionOk({ events: [event()], hasMore: false })
    );

    renderAudit();

    expect(await screen.findByText("08/04/2026 10:54:54")).toBeDefined();
  });

  // What the mangled version looked like: the day slot held the whole tail of
  // the timestamp, giving "03T22:54:54.182Z/08/2026 10:54:54".
  it("shows no part of the raw timestamp", async () => {
    process.env.TZ = "Pacific/Auckland";
    getProjectAuditEvents.mockResolvedValue(
      actionOk({ events: [event()], hasMore: false })
    );

    const { container } = renderAudit();

    await screen.findByText("08/04/2026 10:54:54");
    expect(container.textContent).not.toContain("182Z");
  });
});
