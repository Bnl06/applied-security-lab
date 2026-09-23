import { MFA_METHODS } from "./mfa";
import { PROTOCOLS } from "./protocols";
import type { QuantumStatus, ScoreCell } from "./types";

const Q: Record<string, QuantumStatus> = {
  sms: "hybride",
  "totp-software": "hybride",
  "totp-hardware": "hybride",
  "authenticator-push": "kwetsbaar",
  passwordless: "kwetsbaar",
  whfb: "kwetsbaar",
  "passkey-authenticator": "kwetsbaar",
  "passkey-dongle": "kwetsbaar",
  tenbeo: "kwetsbaar",
};

/** Protocol modifiers on the MFA base score. Negative = worse. */
const MOD: Record<string, number> = {
  cba: 0.4, // phishing-resistant protocol when the cert is the factor
  saml: -0.6, // Golden/Silver SAML sits above MFA
  oauth: -0.5, // consent + device-code bypass the factor
  oidc: -0.3, // amr inherited via PRT
};

function clamp(n: number) {
  return Math.max(0.5, Math.min(10, Math.round(n * 10) / 10));
}

function cell(
  protocolId: string,
  mfaId: string,
  finding: string,
  blocked: boolean | "deels",
  ref: string,
): ScoreCell {
  const mfa = MFA_METHODS.find((m) => m.id === mfaId)!;
  const score = clamp(mfa.score.totaal + (MOD[protocolId] ?? 0));
  return {
    protocolId,
    mfaId,
    finding,
    blocked,
    quantum: Q[mfaId],
    score,
    ref,
  };
}

export const SCORE_CELLS: ScoreCell[] = [
  cell("cba", "sms", "CBA+SMS is zelden een stack; SMS als fallback sloopt phishing-resistance.", false, "03.A"),
  cell("cba", "totp-software", "TOTP naast CBA wordt de phishable enroll/fallback.", false, "03.B"),
  cell("cba", "totp-hardware", "OATH-fallback naast certificaat: AiTM op de fallback.", false, "03.C"),
  cell("cba", "authenticator-push", "Push als step-up naast single-factor cert: relaybaar.", false, "03.D"),
  cell("cba", "passwordless", "TAP om het certificaat te enrollen is het breekijzer.", false, "03.E"),
  cell("cba", "whfb", "Twee phishing-resistant factoren. Sterkste praktische combo tot Q-day.", true, "03.F"),
  cell("cba", "passkey-authenticator", "CBA op desktop + passkey op phone. Origin binding beiderzijds.", true, "03.G"),
  cell("cba", "passkey-dongle", "Smartcard-CBA of FIDO-dongle. PKI-integriteit is de rest-risk.", true, "03.H"),
  cell("cba", "tenbeo", "CBA login + heartbeat overlay. Replay op M365 blijft tot Tenbeo first-class is.", "deels", "03.I"),

  cell("saml", "sms", "Golden SAML negeert SMS. AiTM negeert SMS. Dubbel faal.", false, "01.B"),
  cell("saml", "totp-software", "Assertion wordt ná MFA getekend; gestolen signing key omzeilt TOTP.", false, "01.B"),
  cell("saml", "totp-hardware", "Zelfde: MFA zit vóór de assertion, niet in de signature.", false, "01.B"),
  cell("saml", "authenticator-push", "Push beschermt de IdP-login, niet een gestolen AD FS-key.", false, "01.B"),
  cell("saml", "passwordless", "Passwordless IdP + Golden SAML = nog steeds forged assertions.", false, "01.B"),
  cell("saml", "whfb", "WHFB beschermt de IdP-ceremonie. Silver/Golden SAML ernaast blijft fataal.", "deels", "01.B"),
  cell("saml", "passkey-authenticator", "Passkey op Entra, SAML naar SaaS: signing-key diefstal omzeilt de passkey.", "deels", "01.B"),
  cell("saml", "passkey-dongle", "Zelfde kloof: FIDO op IdP ≠ integriteit van de assertion naar de SP.", "deels", "01.B"),
  cell("saml", "tenbeo", "Heartbeat op de SP vangt replay; Golden SAML is een verse assertion.", "deels", "03.I"),

  cell("oauth", "sms", "Consent- en device-code-phishing: user doet SMS op het echte domein.", false, "01.C"),
  cell("oauth", "totp-software", "Device-code: TOTP op microsoft.com voor het device van de aanvaller.", false, "01.C"),
  cell("oauth", "totp-hardware", "Hardware-code, zelfde device-code-ceremonie.", false, "01.C"),
  cell("oauth", "authenticator-push", "Storm-2372: push op de echte pagina, PRT voor de aanvaller.", false, "01.C"),
  cell("oauth", "passwordless", "TAP + malafide app consent. Passwordless lost OAuth-governance niet op.", false, "01.C"),
  cell("oauth", "whfb", "WHFB stopt AiTM. Device-code en consent phishing lopen via het echte origin.", "deels", "01.C"),
  cell("oauth", "passkey-authenticator", "Zelfde: origin-bound factor, origin-true OAuth-misbruik.", "deels", "01.G"),
  cell("oauth", "passkey-dongle", "FIDO op de echte AS + malafide client_id. Governance, geen crypto-fail.", "deels", "01.C"),
  cell("oauth", "tenbeo", "OAuth-consent gebeurt vóór heartbeat. Sidecar te laat.", false, "03.I"),

  cell("oidc", "sms", "Nonce-loze RP + SMS-AiTM. amr=sms in het ID token, mailbox leeg.", false, "01.D"),
  cell("oidc", "totp-software", "OTP in amr, bearer ID token replaybaar zonder nonce.", false, "01.D"),
  cell("oidc", "totp-hardware", "Zelfde OIDC-hygiëneprobleem, andere token-vorm.", false, "01.D"),
  cell("oidc", "authenticator-push", "PRT erft amr=mfa. Steal PRT, elke OIDC-app is overtuigd.", false, "01.D"),
  cell("oidc", "passwordless", "Passwordless amr, unbound tokens.", false, "01.E"),
  cell("oidc", "whfb", "WHFB + nonce + PKCE + Token Protection: de bedoelde stack.", true, "03.F"),
  cell("oidc", "passkey-authenticator", "Passkey + strikte ID-token-validatie. Device-code blijft rest-risk.", "deels", "03.G"),
  cell("oidc", "passkey-dongle", "FIDO + OIDC best practice. Hoogste OIDC-score tot PQC-JWT.", true, "03.H"),
  cell("oidc", "tenbeo", "Geen OIDC-amr voor ECG. Custom claim, vendor-specifiek.", "deels", "03.I"),
];

export function cellsFor(protocolId?: string, mfaId?: string) {
  return SCORE_CELLS.filter(
    (c) => (!protocolId || c.protocolId === protocolId) && (!mfaId || c.mfaId === mfaId),
  );
}

export { PROTOCOLS, MFA_METHODS };
