// @vitest-environment jsdom

import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useLiveValue } from "../useLiveValue";

/**
 * Stands in for a field like the clinical notes: local state seeded from the
 * server, edited here, and re-sent by the ten-second refresh.
 */
const Field = ({ remoteValue }: { remoteValue: string }) => {
  const [value, setValue] = useLiveValue(remoteValue);

  return (
    <input
      aria-label="field"
      value={value}
      onChange={(event) => setValue(event.target.value)}
    />
  );
};

const field = () => screen.getByLabelText<HTMLInputElement>("field");

afterEach(cleanup);

describe("useLiveValue", () => {
  it("shows the server's value when the field has not been touched", () => {
    const { rerender } = render(<Field remoteValue="first note" />);

    expect(field().value).toBe("first note");

    rerender(<Field remoteValue="a colleague's note" />);

    expect(field().value).toBe("a colleague's note");
  });

  it("keeps an unsaved edit when the server's value changes underneath it", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Field remoteValue="first note" />);

    await user.clear(field());
    await user.type(field(), "mid-sentence");

    rerender(<Field remoteValue="a colleague's note" />);

    expect(field().value).toBe("mid-sentence");
  });

  it("goes back to following the server once the edit has been saved", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Field remoteValue="first note" />);

    await user.clear(field());
    await user.type(field(), "my note");

    // The save lands, so the server now reports what was typed here.
    rerender(<Field remoteValue="my note" />);
    expect(field().value).toBe("my note");

    // Which means the next change from elsewhere is adopted, rather than the
    // field insisting on a value nobody is editing any more.
    rerender(<Field remoteValue="a colleague's note" />);
    expect(field().value).toBe("a colleague's note");
  });

  it("settles instead of fighting the tab that made the change", () => {
    // Two tabs would otherwise fight forever: each sees a value it did not
    // write, decides its own copy is the edit, and saves it back. The watching
    // tab has to yield, which it does by treating an untouched field as the
    // server's to set -- and then staying put.
    const { rerender } = render(<Field remoteValue="shared note" />);

    rerender(<Field remoteValue="edited elsewhere" />);
    expect(field().value).toBe("edited elsewhere");

    // Nothing here now differs from the server, so the save effect these
    // fields run has nothing to send back.
    rerender(<Field remoteValue="edited elsewhere" />);
    expect(field().value).toBe("edited elsewhere");
  });

  it("carries booleans as well as text, for the referral checkbox", () => {
    const Checkbox = ({ remoteValue }: { remoteValue: boolean }) => {
      const [checked, setChecked] = useLiveValue(remoteValue);

      return (
        <input
          aria-label="checkbox"
          type="checkbox"
          checked={checked}
          onChange={(event) => setChecked(event.target.checked)}
        />
      );
    };

    const { rerender } = render(<Checkbox remoteValue={false} />);
    const box = screen.getByLabelText<HTMLInputElement>("checkbox");

    expect(box.checked).toBe(false);

    rerender(<Checkbox remoteValue />);

    expect(box.checked).toBe(true);
  });
});
