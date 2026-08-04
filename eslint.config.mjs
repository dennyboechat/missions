import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

/**
 * Flat config, which is the only format ESLint 9 reads.
 *
 * Nothing was being linted before this file existed: `next lint` was removed in
 * Next 16, and running eslint directly against the old .eslintrc.json failed
 * inside eslintrc's own validator. So the rules below are not a relaxation of
 * something that used to pass -- they are the first pass over code no linter had
 * seen.
 *
 * eslint-config-next/core-web-vitals brings the Next, TypeScript and React
 * plugins along with the accessibility and Core Web Vitals rules.
 */
const config = [
  ...nextCoreWebVitals,
  {
    ignores: [".next/**", "next-env.d.ts", "node_modules/**", "public/**"],
  },
  {
    rules: {
      /**
       * Warnings, not errors, and deliberately so for now.
       *
       * Both rules are new in eslint-plugin-react-hooks 6 and both fire on the
       * same pattern throughout this app: state that has to start at a value the
       * server can also produce, and then adopt what only the browser knows.
       * useOrigin cannot read window during render without breaking hydration;
       * UnitPreferenceContext cannot read localStorage there either; useLiveValue
       * seeds a field from the server and then lets the edit win. Each is
       * commented where it happens, and each is covered by tests.
       *
       * useMenuNavigation's ref write is the same kind of case: it happens during
       * render on purpose, because a URL that changed in a render React then
       * declines to commit would be missed by an effect, and the burst timer
       * would navigate to a page the user is already on.
       *
       * Left visible rather than disabled, because some of the thirteen may well
       * be worth rewriting -- that is a piece of work with its own tests, not a
       * drive-by on a lint migration.
       */
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
    },
  },
];

export default config;
