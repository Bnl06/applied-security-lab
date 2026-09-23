export const DEFENSES = [
  {
    id: "token-protection",
    name: "Token Protection (token binding)",
    status: "GA native Windows / iOS / macOS; browser preview ARM",
    how: "Conditional Access session control eist een cryptografisch aan het device gebonden sign-in token (PRT). Bearer refresh tokens vanaf een ander apparaat worden geweigerd. Op Windows zit de client secret in de TPM.",
    test: "AiTM-cookie van alice importeren op de attacker-VM. Zonder TP: Outlook opent. Met TP op Exchange: 1002/1003 unbound — toegang geweigerd. Sign-in log: Token Protection - Sign In Session = Unbound.",
    blocks: ["Pass-the-cookie naar een tweede host", "Gestolen refresh token op VPS", "Veel infostealer-replay"],
    misses: [
      "Malware op het originele device (secret zit daar)",
      "Browser-flows die nog geen TP spreken",
      "Externe users, ongeregistreerde devices",
      "Resources buiten Exchange/SharePoint/Teams/AVD",
    ],
  },
  {
    id: "cae",
    name: "Continuous Access Evaluation",
    status: "GA voor M365-core",
    how: "Entra pusht events (user disabled, password change, high risk) naar resource providers. Access tokens sterven vóór exp.",
    test: "Revoke-MgUserSignInSession tijdens een open Graph-sessie. Met CAE: fail binnen seconden. Zonder: tot 60–90 min.",
    blocks: ["Ná-detectie tokengebruik in CAE-aware apps"],
    misses: ["Apps zonder CAE", "De initële AiTM-capture", "PRT op het device zelf"],
  },
  {
    id: "auth-strength",
    name: "Authentication strength",
    status: "GA",
    how: "CA grant: phishing-resistant MFA (WHFB, FIDO2, CBA, passkeys). SMS/TOTP/push voldoen niet.",
    test: "alice (SMS) naar SharePoint → geblokkeerd. henry (YubiKey) → toegestaan.",
    blocks: ["Elke phishable MFA als voldoening van ‘require MFA’"],
    misses: ["Device-code op het echte origin", "Consent phishing", "Golden SAML"],
  },
  {
    id: "device-code-block",
    name: "Block authentication flows",
    status: "CA condition",
    how: "Blokkeer device-code grant tenant-wide, met een kiosk-uitzondering.",
    test: "roadtx device auth als dave → blocked. TV-kiosk-groep → allowed.",
    blocks: ["Storm-2372-stijl initial access"],
    misses: ["AiTM op de authorization-code flow", "Al ingelogde PRT"],
  },
  {
    id: "consent",
    name: "Consent governance",
    status: "Admin consent workflow + verified publishers",
    how: "User consent uit. Apps van unverified publishers blokkeren. Periodieke review van Graph-grants.",
    test: "Malafide lab-app Mail.Read — user ziet geen Accept, admin-workflow alert.",
    blocks: ["Klassieke consent phishing"],
    misses: ["Compromised admin die zelf consent geeft", "Illicit consent via al goedgekeurde app-rol"],
  },
  {
    id: "mde-prt",
    name: "MDE · Attempted access of PRT",
    status: "Defender for Endpoint",
    how: "Detecteert LSASS/CloudAP-toegang tot PRT-artefacten. Combineer met token revoke SOAR.",
    test: "ROADtoken op de victim-VM → alert. Playbook: disable device + Revoke-MgUserSignInSession.",
    blocks: ["Onopgemerkte PRT-extractie (detectie, geen preventie)"],
    misses: ["WAM-broker abuse zonder LSASS-inject", "AiTM zonder endpoint-malware"],
  },
];

export const DEFENSE_MATRIX: {
  mfaId: string;
  rows: { attack: string; without: string; with: string }[];
}[] = [
  {
    mfaId: "sms",
    rows: [
      { attack: "AiTM cookie replay", without: "gelukt", with: "Token Protection blokkeert op 2e host; capture zelf slaagt" },
      { attack: "SIM-swap", without: "gelukt", with: "Auth strength verwijdert SMS; TP irrelevant" },
    ],
  },
  {
    mfaId: "totp-software",
    rows: [
      { attack: "AiTM", without: "gelukt", with: "TP blokkeert replay; strength verwijdert TOTP" },
      { attack: "Seed-clone", without: "gelukt", with: "Strength / passkey-migratie" },
    ],
  },
  {
    mfaId: "totp-hardware",
    rows: [
      { attack: "AiTM", without: "gelukt", with: "Zelfde als software-TOTP" },
      { attack: "CSV-leak seeds", without: "gelukt", with: "Niet door TP; vault + FIDO-migratie" },
    ],
  },
  {
    mfaId: "authenticator-push",
    rows: [
      { attack: "AiTM + number matching", without: "gelukt", with: "TP op 2e host; strength → passkey in dezelfde app" },
      { attack: "MFA fatigue", without: "gelukt zonder matching", with: "Matching (niet TP)" },
    ],
  },
  {
    mfaId: "passwordless",
    rows: [
      { attack: "TAP phishing", without: "gelukt", with: "Korte TTL + verified recovery; TP ná enroll" },
      { attack: "Device-code", without: "gelukt", with: "CA block flow" },
    ],
  },
  {
    mfaId: "whfb",
    rows: [
      { attack: "AiTM", without: "geblokkeerd", with: "al geblokkeerd; TP extra voor PRT" },
      { attack: "Broker abuse op device", without: "gelukt", with: "MDE detecteert; TP stopt exfil naar 2e host" },
    ],
  },
  {
    mfaId: "passkey-authenticator",
    rows: [
      { attack: "AiTM", without: "geblokkeerd", with: "al geblokkeerd" },
      { attack: "Device-code", without: "gelukt", with: "CA block flow" },
    ],
  },
  {
    mfaId: "passkey-dongle",
    rows: [
      { attack: "AiTM", without: "geblokkeerd", with: "al geblokkeerd" },
      { attack: "APDU-forward", without: "gelukt post-exploit", with: "MDE + TP op resource" },
    ],
  },
  {
    mfaId: "tenbeo",
    rows: [
      { attack: "Entra AiTM (sidecar)", without: "M365 gelukt", with: "TP op M365; Tenbeo raakt Graph niet" },
      { attack: "Cookie replay op sidecar-app", without: "faalt (1s TTL)", with: "Tenbeo zelf" },
    ],
  },
];
