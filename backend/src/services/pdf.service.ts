import puppeteer from 'puppeteer';

interface OfferLetterData {
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
  directorApprovedAt?: string | Date | null;
  respondedAt?: string | Date | null;
  createdAt: string | Date;
}

export const generateOfferLetterPdf = async (offer: OfferLetterData): Promise<Buffer> => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();

    const formattedDate = new Date(offer.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const approvedDateStr = offer.directorApprovedAt
      ? new Date(offer.directorApprovedAt).toLocaleString('en-US')
      : null;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Offer Letter - ${offer.offerLetterNo}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    
    @page {
      size: A4;
      margin: 20mm;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #0f172a;
      line-height: 1.5;
      font-size: 11pt;
      position: relative;
    }
    
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 55pt;
      font-weight: 900;
      color: rgba(15, 23, 42, 0.035);
      z-index: -1;
      pointer-events: none;
      letter-spacing: 0.1em;
      white-space: nowrap;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    
    .logo-box {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .logo-badge {
      width: 44px;
      height: 44px;
      background: #0f172a;
      color: #ffffff;
      font-size: 18pt;
      font-weight: 900;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
    }
    
    .company-title {
      font-size: 15pt;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    
    .company-tagline {
      font-size: 7.5pt;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    
    .company-contact {
      text-align: right;
      font-size: 8pt;
      color: #475569;
      line-height: 1.4;
    }
    
    .meta-bar {
      display: flex;
      justify-content: space-between;
      margin-bottom: 18px;
      font-size: 9.5pt;
      font-weight: 600;
      color: #334155;
    }
    
    .ref-no {
      font-family: monospace;
      font-weight: 700;
      color: #0f172a;
    }
    
    .recipient-info {
      margin-bottom: 16px;
    }
    
    .to-label {
      font-weight: 700;
      font-size: 9.5pt;
      color: #475569;
    }
    
    .candidate-name {
      font-size: 13pt;
      font-weight: 800;
      color: #0f172a;
    }
    
    .subject-box {
      background: #f8fafc;
      padding: 9px 14px;
      border-left: 4px solid #0f172a;
      margin-bottom: 16px;
      font-weight: 700;
      font-size: 10pt;
      color: #0f172a;
      letter-spacing: 0.3px;
    }
    
    .content-body {
      font-size: 9.5pt;
      color: #334155;
      margin-bottom: 16px;
      text-align: justify;
    }
    
    .section-title {
      font-size: 10pt;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 16px 0 8px 0;
    }
    
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #cbd5e1;
      font-size: 9pt;
      margin-bottom: 16px;
    }
    
    table.data-table td {
      padding: 7px 12px;
      border-bottom: 1px solid #e2e8f0;
    }
    
    table.data-table tr:nth-child(even) {
      background: #f8fafc;
    }
    
    table.data-table .label-col {
      font-weight: 600;
      color: #475569;
      width: 40%;
    }
    
    table.data-table .val-col {
      font-weight: 700;
      color: #0f172a;
    }
    
    .ctc-row {
      background: #f0fdf4 !important;
      border-top: 2px solid #cbd5e1;
    }
    
    .ctc-row td {
      font-weight: 800 !important;
      color: #166534 !important;
      font-size: 10pt;
    }
    
    .terms-box {
      background: #f8fafc;
      padding: 12px 14px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 8.5pt;
      color: #334155;
      white-space: pre-line;
      line-height: 1.5;
      margin-bottom: 24px;
    }
    
    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 28px;
      padding-top: 14px;
      border-top: 1px solid #cbd5e1;
      page-break-inside: avoid;
    }
    
    .sig-col {
      width: 45%;
    }
    
    .sig-img {
      height: 40px;
      font-family: 'Brush Script MT', cursive, sans-serif;
      font-size: 20pt;
      color: #0f172a;
      display: flex;
      align-items: flex-end;
      margin-bottom: 6px;
    }
    
    .sig-name {
      font-weight: 800;
      color: #0f172a;
      font-size: 10pt;
    }
    
    .sig-sub {
      font-size: 8pt;
      color: #64748b;
    }
    
    .sig-verified {
      font-size: 7.5pt;
      color: #166534;
      font-weight: 600;
      margin-top: 4px;
    }
    
    .footer-note {
      margin-top: 30px;
      border-top: 1px solid #e2e8f0;
      padding-top: 8px;
      text-align: center;
      font-size: 7pt;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="watermark">ENTERPRENEX</div>

  <div class="header">
    <div class="logo-box">
      <div class="logo-badge">E</div>
      <div>
        <div class="company-title">ENTERPRENEX SOLUTIONS PVT LTD</div>
        <div class="company-tagline">Empowering Enterprise Engineering • CIN: U72900PN2026PTC239841</div>
      </div>
    </div>
    <div class="company-contact">
      <div>Headquarters: Pune, MH, India</div>
      <div>Web: https://enterprenexsolution.com</div>
      <div>HR Portal: hr@enterprenex.solutions</div>
    </div>
  </div>

  <div class="meta-bar">
    <div>REF NO: <span class="ref-no">${offer.offerLetterNo}</span></div>
    <div>Date of Issuance: ${formattedDate}</div>
  </div>

  <div class="recipient-info">
    <div class="to-label">To,</div>
    <div class="candidate-name">${offer.employeeName}</div>
    <div style="font-size: 8.5pt; color: #475569;">Email: ${offer.employeeEmail}</div>
    ${offer.employeeId ? `<div style="font-size: 8pt; color: #64748b;">Candidate Reference ID: ${offer.employeeId}</div>` : ''}
  </div>

  <div class="subject-box">
    SUBJECT: FORMAL APPOINTMENT AND EMPLOYMENT CONTRACT OFFER
  </div>

  <div class="content-body">
    <p style="margin-bottom: 8px;">Dear <strong>${offer.employeeName}</strong>,</p>
    <p>
      Following your technical evaluations and discussions with our engineering leadership, we are delighted to extend this formal offer of appointment for the position of <strong>${offer.designation}</strong> in our <strong>${offer.department}</strong> division at <strong>Enterprenex Solutions Private Limited</strong>.
    </p>
  </div>

  <div class="section-title">1. Terms of Engagement & Compensation Structure</div>
  <table class="data-table">
    <tbody>
      <tr>
        <td class="label-col">Position Title</td>
        <td class="val-col">${offer.designation}</td>
      </tr>
      <tr>
        <td class="label-col">Assigned Department</td>
        <td class="val-col">${offer.department}</td>
      </tr>
      <tr>
        <td class="label-col">Engagement Classification</td>
        <td class="val-col">${offer.employmentType}</td>
      </tr>
      <tr>
        <td class="label-col">Official Joining Date</td>
        <td class="val-col">${offer.joiningDate}</td>
      </tr>
      <tr>
        <td class="label-col">Probation Period</td>
        <td class="val-col">${offer.probationPeriod}</td>
      </tr>
      <tr>
        <td class="label-col">Gross Monthly Compensation</td>
        <td class="val-col">INR ${offer.salaryMonthly.toLocaleString('en-IN')} per month</td>
      </tr>
      <tr class="ctc-row">
        <td>Total Cost to Company (CTC)</td>
        <td>INR ${offer.ctcAnnual.toLocaleString('en-IN')} per annum</td>
      </tr>
    </tbody>
  </table>

  <div class="section-title">2. Policies, Code of Conduct & Intellectual Property</div>
  <div class="terms-box">
${offer.termsAndConditions}
  </div>

  <div class="signatures">
    <div class="sig-col">
      <div class="sig-img">Rohit Pawar</div>
      <div class="sig-name">Rohit Pawar</div>
      <div class="sig-sub">Managing Director & Chief Executive</div>
      <div class="sig-sub">Enterprenex Solutions Pvt Ltd</div>
      ${approvedDateStr ? `<div class="sig-verified">✓ Digitally Authorized: ${approvedDateStr}</div>` : ''}
    </div>

    <div class="sig-col">
      <div class="sig-img" style="font-family: inherit; font-size: 11pt; color: #166534; font-weight: 700;">
        ${offer.status === 'Accepted' ? offer.employeeName : '<span style="border-bottom: 1px dashed #94a3b8; width: 100%; display: inline-block;"></span>'}
      </div>
      <div class="sig-name">${offer.employeeName}</div>
      <div class="sig-sub">Candidate Acceptance & Confirmation</div>
      <div class="sig-sub">
        ${offer.status === 'Accepted' ? `Accepted: ${offer.respondedAt ? new Date(offer.respondedAt).toLocaleDateString() : 'On Record'}` : 'Pending Signature'}
      </div>
    </div>
  </div>

  <div class="footer-note">
    Enterprenex Workforce Management System (EWMS) Verified Document • Ref: ${offer.offerLetterNo} • Valid without physical seal when digitally signed.
  </div>
</body>
</html>
    `;

    await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm'
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
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
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
    body { font-family: 'Inter', sans-serif; padding: 25px; color: #1e293b; background: #ffffff; }
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
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
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
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; line-height: 1.7; font-size: 10.5pt; }
    .header { border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 30px; display: flex; justify-content: space-between; }
    .logo-text { font-size: 20pt; font-weight: 800; color: #0284c7; }
    .doc-title { text-align: center; font-size: 14pt; font-weight: 800; margin-bottom: 25px; text-decoration: underline; }
    p { margin-bottom: 18px; }
    .signature { margin-top: 60px; }
    .footer { margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 8pt; color: #94a3b8; text-align: center; }
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

