import { describe, it, expect, vi, beforeEach } from "vitest";

import { toActionFailure } from "../toActionFailure";
import { AccessDeniedError } from "../projectAccess";
import { InvalidInputError } from "../../validation/fieldGuards";

vi.mock("@vercel/postgres", () => ({ sql: { query: vi.fn() } }));
vi.mock("@clerk/nextjs/server", () => ({ auth: vi.fn(), currentUser: vi.fn() }));

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("toActionFailure", () => {
  it("does not hand the client the ids a denial names", () => {
    const result = toActionFailure(
      new AccessDeniedError("User clerk-1 may not access project project-9 as member")
    );

    expect(result).toEqual({ ok: false, reason: "denied", message: undefined });
  });

  it("does not hand the client a raw database error", () => {
    const result = toActionFailure(
      new Error('relation "patient_personal" does not exist')
    );

    expect(result).toEqual({ ok: false, reason: "error", message: undefined });
  });

  it("still sorts a rejected payload as invalid", () => {
    expect(toActionFailure(new InvalidInputError("x is required"))).toMatchObject({
      ok: false,
      reason: "invalid",
    });
  });

  it("keeps the detail in the server log", () => {
    const error = new Error("detail");
    toActionFailure(error);

    expect(console.error).toHaveBeenCalledWith(error);
  });
});
