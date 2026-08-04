import { describe, it, expect } from "vitest";

import { getDataTableTotalRecords } from "../getDataTableTotalRecords";
import { getGenderLabel } from "../getGenderLabel";
import { getYearsOldLabel } from "../getYearsOldLabel";
import { getSideMenuSubHeaderFooter } from "../getSideMenuSubHeaderFooter";
import { joinWithAnd } from "../joinWithAnd";

describe("getDataTableTotalRecords", () => {
  it("uses the singular for exactly one", () => {
    expect(getDataTableTotalRecords([{}], "patient")).toBe("total 1 patient");
  });

  it("uses the plural for none, which is what English does", () => {
    // The earlier test was `> 1`, so an empty table read "total 0 record".
    expect(getDataTableTotalRecords([], "patient")).toBe("total 0 patients");
  });

  it("uses the plural for more than one", () => {
    expect(getDataTableTotalRecords([{}, {}], "patient")).toBe("total 2 patients");
    expect(getDataTableTotalRecords(Array(24).fill({}), "patient")).toBe(
      "total 24 patients"
    );
  });

  it("counts nothing as none rather than failing", () => {
    expect(getDataTableTotalRecords()).toBe("total 0 records");
    expect(getDataTableTotalRecords(undefined, "patient")).toBe("total 0 patients");
  });

  it("says record when the caller does not name what is being counted", () => {
    expect(getDataTableTotalRecords([{}])).toBe("total 1 record");
    expect(getDataTableTotalRecords([{}, {}])).toBe("total 2 records");
  });

  it("stays lowercase and unemphatic, so it reads as a footnote", () => {
    const label = getDataTableTotalRecords([{}, {}], "appointment");

    expect(label).toBe("total 2 appointments");
    expect(label).toBe(label.toLowerCase());
  });
});

describe("getGenderLabel", () => {
  it("writes the two labels the record holds", () => {
    expect(getGenderLabel({ isPatientMale: true })).toBe("Male");
    expect(getGenderLabel({ isPatientMale: false })).toBe("Female");
  });
});

describe("getYearsOldLabel", () => {
  it("keeps the singular for an infant", () => {
    expect(getYearsOldLabel({ age: 0 })).toBe("0 year old");
    expect(getYearsOldLabel({ age: 1 })).toBe("1 year old");
  });

  it("turns plural at two", () => {
    expect(getYearsOldLabel({ age: 2 })).toBe("2 years old");
    expect(getYearsOldLabel({ age: 47 })).toBe("47 years old");
  });
});

describe("getSideMenuSubHeaderFooter", () => {
  it("writes the gender in the lower case the sub-header reads in", () => {
    expect(getSideMenuSubHeaderFooter({ isPatientMale: true })).toBe("male");
    expect(getSideMenuSubHeaderFooter({ isPatientMale: false })).toBe("female");
  });

  it("says nothing at all before the record has arrived", () => {
    // Not "female" by default: an unanswered field must not read as an answer.
    expect(getSideMenuSubHeaderFooter({})).toBe("");
    expect(getSideMenuSubHeaderFooter({ isPatientMale: undefined })).toBe("");
  });
});

describe("joinWithAnd", () => {
  it("reads as a sentence at every length", () => {
    expect(joinWithAnd([])).toBe("");
    expect(joinWithAnd(["name"])).toBe("name");
    expect(joinWithAnd(["name", "date of birth"])).toBe("name and date of birth");
    expect(joinWithAnd(["name", "date of birth", "phone number"])).toBe(
      "name, date of birth and phone number"
    );
  });

  it("puts no comma before the and", () => {
    expect(joinWithAnd(["a", "b", "c", "d"])).toBe("a, b, c and d");
  });

  it("does not mind an empty entry, and does not drop it either", () => {
    expect(joinWithAnd([""])).toBe("");
    expect(joinWithAnd(["a", ""])).toBe("a and ");
  });

  it("leaves the caller's list as it found it", () => {
    const fields = ["name", "date of birth", "phone number"];

    joinWithAnd(fields);

    expect(fields).toEqual(["name", "date of birth", "phone number"]);
  });
});
