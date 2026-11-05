import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

export interface OfferLetterData {
  offerLetterNo: string;
  employeeName: string;
  employeeEmail: string;
  employeeId?: string | null;
  department: string;
  designation: string;
  joiningDate: string;
  employmentType: string;
  salaryMonthly: number;
  ctcAnnual: number;
  probationPeriod: string;
  termsAndConditions: string;
  status: string;
  directorApprovedBy?: string | null;
  directorApprovedAt?: string | Date | null;
  respondedAt?: string | Date | null;
  createdAt: string | Date;
  candidateAddress?: string | null;
  placeOfJoining?: string | null;
  workMode?: string | null;
  workingHours?: string | null;
  workingDays?: string | null;
  reportingManager?: string | null;
  signatoryName?: string | null;
  signatoryRole?: string | null;
  signatoryDepartment?: string | null;
}

// Helper: load circular Enterprenex logo as base64
function getLogoBase64(): string {
  try {
    const possiblePaths = [
      path.resolve(__dirname, '../../../frontend/public/images/enterprenex-logo.png'),
      path.resolve(__dirname, '../../../../frontend/public/images/enterprenex-logo.png'),
      path.resolve(process.cwd(), 'frontend/public/images/enterprenex-logo.png'),
      path.resolve(process.cwd(), '../frontend/public/images/enterprenex-logo.png')
    ];
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        return fs.readFileSync(p).toString('base64');
      }
    }
  } catch (err) {
    console.warn('Could not read logo image file:', err);
  }
  return '';
}

export const generateOfferLetterPdf = async (offer: OfferLetterData): Promise<Buffer> => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--disable-extensions'
    ]
  });

  try {
    const page = await browser.newPage();
    const logoBase64 = getLogoBase64();

    // Format Date: e.g. "17 Oct 2026"
    const dateObj = new Date(offer.createdAt);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString('en-US', { month: 'short' });
    const year = dateObj.getFullYear();
    const formattedDate = `${day} ${month} ${year}`;

    const isInternship = true;
    const department = offer.department && offer.department !== 'Engineering' ? offer.department : 'IT';
    const durationText = offer.probationPeriod || '3 (Three) Months from the Date of Joining';
    const reportingTo = offer.reportingManager || 'Rohit pawar';
    const placeOfJoining = offer.placeOfJoining || 'chh sambhajinagar,Maharashtra,india';
    const workMode = offer.workMode || 'online';
    const workingHours = offer.workingHours || '4 to 6 hours per day, as assigned by the Reporting Manager';
    const workingDays = offer.workingDays || 'Monday - saturday';
    const address = offer.candidateAddress || 'Burdwan, West Bengal';
    const formatJoiningDate = (raw?: string | null): string => {
      if (!raw) {
        const today = new Date();
        const d = String(today.getDate()).padStart(2, '0');
        const m = today.toLocaleString('en-US', { month: 'short' });
        const y = today.getFullYear();
        return `${d}${m}${y}`;
      }
      if (/^\d{1,2}[A-Za-z]{3}\d{4}$/.test(raw.trim())) {
        return raw.trim();
      }
      const parsed = new Date(raw);
      if (!isNaN(parsed.getTime())) {
        const d = String(parsed.getDate()).padStart(2, '0');
        const m = parsed.toLocaleString('en-US', { month: 'short' });
        const y = parsed.getFullYear();
        return `${d}${m}${y}`;
      }
      return raw;
    };

    const startDate = formatJoiningDate(offer.joiningDate);
    const stipendText = 'This is an unpaid internship. No monetary compensation shall be provided for the duration of the internship.';

    // Signatory resolution
    const signatoryName = offer.signatoryName || 'Rohit Pawar';
    const signatoryRole = offer.signatoryRole || 'Operations Officer';
    const signatoryDepartment = offer.signatoryDepartment || 'HR Team, Enterprenex Solutions Pvt Ltd';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Offer Letter - ${offer.offerLetterNo}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 18mm 12mm 18mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Times New Roman', Times, serif;
      color: #1a1a1a;
      background: #ffffff;
      font-size: 9pt;
      line-height: 1.45;
      -webkit-font-smoothing: antialiased;
    }

    .page {
      width: 100%;
      position: relative;
      box-sizing: border-box;
    }

    .page-1 {
      page-break-after: always;
      break-after: page;
    }

    .page-2 {
      page-break-after: avoid;
      break-after: avoid;
    }

    /* ── HEADER ── */
    .header {
      text-align: center;
      margin-bottom: 4px;
    }

    .logo-img {
      width: 58px;
      height: 58px;
      margin: 0 auto 4px auto;
      display: block;
      object-fit: contain;
    }

    .company-title {
      font-family: 'Cinzel', 'Times New Roman', Georgia, serif;
      font-size: 13pt;
      font-weight: 800;
      letter-spacing: 0.8px;
      color: #0f172a;
      margin-bottom: 1px;
    }

    .company-web {
      font-size: 8pt;
      font-style: italic;
      color: #475569;
      margin-bottom: 8px;
    }

    .gold-bar {
      height: 2.5px;
      background: #c28b38;
      width: 100%;
      margin-bottom: 10px;
    }

    /* ── FOOTER ── */
    .footer {
      margin-top: 16px;
      padding-top: 6px;
      text-align: center;
    }

    .footer-bar {
      height: 2px;
      background: #c28b38;
      width: 100%;
      margin-bottom: 6px;
    }

    .footer-contact {
      font-size: 7.6pt;
      color: #475569;
      line-height: 1.35;
    }

    /* ── PAGE 1 CONTENT ── */
    .date-row {
      text-align: right;
      font-weight: 700;
      font-size: 9.2pt;
      color: #0f172a;
      margin-bottom: 12px;
    }

    .to-block {
      font-size: 9.2pt;
      line-height: 1.4;
      margin-bottom: 14px;
      color: #0f172a;
    }

    .to-block strong {
      font-weight: 700;
    }

    .offer-title {
      text-align: center;
      font-size: 11pt;
      font-weight: 800;
      letter-spacing: 0.6px;
      color: #0f172a;
      text-decoration: underline;
      margin-bottom: 14px;
    }

    .salutation {
      font-weight: 700;
      font-size: 9.2pt;
      color: #0f172a;
      margin-bottom: 10px;
    }

    .intro-p {
      font-size: 9pt;
      line-height: 1.45;
      color: #1f2937;
      text-align: justify;
      margin-bottom: 14px;
    }

    .section-heading {
      font-size: 9.8pt;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: #0f172a;
      margin-bottom: 2px;
    }

    .section-line {
      height: 1px;
      background: #0f172a;
      width: 100%;
      margin-bottom: 8px;
    }

    .details-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.8pt;
      line-height: 1.5;
      margin-bottom: 12px;
    }

    .details-table td {
      padding: 1.5px 0;
      vertical-align: top;
    }

    .details-table td.lbl {
      font-weight: 700;
      color: #0f172a;
      width: 25%;
    }

    .details-table td.val {
      color: #1f2937;
      width: 75%;
    }

    .policy-list {
      padding-left: 18px;
      margin: 0;
      font-size: 8.7pt;
      line-height: 1.45;
      color: #1f2937;
    }

    .policy-list li {
      margin-bottom: 4px;
      text-align: justify;
    }

    .acceptance-p {
      font-size: 8.8pt;
      line-height: 1.45;
      color: #1f2937;
      margin-bottom: 10px;
    }

    .signatory-block {
      margin-top: 14px;
      margin-bottom: 22px;
      font-size: 9.2pt;
      line-height: 1.35;
    }

    .signatory-firm {
      font-weight: 600;
      margin-bottom: 14px;
      color: #0f172a;
    }

    .signatory-name {
      font-size: 10pt;
      font-weight: 800;
      color: #0f172a;
    }

    .signatory-role {
      font-size: 8.8pt;
      font-weight: 600;
      color: #334155;
    }

    .signatory-dept {
      font-size: 8.4pt;
      color: #475569;
    }

    .acceptance-form {
      font-size: 9pt;
      line-height: 2.1;
      color: #0f172a;
    }
  </style>
</head>
<body>

  <!-- ═══════════════════════════════════════════════════════════════ -->
  <!-- PAGE 1 -->
  <!-- ═══════════════════════════════════════════════════════════════ -->
  <div class="page page-1">
    <div class="header">
      ${logoBase64 ? `<img src="data:image/png;base64,${logoBase64}" class="logo-img" alt="Enterprenex Solutions" />` : ''}
      <div class="company-title">ENTERPRENEX SOLUTIONS PVT LTD</div>
      <div class="company-web">www.enterprenexsolution.com</div>
      <div class="gold-bar"></div>
    </div>

    <div class="date-row">Date:${formattedDate}</div>

    <div class="to-block">
      <strong>To,</strong><br>
      <strong>${offer.employeeName.toUpperCase()}</strong><br>
      <span>${address}</span>
    </div>

    <div class="offer-title">
      OFFER LETTER FOR INTERNSHIP
    </div>

    <div class="salutation">Dear ${offer.employeeName.toUpperCase()},</div>

    <p class="intro-p">
      We are pleased to offer you the position of <strong>${offer.designation}</strong> at Enterprenex Solutions Pvt Ltd. We were impressed with your profile during the selection process and believe you will be a valuable addition to our team. Please find below the terms and conditions of your internship.
    </p>

    <div class="section-heading">INTERNSHIP DETAILS</div>
    <div class="section-line"></div>

    <table class="details-table">
      <tbody>
        <tr>
          <td class="lbl">Intern Name:</td>
          <td class="val"><strong>${offer.employeeName.toUpperCase()}</strong></td>
        </tr>
        <tr>
          <td class="lbl">Intern ID:</td>
          <td class="val">${offer.employeeId || offer.offerLetterNo}</td>
        </tr>
        <tr>
          <td class="lbl">Position / Role:</td>
          <td class="val">${offer.designation}</td>
        </tr>
        <tr>
          <td class="lbl">Department:</td>
          <td class="val">${department}</td>
        </tr>
        <tr>
          <td class="lbl">Reporting To:</td>
          <td class="val">${reportingTo}</td>
        </tr>
        <tr>
          <td class="lbl">Place of Joining:</td>
          <td class="val">${placeOfJoining}</td>
        </tr>
        <tr>
          <td class="lbl">Work Mode:</td>
          <td class="val">${workMode}</td>
        </tr>
        <tr>
          <td class="lbl">Duration:</td>
          <td class="val">${durationText}</td>
        </tr>
        <tr>
          <td class="lbl">Start Date:</td>
          <td class="val">${startDate}</td>
        </tr>
        <tr>
          <td class="lbl">Working Hours:</td>
          <td class="val">${workingHours}</td>
        </tr>
        <tr>
          <td class="lbl">Working Days:</td>
          <td class="val">${workingDays}</td>
        </tr>
        <tr>
          <td class="lbl">Stipend:</td>
          <td class="val">${stipendText}</td>
        </tr>
      </tbody>
    </table>

    <div class="section-heading" style="margin-top: 6px;">TERMS & GENERAL POLICIES</div>
    <div class="section-line"></div>

    <ul class="policy-list">
      <li>This ${isInternship ? 'internship' : 'employment'} is for a fixed period of ${durationText} from the date of joining and may be extended or converted into a full-time offer at the sole discretion of the Company, based on performance.</li>
      <li>The ${isInternship ? 'intern' : 'employee'} is expected to maintain regular attendance and complete assigned tasks within the given deadlines with due diligence and professionalism.</li>
      <li>The ${isInternship ? 'intern' : 'employee'} shall report to their designated Reporting Manager / Department Lead and follow the task and reporting structure communicated to them.</li>
      <li>All work, content, code, designs, strategies, documents, and materials created during the ${isInternship ? 'internship' : 'employment'} shall remain the exclusive property of Enterprenex Solutions Pvt Ltd.</li>
    </ul>

    <div class="footer">
      <div class="footer-bar"></div>
      <div class="footer-contact">
        enterprenexsolutionpvtltd@gmail.com &nbsp;|&nbsp; +91-9226860060<br>
        Plot No. 148, Shrinand Plaza, CIDCO Waluj Mahanagar 1, Chhatrapati Sambhajinagar, MH 431136
      </div>
    </div>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════ -->
  <!-- PAGE 2 -->
  <!-- ═══════════════════════════════════════════════════════════════ -->
  <div class="page page-2">
    <div class="header">
      ${logoBase64 ? `<img src="data:image/png;base64,${logoBase64}" class="logo-img" alt="Enterprenex Solutions" />` : ''}
      <div class="company-title">ENTERPRENEX SOLUTIONS PVT LTD</div>
      <div class="company-web">www.enterprenexsolution.com</div>
      <div class="gold-bar"></div>
    </div>

    <ul class="policy-list" style="margin-top: 4px;">
      <li>The ${isInternship ? 'intern' : 'employee'} shall maintain strict confidentiality regarding the Company's business information, client data, social media credentials, internal tools, and processes, both during and after the ${isInternship ? 'internship' : 'employment'} period.</li>
      <li>The ${isInternship ? 'intern' : 'employee'} shall not engage in any activity that conflicts with the interests of the Company, including but not limited to sharing confidential information with third parties.</li>
      <li>The ${isInternship ? 'intern' : 'employee'} is expected to adhere to the Company's code of conduct, maintain professional behavior, and respect fellow team members at all times.</li>
      <li>This ${isInternship ? 'internship' : 'employment'} does not guarantee any full-time employment offer upon completion, unless communicated separately in writing by the Company.</li>
      <li>Either party (the Company or the ${isInternship ? 'Intern' : 'Employee'}) may terminate this ${isInternship ? 'internship' : 'employment'} by providing 10 (ten) days' written notice to the other party.</li>
      <li>In case of unsatisfactory performance, misconduct, or breach of any terms mentioned herein, the Company reserves the right to terminate the ${isInternship ? 'internship' : 'employment'} without prior notice.</li>
    </ul>

    <div class="section-heading" style="margin-top: 14px;">ON SUCCESSFUL COMPLETION</div>
    <div class="section-line"></div>
    <p class="intro-p" style="margin-bottom: 12px;">
      Upon successful completion of the ${isInternship ? 'internship' : 'probation'} period and satisfactory performance, the ${isInternship ? 'intern' : 'employee'} shall be provided with a Letter of Recommendation and an Experience/Completion Certificate from Enterprenex Solutions Pvt Ltd.
    </p>

    <div class="section-heading" style="text-decoration: underline; margin-bottom: 6px;">ACCEPTANCE</div>
    <p class="acceptance-p">
      Please sign and return a copy of this letter as a token of your acceptance of the above terms and conditions of the ${isInternship ? 'internship' : 'employment'} offer.
    </p>
    <p class="acceptance-p" style="margin-bottom: 18px;">
      We look forward to having you on board and wish you a great learning experience at Enterprenex Solutions Pvt Ltd.
    </p>

    <div class="signatory-block">
      <div class="signatory-firm">For Enterprenex Solutions Pvt Ltd,</div>
      <div class="signatory-name">${signatoryName}</div>
      <div class="signatory-role">${signatoryRole}</div>
      <div class="signatory-dept">${signatoryDepartment}</div>
    </div>

    <div class="section-heading" style="font-size: 9.4pt; margin-bottom: 8px;">
      Acceptance by Intern
    </div>
    <div class="acceptance-form">
      Signature: ______________________________<br>
      Name: ______________________________<br>
      Date: ______________________________
    </div>

    <div class="footer">
      <div class="footer-bar"></div>
      <div class="footer-contact">
        enterprenexsolutionpvtltd@gmail.com &nbsp;|&nbsp; +91-9226860060<br>
        Plot No. 148, Shrinand Plaza, CIDCO Waluj Mahanagar 1, Chhatrapati Sambhajinagar, MH 431136
      </div>
    </div>
  </div>

</body>
</html>
    `;

    await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '18mm',
        bottom: '12mm',
        left: '18mm'
      }
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
};

export interface PayslipPdfData {
  payrollNo: string;
  month: string;
  year: number;
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  basicSalary: number;
  hra: number;
  allowances: number;
  deductions: number;
  pfEmployee: number;
  taxDeduction: number;
  netSalary: number;
  status: string;
  paidAt?: string | Date | null;
  paymentReference?: string | null;
}

export const generatePayslipPdf = async (item: PayslipPdfData): Promise<Buffer> => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--disable-extensions'
    ]
  });

  try {
    const page = await browser.newPage();
    const grossEarnings = item.basicSalary + item.hra + item.allowances;
    const totalDeductions = item.deductions + item.pfEmployee + item.taxDeduction;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Payslip - ${item.payrollNo}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    body { font-family: 'Times New Roman', Times, serif; padding: 25px; color: #1e293b; background: #ffffff; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 20px; }
    .logo-text { font-size: 20pt; font-weight: 800; color: #0284c7; }
    .title { font-size: 14pt; font-weight: 700; text-align: right; color: #334155; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 9pt; }
    .tables-wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
    table { width: 100%; border-collapse: collapse; font-size: 9pt; }
    th { background: #0f172a; color: white; padding: 8px; text-align: left; }
    td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
    .amount { text-align: right; font-weight: 600; }
    .net-card { background: #0284c7; color: white; border-radius: 8px; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; font-size: 11pt; margin-bottom: 30px; }
    .net-amount { font-size: 18pt; font-weight: 800; }
    .footer { text-align: center; font-size: 8pt; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo-text">ENTERPRENEX</div>
      <div style="font-size: 8pt; color: #64748b;">Enterprise Workforce Management Solutions Pvt Ltd</div>
    </div>
    <div>
      <div class="title">SALARY PAYSLIP</div>
      <div style="font-size: 9pt; color: #64748b; text-align: right;">${item.month} ${item.year}</div>
    </div>
  </div>

  <div class="meta-grid">
    <div><strong>Employee Name:</strong> ${item.employeeName}</div>
    <div><strong>Employee ID:</strong> ${item.employeeId}</div>
    <div><strong>Department:</strong> ${item.department}</div>
    <div><strong>Designation:</strong> ${item.designation}</div>
    <div><strong>Pay Slip Reference:</strong> ${item.payrollNo}</div>
    <div><strong>Payment Status:</strong> <span style="color: #059669; font-weight: 700;">${item.status}</span></div>
  </div>

  <div class="tables-wrap">
    <div>
      <table>
        <thead><tr><th>EARNINGS</th><th class="amount">AMOUNT (INR)</th></tr></thead>
        <tbody>
          <tr><td>Basic Salary</td><td class="amount">₹${item.basicSalary.toLocaleString()}</td></tr>
          <tr><td>House Rent Allowance (HRA)</td><td class="amount">₹${item.hra.toLocaleString()}</td></tr>
          <tr><td>Special & Travel Allowances</td><td class="amount">₹${item.allowances.toLocaleString()}</td></tr>
          <tr style="background:#f1f5f9; font-weight: 700;"><td>Gross Earnings</td><td class="amount">₹${grossEarnings.toLocaleString()}</td></tr>
        </tbody>
      </table>
    </div>

    <div>
      <table>
        <thead><tr><th>DEDUCTIONS</th><th class="amount">AMOUNT (INR)</th></tr></thead>
        <tbody>
          <tr><td>Provident Fund (PF)</td><td class="amount">₹${item.pfEmployee.toLocaleString()}</td></tr>
          <tr><td>Professional Tax / TDS</td><td class="amount">₹${item.taxDeduction.toLocaleString()}</td></tr>
          <tr><td>Other Deductions</td><td class="amount">₹${item.deductions.toLocaleString()}</td></tr>
          <tr style="background:#f1f5f9; font-weight: 700;"><td>Total Deductions</td><td class="amount">₹${totalDeductions.toLocaleString()}</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="net-card">
    <div>
      <div style="text-transform: uppercase; letter-spacing: 0.05em; font-size: 9pt;">Take Home Net Salary</div>
      <div style="font-size: 8pt; opacity: 0.9;">Credited via ${item.paymentReference || 'Corporate Direct Bank Transfer'}</div>
    </div>
    <div class="net-amount">₹${item.netSalary.toLocaleString()}</div>
  </div>

  <div class="footer">
    This is an electronically generated salary voucher issued by Enterprenex Solutions Pvt Ltd and requires no physical seal. Ref: ${item.payrollNo}.
  </div>
</body>
</html>
    `;

    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
};

export interface RelievingPdfData {
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  resignationDate: string;
  actualLastWorkingDay: string;
}

export const generateRelievingLetterPdf = async (item: RelievingPdfData): Promise<Buffer> => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--disable-extensions'
    ]
  });

  try {
    const page = await browser.newPage();
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Relieving & Experience Certificate - ${item.employeeName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    body { font-family: 'Times New Roman', Times, serif; padding: 40px; color: #1e293b; line-height: 1.7; font-size: 10.5pt; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 30px; display: flex; justify-content: space-between; }
    .logo-text { font-size: 20pt; font-weight: 800; color: #0284c7; }
    .doc-title { text-align: center; font-size: 14pt; font-weight: 800; margin-bottom: 25px; text-decoration: underline; }
    p { margin-bottom: 18px; }
    .signature { margin-top: 60px; }
    .footer { margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 8pt; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo-text">ENTERPRENEX</div>
      <div style="font-size: 8pt; color: #64748b;">Enterprenex Solutions Pvt Ltd</div>
    </div>
    <div style="text-align: right; font-size: 9pt; color: #64748b;">
      Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
    </div>
  </div>

  <div class="doc-title">TO WHOMSOEVER IT MAY CONCERN</div>

  <p>This is to certify that <strong>${item.employeeName}</strong> (Employee ID: <strong>${item.employeeId}</strong>) was employed with Enterprenex Solutions Pvt Ltd in the <strong>${item.department}</strong> department, holding the designation of <strong>${item.designation}</strong>.</p>

  <p>Consequent to the resignation tendered on <strong>${item.resignationDate}</strong>, ${item.employeeName} has been formally relieved from services and responsibilities with effect from the close of business hours on <strong>${item.actualLastWorkingDay}</strong>.</p>

  <p>During the period of tenure with Enterprenex Solutions, ${item.employeeName} has fulfilled all responsibilities with utmost diligence, technical skill, and professional conduct. All company assets, access credentials, and handover documentations have been duly cleared across Engineering, Finance, and Human Resources.</p>

  <p>We take this opportunity to thank ${item.employeeName} for the valuable contributions made towards the organization and wish continued success and excellence in all future professional endeavors.</p>

  <div class="signature">
    <div style="font-weight: 700; color: #0f172a;">For Enterprenex Solutions Pvt Ltd,</div>
    <div style="margin: 25px 0 5px 0; font-family: cursive; font-size: 16pt; color: #0369a1;">Executive Director</div>
    <div style="font-weight: 700;">Authorized Signatory & Head of Human Capital</div>
    <div style="font-size: 8.5pt; color: #64748b;">Corporate Office &bull; Enterprenex Solutions</div>
  </div>

  <div class="footer">
    Official Record • Verification Ref: ENX-REL-${item.employeeId}-${Date.now().toString().slice(-4)} • Valid without physical stamp.
  </div>
</body>
</html>
    `;

    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
};
