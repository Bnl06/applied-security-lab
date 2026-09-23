export const LAB_NODES = [
  { id: "attacker", label: "Attacker VM", role: "Kali · Evilginx2 · roadtx", zone: "rood" },
  { id: "proxy", label: "AiTM proxy", role: "lab-phish.local · TLS", zone: "rood" },
  { id: "victim", label: "Victim Win11", role: "Entra join · TPM 2.0 · WHFB", zone: "oranje" },
  { id: "phone", label: "Lab-telefoon", role: "Authenticator · YubiKey NFC", zone: "oranje" },
  { id: "entra", label: "Entra lab-tenant", role: "Conditional Access · CBA · FIDO", zone: "blauw" },
  { id: "m365", label: "M365 lab", role: "Exchange · SharePoint · Graph", zone: "blauw" },
  { id: "sp", label: "Lab SAML SP", role: "opzettelijk kwetsbare parser", zone: "blauw" },
];

export const LAB_EDGES = [
  ["attacker", "proxy"],
  ["victim", "proxy"],
  ["proxy", "entra"],
  ["victim", "entra"],
  ["phone", "entra"],
  ["entra", "m365"],
  ["entra", "sp"],
  ["attacker", "m365"],
];

export const LAB_USERS = [
  { upn: "alice@lab.perimeter.local", method: "SMS", role: "Standaard" },
  { upn: "bob@lab.perimeter.local", method: "Software TOTP", role: "Standaard" },
  { upn: "carol@lab.perimeter.local", method: "Hardware OATH", role: "Standaard" },
  { upn: "dave@lab.perimeter.local", method: "Authenticator push", role: "Helpdesk" },
  { upn: "eve@lab.perimeter.local", method: "Passwordless phone", role: "Standaard" },
  { upn: "frank@lab.perimeter.local", method: "WHFB PIN + TPM", role: "Finance" },
  { upn: "grace@lab.perimeter.local", method: "Passkey in Authenticator", role: "IT" },
  { upn: "henry@lab.perimeter.local", method: "YubiKey 5 FIDO2", role: "Privileged" },
  { upn: "ga@lab.perimeter.local", method: "CBA + FIDO break-glass", role: "Global Admin" },
];

export const LAB_POLICIES = [
  {
    name: "CA00 · Break-glass exempt",
    state: "On",
    grant: "Geen extra eisen",
    target: "ga@ + emergency groepen, named locations",
  },
  {
    name: "CA01 · MFA all users",
    state: "On (baseline)",
    grant: "Require MFA",
    target: "Alle users, alle cloud apps",
  },
  {
    name: "CA02 · Phishing-resistant privileged",
    state: "On",
    grant: "Authentication strength: Phishing-resistant MFA",
    target: "Directory roles, henry, ga",
  },
  {
    name: "CA03 · Token protection Windows",
    state: "Report-only → On",
    grant: "Session: require token protection",
    target: "Exchange, SharePoint, Teams · Windows · native clients",
  },
  {
    name: "CA04 · Block device-code flow",
    state: "On (na demo)",
    grant: "Block authentication flow = device code",
    target: "Alle users behalve kiosk-groep",
  },
  {
    name: "CA05 · Compliant device + WHFB",
    state: "On finance",
    grant: "Require compliant device + phishing-resistant",
    target: "frank + Finance app",
  },
];

export const LAB_STEPS = [
  {
    title: "Tenant en domein",
    body: "P1-trial tenant. Custom domain lab.perimeter.local (of de school-subdomain). Security defaults uit, CA aan. Diagnostic settings naar een lab-Log Analytics.",
  },
  {
    title: "Identity hygiene",
    body: "Users uit LAB_USERS. Authentication methods policy: SMS, OATH, Authenticator, FIDO2, CBA, TAP aan, per groep scoped. Registration campaign voor passkeys op IT.",
  },
  {
    title: "Windows 11 victim",
    body: "VM met vTPM, BitLocker, Entra join, Intune compliance, WHFB ‘require security device’. MDE onboarded zodat PRT-access alerts zichtbaar zijn.",
  },
  {
    title: "Attacker + Evilginx",
    body: "Kali, Evilginx2, lab-DNS, lab-CA in de trust store van de victim-browser (we meten UX zonder cert-warning; in het rapport vermelden we dat echte users wél een warning zouden zien bij een onvertrouwde CA).",
  },
  {
    title: "CBA lab-PKI",
    body: "Interne root + issuing CA. HTTP-CRL op een lab-nginx. Eén user met multifactor-cert op YubiKey PIV. Tweede scenario: rogue root (geïsoleerd, daarna verwijderd).",
  },
  {
    title: "SAML lab-SP",
    body: "Flask/Node SP met een opzettelijk kwetsbare parser (XSW) en een harde SP. Entra gallery-app met Entra-generated signing cert versus uploaded cert (Silver SAML).",
  },
];
