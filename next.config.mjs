// Conservative headers only. A Content-Security-Policy is left out on purpose:
// Clerk loads scripts and frames from its own domains, and a CSP that gets that
// list wrong breaks sign-in rather than failing safe.
const securityHeaders = [
  // Nothing here should ever render inside another site's frame: a patient
  // record behind an invisible iframe is a clickjacking target.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // URLs carry patient and project ids; send only the origin elsewhere.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];

const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
