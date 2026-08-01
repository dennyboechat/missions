// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Theme } from "@radix-ui/themes";

import { PopupMessageProvider } from "../../../lib/PopupMessage";
import { PopupMessage } from "../../ui/PopupMessage";
import { actionOk, actionFailed } from "../../../types/ActionResult";

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
vi.mock("../../../database/project/GetProjectTimezone", () => ({
  getProjectTimezone: vi.fn(async () => actionOk(undefined)),
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

  it("names the period it found nothing in", async () => {
    getProjectReportsAllData.mockResolvedValue(actionOk([]));

    const { container } = renderReports();
    const start = (
      container.querySelector('input[type="date"]') as HTMLInputElement
    ).value;
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
});
