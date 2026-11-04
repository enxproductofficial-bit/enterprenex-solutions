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
