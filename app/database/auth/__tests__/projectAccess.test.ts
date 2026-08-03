import { describe, it, expect, vi, beforeEach } from "vitest";

const query = vi.fn();
const auth = vi.fn();

vi.mock("@vercel/postgres", () => ({
  sql: { query: (...args: unknown[]) => query(...args) },
}));
vi.mock("@clerk/nextjs/server", () => ({
  auth: () => auth(),
  currentUser: vi.fn(),
}));

const { assertProjectRole, assertProjectAccess } = await import(
  "../projectAccess"
);

// What the single access query comes back with. Nobody by default: each test
// says only what it is about.
const access = (
  standing: Partial<{
    caller_count: number;
    project_id: string | null;
    is_owner: boolean;
    is_member: boolean;
    is_admin: boolean;
  }> = {}
) => ({
  rows: [
    {
      caller_count: 1,
      project_id: "project-1",
      is_owner: false,
      is_member: false,
      is_admin: false,
      ...standing,
    },
  ],
});

const OWNER = { is_owner: true };
// An admin is a member carrying the flag; the query reports both.
const ADMIN = { is_member: true, is_admin: true };
const MEMBER = { is_member: true };

beforeEach(() => {
  query.mockReset();
  auth.mockReset();
  auth.mockResolvedValue({ userId: "clerk-1" });
});

const roleFor = async (standing: object, requires?: "member" | "admin" | "owner") => {
  query.mockResolvedValue(access(standing));
  const result = await assertProjectRole(
    { projectId: "project-1" },
    requires ? { requires } : undefined
  );
  return result.role;
};

const denied = async (standing: object, requires: "member" | "admin" | "owner") => {
  query.mockResolvedValue(access(standing));
  await expect(
    assertProjectRole({ projectId: "project-1" }, { requires })
  ).rejects.toThrow(/may not access project/);
};

describe("what each rank may reach", () => {
  // The ladder, in full. An owner satisfies everything, an admin everything
  // below owner, a member only the clinical work. Written out rather than
  // generated so a wrong cell is a named failing test.
  it("lets an owner through at every level", async () => {
    expect(await roleFor(OWNER, "member")).toBe("owner");
    expect(await roleFor(OWNER, "admin")).toBe("owner");
    expect(await roleFor(OWNER, "owner")).toBe("owner");
  });

  it("lets an admin through as admin and as member", async () => {
    expect(await roleFor(ADMIN, "member")).toBe("admin");
    expect(await roleFor(ADMIN, "admin")).toBe("admin");
  });

  // The whole point of the rank: everything the owner can do except this.
  it("refuses an admin the one thing that is not delegable", async () => {
    await denied(ADMIN, "owner");
  });

  it("lets a member through as a member only", async () => {
    expect(await roleFor(MEMBER, "member")).toBe("member");
    await denied(MEMBER, "admin");
    await denied(MEMBER, "owner");
  });

  it("refuses a stranger even the clinical work", async () => {
    await denied({}, "member");
  });

  // Guards the default: an action that forgets to say what it needs must not
  // silently become the most permissive thing in the codebase.
  it("requires membership when no level is named", async () => {
    expect(await roleFor(MEMBER)).toBe("member");
    query.mockResolvedValue(access({}));
    await expect(
      assertProjectRole({ projectId: "project-1" })
    ).rejects.toThrow(/may not access project/);
  });
});

describe("the rank it reports back", () => {
  // An owner may also hold a project_user row -- added to their own project as
  // a clinician, say. Owner is what decides, so owner is what it says.
  it("reports owner for an owner who is also an admin", async () => {
    expect(await roleFor({ ...OWNER, ...ADMIN }, "member")).toBe("owner");
  });

  it("reports admin over plain membership", async () => {
    expect(await roleFor(ADMIN, "member")).toBe("admin");
  });
});

describe("when the question cannot be answered", () => {
  it("separates an unknown session from an unknown project", async () => {
    query.mockResolvedValue(access({ caller_count: 0 }));
    await expect(
      assertProjectRole({ projectId: "project-1" })
    ).rejects.toThrow(/No application user/);

    query.mockResolvedValue(access({ project_id: null, is_owner: true }));
    await expect(
      assertProjectRole({ projectId: "project-1" })
    ).rejects.toThrow(/No project found/);
  });

  it("refuses a scope that is not exactly one id", async () => {
    await expect(assertProjectRole({})).rejects.toThrow(/exactly one scope id/);
    await expect(
      assertProjectRole({ projectId: "p", patientPersonalId: "q" })
    ).rejects.toThrow(/exactly one scope id/);
  });

  it("refuses a caller with no session before asking the database", async () => {
    auth.mockResolvedValue({ userId: null });
    await expect(
      assertProjectRole({ projectId: "project-1" })
    ).rejects.toThrow(/Not signed in/);
    expect(query).not.toHaveBeenCalled();
  });
});

describe("assertProjectAccess", () => {
  it("returns the resolved project id", async () => {
    query.mockResolvedValue(access(OWNER));
    await expect(
      assertProjectAccess({ projectId: "project-1" }, { requires: "owner" })
    ).resolves.toBe("project-1");
  });

  // Same gate as assertProjectRole -- it is the same function underneath, and a
  // divergence here would be a silently unguarded action.
  it("refuses whatever assertProjectRole refuses", async () => {
    query.mockResolvedValue(access(ADMIN));
    await expect(
      assertProjectAccess({ projectId: "project-1" }, { requires: "owner" })
    ).rejects.toThrow(/may not access project/);
  });
});
