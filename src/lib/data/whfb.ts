export const PIN_DISALLOWED = [
  "1111",
  "1234",
  "1357",
  "9630",
  "1593",
  "7036",
  "0000",
  "2580",
];

export const WHFB_CLAIMS = [
  {
    title: "Een PIN is device-bound",
    body: "Een 12-teken wachtwoord authenticert de persoon vanaf elke browser ter wereld. Een WHFB-PIN authenticert de persoon-op-dit-TPM. Gestolen PIN zonder laptop = niets. Gestolen wachtwoord zonder laptop = Global Admin in een internetcafé.",
  },
  {
    title: "Een PIN is lokaal",
    body: "Het wachtwoord reist naar Entra (of naar Evilginx). De PIN is entropy om de TPM-sealed private key te unsealen. Entra heeft geen kopie. Windows heeft geen kopie. Alleen de user + dit TPM.",
  },
  {
    title: "Een PIN is hardware-backed",
    body: "TPM 2.0 anti-hammering: na enkele misses een challenge-zin (A1B2C3), daarna lockout 1 → 2 → 10 minuten, oplopend. Online password spray tegen Entra heeft geen vergelijkbare hardware-brake, alleen smart lockout op cloudbasis — omzeilbaar met IP-rotatie.",
  },
  {
    title: "Entropy is het verkeerde frame",
    body: "Microsoft: «A PIN is stronger than a password is not directed at the strength of the entropy.» 4 cijfers ≈ 13.3 bits minus 100 verboden patronen. 12-teken mixed ≈ 70+ bits. Toch wint de PIN, omdat het wachtwoord een symmetrisch, exporteerbaar, phishable geheim is.",
  },
];

export const WHFB_TESTS = [
  {
    id: "phish",
    name: "AiTM phishing",
    password: { result: "fail", detail: "12-teken wachtwoord + MFA-code/push getypt op de lure. Cookie gestolen." },
    pin: { result: "pass", detail: "WHFB-ceremonie weigert origin lab-phish.local. Geen cookie." },
  },
  {
    id: "spray",
    name: "Remote brute force / spray",
    password: { result: "fail", detail: "Spray vanaf VPS’en. Smart lockout vertraagt, stopt gerichte aanvallen niet altijd." },
    pin: { result: "pass", detail: "PIN bestaat niet op het netwerk. Niets om te sprayen." },
  },
  {
    id: "tpm",
    name: "Lokale PIN-gok op gestolen laptop",
    password: { result: "n/a", detail: "Wachtwoord is niet het lokale unseal; BitLocker is een aparte laag." },
    pin: { result: "pass", detail: "Anti-hammering. In het lab: 8 misses → lockout. 9900 overgebleven PIN’s onhaalbaar." },
  },
  {
    id: "dump",
    name: "IdP / tenant dump",
    password: { result: "fail", detail: "Password hashes of plaintext via sync/legacy. Offline crackbaar." },
    pin: { result: "pass", detail: "Geen PIN in Entra. Alleen de public key. Zonder Q-computer niet te inverteren." },
  },
  {
    id: "reuse",
    name: "Credential stuffing",
    password: { result: "fail", detail: "12 tekens hergebruikt van LinkedIn-dump. Login slaagt." },
    pin: { result: "pass", detail: "PIN is per device, niet hergebruikt, niet in dumps." },
  },
  {
    id: "malware",
    name: "Post-login endpoint malware",
    password: { result: "fail", detail: "LSASS / browser cookies / MSAL cache." },
    pin: { result: "fail", detail: "WAM/CloudAP deelt tokens uit zonder de PIN opnieuw. Token Protection mitigeert replay op een tweede host, niet lokaal misbruik." },
  },
];

export function pinSpace(length: number, alphanumeric: boolean) {
  const alphabet = alphanumeric ? 36 : 10;
  const raw = alphabet ** length;
  const disallowed = alphanumeric ? 0 : 100;
  return { raw, disallowed, effective: Math.max(0, raw - disallowed) };
}

export function passwordBits(length: number, classes: number) {
  const alph = [0, 10, 36, 62, 94][Math.min(4, Math.max(1, classes))] ?? 94;
  return length * Math.log2(alph);
}
