import { describe, it, expect, vi, beforeEach } from "vitest";

// The actions that authorise themselves rather than through a project scope:
// looking a user up, linking an account, and the page presence heartbeat.

const query = vi.fn();
const auth = vi.fn();
const currentUser = vi.fn();

vi.mock("@vercel/postgres", () => ({
  sql: { query: (...args: unknown[]) => query(...args) },
}));
vi.mock("@clerk/nextjs/server", () => ({
  auth: () => auth(),
  currentUser: () => currentUser(),
}));

const { getAppUser } = await import("../app-user/GetAppUser");
const { updateAppUser } = await import("../app-user/UpdateAppUser");
const { touchPagePresence } = await import(
  "../page-presence/TouchPagePresence"
);

const USER_ROW = {
  user_id: "user-1",
  user_third_party_id: "clerk-1",
  user_name: "Ana Costa",
  user_email: "ana@example.com",
};

// The project access check's single row: a member of project-1.
const MEMBER_ACCESS = {
  rows: [
    {
      caller_count: 1,
      project_id: "project-1",
      is_owner: false,
      is_member: true,
      is_admin: false,
    },
  ],
};

beforeEach(() => {
  query.mockReset();
  auth.mockReset();
  currentUser.mockReset();
  auth.mockResolvedValue({ userId: "clerk-1" });
  currentUser.mockResolvedValue({
    primaryEmailAddress: { emailAddress: "ana@example.com" },
  });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("getAppUser", () => {
  it("finds the caller by their own Clerk id", async () => {
    query.mockResolvedValue({ rows: [USER_ROW] });

    const result = await getAppUser({
      field: "user_third_party_id",
      value: "clerk-1",
    });

    expect(result.ok).toBe(true);
  });

  it("refuses to look up somebody else's Clerk id", async () => {
    const result = await getAppUser({
      field: "user_third_party_id",
      value: "clerk-2",
    });

    expect(result).toMatchObject({ ok: false, reason: "denied" });
    expect(query).not.toHaveBeenCalled();
  });

  it("refuses an email lookup from a session with no account", async () => {
    query.mockResolvedValueOnce({ rows: [] });

    const result = await getAppUser({
      field: "user_email",
      value: "someone@example.com",
    });

    expect(result).toMatchObject({ ok: false, reason: "denied" });
    expect(query).toHaveBeenCalledTimes(1);
  });

  it("does not hand back another person's Clerk id by email", async () => {
    query
      .mockResolvedValueOnce({ rows: [{ user_id: "user-1" }] })
      .mockResolvedValueOnce({
        rows: [{ ...USER_ROW, user_third_party_id: "clerk-2" }],
      });

    const result = await getAppUser({
      field: "user_email",
      value: "ana@example.com",
    });

    expect(result.ok).toBe(true);
    expect(JSON.stringify(result)).not.toContain("clerk-2");
  });
});

describe("updateAppUser", () => {
  it("only links a row nobody has claimed, or the caller's own", async () => {
    query.mockResolvedValue({ rows: [USER_ROW] });

    await updateAppUser({
      userEmail: "ana@example.com",
      field: "user_third_party_id",
      value: "clerk-1",
    });

    const [statement, params] = query.mock.calls[0];
    expect(statement).toMatch(
      /user_third_party_id IS NULL OR user_third_party_id = \$3/
    );
    expect(params[2]).toBe("clerk-1");
  });
});

describe("touchPagePresence", () => {
  const scope = { patientPersonalId: "patient-1" };

  it("refuses a key that names a record other than the scope", async () => {
    query.mockResolvedValueOnce(MEMBER_ACCESS);

    const result = await touchPagePresence({
      resourceKey: "patient-general:patient-from-another-project",
      resourceLabel: "General",
      scope,
    });

    expect(result).toMatchObject({ ok: false, reason: "denied" });
    expect(query).toHaveBeenCalledTimes(1);
  });

  it("lists only viewers of the authorised project", async () => {
    query
      .mockResolvedValueOnce(MEMBER_ACCESS)
      .mockResolvedValueOnce({ rows: [] });

    const result = await touchPagePresence({
      resourceKey: "patient-general:patient-1",
      resourceLabel: "General",
      scope,
    });

    expect(result.ok).toBe(true);
    const [statement] = query.mock.calls[1];
    expect(statement).toMatch(/page_presence\.project_id = \$2::uuid/);
  });
});
