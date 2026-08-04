import { describe, it, expect } from "vitest";

import { getParsedCharacterText } from "../getParsedCharacterText";

/**
 * What the patient and user searches match against. A name is folded down to
 * plain lowercase letters so that someone typing "jose" on a keyboard with no
 * accents still finds "José" -- the name people are looking for is the one on
 * the record, not the one they can type.
 */
describe("getParsedCharacterText", () => {
  it("lowercases, so the search does not depend on how a name was entered", () => {
    expect(getParsedCharacterText({ text: "MARIA DA SILVA" })).toBe("maria da silva");
  });

  it("folds the accented vowels onto their plain letters", () => {
    expect(getParsedCharacterText({ text: "àáâãäå" })).toBe("aaaaaa");
    expect(getParsedCharacterText({ text: "èéêë" })).toBe("eeee");
    expect(getParsedCharacterText({ text: "ìíîï" })).toBe("iiii");
    expect(getParsedCharacterText({ text: "òóôõö" })).toBe("ooooo");
    expect(getParsedCharacterText({ text: "ùúûü" })).toBe("uuuu");
    expect(getParsedCharacterText({ text: "ýÿ" })).toBe("yy");
  });

  it("folds the consonants and the ligatures", () => {
    expect(getParsedCharacterText({ text: "ç" })).toBe("c");
    expect(getParsedCharacterText({ text: "ñ" })).toBe("n");
    expect(getParsedCharacterText({ text: "æ" })).toBe("ae");
    expect(getParsedCharacterText({ text: "œ" })).toBe("oe");
  });

  it("folds an accent that was typed in capitals", () => {
    // The lowercasing happens first, which is the only reason the uppercase
    // forms are not in the replacement table.
    expect(getParsedCharacterText({ text: "JOSÉ" })).toBe("jose");
    expect(getParsedCharacterText({ text: "ÀÉÎÕÜ" })).toBe("aeiou");
    expect(getParsedCharacterText({ text: "Ångström" })).toBe("angstrom");
    expect(getParsedCharacterText({ text: "Curaçao" })).toBe("curacao");
  });

  it("folds the real names it exists for", () => {
    expect(getParsedCharacterText({ text: "José Ramírez" })).toBe("jose ramirez");
    expect(getParsedCharacterText({ text: "Müller" })).toBe("muller");
    expect(getParsedCharacterText({ text: "Peña" })).toBe("pena");
  });

  it("leaves everything else where it is", () => {
    // Spaces, hyphens, apostrophes and digits all survive: they are part of the
    // name or the phone number being searched, not noise.
    expect(getParsedCharacterText({ text: "O'Brien-Smith" })).toBe("o'brien-smith");
    expect(getParsedCharacterText({ text: "+679 555 0123" })).toBe("+679 555 0123");
  });

  it("gives an empty string for no text, so a caller can always call .includes on it", () => {
    expect(getParsedCharacterText({})).toBe("");
    expect(getParsedCharacterText({ text: "" })).toBe("");
    expect(getParsedCharacterText({ text: undefined })).toBe("");
  });

  it("does not shorten or lengthen a name it folds, apart from the two ligatures", () => {
    const name = "José Müller Peña Ångström";

    expect(getParsedCharacterText({ text: name }).length).toBe(name.length);
  });

  it("leaves the letters outside its table alone, which the query has to match as typed", () => {
    // Documented, not desired: ø and ß are not folded, so "Bjorn" does not find
    // "Bjørn". Adding them here is all it would take.
    expect(getParsedCharacterText({ text: "Bjørn" })).toBe("bjørn");
    expect(getParsedCharacterText({ text: "Straße" })).toBe("straße");
  });

  it("settles after one pass, so folding a folded name changes nothing", () => {
    const once = getParsedCharacterText({ text: "JOSÉ RAMÍREZ" });

    expect(getParsedCharacterText({ text: once })).toBe(once);
  });
});
