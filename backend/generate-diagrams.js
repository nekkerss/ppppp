/**
 * generate-diagrams.js
 * Run from:  projectpfe/backend/
 * Command:   node generate-diagrams.js
 * Output:    BNA-Assurances-Diagrams.pdf  (same directory)
 *
 * Requires:  pdfkit (already in package.json)
 *            Internet access (fetches PNGs from plantuml.com)
 */

'use strict';

const https    = require('https');
const http     = require('http');
const zlib     = require('zlib');
const fs       = require('fs');
const path     = require('path');
const PDFDoc   = require('pdfkit');

// ─────────────────────────────────────────────────────────────────────────────
//  PlantUML encoding  (deflateRaw → custom base-64)
// ─────────────────────────────────────────────────────────────────────────────

function encode6bit(b) {
  if (b < 10) return String.fromCharCode(48 + b);
  b -= 10;
  if (b < 26) return String.fromCharCode(65 + b);
  b -= 26;
  if (b < 26) return String.fromCharCode(97 + b);
  b -= 26;
  if (b === 0) return '-';
  if (b === 1) return '_';
  return '?';
}

function append3(b1, b2, b3) {
  return (
    encode6bit( b1 >> 2) +
    encode6bit(((b1 & 0x3) << 4) | (b2 >> 4)) +
    encode6bit(((b2 & 0xF) << 2) | (b3 >> 6)) +
    encode6bit(  b3 & 0x3F)
  );
}

function toBase64(buf) {
  let out = '';
  for (let i = 0; i < buf.length; i += 3) {
    out += (i + 2 === buf.length) ? append3(buf[i], buf[i + 1], 0)
         : (i + 1 === buf.length) ? append3(buf[i], 0, 0)
         :                          append3(buf[i], buf[i + 1], buf[i + 2]);
  }
  return out;
}

function encodePuml(text) {
  return new Promise((resolve, reject) => {
    zlib.deflateRaw(Buffer.from(text, 'utf8'), { level: 9 }, (err, buf) => {
      err ? reject(err) : resolve(toBase64(buf));
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  HTTP fetch  (follows redirects)
// ─────────────────────────────────────────────────────────────────────────────

function fetchBuffer(url, redirects = 5) {
  return new Promise((resolve, reject) => {
    if (redirects === 0) return reject(new Error('Too many redirects'));
    const lib = url.startsWith('https') ? https : http;
    lib.get(url, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
        return fetchBuffer(res.headers.location, redirects - 1)
          .then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end',  () => resolve(Buffer.concat(chunks)));
      res.on('error',    reject);
    }).on('error', reject);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  PlantUML diagram texts
// ─────────────────────────────────────────────────────────────────────────────

const CLASS_DIAGRAM = `
@startuml ClassDiagram
title BNA Assurances — Class Diagram

skinparam classAttributeIconSize 0
skinparam classBorderColor #1a365d
skinparam classBackgroundColor #f0f7ff
skinparam classHeaderBackgroundColor #1a365d
skinparam classHeaderFontColor #ffffff
skinparam arrowColor #00a67e
skinparam noteBorderColor #00a67e
skinparam noteBackgroundColor #effaf5
skinparam linetype ortho

enum Role {
  user
  admin
  gestionnaire
}

enum ContractStatus {
  en_attente
  actif
  expire
  refuse
}

enum ClaimStatus {
  en_attente
  accepte
  refuse
}

enum SinistreType {
  sante
  voyage
  auto
  batiment
}

enum ContractType {
  auto
  home
  health
  travel
  life
}

class User {
  - _id               : ObjectId
  + name              : String
  + CIN               : String <<unique>>
  + email             : String <<unique>>
  + phone             : Number
  - password          : String <<hashed>>
  + role              : Role
  + emailVerified     : Boolean
  - verificationCode  : String
  - resetPasswordToken: String
  + avatar            : String
  + createdAt         : Date
  --
  + register()
  + login() : JWT
  + verifyEmail()
  + forgotPassword()
  + resetPassword()
  + updateProfile()
  + uploadAvatar()
}

class Contract {
  - _id             : ObjectId
  + contractNumber  : String <<unique>>
  + type            : ContractType
  + startDate       : Date
  + endDate         : Date
  + status          : ContractStatus
  + address         : String
  + age             : Number
  + contactNumber   : String
  + durationMonths  : Number
  + rejectionReason : String
  + paymentStatus   : String
  + paymentMethod   : String
  + createdAt       : Date
  --
  + create()
  + update()
  + renew()
  + cancel()
  + pay()
  + review()
  + generatePDF()
}

class Claim {
  - _id             : ObjectId
  + sinistreType    : SinistreType
  + fullName        : String
  + cinNumber       : String
  + gsm             : String
  + immatriculation : String
  + voyageSubType   : String
  + santeSubType    : String
  + batimentSubType : String
  + description     : String
  + status          : ClaimStatus
  + rejectionReason : String
  + files           : FileMap
  + date            : Date
  --
  + create()
  + updateStatus()
  + update()
  + delete()
}

class FileMap {
  + attestationTiers       : String
  + constat                : String
  + photoVehicule          : String
  + cinPasseport           : String
  + billetsAvion           : String
  + feuilleSoins           : String
  + rapportMedical         : String
  + facturesOriginales     : String
  + photosDegats           : String
  + rapportExpert          : String
}

class Quote {
  - _id        : ObjectId
  + type       : ContractType
  + prix       : Number
  + parametres : Object
  + explication: String
  + createdAt  : Date
  --
  + estimatePrice()
  + create()
  + generatePDF()
}

class Document {
  - _id      : ObjectId
  + fileUrl  : String
  + type     : String
  + createdAt: Date
  --
  + upload()
  + download()
  + delete()
}

class Message {
  - _id      : ObjectId
  + content  : String
  + read     : Boolean
  + createdAt: Date
  --
  + send()
  + markAsRead()
  + getConversations()
  + deleteConversation()
}

class Notification {
  - _id      : ObjectId
  + message  : String
  + read     : Boolean
  + createdAt: Date
  --
  + create()
  + markAsRead()
}

class AuthService {
  - JWT_SECRET  : String
  - SALT_ROUNDS : Number
  --
  + hashPassword()   : String
  + comparePassword(): Boolean
  + generateJWT()    : String
  + verifyJWT()      : Payload
  + generateCode()   : String
  + sendEmail()
}

User       "1" --> "0..*" Contract     : owns >
User       "1" --> "0..*" Claim        : submits >
User       "1" --> "0..*" Quote        : requests >
User       "1" --> "0..*" Document     : uploads >
User       "1" --> "0..*" Notification : receives >
User       "1" --> "0..*" Message      : sends >
User       "1" --> "0..*" Message      : receives >
Contract   "1" --> "0..*" Claim        : referenced by >
Claim      "1" *-- "1"   FileMap       : contains
Document "0..*" --> "0..1" Claim       : linked to >
User        ..>  AuthService           : authenticated by

note right of AuthService
  JWT in Authorization: Bearer <token>
  Roles enforced by roleMiddleware
end note

note bottom of Quote
  prix calculated by AI engine.
  explication is AI-generated.
end note

@enduml
`.trim();

const SEQUENCE_DIAGRAM = `
@startuml SequenceDiagram
title BNA Assurances — Sequence Diagram: Client Submits a Claim (Sinistre)

skinparam sequenceArrowThickness 2
skinparam sequenceParticipantBorderColor #1a365d
skinparam sequenceParticipantBackgroundColor #f0f7ff
skinparam sequenceActorBorderColor #1a365d
skinparam sequenceGroupBorderColor #00a67e
skinparam noteBorderColor #00a67e
skinparam noteBackgroundColor #effaf5

actor       "Client"              as C
participant "React Frontend"      as FE
participant "AuthMiddleware\\n(JWT)" as AM
participant "ClaimController"     as CC
participant "ContractController"  as ConC
database    "MongoDB"             as DB
participant "NotificationSvc"     as NS
participant "EmailService"        as ES

== 1. Load Claims Page ==

C  -> FE  : Navigate to /claims
FE -> AM  : GET /claims [Bearer <JWT>]
AM -> DB  : Verify JWT, find User
DB --> AM : User { id, role }
AM --> FE : req.user attached
FE -> DB  : GET /contracts (user's active contracts)
DB --> FE : Contract[]
FE --> C  : Render claims list + contracts dropdown

== 2. Open Claim Form ==

C  -> FE  : Click "Declarer un sinistre"
FE --> C  : Show modal (contract selector, type, files)

== 3. Client-Side Validation ==

C  -> FE  : Fill form + attach files
FE -> FE  : validate()
note right of FE
  Checks:
  - contract selected?
  - description filled?
  - required files present?
  - file type/size OK?
end note

alt Validation fails
  FE --> C : Show inline errors
else Validation passes
  FE --> C : Enable Submit button
end

== 4. Submit to Backend ==

C  -> FE  : Click "Soumettre"
FE -> AM  : POST /claims\\nmultipart/form-data [Bearer <JWT>]\\n{ contractId, sinistreType, subType,\\n  fullName, cinNumber, gsm,\\n  description, files[] }
AM -> DB  : Find User by JWT id
DB --> AM : User OK
AM --> CC : Pass request

== 5. Backend Processing ==

CC -> CC  : Extract & validate body
CC -> CC  : multer saves files to /uploads/
CC -> DB  : findById(contractId) verify ownership
DB --> CC : Contract { id, type, status }

alt Contract not found
  CC --> FE : 403 Forbidden
  FE --> C  : Error message
else Contract valid
  CC -> DB  : Claim.create({\\n  userId, contractId, sinistreType,\\n  description, files{}, status:"en attente"\\n})
  DB --> CC : Claim { _id }
end

== 6. Notifications ==

CC -> NS  : createNotification({\\n  userId: adminId,\\n  message: "Nouveau sinistre - " + userName\\n})
NS -> DB  : Notification.create(...)
CC -> ES  : sendEmail to gestionnaire
CC --> FE : HTTP 201 { claim: { _id, status } }
FE --> C  : Success toast + updated claim list

== 7. Gestionnaire Reviews ==

actor "Gestionnaire" as G

G  -> FE  : Navigate to /gestionnaire/sinistres [Bearer <JWT>]
AM -> DB  : Verify token, role = gestionnaire
FE --> G  : All claims list

G  -> FE  : Open claim, select "Accepte"
FE -> AM  : PATCH /claims/<id>/status\\n{ status: "accepte" }
AM --> CC : Token valid, role OK
CC -> DB  : Claim.findByIdAndUpdate(_id, { status })
DB --> CC : Updated Claim
CC -> NS  : Notify client "Sinistre accepte"
NS -> DB  : Notification.create({ userId: client })
CC --> FE : HTTP 200 { claim: { status: "accepte" } }
FE --> G  : Badge updated

@enduml
`.trim();

const USECASE_DIAGRAM = `
@startuml UseCaseDiagram
title BNA Assurances — Use Case Diagram

skinparam actorBorderColor #1a365d
skinparam actorBackgroundColor #e8f4fd
skinparam usecaseBorderColor #1a365d
skinparam usecaseBackgroundColor #f0f7ff
skinparam arrowColor #1a365d
skinparam packageBorderColor #00a67e

left to right direction

actor "Client (User)"  as Client
actor "Gestionnaire"   as Gest
actor "Admin"          as Admin
actor "AI Engine"      as AI    #technology
actor "Email Service"  as Email #technology

Admin -|> Gest

package "Authentication" {
  usecase "Register"             as UC_Reg
  usecase "Verify Email"         as UC_Verify
  usecase "Login"                as UC_Login
  usecase "Forgot Password"      as UC_ForgotPwd
  usecase "Reset Password"       as UC_ResetPwd
  usecase "Logout"               as UC_Logout
}

Client --> UC_Reg
Client --> UC_Login
Client --> UC_Verify
Client --> UC_ForgotPwd
Client --> UC_ResetPwd
Client --> UC_Logout
UC_Reg       ..> UC_Verify    : <<include>>
UC_ForgotPwd ..> UC_ResetPwd  : <<include>>
UC_Reg       ..> Email        : <<include>>
UC_ForgotPwd ..> Email        : <<include>>

package "Contracts" {
  usecase "View My Contracts"    as UC_ViewC
  usecase "Create Contract"      as UC_CreateC
  usecase "Pay Contract"         as UC_PayC
  usecase "Renew Contract"       as UC_Renew
  usecase "Cancel Contract"      as UC_Cancel
  usecase "Download Contract PDF" as UC_CPDF
  usecase "Approve / Reject Contract" as UC_Review
  usecase "View All Contracts"   as UC_AllC
}

Client --> UC_ViewC
Client --> UC_CreateC
Client --> UC_PayC
Client --> UC_Renew
Client --> UC_Cancel
Client --> UC_CPDF
Gest   --> UC_AllC
Gest   --> UC_Review
UC_Review ..> UC_AllC : <<include>>

package "Quotes (Devis)" {
  usecase "Request a Quote"      as UC_ReqQ
  usecase "AI Price Estimation"  as UC_AIP
  usecase "View My Quotes"       as UC_ViewQ
  usecase "Download Quote PDF"   as UC_QPDF
}

Client --> UC_ReqQ
Client --> UC_ViewQ
Client --> UC_QPDF
UC_ReqQ ..> UC_AIP : <<include>>
AI      --> UC_AIP

package "Claims (Sinistres)" {
  usecase "Submit a Claim"       as UC_Sub
  usecase "Upload Evidence Files" as UC_Files
  usecase "View My Claims"       as UC_ViewCl
  usecase "Delete Pending Claim" as UC_DelCl
  usecase "View All Claims"      as UC_AllCl
  usecase "Update Claim Status"  as UC_Status
}

Client --> UC_Sub
Client --> UC_ViewCl
Client --> UC_DelCl
Gest   --> UC_AllCl
Gest   --> UC_Status
UC_Sub    ..> UC_Files  : <<include>>
UC_Status ..> UC_AllCl  : <<include>>

package "Documents" {
  usecase "Upload Document"      as UC_UpD
  usecase "View Documents"       as UC_ViewD
  usecase "Preview / Download"   as UC_DLDoc
  usecase "Delete Document"      as UC_DelD
  usecase "Link to Claim"        as UC_LinkD
}

Client --> UC_UpD
Client --> UC_ViewD
Client --> UC_DLDoc
Client --> UC_DelD
UC_UpD ..> UC_LinkD : <<extend>>

package "Messaging" {
  usecase "Send Message"         as UC_Send
  usecase "View Conversations"   as UC_Conv
  usecase "Delete Conversation"  as UC_DelConv
}

Client --> UC_Send
Client --> UC_Conv
Client --> UC_DelConv
Gest   --> UC_Send
Gest   --> UC_Conv

package "Profile" {
  usecase "Edit Profile"         as UC_EditP
  usecase "Change Password"      as UC_ChgPwd
  usecase "Upload Avatar"        as UC_Avt
  usecase "View Notifications"   as UC_Notif
}

Client --> UC_EditP
Client --> UC_ChgPwd
Client --> UC_Avt
Client --> UC_Notif

package "Admin — User Management" {
  usecase "View All Accounts"    as UC_ViewU
  usecase "Change User Role"     as UC_ChgRole
  usecase "Toggle Verification"  as UC_TogV
  usecase "Delete User Account"  as UC_DelU
}

Admin --> UC_ViewU
Admin --> UC_ChgRole
Admin --> UC_TogV
Admin --> UC_DelU

package "Dashboard" {
  usecase "Client Dashboard\\n(KPIs, activity)" as UC_CDash
  usecase "Admin Dashboard\\n(users, stats)"    as UC_ADash
}

Client --> UC_CDash
Admin  --> UC_ADash

package "Public Pages" {
  usecase "Home Page"            as UC_Home
  usecase "Service Details"      as UC_Svc
  usecase "Actualites (News)"    as UC_News
  usecase "About / Contact"      as UC_About
}

Client --> UC_Home
Client --> UC_Svc
Client --> UC_News
Client --> UC_About

@enduml
`.trim();

// ─────────────────────────────────────────────────────────────────────────────
//  PDF generation
// ─────────────────────────────────────────────────────────────────────────────

const DIAGRAMS = [
  { title: 'Class Diagram',    subtitle: 'Models, attributes, methods and relationships', puml: CLASS_DIAGRAM    },
  { title: 'Sequence Diagram', subtitle: 'Client submits a claim — full interaction flow',  puml: SEQUENCE_DIAGRAM },
  { title: 'Use Case Diagram', subtitle: 'All actors and system use cases',                  puml: USECASE_DIAGRAM  },
];

const PRIMARY   = '#1a365d';
const SECONDARY = '#00a67e';
const TEXT      = '#1e293b';
const MUTED     = '#64748b';

async function buildPDF() {
  const outputFile = path.join(__dirname, 'BNA-Assurances-Diagrams.pdf');

  const doc = new PDFDoc({
    size:    'A3',
    layout:  'landscape',
    margins: { top: 40, bottom: 40, left: 50, right: 50 },
    info: {
      Title:    'BNA Assurances — UML Diagrams',
      Author:   'BNA Assurances System',
      Subject:  'System Architecture Diagrams',
      Creator:  'generate-diagrams.js',
    },
  });

  const out = fs.createWriteStream(outputFile);
  doc.pipe(out);

  const W = doc.page.width  - 100;  // usable width
  const H = doc.page.height - 80;   // usable height

  // ── Cover page ──────────────────────────────────────────────────────────────

  // Background band
  doc.rect(0, 0, doc.page.width, 180).fill(PRIMARY);

  doc.fillColor('#ffffff')
     .fontSize(36).font('Helvetica-Bold')
     .text('BNA Assurances', 50, 55, { align: 'center', width: doc.page.width - 100 });

  doc.fontSize(16).font('Helvetica')
     .text('System Architecture — UML Diagrams', 50, 105, { align: 'center', width: doc.page.width - 100 });

  // Green accent line
  doc.rect(0, 180, doc.page.width, 5).fill(SECONDARY);

  // Table of contents
  doc.fillColor(TEXT).font('Helvetica-Bold').fontSize(14)
     .text('Contents', 50, 220);

  const tocItems = [
    '1.  Class Diagram              — Models, attributes, methods and relationships',
    '2.  Sequence Diagram           — Client submits a claim (full backend/DB flow)',
    '3.  Use Case Diagram           — All actors: Client, Gestionnaire, Admin',
  ];

  doc.font('Helvetica').fontSize(12).fillColor(MUTED);
  tocItems.forEach((item, i) => {
    doc.text(item, 70, 255 + i * 30);
  });

  // Footer info
  doc.rect(0, doc.page.height - 60, doc.page.width, 60).fill('#f8fafc');
  doc.fillColor(MUTED).fontSize(10).font('Helvetica')
     .text(
       `Generated on ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}   •   PlantUML diagrams   •   BNA Assurances`,
       50, doc.page.height - 38,
       { align: 'center', width: doc.page.width - 100 }
     );

  // ── Diagram pages ────────────────────────────────────────────────────────────

  for (let i = 0; i < DIAGRAMS.length; i++) {
    const { title, subtitle, puml } = DIAGRAMS[i];

    console.log(`\n[${i + 1}/${DIAGRAMS.length}] Encoding "${title}"...`);
    const encoded = await encodePuml(puml);
    const url     = `https://www.plantuml.com/plantuml/png/${encoded}`;

    console.log(`    Fetching PNG from PlantUML server...`);
    let imgBuf;
    try {
      imgBuf = await fetchBuffer(url);
    } catch (err) {
      console.error(`    ERROR fetching image: ${err.message}`);
      process.exit(1);
    }
    console.log(`    OK — ${Math.round(imgBuf.length / 1024)} KB`);

    doc.addPage();

    // Header band
    doc.rect(0, 0, doc.page.width, 70).fill(PRIMARY);
    doc.rect(0, 70, doc.page.width, 4).fill(SECONDARY);

    // Page number badge
    doc.circle(doc.page.width - 65, 35, 22).fill(SECONDARY);
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(18)
       .text(`${i + 1}`, doc.page.width - 80, 26, { width: 30, align: 'center' });

    // Title + subtitle
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(20)
       .text(title, 50, 18, { width: doc.page.width - 130 });
    doc.font('Helvetica').fontSize(11).fillColor('#cbd5e1')
       .text(subtitle, 50, 46, { width: doc.page.width - 130 });

    // Diagram image — centred in remaining space
    const imgY      = 90;
    const imgH      = doc.page.height - imgY - 50;
    const imgW      = doc.page.width  - 100;

    doc.image(imgBuf, 50, imgY, {
      fit:    [imgW, imgH],
      align:  'center',
      valign: 'top',
    });

    // Footer
    doc.rect(0, doc.page.height - 40, doc.page.width, 40).fill('#f8fafc');
    doc.fillColor(MUTED).font('Helvetica').fontSize(9)
       .text(
         `BNA Assurances — UML Diagrams   •   Page ${i + 2}`,
         50, doc.page.height - 26,
         { align: 'center', width: doc.page.width - 100 }
       );
  }

  doc.end();

  return new Promise((resolve, reject) => {
    out.on('finish', () => resolve(outputFile));
    out.on('error',  reject);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  Entry point
// ─────────────────────────────────────────────────────────────────────────────

buildPDF()
  .then(file => {
    console.log(`\n✓ PDF created successfully:`);
    console.log(`  ${file}`);
  })
  .catch(err => {
    console.error('\n✗ Failed to generate PDF:', err.message);
    process.exit(1);
  });
