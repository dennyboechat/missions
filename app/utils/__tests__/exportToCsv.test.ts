// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { exportToCsv } from "../exportToCsv";

const HEADERS = [
  { key: "patientFullName", label: "Patient" },
  { key: "drugName", label: "Medication" },
];

let written: Blob[] = [];
let clicked: HTMLAnchorElement[] = [];
let revoked: string[] = [];

/** The file the browser was handed, as text. */
const downloadedText = async () => {
  expect(written.length).toBe(1);

  return written[0].text();
};

const rows = async () => (await downloadedText()).split("\n");

beforeEach(() => {
  written = [];
  clicked = [];
  revoked = [];

  // jsdom implements neither, and neither has anything to do with what the CSV
  // says. Capturing them is how the test reads the file that was produced.
  vi.stubGlobal("URL", {
    ...URL,
    createObjectURL: (blob: Blob) => {
      written.push(blob);

      return `blob:mission/${written.length}`;
    },
    revokeObjectURL: (url: string) => {
      revoked.push(url);
    },
  });

  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
    this: HTMLAnchorElement
  ) {
    clicked.push(this);
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("exportToCsv", () => {
  it("writes the labels as the header row, in the order given", async () => {
    exportToCsv({
      data: [{ patientFullName: "Ana Costa", drugName: "Losartan" }],
      headers: HEADERS,
      filename: "medications.csv",
    });

    expect(await rows()).toEqual(["Patient,Medication", "Ana Costa,Losartan"]);
  });

  it("writes a row per record and only the columns asked for", async () => {
    exportToCsv({
      data: [
        { patientFullName: "Ana Costa", drugName: "Losartan", internalId: "secret" },
        { patientFullName: "Bruno Lima", drugName: "Metformin", internalId: "secret" },
      ],
      headers: HEADERS,
      filename: "medications.csv",
    });

    const lines = await rows();

    expect(lines.length).toBe(3);
    expect(await downloadedText()).not.toContain("secret");
  });

  it("quotes a value holding a comma, so a name does not become two columns", async () => {
    // "Costa, Ana" written bare shifts every column after it by one, which is
    // the difference between a medication list and a nonsense one.
    exportToCsv({
      data: [{ patientFullName: "Costa, Ana", drugName: "Losartan" }],
      headers: HEADERS,
      filename: "medications.csv",
    });

    expect((await rows())[1]).toBe('"Costa, Ana",Losartan');
  });

  it("doubles a quote inside a value, the escape CSV readers expect", async () => {
    exportToCsv({
      data: [{ patientFullName: 'Ana "Annie" Costa', drugName: "Losartan" }],
      headers: HEADERS,
      filename: "medications.csv",
    });

    expect((await rows())[1]).toBe('"Ana ""Annie"" Costa",Losartan');
  });

  it("quotes a value holding a newline, so notes stay inside their row", async () => {
    exportToCsv({
      data: [{ patientFullName: "Ana Costa", drugName: "Losartan\n500 mg" }],
      headers: HEADERS,
      filename: "medications.csv",
    });

    expect(await downloadedText()).toBe(
      'Patient,Medication\nAna Costa,"Losartan\n500 mg"'
    );
  });

  it("leaves an empty cell empty rather than writing the word null", async () => {
    exportToCsv({
      data: [{ patientFullName: "Ana Costa", drugName: null }, { patientFullName: "Bruno Lima" }],
      headers: HEADERS,
      filename: "medications.csv",
    });

    expect(await rows()).toEqual([
      "Patient,Medication",
      "Ana Costa,",
      "Bruno Lima,",
    ]);
  });

  it("writes a number, a zero and a false as themselves", async () => {
    exportToCsv({
      data: [{ patientFullName: 0, drugName: false }],
      headers: HEADERS,
      filename: "medications.csv",
    });

    expect((await rows())[1]).toBe("0,false");
  });

  it("quotes a label that needs it, not only a value", async () => {
    exportToCsv({
      data: [{ dose: "500 mg" }],
      headers: [{ key: "dose", label: "Dose, as prescribed" }],
      filename: "medications.csv",
    });

    expect((await rows())[0]).toBe('"Dose, as prescribed"');
  });

  it("still writes the header row when there is nothing to report", async () => {
    // An empty report is an answer. A file with no header at all reads as a
    // failed export.
    exportToCsv({ data: [], headers: HEADERS, filename: "medications.csv" });

    expect(await downloadedText()).toBe("Patient,Medication");
  });

  it("names the file what the caller asked and hands it to the browser once", async () => {
    exportToCsv({
      data: [{ patientFullName: "Ana Costa", drugName: "Losartan" }],
      headers: HEADERS,
      filename: "fiji-2026-medications.csv",
    });

    expect(clicked.length).toBe(1);
    expect(clicked[0].download).toBe("fiji-2026-medications.csv");
    expect(clicked[0].getAttribute("href")).toBe("blob:mission/1");
  });

  it("offers the file as CSV text, so a spreadsheet opens it as a sheet", async () => {
    exportToCsv({
      data: [{ patientFullName: "Ana Costa", drugName: "Losartan" }],
      headers: HEADERS,
      filename: "medications.csv",
    });

    expect(written[0].type).toBe("text/csv;charset=utf-8;");
  });

  it("releases the blob URL it created", async () => {
    exportToCsv({
      data: [{ patientFullName: "Ana Costa", drugName: "Losartan" }],
      headers: HEADERS,
      filename: "medications.csv",
    });

    expect(revoked).toEqual(["blob:mission/1"]);
  });

  it("keeps an accented name intact through the download", async () => {
    exportToCsv({
      data: [{ patientFullName: "José Ramírez", drugName: "Losartan" }],
      headers: HEADERS,
      filename: "medications.csv",
    });

    expect(await downloadedText()).toContain("José Ramírez");
  });
});
