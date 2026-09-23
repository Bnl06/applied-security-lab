import type { Protocol } from "./types";

export const PROTOCOLS: Protocol[] = [
  {
    id: "cba",
    code: "01.A",
    name: "Certificate-based auth",
    fullName: "Microsoft Entra Certificate-Based Authentication",
    summary:
      "CBA koppelt een X.509-clientcertificaat aan een Entra-gebruiker. Microsoft classificeert multifactor-CBA als phishing-resistant, op voorwaarde dat de PKI zelf integer is. De zwakte zit zelden in het protocol — die zit in de CA-trust.",
    how: [
      "De browser of native client presenteert een clientcertificaat tijdens de TLS-handshake of via een HTTP-challenge.",
      "Entra ID valideert de keten tot een in de tenant vertrouwde CA, checkt optioneel de CRL, en bindt het certificaat aan de user via UPN, IssuerAndSerialNumber of certificateUserIds.",
      "Een policy kan het certificaat als single-factor of multifactor markeren. Multifactor-CBA telt als phishing-resistant MFA in Conditional Access.",
      "Er is geen gedeeld geheim: authenticatie is een challenge-response met de private key op smartcard, TPM of software store.",
    ],
    weaknesses: [
      {
        title: "Rogue root CA in de tenant",
        body: "Wie Authentication Policy Administrator is (of PIM daarvoor kan activeren) kan een eigen root-CA uploaden. Vanaf dat moment tekent de aanvaller clientcertificaten voor elke gebruiker — inclusief Global Admin — en voldoet die login aan phishing-resistant MFA. Semperis/EntraGoat scenario 6 demonstreert deze keten.",
      },
      {
        title: "CRL die ontbreekt of onbereikbaar is",
        body: "Zonder geconfigureerde HTTP-CRL voert Entra ID géén revocation check uit. Ingetrokken certificaten blijven geldig. LDAP- of OCSP-CDP's worden niet ondersteund.",
      },
      {
        title: "On-premises attribute poisoning",
        body: "Als username binding via synchroniseerde attributen loopt (certificateUserIds, onPremisesUserPrincipalName), kan een on-prem AD-admin die waarden wijzigen en zo een certificaat aan een ander cloudaccount koppelen.",
      },
      {
        title: "Software-stored keys",
        body: "Zonder smartcard of TPM is de private key exporteerbaar. Een malware-compromis van de store is equivalent aan het stelen van het certificaat.",
      },
    ],
    poc: [
      {
        title: "Rogue CA → Global Admin impersonatie (lab)",
        body: "In de lab-tenant: PIM activeren tot Authentication Policy Administrator, CBA inschakelen, een lab-root-CA uploaden, een clientcertificaat uitgeven op naam van de Global Admin, authentication binding op multifactor zetten, inloggen via CBA. Geen wachtwoord, geen push, geen SMS.",
        commands: `# Lab-only — eigen tenant
# 1. Root CA (lab)
openssl req -x509 -newkey rsa:4096 -days 365 -nodes \\
  -keyout lab-root.key -out lab-root.crt -subj "/CN=PERIMETER Lab Root"
# 2. Client cert voor ga@lab.perimeter.local
openssl req -new -newkey rsa:2048 -nodes -keyout ga.key \\
  -out ga.csr -subj "/CN=ga@lab.perimeter.local"
openssl x509 -req -in ga.csr -CA lab-root.crt -CAkey lab-root.key \\
  -CAcreateserial -out ga.crt -days 90
# 3. Upload lab-root.crt in Entra > Certificate authorities
# 4. Sign-in met ga.pfx via CBA`,
      },
    ],
    quantum: "kwetsbaar",
    quantumNote:
      "Productie-CBA gebruikt vrijwel altijd RSA-2048 of ECDSA P-256. Shor's algoritme breekt beide. PQC-certificaten (ML-DSA in X.509) zijn in 2026 experimenteel en niet native in Entra CBA. Q-day maakt elke vandaag uitgegeven keten forgebaar.",
    mitigations: [
      "CA-upload beperken tot break-glass accounts; PIM + approval + alert op Update-MgPolicyCertificateBasedAuthConfiguration.",
      "HTTP-CRL verplicht; monitoren dat CDP's bereikbaar blijven.",
      "Hardware-backed keys (PIV/smartcard of TPM) afdwingen.",
      "CBA combineren met compliant device in Conditional Access.",
      "On-prem write-paden naar certificateUserIds auditen.",
    ],
  },
  {
    id: "saml",
    code: "01.B",
    name: "SAML 2.0",
    fullName: "Security Assertion Markup Language 2.0",
    summary:
      "SAML delegeert authenticatie via XML-assertions die de IdP tekent. De history van Golden SAML, Silver SAML en XML Signature Wrapping toont dat de integriteit van die handtekening én van de parser het hele kasteel is.",
    how: [
      "De Service Provider (SP) stuurt de gebruiker naar de IdP met een AuthnRequest.",
      "Na authenticatie (en MFA) stuurt de IdP een ondertekende SAML Response/Assertion terug.",
      "De SP verifieert de XML-handtekening tegen het IdP-certificaat en leest NameID + claims.",
      "Entra ID kan zowel IdP zijn (apps via gallery/federation) als RP achter AD FS.",
    ],
    weaknesses: [
      {
        title: "Golden SAML",
        body: "Diefstal van de token-signing private key op AD FS (ADFS/NTDS of het DKM-containercertificaat) laat de aanvaller assertions smeden voor élke gebruiker, met willekeurige claims, zonder MFA. Midnight Blizzard (SolarWinds) gebruikte dit op schaal. Persistente toegang overleeft wachtwoordreset.",
      },
      {
        title: "Silver SAML (Entra als IdP)",
        body: "Semperis (2024): als de SAML-signing key van een Entra-enterprise-app een extern gegenereerd certificaat is waarvan de private key uitlekt, smeedt de aanvaller Entra-achtige responses naar Salesforce, ServiceNow, etc. — zonder de Entra-tenant zelf te raken.",
      },
      {
        title: "XML Signature Wrapping (XSW)",
        body: "Acht+ varianten. De SP valideert een getekend element maar leest claims uit een ander, ongetekend element. Recente treffers: CVE-2025-47949 (Samlify), CVE-2024-45409 (ruby-saml parser differential), PortSwigger 'Void Canonicalization' (2025).",
      },
      {
        title: "Federated domain backdoor",
        body: "Storm-0501: Global Admin registreert een aanvaller-tenant als federated domain. Via ImmutableId kan de aanvaller daarna inloggen als vrijwel elke user. Dit is SAML-federation als persistence, niet als initial access.",
      },
    ],
    poc: [
      {
        title: "Silver SAML forger (lab SP)",
        body: "We koppelen een lab-SP aan Entra met een zelf gegenereerd signing-certificaat. Met SilverSAMLForger (Semperis) tekenen we een Response als willekeurige user. De SP accepteert die zolang het certificaat matcht — Entra zelf ziet de login niet.",
        commands: `# Lab-only
# Signing cert van de enterprise app exporteren (of zelf uploaden)
# SilverSAMLForger: assertion met NameID=ga@lab, signed with stolen key
python silversaml.py --cert lab-saml.pfx --nameid ga@lab.perimeter.local \\
  --audience https://sp.lab.perimeter.local --acs https://sp.lab.perimeter.local/acs`,
      },
      {
        title: "XSW tegen een kwetsbare SP",
        body: "Een SP die xmlsec + libxml2 in de verkeerde volgorde gebruikt, valideert de signature van een dummy-Assertion en parseert daarna een tweede, ongetekende Assertion met admin-rechten. We reproduceren dit tegen een opzettelijk kwetsbare lab-SP, niet tegen Entra zelf (Entra als SP is niet het zwakke punt).",
      },
    ],
    quantum: "kwetsbaar",
    quantumNote:
      "SAML-signatures zijn RSA-SHA256 of ECDSA. Q-day laat Golden/Silver SAML-keys offline kraken: harvest-now-forge-later. XML-DSig PQC-profielen bestaan nauwelijks in enterprise IdP's.",
    mitigations: [
      "AD FS token-signing keys in HSM; rollover + alerting op certificaatexport.",
      "Geen externe private keys voor Entra enterprise-app SAML signing — laat Entra het certificaat genereren.",
      "SAML-libraries up-to-date houden; XSW-regressietests op de SP.",
      "Federation-settings (StsRefreshTokensValidFrom, domains) monitoren; alert op Add-MgDomain met federation.",
      "Migratiepad: SAML → OIDC waar mogelijk, plus phishing-resistant MFA vóór de assertion.",
    ],
  },
  {
    id: "oauth",
    code: "01.C",
    name: "OAuth 2.0",
    fullName: "OAuth 2.0 Authorization Framework",
    summary:
      "OAuth delegeert autorisatie, niet authenticatie. De gevaarlijkste enterprise-vectoren zijn consent phishing, device-code phishing, te ruime refresh tokens, en legacy grants (implicit, ROPC) die nog in tenants sluimeren.",
    how: [
      "Een client vraagt autorisatie voor scopes. De resource owner authenticert bij de Authorization Server (Entra).",
      "Authorization Code + PKCE is de enige grant die OAuth 2.1 nog aanbeveelt voor user-delegated access.",
      "De client wisselt de code (plus code_verifier) in voor access token + refresh token.",
      "Access tokens zijn bearer: bezit = toegang, tenzij Token Protection of DPoP/mTLS ze bindt.",
    ],
    weaknesses: [
      {
        title: "Consent phishing",
        body: "De aanvaller registreert een app ('IT Secure Viewer') die Mail.Read en Files.ReadWrite.All vraagt. Het slachtoffer logt in op de échte login.microsoftonline.com en klikt Accept. De aanvaller krijgt tokens zonder het wachtwoord te kennen. Passkeys helpen hier niet: de user authenticert expres op het echte domein.",
      },
      {
        title: "Device-code phishing (Storm-2372, EvilTokens)",
        body: "RFC 8628 is bedoeld voor input-constrained devices. Aanvallers sturen een code die het slachtoffer op microsoft.com/devicelogin plakt. Microsoft rapporteerde in 2026 het EvilTokens-platform: 12.000+ inboxes. Binnen 10 minuten registreren operators een apparaat en halen een PRT.",
      },
      {
        title: "Authorization code interceptie zonder PKCE",
        body: "Public clients (mobiel, SPA, custom URI schemes) zonder PKCE: wie de code onderschept, wisselt hem in. OAuth 2.1 maakt PKCE verplicht; veel enterprise-apps zijn 2.0 zonder S256.",
      },
      {
        title: "Legacy grants",
        body: "Implicit (tokens in de URL-fragment) en Resource Owner Password Credentials geven secrets aan de client. ROPC omzeilt Conditional Access-interactie. Device-code zonder extra CA-policy is het moderne equivalent.",
      },
    ],
    poc: [
      {
        title: "Device-code flow (lab user)",
        body: "We starten de device-code grant voor de Microsoft Authentication Broker client. Het slachtoffer (lab-account) bevestigt op de echte Microsoft-pagina. We ontvangen access + refresh token, en met de broker-client-id een pad naar device registratie en PRT.",
        commands: `# Lab-only — eigen tenant
# Device code starten (publieke client)
curl -s https://login.microsoftonline.com/$TENANT/oauth2/v2.0/devicecode \\
  -d "client_id=29d9ed98-a469-4536-ade2-fcebfe398ff1" \\
  -d "scope=openid offline_access https://graph.microsoft.com/.default"
# User navigeert naar microsoft.com/devicelogin en voert de user_code in
# Poll token endpoint tot access_token + refresh_token terugkomen`,
      },
    ],
    quantum: "kwetsbaar",
    quantumNote:
      "JWT access/ID tokens zijn RS256 of ES256. Refresh tokens zijn opaques, maar de TLS-kanaalbescherming (ECDHE) is harvest-now-decrypt-later tot ML-KEM overal staat. OAuth zelf heeft geen PQC-profiel; de kwetsbaarheid zit in JOSE/COSE en TLS.",
    mitigations: [
      "User consent uitschakelen of beperken tot verified publishers; admin consent workflow.",
      "Device-code flow blokkeren via Conditional Access authentication flows (preview/GA per workload).",
      "PKCE S256 verplicht, implicit en ROPC uitzetten in de tenant.",
      "Token Protection (device-bound PRT) + Continuous Access Evaluation.",
      "App registration reviews: redirect URI's strikt, geen wildcards, secrets in Key Vault.",
    ],
  },
  {
    id: "oidc",
    code: "01.D",
    name: "OpenID Connect",
    fullName: "OpenID Connect 1.0 (op OAuth 2.0)",
    summary:
      "OIDC voegt een ID token (JWT) toe bovenop OAuth. De extra claims (nonce, azp, acr/amr) zijn de MFA-audittrail — en tegelijk het aanvalsoppervlak als ze niet gecontroleerd worden.",
    how: [
      "OIDC Authorization Code flow (+ PKCE) levert een ID token, access token en optioneel refresh token.",
      "Het ID token bewijst authenticatie: iss, aud, sub, exp, nonce, en bij Entra: amr/acr voor MFA.",
      "De client moet iss/aud/exp/nonce valideren. Een RP die dat overslaat, accepteert tokens van een andere tenant of een oude sessie.",
      "Hybrid flow en implicit blijven in oude apps; ze lekken tokens naar de browser history.",
    ],
    weaknesses: [
      {
        title: "Mix-up / malicious endpoints",
        body: "Zonder strikte issuer-validatie + authorization server metadata (RFC 8414) kan een aanvaller de client naar een malafide AS sturen en tokens laten inwisselen bij de echte AS (of omgekeerd). OIDC Discovery-documenten zijn een vertrouwensanker dat zelden gepind wordt.",
      },
      {
        title: "Nonce- en state-loosheid",
        body: "Zonder nonce is het ID token replaybaar. Zonder state is de callback CSRF-baar: het slachtoffer bindt de sessie van de aanvaller. Beide komen wekelijks voor in interne enterprise-apps.",
      },
      {
        title: "amr-claim spoofing via PRT",
        body: "Een MFA-gebaseerde PRT transfereert de MFA-claim naar app-tokens. Steal de PRT, en elke OIDC-app ziet amr=mfa zonder dat de aanvaller MFA uitvoert. Dit is by-design SSO, misbruikt.",
      },
      {
        title: "ID token als access token",
        body: "RPs die het ID token naar API's sturen (in plaats van het access token) omzeilen audience-restrictie. Een token voor de client wordt zo een universele sleutel.",
      },
    ],
    poc: [
      {
        title: "Nonce-loze RP accepteert replay",
        body: "Lab-RP zonder nonce-check. We vangen een ID token (via browser of AiTM), spelen hem later opnieuw af naar de callback. Zolang exp niet verstreken is, is de sessie van het slachtoffer van ons. Met nonce faalt dezelfde replay.",
        commands: `# Lab RP: vergelijk twee callbacks
# A) nonce in authorize + id_token.nonce check → replay rejected
# B) geen nonce → zelfde id_token twee keer geaccepteerd tot exp`,
      },
    ],
    quantum: "kwetsbaar",
    quantumNote:
      "ID tokens zijn JOSE (RS256/ES256). IANA voegde in april 2025 ML-DSA COSE-algs toe (-48/-49/-50), maar Entra ID tokens zijn klassiek. Tot Entra ML-DSA of een hybride JWT-algorithmeset uitgeeft, is elk OIDC-token Q-day-forgebaar.",
    mitigations: [
      "Verplicht: iss, aud, exp, nbf, nonce, state, PKCE S256.",
      "Gebruik authorization code + PKCE; implicit/hybrid uitzetten.",
      "JWKS pinnen of cache met kid-rotatie; geen 'none' alg.",
      "amr/acr niet vertrouwen zonder Token Protection + sign-in frequency.",
      "Migratiepad naar PQC-JOSE wanneer Entra het ondersteunt; tot die tijd korte token-TTL + CAE.",
    ],
  },
];

export function protocolById(id: string) {
  return PROTOCOLS.find((p) => p.id === id);
}
