"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAdminPasswordResetEmail = exports.sendAccountCredentialsEmail = exports.sendOfferLetterEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
// Create Nodemailer Transporter with SMTP fallback or Ethereal test transport
const createTransporter = async () => {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (host && user && pass) {
        return nodemailer_1.default.createTransport({
            host,
            port,
            secure: port === 465,
            auth: { user, pass }
        });
    }
    // Graceful fallback for local development: creates test Ethereal account or stub
    try {
        const testAccount = await nodemailer_1.default.createTestAccount();
        return nodemailer_1.default.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
    }
    catch {
        // Return mock transport if network is isolated
        return nodemailer_1.default.createTransport({
            streamTransport: true,
            newline: 'windows'
        });
    }
};
let cachedTransporter = null;
const getTransporter = async () => {
    if (!cachedTransporter) {
        cachedTransporter = await createTransporter();
    }
    return cachedTransporter;
};
const sendOfferLetterEmail = async (offerLetter, pdfBuffer) => {
    try {
        const transporter = await getTransporter();
        const mailOptions = {
            from: '"Enterprenex HR Operations" <hr@enterprenex.solutions>',
            to: offerLetter.employeeEmail,
            subject: `Offer of Employment: ${offerLetter.designation} at Enterprenex Solutions [Ref: ${offerLetter.offerLetterNo}]`,
            html: `
        <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; line-height: 1.6;">
          <div style="background: #0f172a; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px;">ENTERPRENEX SOLUTIONS PVT LTD</h1>
            <p style="color: #94a3b8; margin: 5px 0 0; font-size: 12px;">Workforce Management System (EWMS)</p>
          </div>

          <div style="padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
            <p>Dear <strong>${offerLetter.employeeName}</strong>,</p>

            <p>We are delighted to extend you an official employment offer for the role of <strong>${offerLetter.designation}</strong> in our <strong>${offerLetter.department}</strong> team at Enterprenex Solutions.</p>

            <div style="background: #f8fafc; border-left: 4px solid #1070c8; padding: 14px; margin: 20px 0; border-radius: 4px;">
              <div><strong>Offer Reference:</strong> ${offerLetter.offerLetterNo}</div>
              <div><strong>Proposed Joining Date:</strong> ${offerLetter.joiningDate}</div>
              <div><strong>Annual Cost to Company (CTC):</strong> ₹${offerLetter.ctcAnnual.toLocaleString('en-IN')}</div>
            </div>

            <p>Please find attached your comprehensive, digitally-signed Offer Letter & Terms of Engagement (PDF).</p>

            <p>To accept or record your decision, please log in to the Enterprenex Candidate Portal:</p>

            <div style="text-align: center; margin: 25px 0;">
              <a href="https://enterprenexsolution.com/admin/offer-letters" style="background: #1070c8; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Review & Confirm Offer Acceptance
              </a>
            </div>

            <p style="font-size: 13px; color: #64748b; margin-top: 30px;">
              Warm regards,<br>
              <strong>Human Resources Division</strong><br>
              Enterprenex Solutions Pvt Ltd<br>
              CIN: U72900PN2026PTC239841
            </p>
          </div>
        </div>
      `,
            attachments: [
                {
                    filename: `Enterprenex_Offer_Letter_${offerLetter.offerLetterNo}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        };
        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email] Offer letter dispatched to ${offerLetter.employeeEmail}: MessageId: ${info.messageId}`);
        return true;
    }
    catch (error) {
        console.error('[Email Error] Failed to send offer letter email:', error);
        return false;
    }
};
exports.sendOfferLetterEmail = sendOfferLetterEmail;
const sendAccountCredentialsEmail = async (employee, temporaryPassword) => {
    try {
        const transporter = await getTransporter();
        const mailOptions = {
            from: '"Enterprenex Security & Access" <security@enterprenex.solutions>',
            to: employee.email,
            subject: `Your EWMS Portal Login Credentials - Enterprenex Solutions`,
            html: `
        <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; line-height: 1.6;">
          <div style="background: #0f172a; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px;">ENTERPRENEX EWMS ACCESS</h1>
            <p style="color: #34d399; margin: 5px 0 0; font-size: 12px;">Corporate Account Activation</p>
          </div>

          <div style="padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
            <p>Hello <strong>${employee.name}</strong>,</p>

            <p>Your onboarding has been formally approved by the Executive Director. Your corporate portal credentials have been provisioned:</p>

            <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 16px; margin: 20px 0; border-radius: 6px;">
              <div style="margin-bottom: 8px;"><strong>Login Portal:</strong> https://enterprenexsolution.com/admin/login</div>
              <div style="margin-bottom: 8px;"><strong>Registered Email / User ID:</strong> <code>${employee.email}</code></div>
              <div style="margin-bottom: 8px;"><strong>Unique Employee ID:</strong> <code>${employee.employeeId || 'N/A'}</code></div>
              <div style="margin-bottom: 8px;"><strong>Assigned Role:</strong> ${employee.role}</div>
              <div><strong>Temporary Password:</strong> <code style="background: #0f172a; color: #34d399; padding: 3px 8px; border-radius: 4px; font-weight: bold;">${temporaryPassword}</code></div>
            </div>

            <p style="font-size: 13px; color: #ef4444; font-weight: bold;">
              Security Requirement: You will be required to configure your permanent private password immediately upon your first sign-in.
            </p>

            <div style="text-align: center; margin: 25px 0;">
              <a href="https://enterprenexsolution.com/admin/login" style="background: #10b981; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Sign In to Enterprise Workspace
              </a>
            </div>
          </div>
        </div>
      `
        };
        await transporter.sendMail(mailOptions);
        return true;
    }
    catch (error) {
        console.error('[Email Error] Failed to send credentials email:', error);
        return false;
    }
};
exports.sendAccountCredentialsEmail = sendAccountCredentialsEmail;
/**
 * Dispatches a high-priority, secure administrative password-reset email for Director and HR accounts.
 * Always dispatches directly to the corporate recovery address: enxproductofficial@gmail.com
 */
const sendAdminPasswordResetEmail = async (params) => {
    const { adminName, adminEmail, adminRole, resetLink, ipAddress = 'Unknown IP', expiresMinutes = 15 } = params;
    const targetRecoveryEmail = process.env.ADMIN_RECOVERY_EMAIL || 'enxproductofficial@gmail.com';
    try {
        const transporter = await getTransporter();
        const mailOptions = {
            from: '"Enterprenex Corporate Security" <security@enterprenex.solutions>',
            to: targetRecoveryEmail,
            subject: `[EWMS Security] Password Reset Request: ${adminRole} (${adminEmail})`,
            html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; line-height: 1.6; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
            <div style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">ENTERPRENEX SOLUTIONS</div>
            <div style="color: #38bdf8; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;">
              Enterprise Workforce Management Suite (EWMS)
            </div>
            <div style="display: inline-block; background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #fca5a5; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 9999px; margin-top: 10px;">
              CONFIDENTIAL • ADMINISTRATIVE SECURITY NOTIFICATION
            </div>
          </div>

          <div style="padding: 32px 28px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; margin-top: 0;">
              Hello <strong>${adminName}</strong>,
            </p>

            <p style="color: #475569; font-size: 14px;">
              A formal request has been received to reset the security password for your <strong>${adminRole}</strong> portal account on the Enterprenex EWMS platform.
            </p>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #1070c8; padding: 16px; margin: 24px 0; border-radius: 6px;">
              <div style="font-size: 13px; margin-bottom: 6px;"><strong>Target Account:</strong> <code style="color: #0f172a; font-weight: 700;">${adminEmail}</code></div>
              <div style="font-size: 13px; margin-bottom: 6px;"><strong>Administrative Role:</strong> ${adminRole}</div>
              <div style="font-size: 13px; margin-bottom: 6px;"><strong>Request Timestamp:</strong> ${new Date().toUTCString()}</div>
              <div style="font-size: 13px;"><strong>Originating IP:</strong> <code>${ipAddress}</code></div>
            </div>

            <p style="color: #475569; font-size: 14px;">
              To configure a new password and restore full access to your workspace, click the button below:
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background: #1070c8; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(16, 112, 200, 0.35);">
                Create New Password →
              </a>
            </div>

            <p style="font-size: 12px; color: #64748b; word-break: break-all;">
              Or copy and paste this secure link into your browser:<br>
              <a href="${resetLink}" style="color: #1070c8;">${resetLink}</a>
            </p>

            <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 6px; padding: 12px; margin-top: 24px;">
              <div style="font-size: 12px; color: #9a3412; font-weight: 700; margin-bottom: 4px;">
                ⚠️ CRITICAL SECURITY PROTOCOLS:
              </div>
              <ul style="font-size: 12px; color: #7c2d12; margin: 0; padding-left: 18px; line-height: 1.5;">
                <li>This link will automatically expire in <strong>${expiresMinutes} minutes</strong>.</li>
                <li>This is a <strong>single-use token</strong>: once used, it cannot be reused.</li>
                <li>Existing sessions are immediately revoked upon password update.</li>
                <li>If you did not initiate this request, your current password is completely safe. No action is required.</li>
              </ul>
            </div>

            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 28px 0;" />

            <p style="font-size: 12px; color: #94a3b8; margin: 0; text-align: center;">
              Enterprenex Solutions Pvt Ltd • Enterprise Workforce Governance<br>
              Official Inquiries: <a href="mailto:contact@enterprenex.solutions" style="color: #64748b;">contact@enterprenex.solutions</a>
            </p>
          </div>
        </div>
      `
        };
        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email] Admin password reset link dispatched to ${targetRecoveryEmail} for ${adminEmail}: MessageId: ${info.messageId}`);
        return true;
    }
    catch (error) {
        console.error('[Email Error] Failed to send admin password reset email:', error);
        return false;
    }
};
exports.sendAdminPasswordResetEmail = sendAdminPasswordResetEmail;
