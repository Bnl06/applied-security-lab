export type NavItem = {
  to: string;
  label: string;
  code: string;
  short: string;
};

export const NAV: NavItem[] = [
  { to: "/", label: "Briefing", code: "00", short: "Brief" },
  { to: "/protocollen", label: "Protocollen", code: "01", short: "Proto" },
  { to: "/tokens", label: "Tokendiefstal", code: "02", short: "Token" },
  { to: "/mfa", label: "MFA-methoden", code: "03", short: "MFA" },
  { to: "/onderzoek-whfb", label: "WHFB-onderzoek", code: "04", short: "WHFB" },
  { to: "/verdediging", label: "Verdediging", code: "05", short: "Def" },
  { to: "/quantum", label: "Quantum", code: "06", short: "Q" },
  { to: "/scorekaart", label: "Scorekaart", code: "07", short: "Score" },
  { to: "/lab", label: "Lab", code: "08", short: "Lab" },
  { to: "/presentatie", label: "Presentatie", code: "09", short: "Pres" },
];
