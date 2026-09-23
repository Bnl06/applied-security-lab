export type Slide = {
  kicker: string;
  title: string;
  points: string[];
  note?: string;
};

export const SLIDES: Slide[] = [
  {
    kicker: "3ITCSC · Applied Security",
    title: "PERIMETER — MFA die niet houdt",
    points: [
      "Identity is the new perimeter. Lapsus$, Midnight Blizzard, Scattered Spider vielen daar aan.",
      "Opdracht: protocollen, tokendiefstal, negen MFA-methoden, WHFB-onderzoeksvraag, quantum, scorekaart.",
      "Lab-tenant, geen productie. Elke demo is reproduceerbaar of als theoretisch gemarkeerd.",
    ],
  },
  {
    kicker: "Threat landscape",
    title: "Aanvallers skippen het wachtwoord niet — ze skippen de factor",
    points: [
      "AiTM-PhaaS (Tycoon, EvilProxy, BigBear): 5000+ M365-cookies in één panel.",
      "Storm-2372 device-code → Authentication Broker → PRT.",
      "CVE-2025-55241 Actor Tokens; token theft is initial access, geen post-exploit meer.",
    ],
  },
  {
    kicker: "01 · Protocollen",
    title: "CBA, SAML, OAuth, OIDC",
    points: [
      "CBA is phishing-resistant tot iemand een rogue CA uploadt.",
      "SAML: Golden (AD FS-key) en Silver (Entra app-cert) smeden assertions ná MFA.",
      "OAuth/OIDC: consent + device-code lopen over het echte origin — passkeys helpen daar niet.",
    ],
  },
  {
    kicker: "02 · Tokens",
    title: "PRT is de TGT van de cloud",
    points: [
      "Steal: AiTM-cookie, device-code, LSASS/ROADtoken, WAM-broker.",
      "MFA-claim reist mee. CA ‘require MFA’ is daarna stil.",
      "Kill-switch: Token Protection + CAE + revoke + device disable.",
    ],
  },
  {
    kicker: "03.A–E · Phishable MFA",
    title: "SMS, TOTP, push, passwordless",
    points: [
      "Evilginx relayer SMS, software-OTP, hardware-OTP en number matching.",
      "Number matching stopt fatigue, niet de proxy.",
      "Passwordless zonder passkey = AiTM met minder typewerk. TAP is recovery-breekijzer.",
    ],
    note: "Demo: alice/bob/carol/dave tegen dezelfde lure.",
  },
  {
    kicker: "03.F · WHFB",
    title: "Is een 4-cijfer-PIN veiliger dan 12 tekens?",
    points: [
      "Ja, in Entra ID, als TPM-backed WHFB. Niet omdat 4 > 12 in entropy.",
      "PIN is lokaal, device-bound, anti-hammering. Wachtwoord is een remote symmetrisch geheim.",
      "Lab: AiTM faalt, spray faalt, lokale gok lockt de TPM. Malware ná login blijft.",
    ],
  },
  {
    kicker: "03.G–H · Passkeys",
    title: "Origin binding houdt. Relay is een andere klasse.",
    points: [
      "Authenticator-passkey: AiTM dood. Hybrid BLE is proximity, geen PhaaS.",
      "YubiKey USB/NFC + PIN: hoogste phishing-score. APDU-forward = endpoint-compromis.",
      "Domain binding = rpId + origin, door browser én authenticator.",
    ],
  },
  {
    kicker: "03.I · Tenbeo",
    title: "Continuous heartbeat, geen Entra-native factor",
    points: [
      "Per-second tokens tackelen precies cookie-replay.",
      "Als sidecar ná Entra: AiTM heeft M365 al. Als first-class: andere discussie.",
      "ECG-spoofing onbewezen in ons lab; privacy/GDPR is operationeel een issue.",
    ],
  },
  {
    kicker: "05 · Verdediging",
    title: "Token Protection is de ontbrekende bind",
    points: [
      "CA session control: alleen device-bound PRT’s. Gestolen cookie sterft op de laptop van de aanvaller.",
      "Beperkingen: native Windows/iOS/macOS, Exchange/SharePoint/Teams, geen externe users.",
      "Daarnaast: phishing-resistant strength, block device-code, consent governance, MDE PRT-alerts.",
    ],
  },
  {
    kicker: "06 · Quantum",
    title: "Passkeys van vandaag zijn de RSA van morgen",
    points: [
      "Shor breekt RSA/ECDSA — dus WHFB, FIDO, CBA, SAML, OIDC-JWT.",
      "HMAC-TOTP overleeft beter (Grover), maar mist origin binding.",
      "Minpunt op elke passkey-score tot ML-DSA in Entra zit. Koop crypto-agility, niet nostalgie.",
    ],
  },
  {
    kicker: "07 · Scorekaart",
    title: "Eén getal, vijf assen",
    points: [
      "Phishing 30 · Token 25 · Binding 20 · Quantum 15 · Operationeel 10.",
      "Hardware FIDO 7.8 · WHFB 7.4 · Authenticator-passkey 6.7 · Tenbeo 6.0 · SMS 1.8.",
      "SAML en OAuth trekken élke factor omlaag: de protocol-laag zit boven de MFA-laag.",
    ],
  },
  {
    kicker: "Advies",
    title: "Wat we een CISO morgen laten doen",
    points: [
      "Zet authentication strength op phishing-resistant voor privileged én finance.",
      "Zet Token Protection aan (report-only → enforce) en blokkeer device-code.",
      "Verwijder SMS/legacy MFA. TAP in minuten. Tweede FIDO-key voor admin.",
      "Plan PQC: inventory, hybride FIDO, korte TTL tot Entra ML-DSA tekent.",
    ],
  },
];
