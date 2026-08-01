import { describe, it, expect } from "vitest";

import { getDuplicateUserWarning } from "../getDuplicateUserWarning";

// Types
import { ProjectUser } from "../../types/ProjectUserTypes";

const userWithEmail = (userEmail: string): ProjectUser => ({
  projectUserId: userEmail,
  projectId: "project-1",
  userId: userEmail,
  isUserActive: true,
  userName: "Denny Boechat",
  userEmail,
});

describe("getDuplicateUserWarning", () => {
  it("stays empty when no user shares the name", () => {
    expect(
      getDuplicateUserWarning({
        userName: "Denny Boechat",
        duplicateProjectUsers: [],
      }),
    ).toBe("");
  });

  it("stays empty when there is no name yet", () => {
    expect(
      getDuplicateUserWarning({
        userName: "",
        duplicateProjectUsers: [userWithEmail("denny@example.com")],
      }),
    ).toBe("");
  });

  it("names the single match and its email", () => {
    const warning = getDuplicateUserWarning({
      userName: "  Denny Boechat  ",
      duplicateProjectUsers: [userWithEmail("denny@example.com")],
    });

    expect(warning).toContain('"Denny Boechat"');
    expect(warning).toContain("denny@example.com");
  });

  it("lists every email when several users share the name", () => {
    const warning = getDuplicateUserWarning({
      userName: "Denny Boechat",
      duplicateProjectUsers: [
        userWithEmail("denny@example.com"),
        userWithEmail("denny.boechat@example.com"),
        userWithEmail("db@example.com"),
      ],
    });

    expect(warning).toContain("3 users");
    expect(warning).toContain(
      "emails denny@example.com, denny.boechat@example.com and db@example.com",
    );
  });
});
