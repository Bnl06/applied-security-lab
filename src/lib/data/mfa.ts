import type { MfaMethod } from "./types";

export const MFA_METHODS: MfaMethod[] = [
  {
    id: "sms",
    code: "03.A",
    name: "MFA met SMS",
    aka: "SMS OTP · telefoon als factor",
    category: "phishable",
    summary:
      "Een zescijferige code over SS7/GSM. NIST raadt SMS al jaren af als MFA. In 2026 is het de zwakste factor die Entra nog toestaat — en AiTM maakt zelfs SIM-swap overbodig.",
    theory: [
      "SMS-OTP is een gedeeld kort geheim (knowledge+possession hybrid) dat over een onversleuteld telco-kanaal reist. De code is 6 cijfers, 30–180 s geldig, één keer bruikbaar bij de IdP — maar wél door te geven.",
      "Twee klassen van aanvallen: (1) het kanaal kapen (SIM-swap, SS7/Diameter intercept, malafide RCS-app), (2) de user de code laten typen op een proxy (AiTM). Klasse 2 is goedkoper en schaalt; PhaaS-kits als Tycoon en BigBear doen niets anders.",
      "Entra behandelt SMS als first-factor (SMS sign-in) én second-factor. Conditional Access ‘require MFA’ is tevreden. ‘Require phishing-resistant MFA’ weigert SMS.",
    ],
    attacks: [
      {
        title: "AiTM / Evilginx — de standaardbypass",
        body: "Het slachtoffer ziet een pixel-perfecte Microsoft-login op login.contoso-sso.net. Wachtwoord én SMS-code gaan live naar login.microsoftonline.com. De proxy houdt ESTSAUTH. MFA is ‘geslaagd’ voor de aanvaller.",
      },
      {
        title: "SIM-swap / port-out",
        body: "Social engineering bij de provider. De aanvaller ontvangt de SMS op een eigen sim. Combineer met gelekt wachtwoord (credential stuffing). Geen phishingpagina nodig.",
      },
      {
        title: "SS7/Diameter intercept",
        body: "Wie toegang heeft tot roaming-interconnects leest SMS zonder de sim te verhuizen. Nation-state en sommige cybercrime-groepen. Buiten scope van het studentlab, wel relevant voor de score.",
      },
    ],
    demo: {
      start:
        "Lab-user alice@lab heeft SMS als enige MFA. Geen CA phishing-resistant policy. Evilginx2 op de lab-proxy met microsoft-phishlet. DNS van login.lab-phish.local → proxy.",
      tools: ["Evilginx2", "lab-browser (slachtoffer)", "attacker Firefox met cookie-import"],
      steps: [
        {
          n: 1,
          actor: "lab",
          title: "Proxy omhoog",
          body: "Phishlet enabled, lure URL gegenereerd. TLS via lab-CA, geen cert-warning in de lab-browser.",
          terminal: `evilginx> phishlets hostname microsoft login.lab-phish.local
evilginx> phishlets enable microsoft
evilginx> lures create microsoft
lure 0: https://login.lab-phish.local/Uw9a`,
        },
        {
          n: 2,
          actor: "slachtoffer",
          title: "Login op de lure",
          body: "Alice opent de lure, typt wachtwoord. Entra stuurt SMS. Alice typt 482193. De echte IdP accepteert.",
        },
        {
          n: 3,
          actor: "proxy",
          title: "Cookie capture",
          body: "Set-Cookie: ESTSAUTHPERSISTENT wordt onderschept. Alice landt op office.com en merkt niets.",
          terminal: `[session] ESTSAUTHPERSISTENT=0.AR0A...
[session] ESTSAUTH=...
tokens captured for alice@lab.perimeter.local`,
        },
        {
          n: 4,
          actor: "aanvaller",
          title: "Replay",
          body: "Cookies in de attacker-browser. Outlook web laadt de mailbox. Geen SMS, geen wachtwoord.",
        },
      ],
      outcome: "gelukt",
      result:
        "SMS-MFA is volledig omzeild. De factor bewijst alleen dat iemand de SMS kon lezen of doorzetten — niet dat de sessie op Alice’ apparaat zit.",
    },
    defenses: {
      blocks: [
        "Conditional Access: require authentication strength ‘Phishing-resistant MFA’.",
        "SMS als methode uitschakelen in Authentication methods policy.",
      ],
      fails: [
        "‘Require MFA’ (elke methode).",
        "Number matching (niet van toepassing op SMS).",
        "Token Protection helpt ná diefstal van unbound cookies, niet tegen de capture zelf als de browser unbound is.",
      ],
    },
    quantum: "hybride",
    quantumNote:
      "De OTP zelf is geen publieke-sleutelcrypto. Q-day kraakt SMS niet direct. Wél kraakt Q-day de RSA/ECDSA sessietokens die na de SMS worden uitgereikt, en harvest-now-decrypt-later op de TLS-sessie van de proxy. Score-minpunt zit in de tokens, niet in de SMS-berichten.",
    score: { phishing: 1, token: 2, binding: 1, quantum: 5, operationeel: 1, totaal: 1.8 },
    motivation: [
      "Phishing (gewicht 30%): 1/10. AiTM relay is triviaal; SIM-swap is een commodity. Geen origin binding.",
      "Tokenrisico (25%): 2/10. Na één geslaagde SMS is de sessie een bearer cookie. Geen device binding.",
      "Binding (20%): 1/10. De factor is een telefoonnummer, niet een apparaat of origin.",
      "Quantum (15%): 5/10. OTP-kanaal is symmetrisch/telecom; tokens zijn klassiek asymmetrisch. Geen extra minpunt bovenop de rest van Entra.",
      "Operationeel (10%): 1/10. Delivery-failures, SIM-port-out, geen phishing-resistant strength, NIST-discouraged.",
    ],
    primaryFinding: "AiTM vangt de sessie ná de SMS. De factor is theater.",
  },
  {
    id: "totp-software",
    code: "03.B",
    name: "MFA met OTP-software",
    aka: "TOTP · Google/Microsoft Authenticator codes · RFC 6238",
    category: "phishable",
    summary:
      "HMAC-SHA1 over tijd + shared secret. Beter dan SMS (geen SS7), even kwetsbaar voor AiTM: de user typt de code in de proxy.",
    theory: [
      "Software-OATH in Entra is TOTP, 30 of 60 seconden, SHA1 (legacy) of SHA256. Het secret wordt bij registratie als QR (otpauth://) getoond — screenshot = clone.",
      "De code is een short-lived shared secret. Origin-binding bestaat niet: elke pagina die om ‘uw 6-cijferige code’ vraagt, is een geldige verifier vanuit het perspectief van de user.",
      "Seed-extractie uit de authenticator-app (backup, rooted phone, notification overlay) is een tweede vector, zeldzamer dan AiTM.",
    ],
    attacks: [
      {
        title: "AiTM-relay binnen het TOTP-window",
        body: "Evilginx heeft 30 seconden. Dat is ruim. BigBear 2.0 rapporteerde duizenden M365-cookies uit precies deze flow.",
      },
      {
        title: "QR/seed clone bij enrollment",
        body: "Een phishingpagina die ‘registreer MFA opnieuw’ nabootst, vangt het otpauth-secret. Daarna genereert de aanvaller zelf codes, zonder proxy.",
      },
      {
        title: "Notification-listener / overlay malware",
        body: "Op Android kan malware TOTP-codes uit notifications of screenshots lezen. Geen MFA-fatigue nodig.",
      },
    ],
    demo: {
      start:
        "Lab-user bob@lab, Microsoft Authenticator in code-mode (geen push). Zelfde Evilginx-lure als SMS. CA: require MFA, geen authentication strength.",
      tools: ["Evilginx2", "Authenticator (software TOTP)", "roadtx"],
      steps: [
        {
          n: 1,
          actor: "slachtoffer",
          title: "Code invoeren op de lure",
          body: "Bob opent de authenticator, leest 6 cijfers, typt ze in de nep-Microsoft-pagina. De proxy zet ze door.",
        },
        {
          n: 2,
          actor: "proxy",
          title: "Sessie gestolen",
          body: "ESTSAUTH + refresh token. Replay in attacker-browser. Graph /me slaagt.",
          terminal: `roadtx token --refresh-token $RT --client 1b730954-1685-4b74-9eed-ff0bd1d3adb6
[+] access_token aud=https://graph.microsoft.com
[+] amr: [pwd, otp]`,
        },
      ],
      outcome: "gelukt",
      result:
        "Software-TOTP overleeft credential stuffing, niet real-time phishing. De amr-claim in het token is ‘otp’ — auditors zien MFA, de mailbox is leeggehaald.",
    },
    defenses: {
      blocks: [
        "Phishing-resistant authentication strength.",
        "Authenticator in passwordless/passkey-modus i.p.v. TOTP-codes.",
      ],
      fails: [
        "Number matching (niet van toepassing op TOTP).",
        "CA ‘require MFA’.",
        "Trusted locations — AiTM kan via residential proxy geo-matchen (BigBear: 69 landen).",
      ],
    },
    quantum: "hybride",
    quantumNote:
      "HMAC-SHA1/SHA256 is Grover-kwetsbaar (ruwweg halve bitsterkte) maar 30-seconden-codes zijn geen Q-day-doelwit. Het TOTP-secret is 80–160 bits; brute force ná Grover blijft onpraktisch voor live codes. Sessietokens blijven RSA/ECDSA.",
    score: { phishing: 2, token: 2, binding: 1, quantum: 6, operationeel: 4, totaal: 2.6 },
    motivation: [
      "Phishing: 2/10. Geen SIM-swap, wél identieke AiTM-relay. Enrollment-QR is een extra clone-vector.",
      "Token: 2/10. Zelfde bearer-cookies als SMS.",
      "Binding: 1/10. Secret is kopieerbaar; geen device- of origin-bind.",
      "Quantum: 6/10. TOTP zelf is symmetrisch en redelijk Q-okay; tokens niet. Iets beter dan pure asymmetrische credentials die Q-day fully breakt.",
      "Operationeel: 4/10. Werkt offline, geen telco, maar UX nodigt uit tot typed codes op elke pagina.",
    ],
    primaryFinding: "TOTP stopt stuffing, niet Evilginx. De code is een phishable bearer.",
  },
  {
    id: "totp-hardware",
    code: "03.C",
    name: "MFA met OTP-hardware",
    aka: "OATH-TOTP token · YubiKey OTP · Thales/Feitian display tokens",
    category: "phishable",
    summary:
      "Zelfde RFC 6238, andere verpakking. De seed zit in een tamper-resistant token i.p.v. een telefoon. AiTM is onveranderd: de user leest het schermpje en typt de code.",
    theory: [
      "Entra ondersteunt hardware OATH (preview Graph API) — SHA1/SHA256, 30 of 60 s. Seeds worden als CSV/Graph geüpload. Wie de CSV heeft, heeft de tokens.",
      "Fysieke possession is sterker tegen malware op de telefoon en tegen SIM-swap. Het is géén FIDO2: er is geen origin check, geen challenge-response naar de RP.",
      "YubiKey ‘OTP’ (Yubico OTP, HID-toetsenbord) is een andere modus dan FIDO2 op dezelfde dongle. Verwarring daartussen is een operationeel risico: orgs denken ‘we hebben keys’ terwijl ze Yubico-OTP phishable codes gebruiken.",
    ],
    attacks: [
      {
        title: "AiTM — identiek aan software-TOTP",
        body: "De user typt wat het schermpje toont. De proxy is klaar binnen 30 s. Hardware verandert de verifier niet.",
      },
      {
        title: "Seed-CSV compromis",
        body: "De uploadfile of Graph hardwareOathDevices bevat secretKey in Base32. Een Global/Auth Policy Admin leak of een misconfiguratie van de vault is game over voor de hele batch.",
      },
      {
        title: "Lost token zonder PIN",
        body: "Veel display-tokens hebben geen PIN. Vind je hem, dan genereer je codes. Combineer met een gelekt wachtwoord.",
      },
    ],
    demo: {
      start:
        "Lab-user carol@lab, Thales OTP 110 geüpload via Graph. Evilginx-lure. Vergelijkingsshot: dezelfde user later met FIDO2 op dezelfde YubiKey — die flow faalt op origin.",
      tools: ["Hardware OATH token", "Evilginx2", "YubiKey 5 (FIDO2-contrast)"],
      steps: [
        {
          n: 1,
          actor: "slachtoffer",
          title: "Hardware-code getypt",
          body: "Carol leest 6 cijfers van het token, typt ze op de lure. Capture slaagt.",
        },
        {
          n: 2,
          actor: "lab",
          title: "Contrast: FIDO2 op dezelfde key",
          body: "We zetten carol over naar FIDO2. Dezelfde lure toont géén WebAuthn-prompt die Entra accepteert: origin lab-phish.local ≠ login.microsoftonline.com.",
        },
      ],
      outcome: "gelukt",
      result:
        "Hardware-OATH faalt op AiTM net als software. Het contrast met FIDO2 op dezelfde YubiKey is de didactische kern van deze demo.",
    },
    defenses: {
      blocks: ["Phishing-resistant strength.", "FIDO2-modus op dezelfde dongle i.p.v. OATH."],
      fails: ["CA require MFA.", "Fysieke possession alleen.", "CSV in een ‘secure’ sharepoint."],
    },
    quantum: "hybride",
    quantumNote:
      "Gelijk aan software-TOTP: HMAC is Grover-only. De hardware lost Q-day voor sessietokens niet op. Geen minpunt extra, geen plus voor PQC.",
    score: { phishing: 2, token: 2, binding: 3, quantum: 6, operationeel: 5, totaal: 3.1 },
    motivation: [
      "Phishing: 2/10. Identieke relay. Hardware is geen origin binding.",
      "Token: 2/10. Zelfde sessiecookies.",
      "Binding: 3/10. Seed niet op de telefoon; fysiek token. CSV-beheer ondermijnt dat.",
      "Quantum: 6/10. Als TOTP.",
      "Operationeel: 5/10. Geen batterij-apps, wel logistiek, verloren tokens, seed-vault.",
    ],
    primaryFinding: "Een display-token is TOTP in plastic. AiTM typt mee.",
  },
  {
    id: "authenticator-push",
    code: "03.D",
    name: "Microsoft Authenticator (push)",
    aka: "Number matching · passwordless phone sign-in · Authenticator Lite",
    category: "phishable",
    summary:
      "Push met number matching stopt MFA-fatigue, niet AiTM. De cijfers op het scherm staan óók op de proxy. Passwordless phone sign-in is handiger, niet phishing-resistant.",
    theory: [
      "Klassieke Approve/Deny-push is MFA-fatigue (Lapsus$, 2022). Number matching (default) dwingt de user het getal van het login-scherm in de app te typen.",
      "AiTM relayer het getal 1-op-1. De user ziet 47 op de nep-pagina, typt 47 in Authenticator, keurt de échte Entra-prompt goed. Number matching bewijst aandacht, niet origin.",
      "Passwordless phone sign-in (number matching zonder wachtwoord) is possession+inherence-adjacent, maar de sessie is nog steeds een unbound cookie. Microsoft zelf: push is géén phishing-resistant method.",
    ],
    attacks: [
      {
        title: "AiTM + number matching",
        body: "De proxy toont het getal. Het slachtoffer denkt dat het een normale login is. Sessie gestolen. Dit is de dominante M365-phish in 2025–2026.",
      },
      {
        title: "MFA-fatigue (als matching uit staat)",
        body: "Legacy-tenants. Dozens of pushes tot iemand Approve tikt. Helpdesk-pretext versnelt het.",
      },
      {
        title: "Authenticator enrollment takeover",
        body: "Na een gestolen sessie registreert de aanvaller een eigen Authenticator (of TAP). Persistent, overleeft wachtwoordreset als SSPR zwak is.",
      },
    ],
    demo: {
      start:
        "dave@lab, Authenticator push + number matching enforced. Fatigue-policy actief. Evilginx lure. Tweede run: passwordless phone sign-in.",
      tools: ["Microsoft Authenticator", "Evilginx2", "Entra Authentication methods policy"],
      steps: [
        {
          n: 1,
          actor: "idp",
          title: "Number matching challenge",
          body: "Entra toont 47. De proxy toont 47. Dave typt 47 in de app.",
        },
        {
          n: 2,
          actor: "aanvaller",
          title: "Sessie binnen",
          body: "Cookies + refresh token. Number matching heeft alleen bewezen dat Dave wakker was.",
        },
        {
          n: 3,
          actor: "lab",
          title: "Fatigue-controle",
          body: "Zonder matching sturen we 30 pushes. Dave keurt de 31e goed. Met matching gebeurt dat niet — maar AiTM wél.",
        },
      ],
      outcome: "gelukt",
      result:
        "Push + number matching is een verbetering tegen fatigue, geen sprong naar phishing-resistance. Passwordless phone sign-in verandert de eerste factor, niet de relay.",
    },
    defenses: {
      blocks: [
        "Authentication strength phishing-resistant.",
        "Passkey in Authenticator (zelfde app, andere ceremony).",
      ],
      fails: ["Number matching.", "Number matching + geografische context in de push.", "Require MFA."],
    },
    quantum: "kwetsbaar",
    quantumNote:
      "De push is een Entra-notificatie plus een sessie die RSA/ECDSA JWT’s uitdeelt. Geen authenticator-side public key zoals bij passkeys. Q-day = forge sessietokens. Minpunt voor de tokenlaag.",
    score: { phishing: 2, token: 3, binding: 3, quantum: 3, operationeel: 5, totaal: 2.9 },
    motivation: [
      "Phishing: 2/10. Number matching is geen origin check.",
      "Token: 3/10. Iets beter zichtbaar in sign-in logs (app-attest), nog steeds bearer.",
      "Binding: 3/10. Device-registratie van de phone, maar de web-sessie is unbound.",
      "Quantum: 3/10. Geen device-bound credential; klassieke tokens.",
      "Operationeel: 5/10. Goede UX, fatigue deels gefixt, enrollment-aanval blijft.",
    ],
    primaryFinding: "Number matching stopt fatigue. De proxy kent het getal ook.",
  },
  {
    id: "passwordless",
    code: "03.E",
    name: "Passwordless MFA",
    aka: "Temporary Access Pass · Authenticator passwordless · QR sign-in",
    category: "phishable",
    summary:
      "Het wachtwoord weghalen verwijdert stuffing en reuse. Het verwijdert AiTM niet, zolang de vervanger een getypt geheim of een device-code is. TAP is een breekijzer als hij te lang leeft.",
    theory: [
      "Entra passwordless: Authenticator passwordless, Windows Hello, passkeys, CBA, SMS sign-in, QR-code, TAP. Deze pagina behandelt de phishable subset: TAP, QR, SMS sign-in, Authenticator passwordless zonder WebAuthn.",
      "TAP (Temporary Access Pass) is een kort levensteken voor recovery/onboarding. Te ruime lifetime (uren/dagen) + phishing van de TAP = account takeover inclusief het registreren van een persistente factor.",
      "QR-code sign-in en device-code zijn UX voor TV’s en kiosken. Storm-2372 bewees dat ‘plak deze code op microsoft.com’ social-engineering-proof is tegen mensen, niet tegen het protocol.",
    ],
    attacks: [
      {
        title: "TAP phishing / helpdesk pretext",
        body: "Helpdesk geeft een TAP af (of de user vraagt SSPR). Aanvaller vangt de TAP via mail/SMS/pretext en registreert Authenticator + passkey. Daarna is de account van de aanvaller.",
      },
      {
        title: "Passwordless phone sign-in via AiTM",
        body: "Zelfde reverse proxy. Geen wachtwoord om te stelen — de sessie na number matching is genoeg.",
      },
      {
        title: "QR / device-code",
        body: "User scant of typt op de echte Microsoft-pagina. Passkeys op dat account beschermen de ceremony op de echte pagina niet tegen het goedkeuren van een vreemd device.",
      },
    ],
    demo: {
      start:
        "eve@lab, wachtwoord disabled, Authenticator passwordless + TAP 30 min voor onboarding. Scenario A: TAP-pretext. Scenario B: AiTM op passwordless phone sign-in.",
      tools: ["TAP", "Authenticator passwordless", "Evilginx2"],
      steps: [
        {
          n: 1,
          actor: "aanvaller",
          title: "TAP onderschept",
          body: "Lab-helpdesk-rol maakt TAP. We phishen hem als ‘IT-onboarding’. Registratie van een tweede Authenticator slaagt.",
        },
        {
          n: 2,
          actor: "proxy",
          title: "Passwordless via AiTM",
          body: "Zonder TAP: phone sign-in door de proxy. Number matching + sessiecookie. Wachtwoordloos ≠ phishing-resistant.",
        },
      ],
      outcome: "gelukt",
      result:
        "Passwordless is een noodzakelijke stap, geen bestemming. Zonder origin-bound credentials (FIDO/CBA/WHFB) blijft de sessie steelbaar.",
    },
    defenses: {
      blocks: [
        "TAP: minuten-lifetime, eenmalig, alleen vanuit een geverifieerd kanaal.",
        "Authentication methods: phishable credential removal (Entra 2026).",
      ],
      fails: ["Wachtwoord uitzetten alleen.", "QR-sign-in zonder extra CA-flow-control."],
    },
    quantum: "kwetsbaar",
    quantumNote:
      "TAP en phone sign-in rusten op klassieke Entra-tokens. Geen authenticator-helden-PQC. Iets slechter dan TOTP op de quantum-as omdat er geen HMAC-secret is, alleen JWT.",
    score: { phishing: 3, token: 3, binding: 4, quantum: 3, operationeel: 5, totaal: 3.4 },
    motivation: [
      "Phishing: 3/10. Wachtwoord weg is winst; TAP/QR/phone-sign-in blijven social-engineerbaar.",
      "Token: 3/10. Zelfde PRT/cookie-verhaal na geslaagde sign-in.",
      "Binding: 4/10. Authenticator-device is geregistreerd; web-sessie niet.",
      "Quantum: 3/10. Klassieke tokens.",
      "Operationeel: 5/10. Betere UX, recovery is de zwakke schakel.",
    ],
    primaryFinding: "Passwordless zonder passkey is AiTM met minder typewerk.",
  },
  {
    id: "whfb",
    code: "03.F",
    name: "Passkey · Windows Hello for Business",
    aka: "WHFB · platform authenticator · TPM-backed PIN/bio",
    category: "phishing-resistant",
    summary:
      "Asymmetrische device-bound credential, PIN als lokale entropy, TPM anti-hammering. Bevestigt de onderzoeksvraag: een 4-cijferige PIN is in dit model sterker dan een 12-teken wachtwoord. Niet immuun voor device-theft, assertion-replay-bugs of Q-day.",
    theory: [
      "WHFB genereert een key pair in de TPM. De public key gaat naar Entra. De PIN of biometric unsealt de private key lokaal. De PIN reist nooit naar de IdP en staat niet op de server.",
      "WebAuthn origin binding: een phishingdomein krijgt geen assertion voor login.microsoftonline.com. AiTM-Evilginx faalt hier — tenzij de user via device-code op het echte domein goedkeurt.",
      "SpecterOps (2026) ‘Pass-the-Passkey’: Windows logde complete WebAuthn assertions; Entra enforce’te replay-protectie onvoldoende. Dat is een implementatiebug, geen protocolbreuk. We reproduceren de les: RP’s moeten challenge uniqueness afdwingen.",
    ],
    attacks: [
      {
        title: "AiTM — geblokkeerd",
        body: "WebAuthn clientDataJSON.origin is het echte origin van het document. lab-phish.local ≠ login.microsoftonline.com. De TPM tekent niet voor de IdP.",
      },
      {
        title: "Fysieke device-diefstal + PIN",
        body: "Aanvaller heeft de laptop. 4-cijferige PIN, maar TPM lockout na herhaalde misses (A1B2C3-challenge, daarna exponentiële lockout tot minuten). Brute force faalt in de praktijk. Shoulder surfing + onbewaakte ontgrendelde sessie blijft het realistische pad.",
      },
      {
        title: "PRT uit de user-sessie",
        body: "Malware ná login misbruikt de CloudAP/WAM-broker zonder de TPM-key te exporteren. Token Protection + MDE ‘Attempted access of PRT’ is de verdediging, niet WHFB zelf.",
      },
      {
        title: "Device-code / consent naast WHFB",
        body: "WHFB beschermt de WHFB-ceremony. Een user die op microsoft.com/devicelogin een code plakt, heeft WHFB netjes gebruikt — voor het device van de aanvaller.",
      },
    ],
    demo: {
      start:
        "frank@lab, Entra-joined Win11 + TPM 2.0, WHFB PIN 4 cijfers, CA phishing-resistant MFA. Evilginx lure. Tweede scenario: malware in user-sessie vraagt token via WAM.",
      tools: ["Windows 11 lab-VM", "Evilginx2", "roadtx", "AADInternals"],
      steps: [
        {
          n: 1,
          actor: "proxy",
          title: "AiTM vs WHFB",
          body: "Lure laadt. Browser WebAuthn-prompt verschijnt niet voor Entra, of de assertion wordt geweigerd (origin mismatch). Geen ESTSAUTH voor de aanvaller.",
          terminal: `[webauthn] rpId=login.microsoftonline.com
[client] origin=https://login.lab-phish.local
[browser] SecurityError: origin mismatch`,
        },
        {
          n: 2,
          actor: "apparaat",
          title: "PIN brute-force tegen TPM",
          body: "32k+ random PINs? Nee. Na enkele misses: ‘enter A1B2C3’. Daarna lockout 1/2/10 minuten. 4 cijfers × anti-hammering ≫ 12-teken wachtwoord dat remote gesprayed wordt.",
        },
        {
          n: 3,
          actor: "aanvaller",
          title: "Post-login PRT abuse",
          body: "Op een gecompromitteerde, al ontgrendelde sessie vraagt malware tokens via de broker. WHFB is dan al ‘gebruikt’. Token Protection weigert replay op een tweede machine.",
        },
      ],
      outcome: "geblokkeerd",
      result:
        "AiTM faalt. Remote password spray faalt. Device-bound PIN wint van het 12-teken wachtwoord. Restrisico: endpoint-malware, device-code, assertion-replay-bugs, Q-day.",
      blockers: "Origin binding + TPM non-exportable key + CA phishing-resistant strength.",
      theory:
        "Zonder TPM (software-backed Hello) daalt de score: keys zijn DPAPI-beschermd en in principe extraheerbaar. Policy ‘Require security device’ is verplicht in het lab.",
    },
    defenses: {
      blocks: ["AiTM / Evilginx.", "Credential stuffing / password spray.", "Server-side hash dumps."],
      fails: [
        "Malware in een ontgrendelde sessie (broker abuse).",
        "Device-code phishing op het echte domein.",
        "Pass-the-Passkey-klasse replay als de RP challenge niet uniqueness-checkt.",
        "Q-day tegen ECDSA/RSA Hello-keys.",
      ],
    },
    quantum: "kwetsbaar",
    quantumNote:
      "WHFB-keys zijn RSA-2048 of ECDSA P-256 in de TPM. Q-day: private key afleiden uit de public key in Entra en assertions smeden zonder het device. FIDO/COSE heeft ML-DSA-algs (IANA 2025), Entra/Windows Hello nog niet. Dit is het gevraagde minpunt: vandaag phishing-resistant, over een paar jaar Q-deprecated.",
    score: { phishing: 9, token: 7, binding: 9, quantum: 3, operationeel: 7, totaal: 7.4 },
    motivation: [
      "Phishing: 9/10. Origin binding. Minpunt voor device-code ernaast en fallback-methoden.",
      "Token: 7/10. PRT nog steeds waardevol post-login; Token Protection tilt dit.",
      "Binding: 9/10. TPM + device. Zonder TPM (policy uit) zakt dit naar 5.",
      "Quantum: 3/10. Klassieke asymmetrische keys. Expliciet minpunt t.o.v. HMAC-OTP.",
      "Operationeel: 7/10. PIN-reset service, biometrics fallback, enrollment via TAP.",
    ],
    primaryFinding: "AiTM sterft hier. De 4-cijfer-PIN is sterker dan het 12-teken-wachtwoord — lokaal, niet in entropy.",
  },
  {
    id: "passkey-authenticator",
    code: "03.G",
    name: "Passkey · Microsoft Authenticator",
    aka: "device-bound passkey in Authenticator · hybrid/caBLE proximity",
    category: "phishing-resistant",
    summary:
      "FIDO2-credential in de Authenticator-app. Origin binding houdt AiTM tegen. Hybrid transport (QR + BLE) voegt een proximity-check toe — relaying is het onderzoekspunt.",
    theory: [
      "Passkeys in Authenticator (GA 2025) zijn device-bound discoverable credentials, niet iCloud-synced. De private key zit in de telefoon-TEE/Secure Enclave / StrongBox.",
      "Cross-device: de desktop toont een QR; de telefoon scant; caBLE/hybrid CTAP over BLE bewijst nabijheid. De browser praat niet ‘zomaar’ over het internet met de authenticator.",
      "Domain binding = rpId + origin in clientDataJSON, gecontroleerd door browser én authenticator. lab-phish.local kan de passkey van login.microsoftonline.com niet wekken.",
    ],
    attacks: [
      {
        title: "AiTM — geblokkeerd door origin",
        body: "Zelfde resultaat als WHFB. De app biedt de passkey niet aan voor het phishing-rpId.",
      },
      {
        title: "Hybrid BLE relay",
        body: "inovex (2025) en NCC BLE-relay: als de aanvaller een gadget binnen BLE-bereik van het slachtoffer zet én het slachtoffer de QR van de phishingpagina scant, kan hybrid CTAP getunneld worden. Praktisch: spear-phish + fysieke nabijheid. Geen mass-PhaaS. Distance bounding (UWB) ontbreekt in caBLE; latency-bounds zijn omzeilbaar (~8 ms extra in NCC-research).",
      },
      {
        title: "Telefoon-compromis / backup",
        body: "Device-bound in Authenticator beperkt sync-account takeover. Rooted phone + TEE-bypass is nation-state-terrein. Enrollment via TAP blijft het goedkope pad.",
      },
    ],
    demo: {
      start:
        "grace@lab, passkey in Authenticator, CA phishing-resistant. Desktop zonder WHFB. Scenario A: Evilginx. Scenario B: QR-hybrid met lab-BLE-sniffer op 2 m.",
      tools: ["Authenticator passkey", "Evilginx2", "WebAuthn DevTools", "nRF BLE sniffer (lab)"],
      steps: [
        {
          n: 1,
          actor: "proxy",
          title: "Origin mismatch",
          body: "Geen bruikbare assertion. Authenticator toont de Entra-passkey niet op de lure.",
        },
        {
          n: 2,
          actor: "aanvaller",
          title: "Hybrid QR op de lure",
          body: "Als we de user de QR van de phishingpagina laten scannen, weigert de ceremony: rpId/origin kloppen niet. De user zou de QR van de échte Microsoft-pagina moeten scannen — die de proxy niet kan vervalsen met een geldige origin.",
        },
        {
          n: 3,
          actor: "lab",
          title: "BLE relay (theoretisch/lab)",
          body: "Twee BLE-proxies (naast slachtoffer + naast attacker-laptop op het echte origin) is een klassieke FIDO-hybrid relay. In ons lab: latency zichtbaar, Entra weigert niet op RTT. Dit vereist fysieke nabijheid én dat de user de ceremony op het echte origin start. Dat is geen Evilginx; dat is een targeted proximity-aanval.",
        },
      ],
      outcome: "geblokkeerd",
      result:
        "AiTM faalt hard. BLE-relay is mogelijk in een targeted scenario met nabijheid, niet als PhaaS. Domain binding houdt stand.",
      theory:
        "Een puur internet-relay van hybrid CTAP zonder BLE-nabijheid faalt: de spec eist een BLE-advertisement als proximity proof. Dat is de check. Hij is niet cryptographically distance-bounding, wél een drempel.",
    },
    defenses: {
      blocks: ["Klassieke AiTM.", "SMS/TOTP-style code relay.", "Cloud-sync account takeover (device-bound)."],
      fails: [
        "BLE/hybrid relay met fysieke nabijheid.",
        "Device-code op het echte origin.",
        "Q-day tegen ES256-passkeys.",
      ],
    },
    quantum: "kwetsbaar",
    quantumNote:
      "Authenticator-passkeys zijn ES256 (P-256). IANA COSE ML-DSA is nog geen Entra-realiteit. Zelfde Q-day-minpunt als WHFB. Hybrid PQC (Dilithium+ECDSA) zit in research-keys, niet in de Authenticator-app van 2026.",
    score: { phishing: 8, token: 6, binding: 8, quantum: 3, operationeel: 7, totaal: 6.7 },
    motivation: [
      "Phishing: 8/10. Origin binding. Minpunt voor hybrid-relay-met-nabijheid en fallback.",
      "Token: 6/10. Cross-device sessie op de desktop is een gewone Entra-sessie; Token Protection niet altijd van toepassing op die desktop.",
      "Binding: 8/10. Device-bound + BLE proximity. Geen UWB.",
      "Quantum: 3/10. ES256.",
      "Operationeel: 7/10. Geen extra hardware, wel telefoon-afhankelijkheid.",
    ],
    primaryFinding: "Proximity is een BLE-advert, geen distance bound. Origin binding redt de AiTM-case.",
  },
  {
    id: "passkey-dongle",
    code: "03.H",
    name: "Passkey · hardware dongle",
    aka: "FIDO2 security key · YubiKey 5 · CTAP2 USB/NFC/BLE",
    category: "phishing-resistant",
    summary:
      "Hoogste praktische phishing-resistance. Private key in secure element, PIN op de key, user presence (touch). Relay van USB/NFC is een endpoint-compromis, geen phishing. BLE-keys erven de proximity-vraag.",
    theory: [
      "CTAP2 over USB-HID, NFC of BLE. Discoverable resident keys maken usernameless login mogelijk. PIN-protocol (CTAP2.1) beschermt een gestolen key.",
      "Domain binding: identiek WebAuthn origin+rpId. Phishingdomeinen krijgen geen touch-prompt die Entra accepteert.",
      "CTRAPS (2024/25): CTAP-client impersonation, API confusion, zelfs op FIPS YubiKeys — vooral NFC/proximity en malafide client-apps, niet Evilginx. Relaying YubiKeys (APDU-forward vanaf een gecompromitteerde workstation) is laterale movement, geen initial access.",
    ],
    attacks: [
      {
        title: "AiTM — geblokkeerd",
        body: "De key ziet rpId van de browser. Die is het phishingdomein. Geen geldige assertion voor Entra.",
      },
      {
        title: "USB/NFC relay vanaf een gecompromitteerd endpoint",
        body: "Malware stuurt APDU’s naar de ingestoken key en vraagt de user te touchen. De user denkt dat Windows het vraagt. Dit is post-exploitation, equivalent aan WHFB-broker-abuse.",
      },
      {
        title: "BLE roaming-key relay",
        body: "Weinig enterprise FIDO2-keys gebruiken BLE (YubiKey 5 heeft geen BLE). Keys die het wél hebben, erven NCC-style BLE-relay. USB-only keys: niet van toepassing.",
      },
      {
        title: "Gestolen dongle zonder PIN",
        body: "Presence-only (UP, geen UV) + gestolen key = login. Enterprise moet PIN/UV afdwingen via authenticator enrollment policy / attestation.",
      },
    ],
    demo: {
      start:
        "henry@lab, YubiKey 5 NFC, PIN verplicht, attestation restricted tot Yubico. CA phishing-resistant. USB. Contrast: OATH-modus op dezelfde key (zie 03.C).",
      tools: ["YubiKey 5 NFC", "Evilginx2", "libfido2 / fido2-token", "Windows WebAuthn"],
      steps: [
        {
          n: 1,
          actor: "proxy",
          title: "Phishlet vs security key",
          body: "Geen geaccepteerde assertion. Touch-LED blijft uit op de lure, of de browser weigert rpId.",
        },
        {
          n: 2,
          actor: "lab",
          title: "USB APDU-forward (post-exploit)",
          body: "Op de lab-VM als ‘malware’: challenge van een tweede machine naar de lokale key. User-touch op de VM tekent voor de aanvaller-sessie. Detectie: user education + MDE + Token Protection op de doelresource.",
        },
        {
          n: 3,
          actor: "lab",
          title: "NFC proximity",
          body: "NFC vereist centimeters. Relay over internet met een NFC-proxy is mogelijk (CTRAPS proximity mode) maar geen mass phishing. We documenteren het als targeted.",
        },
      ],
      outcome: "geblokkeerd",
      result:
        "Voor initial access via phishing: geblokkeerd. Relaying is mogelijk ná endpoint-compromis of met NFC/BLE-nabijheid. Domain binding houdt stand.",
      theory:
        "BLE-roaming authenticators zonder UWB distance bounding zijn de zwakste hardware-klasse. Koop USB/NFC + PIN, niet BLE-passief.",
    },
    defenses: {
      blocks: ["AiTM.", "SIM-swap.", "MFA-fatigue.", "Password spray."],
      fails: [
        "Endpoint malware + user touch.",
        "Gestolen key zonder PIN.",
        "CTRAPS-klasse CTAP-client bugs.",
        "Q-day ES256/RS256 op de key.",
      ],
    },
    quantum: "kwetsbaar",
    quantumNote:
      "YubiKey 5-series: ES256. Yubico demonstreerde PQC-signatures op een prototype (2025); productie-keys in 2026 zijn klassiek. Swissbit/Intercede bouwen PQC-FIDO. Tot de tenant PQC-keys eist: minpunt. Hardware heeft wél een update-pad (sommige keys field-updateable, YubiKey 5 niet).",
    score: { phishing: 9, token: 8, binding: 9, quantum: 3, operationeel: 8, totaal: 7.8 },
    motivation: [
      "Phishing: 9/10. Beste mass-phish-verdediging. Minpunt voor fallback-methoden in de tenant.",
      "Token: 8/10. Device-bound login; PRT op de desktop blijft bestaan. Token Protection aanbevolen.",
      "Binding: 9/10. SE + PIN + origin. USB/NFC beter dan BLE.",
      "Quantum: 3/10. ES256 tot PQC-keys GA zijn.",
      "Operationeel: 8/10. Attestation, PIN, resident keys. Logistiek van keys + backups (tweede key).",
    ],
    primaryFinding: "USB/NFC + PIN: AiTM dood. Relay is endpoint- of nabijheidsklasse, geen PhaaS.",
  },
  {
    id: "tenbeo",
    code: "03.I",
    name: "Passkey · Tenbeo",
    aka: "heartbeat / ECG continuous identity · wearable token",
    category: "hybride",
    summary:
      "Belgische continuous-identity-laag: ECG-biometrie via smartwatch, tokens die elke seconde roteren. Sterk tegen sessiediefstal-ná-login, onbewezen tegen WebAuthn-phishing, vendor-crypto en spoofing. Geen Entra-native authentication method.",
    theory: [
      "Tenbeo claimt 250+ ECG-features, 99,98% accuracy, lokale verificatie, tokens die elke seconde regenereren. ‘Steal one, and it’s already expired.’ Dat adresseert precies PRT/cookie-replay.",
      "Het is géén FIDO2-passkey. De opdracht noemt het ‘Passkey met Tenbeo’; we behandelen het als passwordless/continuous MFA-kandidaat die je vóór of ná Entra hangt (SIDECAR). Integratie loopt via hun platform, niet via Entra authentication methods.",
      "Biometrie is inherence: niet phishable als code, wél spoofbaar als signaal (ECG-replay van een opgenomen waveform, compromised wearable). Continuous auth verkleint het window, elimineert enrollment- en recovery-vragen niet.",
    ],
    attacks: [
      {
        title: "AiTM op de Entra-front-door",
        body: "Als Tenbeo ná Entra-login zit (session overlay), steelt Evilginx nog steeds de Entra-cookie vóór de heartbeat-laag start. Als Tenbeo de primaire factor is en Entra nooit een unbound cookie geeft, faalt AiTM. De architectuurkeuze is alles.",
      },
      {
        title: "Wearable-compromis / ECG-replay",
        body: "Een opgenomen ECG + gadget dat het signaal naspeelt, of malware op de watch. Tenbeo claimt liveness/anti-spoof; peer-reviewed red-teamresultaten ontbreken in open literatuur (2026). We scoren conservatief.",
      },
      {
        title: "Vendor / token-endpoint",
        body: "Per-second tokens moeten ergens getekend worden. Als dat ECDSA-JWT’s zijn van Tenbeo’s AS, is token theft een race van één seconde — plus eventuele refresh. We hebben geen open spec; aanname: kortlevend + biometric bind.",
      },
    ],
    demo: {
      start:
        "Geen native Entra-method. Lab: Tenbeo sidecar voor een interne app (niet M365). Vergelijk: login met vs zonder heartbeat-gate. Evilginx tegen de Entra-login die de sidecar vertrouwt.",
      tools: ["Tenbeo trial / Samsung Galaxy Watch", "lab-app met sidecar", "Evilginx2"],
      steps: [
        {
          n: 1,
          actor: "lab",
          title: "Architectuur A — sidecar ná Entra",
          body: "AiTM steelt Entra-cookie. Sidecar ziet een nieuwe device-fingerprint en eist heartbeat. Aanval deels geblokkeerd op de app, niet op Graph/mail.",
        },
        {
          n: 2,
          actor: "lab",
          title: "Architectuur B — Tenbeo first",
          body: "Zonder geldige per-second token geen federatie naar Entra. AiTM vangt geen bruikbare sessie. Dit is de enige opstelling die de claim waarmaakt.",
        },
        {
          n: 3,
          actor: "aanvaller",
          title: "Watch af / spoof",
          body: "Watch af: sessie sterft binnen een seconde (claim). Spoof: onbewezen in ons lab zonder hun anti-spoof-dataset — gedocumenteerd als theoretisch.",
        },
      ],
      outcome: "gedeeltelijk",
      result:
        "Continuous tokens zijn een serieus antwoord op token-replay. Zonder first-class Entra-integratie blijft M365 de zwakke schakel. ECG-spoofing is een open onderzoeksvraag.",
      blockers: "Alleen als Tenbeo vóór of in plaats van de Entra-sessie staat, niet als overlay.",
      theory:
        "Zonder watch-hardware in elke studentgroep: we valideren de token-TTL-claim tegen hun docs en scoren de Entra-integratiekloof expliciet.",
    },
    defenses: {
      blocks: ["Lange-levende cookie replay (als Tenbeo first-class is).", "Shoulder-surfed PIN op een verlaten sessie (sessie sterft)."],
      fails: [
        "AiTM op Entra als Tenbeo alleen sidecar is.",
        "Enrollment/recovery via mail/SMS.",
        "Onbekende PQC-status van hun signatures.",
      ],
    },
    quantum: "kwetsbaar",
    quantumNote:
      "ECG is geen crypto. De per-second tokens zijn ‘advanced cryptography’ — in 2026 vrijwel zeker ECC. Q-day: tokens smeden als de public keys bekend zijn. Geen FIDO-PQC-roadmap. Conservatief: zelfde minpunt, plus vendor-lock-in voor een eventuele migratie.",
    score: { phishing: 6, token: 8, binding: 7, quantum: 3, operationeel: 4, totaal: 6.0 },
    motivation: [
      "Phishing: 6/10. Biometrie is niet typebaar; architectuur A laat Entra-AiTM toe. Geen WebAuthn-origin.",
      "Token: 8/10. Per-second rotatie is de beste replay-mitigatie in deze lijst — als ze first-class is.",
      "Binding: 7/10. Hartslag + wearable. Geen rpId. Wearable is een extra possession-factor.",
      "Quantum: 3/10. Vermoedelijk ECC, geen open PQC-roadmap.",
      "Operationeel: 4/10. Wearable-verplichting, privacy (ECG), vendor, geen Entra-method, GDPR-gevoelig in BE/NL.",
    ],
    primaryFinding: "Per-second tokens tackelen replay. Zonder Entra-native factor blijft M365 phishable.",
  },
];

export function mfaById(id: string) {
  return MFA_METHODS.find((m) => m.id === id);
}
