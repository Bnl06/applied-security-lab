export type TokenKind = {
  id: string;
  name: string;
  ttl: string;
  where: string;
  value: string;
  steal: string[];
  replay: string;
  mfaInherited: boolean;
};

export const TOKEN_KINDS: TokenKind[] = [
  {
    id: "prt",
    name: "Primary Refresh Token",
    ttl: "90 dagen, rolling",
    where: "CloudAP / LSASS op Entra-joined of registered Windows; TPM-protected session key indien TPM aanwezig",
    value: "SSO-sleutel voor alle Entra-apps. Eén PRT ≈ TGT van de cloud.",
    steal: [
      "ROADtoken / AADInternals: PRT + session key uit LSASS of via broker-API (geen extractie van TPM-key nodig als je in de user-sessie zit).",
      "Mimikatz sekurlsa::cloudap — PRT + context/key. Op TPM-devices is de session key niet exporteerbaar; abuse via token broker blijft mogelijk.",
      "Device-code + Microsoft Authentication Broker client-id → device registreren → eigen PRT (Storm-2372).",
      "AzTokenFinder / SpecterBroker / OAuthBandit: tokens van disk van dev-machines.",
    ],
    replay:
      "Met PRT + session key vraag je een nonce, teken je een PRT-cookie, en wissel je die in voor access tokens van Graph, AAD Graph, Exchange, … MFA-claim reist mee. Token Protection weigert unbound PRT’s.",
    mfaInherited: true,
  },
  {
    id: "refresh",
    name: "Refresh token",
    ttl: "uren tot 90 dagen (CA / SSPR / sign-in frequency)",
    where: "App cache, browser (MSAL), device keychain; vaak langer en breder gescoped dan access tokens",
    value: "Nieuwe access tokens zonder user interactie. Familie-refresh-tokens (FRT) delen revoked-state.",
    steal: [
      "AiTM (Evilginx2, EvilProxy, Tycoon, BigBear): ESTSAUTH / ESTSAUTHPERSISTENT cookies na voltooide MFA.",
      "Device-code phishing: refresh token in de token-response.",
      "Malware in de user-context leest MSAL token cache (~/.azure, Windows Token Broker).",
      "Consent phishing: refresh token voor de malafide app, met de gevraagde Graph-scopes.",
    ],
    replay:
      "POST naar /token met grant_type=refresh_token. Wachtwoordreset herroept niet altijd alle RT’s. CAE en Token Protection zijn de echte kill-switch.",
    mfaInherited: true,
  },
  {
    id: "access",
    name: "Access token",
    ttl: "60–90 minuten (Entra default)",
    where: "Authorization: Bearer header; memory, HAR-files, logs, frontend storage bij slordige SPA’s",
    value: "Directe API-toegang tot één audience. Kort maar onmiddellijk bruikbaar.",
    steal: [
      "Proxy, browser extension, Fiddler/Burp op het endpoint.",
      "Debug-logs, Application Insights, crash dumps.",
      "XSS in een SPA die tokens in localStorage zet.",
    ],
    replay:
      "Bearer: plakken in een andere client is genoeg tot exp. DPoP/mTLS/Token Protection binden het token aan een key. CAE kan het token server-side intrekken bij risk/password change.",
    mfaInherited: true,
  },
  {
    id: "session",
    name: "Sessiecookie (ESTSAUTH*)",
    ttl: "sessie tot persistente 90 dagen",
    where: "login.microsoftonline.com cookies in de browser van het slachtoffer, of in de AiTM-proxy",
    value: "De concrete MFA-bypass: de cookie ís de voltooide authenticatie.",
    steal: [
      "Evilginx2 phishlets voor Microsoft 365 vangen Set-Cookie.",
      "EvilProxy / Tycoon 2FA / Mamba / BigBear 2.0 als PhaaS.",
      "Browser-malware / infostealers (RedLine, Lumma, Rhadamanthys) exporteren cookies.",
    ],
    replay:
      "Importeer cookies in een gecontroleerde browser of in roadtx prt / token flows. Pass-the-cookie. Token Protection + device-bound sessions blokkeren replay vanaf een ander apparaat.",
    mfaInherited: true,
  },
];

export const TOKEN_CHAIN = [
  { from: "Credentials + MFA", to: "Sessiecookie", via: "AiTM reverse proxy" },
  { from: "Sessiecookie", to: "Refresh / access token", via: "OIDC redeem" },
  { from: "Refresh token (broker)", to: "Device registratie", via: "Auth broker client" },
  { from: "Device registratie", to: "PRT", via: "CloudAP" },
  { from: "PRT + session key", to: "Elke Entra-app", via: "SSO / WAM" },
];

export const TOKEN_TOOLING = [
  {
    name: "Evilginx2 / Evilginx 3",
    use: "AiTM reverse proxy, phishlets, cookie capture",
    lab: "Kali of Ubuntu VM achter een lab-domein met geldige TLS. Phishlet microsoft. Alleen tegen de eigen tenant.",
  },
  {
    name: "roadtx / ROADtools (Dirk-jan Mollema)",
    use: "PRT-aanvraag, token redeem, device code, Graph interactie",
    lab: "pip install roadtools. roadtx device auth / prt / token.",
  },
  {
    name: "AADInternals",
    use: "Export-AADIntLocalDeviceCertificate, Get-AADIntUserPRTKeys, New-AADIntUserPRTToken",
    lab: "PowerShell op het Entra-joined lab-endpoint. Admin vs user context wisselen.",
  },
  {
    name: "ROADtoken / Mimikatz cloudap",
    use: "PRT + key uit LSASS",
    lab: "Alleen op de lab-VM. MDE in de lab-tenant moet de detectie (Attempted access of PRT) laten zien.",
  },
  {
    name: "TokenTactics / GraphRunner",
    use: "Refresh-to-access, FOCI client family abuse, mailbox dumping",
    lab: "Na token-capture: bewijs dat de sessie werkt (Graph /me, mail.read).",
  },
];
