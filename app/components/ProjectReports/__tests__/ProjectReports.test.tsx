// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  cleanup,
  waitFor,
  fireEvent,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Theme } from "@radix-ui/themes";

import { PopupMessageProvider } from "../../../lib/PopupMessage";
import { PopupMessage } from "../../ui/PopupMessage";
import { actionOk, actionFailed } from "../../../types/ActionResult";
import { DEFAULT_PROJECT_FORMATS } from "../../../types/ProjectTypes";
import { formatProjectDate } from "../../../utils/projectFormats";

const getProjectReportsAllData = vi.fn();
const exportToCsv = vi.fn();

vi.mock("@/app/database/project-reports/GetProjectReportsAllData", () => ({
  getProjectReportsAllData: () => getProjectReportsAllData(),
}));
vi.mock("../../../database/project-reports/GetProjectReportsMedication", () => ({
  getProjectReportsMedication: vi.fn(async () => actionOk([])),
}));
vi.mock("../../../database/project-reports/GetProjectReportsAppointment", () => ({
  getProjectReportsAppointment: vi.fn(async () => actionOk([])),
}));
const getProjectTimezone = vi.fn();
const getTodayInTimezone = vi.fn();

vi.mock("../../../database/project/GetProjectTimezone", () => ({
  getProjectTimezone: () => getProjectTimezone(),
}));
// Faked rather than time-travelled: the mission's today is the yardstick the
// end-date warning is measured against, and a test that reads the real clock
// would pass or fail depending on the hour it ran at.
vi.mock("../../../utils/getTodayInTimezone", () => ({
  getTodayInTimezone: () => getTodayInTimezone(),
}));
vi.mock("../../../lib/ProjectContext", () => ({
  useProject: () => ({ project: undefined, setProject: vi.fn() }),
}));
vi.mock("../../../utils/exportToCsv", () => ({
  exportToCsv: (...args: unknown[]) => exportToCsv(...args),
}));

const { ProjectReports } = await import("../components/ProjectReports");

beforeEach(() => {
  getProjectReportsAllData.mockReset();
  exportToCsv.mockReset();
  // No timezone by default, which is the pre-existing behaviour: the dates stay
  // the browser's and getTodayInTimezone is never reached.
  getProjectTimezone.mockReset();
  getProjectTimezone.mockResolvedValue(actionOk(undefined));
  getTodayInTimezone.mockReset();
});

afterEach(cleanup);

const renderReports = () =>
  render(
    <Theme>
      <PopupMessageProvider>
        <ProjectReports params={{ id: "project-1" }} />
        <PopupMessage />
      </PopupMessageProvider>
    </Theme>
  );

const setEndDate = (container: HTMLElement, value: string) => {
  const endDate = container.querySelectorAll('input[type="date"]')[1];
  fireEvent.change(endDate, { target: { value } });
};

const clickDownload = async () => {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Download all data" }));
};

describe("downloading all data", () => {
  it("says so when the period holds no data", async () => {
    getProjectReportsAllData.mockResolvedValue(actionOk([]));

    renderReports();
    await clickDownload();

    expect(await screen.findByText(/No data to download/)).toBeDefined();
    expect(exportToCsv).not.toHaveBeenCalled();
  });

  // The date input holds ISO because type="date" requires it; the message is
  // prose, so it reads in the project's order. This project has no settings
  // loaded, so that is the shipped default.
  it("names the period it found nothing in, in the project's date order", async () => {
    getProjectReportsAllData.mockResolvedValue(actionOk([]));

    const { container } = renderReports();
    const start = formatProjectDate({
      date: (container.querySelector('input[type="date"]') as HTMLInputElement)
        .value,
      dateFormat: DEFAULT_PROJECT_FORMATS.dateFormat,
    });
    await clickDownload();

    expect(await screen.findByText(new RegExp(start))).toBeDefined();
  });

  it("reports a failed query as an error rather than as empty", async () => {
    getProjectReportsAllData.mockResolvedValue(actionFailed("error"));

    renderReports();
    await clickDownload();

    expect(await screen.findByText(/Error to download/)).toBeDefined();
    expect(exportToCsv).not.toHaveBeenCalled();
  });

  it("downloads without a message when there is data", async () => {
    getProjectReportsAllData.mockResolvedValue(
      actionOk([{ patientFullName: "Ana Silva" }])
    );

    renderReports();
    await clickDownload();

    await waitFor(() => expect(exportToCsv).toHaveBeenCalledTimes(1));
    expect(screen.queryByText(/No data to download/)).toBeNull();
    expect(screen.queryByText(/Error to download/)).toBeNull();
  });

  // The export once quietly omitted a third of what a visit records -- vision,
  // the systolic half of a blood pressure, both referrals, tooth status. Naming
  // every field here means dropping one fails a test instead of a mission's
  // report.
  it("exports every recorded field", async () => {
    getProjectReportsAllData.mockResolvedValue(
      actionOk([{ patientFullName: "Ana Silva" }])
    );

    renderReports();
    await clickDownload();

    await waitFor(() => expect(exportToCsv).toHaveBeenCalledTimes(1));

    const { headers } = exportToCsv.mock.calls[0][0];
    expect(headers.map((h: { key: string }) => h.key)).toEqual([
      "appointmentType",
      "patientFullName",
      "patientDateOfBirth",
      "patientPhoneNumber",
      "gender",
      "generalAppointmentDate",
      "generalNotes",
      "generalHasReferral",
      "generalReferral",
      "generalPrescribedMedications",
      "patientHeight",
      "patientWeight",
      "patientTemperature",
      "patientBloodGlucose",
      "patientPulse",
      "patientOxygenSaturation",
      "patientBloodPressureSystolic",
      "patientBloodPressureDiastolic",
      "patientVisionLeftNormalDistance",
      "patientVisionLeftTestedDistance",
      "patientVisionRightNormalDistance",
      "patientVisionRightTestedDistance",
      "dentalAppointmentDate",
      "dentalNotes",
      "dentalHasReferral",
      "dentalReferral",
      "dentalPrescribedMedications",
      "teeth",
    ]);
  });

  // A dental row carries no vitals and a general row no teeth, so half of every
  // row is legitimately blank. Passing the type through is what tells a reader
  // the gaps are the shape of the file and not data that went missing.
  it("keeps the appointment type on each row", async () => {
    getProjectReportsAllData.mockResolvedValue(
      actionOk([
        { patientFullName: "Ana Silva", appointmentType: "General" },
        { patientFullName: "Ana Silva", appointmentType: "Dental" },
      ])
    );

    renderReports();
    await clickDownload();

    await waitFor(() => expect(exportToCsv).toHaveBeenCalledTimes(1));

    const { data } = exportToCsv.mock.calls[0][0];
    expect(data.map((r: { appointmentType: string }) => r.appointmentType)).toEqual(
      ["General", "Dental"]
    );
  });
});

const WARNING = /End date is in the past/;

describe("an end date that has already passed", () => {
  it("says nothing about the window it opens on", async () => {
    renderReports();

    // The default window ends today, so there is nothing to warn about. Awaited
    // so a warning arriving with the timezone would still be caught.
    await waitFor(() => expect(getProjectTimezone).toHaveBeenCalled());
    expect(screen.queryByText(WARNING)).toBeNull();
  });

  it("warns once the window is moved into the past", async () => {
    const { container } = renderReports();
    setEndDate(container, "2020-01-01");

    expect(await screen.findByText(WARNING)).toBeDefined();
  });

  it("names the date the report stops at", async () => {
    const { container } = renderReports();
    setEndDate(container, "2020-01-01");

    expect(await screen.findByText(/Appointments after 2020-01-01/)).toBeDefined();
  });

  it("says nothing about a window that has not closed yet", async () => {
    const { container } = renderReports();
    setEndDate(container, "2999-12-31");

    await waitFor(() => expect(getProjectTimezone).toHaveBeenCalled());
    expect(screen.queryByText(WARNING)).toBeNull();
  });

  it("takes the warning back when the date is corrected", async () => {
    const { container } = renderReports();
    setEndDate(container, "2020-01-01");
    expect(await screen.findByText(WARNING)).toBeDefined();

    setEndDate(container, "2999-12-31");
    await waitFor(() => expect(screen.queryByText(WARNING)).toBeNull());
  });

  // The mission's day decides, not the browser's. A window ending on the day it
  // still is in Los Angeles is already yesterday in Fiji, and it is the mission
  // that is missing visits.
  it("measures against the mission's today, not the browser's", async () => {
    getProjectTimezone.mockResolvedValue(actionOk("Pacific/Fiji"));
    getTodayInTimezone.mockReturnValue("2025-03-12");

    const { container } = renderReports();

    // The window the project's timezone installs ends on the mission's today.
    await waitFor(() =>
      expect(
        (container.querySelectorAll('input[type="date"]')[1] as HTMLInputElement)
          .value
      ).toBe("2025-03-12")
    );
    expect(screen.queryByText(WARNING)).toBeNull();

    // One day earlier is in the past there, even where it is still that day.
    setEndDate(container, "2025-03-11");
    expect(await screen.findByText(WARNING)).toBeDefined();
  });

  // Losing the timezone must not cost the warning: it falls back to the
  // browser's day rather than going quiet.
  it("still warns when the project's timezone cannot be read", async () => {
    getProjectTimezone.mockResolvedValue(actionFailed("error"));

    const { container } = renderReports();
    setEndDate(container, "2020-01-01");

    expect(await screen.findByText(WARNING)).toBeDefined();
  });
});
