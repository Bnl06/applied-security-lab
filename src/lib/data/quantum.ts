export const PQC_TIMELINE = [
  { year: "2024", event: "NIST FIPS 203/204/205: ML-KEM, ML-DSA, SLH-DSA." },
  { year: "2025-04", event: "IANA COSE algs -48/-49/-50 (ML-DSA-44/65/87) — FIDO kan PQC-signatures dragen." },
  { year: "2025-10", event: "Yubico prototype PQ-signatures op een security key. arXiv: The Qey (ML-DSA in FIDO2)." },
  { year: "2026", event: "Entra tokens nog RS256/ES256. Hello/Authenticator-passkeys ES256/RSA. Productie-PQC-FIDO: early (Swissbit/Intercede)." },
  { year: "2029", event: "Cloudflare-doel: fully post-quantum (encryptie nú al ML-KEM; signatures later). Enterprise IdP’s volgen trager." },
];

export const QUANTUM_ROWS = [
  {
    method: "SMS",
    credential: "6-cijfer code over GSM",
    algo: "geen PKI (kanaal SS7)",
    qday: "Credential zelf overleeft Q-day. Sessietoken niet.",
    score: "hybride",
  },
  {
    method: "TOTP software/hardware",
    credential: "HMAC-SHA1/256 shared secret",
    algo: "symmetrisch",
    qday: "Grover halveert bits; 30s-codes blijven onpraktisch. Tokenlaag klassiek.",
    score: "hybride",
  },
  {
    method: "Authenticator push",
    credential: "Entra device registratie + sessie",
    algo: "RS256/ES256 JWT",
    qday: "Shor op tenant signing keys → tokens smeden.",
    score: "kwetsbaar",
  },
  {
    method: "Passwordless TAP/phone",
    credential: "kort geheim / device nonce",
    algo: "klassieke Entra tokens",
    qday: "Zelfde JWT-breuk.",
    score: "kwetsbaar",
  },
  {
    method: "WHFB",
    credential: "TPM RSA/ECDSA key",
    algo: "RSA-2048 / ES256",
    qday: "Public key in Entra → private afleiden → assertions smeden zonder laptop. Minpunt.",
    score: "kwetsbaar",
  },
  {
    method: "Passkey Authenticator",
    credential: "TEE ES256",
    algo: "ES256",
    qday: "Zelfde als WHFB. Geen ML-DSA in de app.",
    score: "kwetsbaar",
  },
  {
    method: "Passkey dongle",
    credential: "secure element ES256",
    algo: "ES256 (prototype ML-DSA)",
    qday: "Productie-keys forgebaar. Field-update zeldzaam (YubiKey 5: geen firmware-PQC).",
    score: "kwetsbaar",
  },
  {
    method: "Tenbeo",
    credential: "ECG-model + per-second token",
    algo: "vermoedelijk ECC JWT",
    qday: "Biometrie overleeft; tokenhandtekening niet. Geen open PQC-roadmap.",
    score: "kwetsbaar",
  },
  {
    method: "CBA / SAML / OIDC",
    credential: "X.509 / XML-DSig / JOSE",
    algo: "RSA/ECDSA",
    qday: "Harvest-now-forge-later op assertions en cert-chains.",
    score: "kwetsbaar",
  },
];

export const QUANTUM_ADVICE = [
  "Inventariseer welke credentials Q-day overleven (HMAC, AES, SHA-2/3) versus welke sneuvelen (RSA, ECDSA, ECDH).",
  "Korte token-TTL + CAE verkleint het harvest-window, lost forgery ná Q-day niet op.",
  "Eis crypto-agility in aankoop: FIDO-keys met PQC-update of ML-DSA, PKI die ML-DSA-certificaten aankan.",
  "Begin hybride (klassiek + ML-DSA) zodra Entra het tekent — niet wachten op ‘pure PQC’.",
  "Passkeys blijven de juiste richting: het protocol kan algoritmes wisselen; TOTP kan dat origin-bind niet bijbenen.",
];
