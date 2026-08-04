import { describe, it, expect } from "vitest";

import { getFilteredProjectUsers } from "../getFilteredProjectUsers";

// Types
import { ProjectUser } from "../../types/ProjectUserTypes";

const user = (userName?: string, userEmail?: string): ProjectUser => ({
  projectUserId: `${userName}-${userEmail}`,
  projectId: "project-1",
  userId: `${userName}`,
  isUserActive: true,
  userName,
  userEmail,
});

const names = (users: ProjectUser[]) => users.map((found) => found.userName);

describe("getFilteredProjectUsers", () => {
  it("gives the whole list back when nothing has been typed", () => {
    const users = [user("Ana Costa", "ana@example.com")];

    expect(getFilteredProjectUsers({ projectUsers: users })).toEqual(users);
    expect(getFilteredProjectUsers({ projectUsers: users, filterText: "" })).toEqual(users);
  });

  it("puts a name that starts with what was typed above one that merely contains it", () => {
    const found = getFilteredProjectUsers({
      projectUsers: [user("Maria da Silva", "m@example.com"), user("Silva Rocha", "s@example.com")],
      filterText: "silva",
    });

    expect(names(found)).toEqual(["Silva Rocha", "Maria da Silva"]);
  });

  it("ranks the name above the email address", () => {
    // Two people can share a name fragment and an address fragment; the name is
    // what the admin was reading.
    const found = getFilteredProjectUsers({
      projectUsers: [
        user("Bruno Lima", "costa@example.com"),
        user("Ana Costa", "ana@example.com"),
      ],
      filterText: "costa",
    });

    expect(names(found)).toEqual(["Ana Costa", "Bruno Lima"]);
  });

  it("finds a colleague by their email address", () => {
    const found = getFilteredProjectUsers({
      projectUsers: [user("Ana Costa", "ana@example.com"), user("Bruno Lima", "bruno@example.com")],
      filterText: "bruno@",
    });

    expect(names(found)).toEqual(["Bruno Lima"]);
  });

  it("finds a colleague by the domain they were invited on", () => {
    const found = getFilteredProjectUsers({
      projectUsers: [user("Ana Costa", "ana@idexx.com"), user("Bruno Lima", "bruno@example.com")],
      filterText: "idexx",
    });

    expect(names(found)).toEqual(["Ana Costa"]);
  });

  it("ignores the case of what was typed and of the address on record", () => {
    const found = getFilteredProjectUsers({
      projectUsers: [user("Ana Costa", "ANA@EXAMPLE.COM")],
      filterText: "ana@example",
    });

    expect(names(found)).toEqual(["Ana Costa"]);
  });

  it("finds an accented name from the letters a plain keyboard can type", () => {
    const found = getFilteredProjectUsers({
      projectUsers: [user("José Ramírez", "jr@example.com")],
      filterText: "jose",
    });

    expect(names(found)).toEqual(["José Ramírez"]);
  });

  it("tolerates a colleague invited by email who has not signed in and named themselves", () => {
    // userName and userEmail are both optional on the row, so a half-filled
    // invitation must not throw the whole list away.
    const found = getFilteredProjectUsers({
      projectUsers: [user(undefined, "invited@example.com"), user("Ana Costa", undefined)],
      filterText: "invited",
    });

    expect(found.length).toBe(1);
    expect(found[0].userEmail).toBe("invited@example.com");
  });

  it("finds nobody when nothing matches, and nobody in an empty list", () => {
    expect(getFilteredProjectUsers({
      projectUsers: [user("Ana Costa", "ana@example.com")],
      filterText: "zzz",
    })).toEqual([]);

    expect(getFilteredProjectUsers({ projectUsers: [], filterText: "ana" })).toEqual([]);
  });

  it("counts a colleague once when their name and their address both match", () => {
    const found = getFilteredProjectUsers({
      projectUsers: [user("Ana", "ana@example.com")],
      filterText: "ana",
    });

    expect(found.length).toBe(1);
  });
});
