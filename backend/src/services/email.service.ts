import nodemailer from 'nodemailer';

// Create Nodemailer Transporter with SMTP fallback or Ethereal test transport
const createTransporter = async () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  }

  // Graceful fallback for local development: creates test Ethereal account or stub
  try {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  } catch {
    // Return mock transport if network is isolated
    return nodemailer.createTransport({
      streamTransport: true,
      newline: 'windows'
    });
  }
};

let cachedTransporter: any = null;

const getTransporter = async () => {
  if (!cachedTransporter) {
    cachedTransporter = await createTransporter();
  }
  return cachedTransporter;
};

export const sendOfferLetterEmail = async (
  offerLetter: {
    offerLetterNo: string;
    employeeName: string;
    employeeEmail: string;
    designation: string;
    department: string;
    joiningDate: string;
    ctcAnnual: number;
  },
  pdfBuffer: Buffer
): Promise<boolean> => {
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
  } catch (error) {
    console.error('[Email Error] Failed to send offer letter email:', error);
    return false;
  }
};

export const sendAccountCredentialsEmail = async (
  employee: {
    name: string;
    email: string;
    role: string;
    employeeId?: string | null;
  },
  temporaryPassword: string
): Promise<boolean> => {
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
  } catch (error) {
    console.error('[Email Error] Failed to send credentials email:', error);
    return false;
  }
};
