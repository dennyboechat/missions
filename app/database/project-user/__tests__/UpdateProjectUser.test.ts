import { describe, it, expect, vi, beforeEach } from "vitest";

const query = vi.fn();
const assertProjectAccess = vi.fn();
const getAuthenticatedUserIds = vi.fn();

vi.mock("@vercel/postgres", () => ({
  sql: { query: (...args: unknown[]) => query(...args) },
}));
vi.mock("../../auth/projectAccess", () => ({
  assertProjectAccess: (...args: unknown[]) => assertProjectAccess(...args),
  getAuthenticatedUserIds: () => getAuthenticatedUserIds(),
}));

const { updateProjectUser } = await import("../UpdateProjectUser");

const TARGET = "project-user-1";
const UPDATED = {
  rows: [
    {
      project_user_id: TARGET,
      project_id: "project-1",
      user_id: "user-2",
      is_user_active: true,
      is_user_admin: true,
    },
  ],
};

// The first query asks whether the target row is the caller's own; the second is
// the update itself. Nobody else by default.
const notTheCallersOwnRow = { rows: [] };

beforeEach(() => {
  query.mockReset();
  assertProjectAccess.mockReset();
  getAuthenticatedUserIds.mockReset();
  assertProjectAccess.mockResolvedValue("project-1");
  getAuthenticatedUserIds.mockResolvedValue(["user-1"]);
});

describe("who may be changed", () => {
  it("asks for admin rank on the row being changed", async () => {
    query.mockResolvedValueOnce(notTheCallersOwnRow).mockResolvedValueOnce(UPDATED);

    await updateProjectUser({ projectUserId: TARGET, isUserAdmin: true });

    expect(assertProjectAccess).toHaveBeenCalledWith(
      { projectUserId: TARGET },
      { requires: "admin" }
    );
  });

  // An admin who could switch off their own admin would revoke the access they
  // are using and land on a page they can no longer load. Someone else with the
  // rank does it -- for the last admin, the owner, who cannot be locked out
  // because ownership is not held in this table.
  it("refuses an admin editing their own row", async () => {
    query.mockResolvedValueOnce({ rows: [{ 1: 1 }] });

    const result = await updateProjectUser({
      projectUserId: TARGET,
      isUserAdmin: false,
    });

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.reason).toBe("invalid");
    // Refused before the update runs, not after it.
    expect(query).toHaveBeenCalledTimes(1);
  });

  it("refuses a self-edit of the active flag too, not just admin", async () => {
    query.mockResolvedValueOnce({ rows: [{ 1: 1 }] });

    const result = await updateProjectUser({
      projectUserId: TARGET,
      isUserActive: false,
    });

    expect(result.ok).toBe(false);
    expect(query).toHaveBeenCalledTimes(1);
  });

  // Duplicate app_user rows for one Clerk id are a known state in this codebase
  // -- the guard has to recognise every one of them as the caller.
  it("matches the caller against all of their app_user rows", async () => {
    getAuthenticatedUserIds.mockResolvedValue(["user-1", "user-1-duplicate"]);
    query.mockResolvedValueOnce(notTheCallersOwnRow).mockResolvedValueOnce(UPDATED);

    await updateProjectUser({ projectUserId: TARGET, isUserAdmin: true });

    expect(query.mock.calls[0][1]).toEqual([
      TARGET,
      ["user-1", "user-1-duplicate"],
    ]);
  });
});

describe("what gets written", () => {
  // Two admins on the same person from different screens must not undo each
  // other: whichever flag was not named keeps the value already on the row.
  it("leaves the flag it was not given alone", async () => {
    query.mockResolvedValueOnce(notTheCallersOwnRow).mockResolvedValueOnce(UPDATED);

    await updateProjectUser({ projectUserId: TARGET, isUserAdmin: true });

    const [sql, params] = query.mock.calls[1];
    expect(sql).toMatch(/is_user_active = COALESCE\(\$1, is_user_active\)/);
    expect(sql).toMatch(/is_user_admin = COALESCE\(\$2, is_user_admin\)/);
    // null, not undefined: COALESCE is what keeps the stored value.
    expect(params).toEqual([null, true, TARGET]);
  });

  it("passes the active flag through in the same way", async () => {
    query.mockResolvedValueOnce(notTheCallersOwnRow).mockResolvedValueOnce(UPDATED);

    await updateProjectUser({ projectUserId: TARGET, isUserActive: false });

    expect(query.mock.calls[1][1]).toEqual([false, null, TARGET]);
  });

  // false is a value, not an absence. Demoting an admin has to send false
  // rather than falling through to "leave it as it was".
  it("treats false as a change and not as unspecified", async () => {
    query.mockResolvedValueOnce(notTheCallersOwnRow).mockResolvedValueOnce(UPDATED);

    await updateProjectUser({ projectUserId: TARGET, isUserAdmin: false });

    expect(query.mock.calls[1][1]).toEqual([null, false, TARGET]);
  });

  it("reports the admin flag back to the caller", async () => {
    query.mockResolvedValueOnce(notTheCallersOwnRow).mockResolvedValueOnce(UPDATED);

    const result = await updateProjectUser({
      projectUserId: TARGET,
      isUserAdmin: true,
    });

    expect(result.ok && result.data.isUserAdmin).toBe(true);
  });

  it("reports a row that is no longer there rather than success", async () => {
    query.mockResolvedValueOnce(notTheCallersOwnRow).mockResolvedValueOnce({ rows: [] });

    const result = await updateProjectUser({
      projectUserId: TARGET,
      isUserAdmin: true,
    });

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.reason).toBe("not_found");
  });
});
