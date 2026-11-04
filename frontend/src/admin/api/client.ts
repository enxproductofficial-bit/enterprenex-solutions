/**
 * Enterprenex EWMS - Enterprise API Client
 * Automatically manages JWT authorization headers and connects to Port 5000.
 */

export const getBackendBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:5000`;
  }
  return 'http://localhost:5000';
};

const API_BASE_URL = import.meta.env.VITE_API_URL || `${getBackendBaseUrl()}/api/v1`;

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('ewms_auth_token');
  }

  public setToken(token: string): void {
    localStorage.setItem('ewms_auth_token', token);
  }

  public clearToken(): void {
    localStorage.removeItem('ewms_auth_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      // Re-throw for caller to handle or fallback
      throw error;
    }
  }

  // 1. Auth Endpoints
  async login(identifier: string, password: string) {
    const data = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password })
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async getMe() {
    return this.request<{ user: any }>('/auth/me');
  }

  // 2. Employees Endpoints
  async getEmployees() {
    return this.request<{ employees: any[] }>('/employees');
  }

  async createEmployee(employeeData: any) {
    return this.request<{ message: string; employee: any; temporaryPassword?: string }>('/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData)
    });
  }

  async updateEmployee(employeeId: string, updates: any) {
    return this.request<{ message: string; employee: any }>(`/employees/${employeeId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async updateMyContact(contactData: { personalPhone?: string; personalEmail?: string; phone?: string }) {
    return this.request<{ message: string; employee: any }>('/employees/me/contact', {
      method: 'PUT',
      body: JSON.stringify(contactData)
    });
  }

  async verifySkill(employeeId: string, skillName: string, verifiedRating: number) {
    return this.request(`/employees/${employeeId}/skills/verify`, {
      method: 'PUT',
      body: JSON.stringify({ skillName, verifiedRating })
    });
  }

  // 3. Attendance Endpoints
  async getAttendance(params: Record<string, string> = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request<{ attendance: any[] }>(`/attendance${qs ? `?${qs}` : ''}`);
  }

  async getAttendanceSummary() {
    return this.request<any>('/attendance/summary');
  }

  async checkIn() {
    return this.request<{ message: string; record: any }>('/attendance/check-in', {
      method: 'POST'
    });
  }

  async checkOut(breakMinutes = 0) {
    return this.request<{ message: string; record: any }>('/attendance/check-out', {
      method: 'POST',
      body: JSON.stringify({ breakMinutes })
    });
  }

  async correctAttendance(id: string, data: { checkIn?: string; checkOut?: string; status?: string; breakMinutes?: number; correctionRemarks: string }) {
    return this.request<{ message: string; record: any }>(`/attendance/${id}/correct`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async punchAttendance(status = 'Present') {
    return this.request<{ message: string; record: any }>('/attendance/punch', {
      method: 'POST',
      body: JSON.stringify({ status })
    });
  }

  async submitAbsenceNote(recordId: string, absenceReason: string, absenceNotes: string, notifiedVia?: string[]) {
    return this.request(`/attendance/${recordId}/absence-note`, {
      method: 'PUT',
      body: JSON.stringify({ absenceReason, absenceNotes, notifiedVia })
    });
  }

  // 3b. Leave Management Endpoints
  async getLeaves(params: Record<string, string> = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request<{ leaves: any[] }>(`/leaves${qs ? `?${qs}` : ''}`);
  }

  async getLeaveBalance() {
    return this.request<{ balance: any }>('/leaves/balance');
  }

  async applyLeave(data: { employeeName?: string; type: string; startDate: string; endDate: string; reason: string; documentUrl?: string }) {
    return this.request<{ message: string; leave: any }>('/leaves/apply', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async reviewLeave(id: string, status: 'Approved' | 'Rejected', remarks?: string) {
    return this.request<{ message: string; leave: any }>(`/leaves/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ status, remarks })
    });
  }

  async cancelLeave(id: string) {
    return this.request<{ message: string; leave: any }>(`/leaves/${id}/cancel`, {
      method: 'POST'
    });
  }

  async updateLeaveStatus(leaveId: string, status: 'Approved' | 'Rejected' | 'Pending') {
    return this.request<{ message: string; leave: any }>(`/leaves/${leaveId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  // 4. Task Endpoints
  async getTasks() {
    return this.request<{ tasks: any[] }>('/tasks');
  }

  async createTask(taskData: any) {
    return this.request<{ task: any }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
  }

  async logTaskTime(taskId: string, hours: number, sessionMinutes?: number, activityNote?: string) {
    return this.request(`/tasks/${taskId}/log-time`, {
      method: 'PUT',
      body: JSON.stringify({ hours, sessionMinutes, activityNote })
    });
  }

  async reviewTask(taskId: string, action: 'submit' | 'approve' | 'rework', notes?: string) {
    return this.request(`/tasks/${taskId}/review`, {
      method: 'PUT',
      body: JSON.stringify({ action, notes })
    });
  }

  // 5. KPI & OKR Endpoints
  async getKpis() {
    return this.request<{ kpis: any[] }>('/kpi');
  }

  async updateKpiMetric(employeeId: string, metricId: string, actual: string, score: number) {
    return this.request(`/kpi/${employeeId}/metric`, {
      method: 'PUT',
      body: JSON.stringify({ metricId, actual, score })
    });
  }

  async getOkrs() {
    return this.request<{ okrs: any[] }>('/kpi/okrs');
  }

  async updateOkrProgress(okrId: string, krId: string, current: string, progressPercent: number) {
    return this.request(`/kpi/okrs/${okrId}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ krId, current, progressPercent })
    });
  }


  // 6. Offer Letter Management & Approval Workflow
  async getOfferLetters() {
    return this.request<{ offerLetters: any[] }>('/offer-letters');
  }

  async getOfferLetter(id: string) {
    return this.request<{ offerLetter: any }>(`/offer-letters/${id}`);
  }

  async createOfferLetter(data: any) {
    return this.request<{ message: string; offerLetter: any }>('/offer-letters', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateOfferLetter(id: string, updates: any) {
    return this.request<{ message: string; offerLetter: any }>(`/offer-letters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async directorReviewOfferLetter(id: string, action: 'Approve' | 'Reject', remarks?: string) {
    return this.request<{ message: string; offerLetter: any }>(`/offer-letters/${id}/director-review`, {
      method: 'PUT',
      body: JSON.stringify({ action, remarks })
    });
  }

  async sendOfferLetter(id: string) {
    return this.request<{ message: string; offerLetter: any }>(`/offer-letters/${id}/send`, {
      method: 'POST'
    });
  }

  async respondOfferLetter(id: string, action: 'Accept' | 'Decline', remarks?: string) {
    return this.request<{ message: string; offerLetter: any }>(`/offer-letters/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify({ action, remarks })
    });
  }

  async deleteOfferLetter(id: string) {
    return this.request<{ message: string }>(`/offer-letters/${id}`, {
      method: 'DELETE'
    });
  }

  // 7. Employee Onboarding & Account Activation
  async approveEmployeeOnboarding(id: string, action: 'Approve' | 'Reject', remarks?: string) {
    return this.request<{ message: string; employee: any }>(`/employees/${id}/approval`, {
      method: 'PUT',
      body: JSON.stringify({ action, remarks })
    });
  }

  async activateEmployeeAccount(id: string, assignedRole?: string) {
    return this.request<{ message: string; employeeId: string; email: string; role: string; temporaryPassword?: string }>(`/employees/${id}/activate`, {
      method: 'POST',
      body: JSON.stringify({ assignedRole })
    });
  }

  // 8. Task Workflow: Submit Completion, Director Review, Reassign
  async submitTaskCompletion(taskId: string, completionRemarks: string, supportingDocuments?: string[]) {
    return this.request<{ message: string; task: any }>(`/tasks/${taskId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ completionRemarks, supportingDocuments })
    });
  }

  async reviewTaskSubmission(taskId: string, action: 'Approve' | 'Reject', remarks?: string) {
    return this.request<{ message: string; task: any }>(`/tasks/${taskId}/director-review`, {
      method: 'POST',
      body: JSON.stringify({ action, remarks })
    });
  }

  async reassignTask(taskId: string, data: { assignedTo: string; dueDate?: string; priority?: string; notes?: string }) {
    return this.request<{ message: string; task: any }>(`/tasks/${taskId}/reassign`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // 9. Notifications Stream
  async getNotifications() {
    return this.request<{ notifications: any[] }>('/notifications');
  }

  async markNotificationRead(id: string) {
    return this.request<{ notification: any }>(`/notifications/${id}/read`, {
      method: 'PUT'
    });
  }

  async markAllNotificationsRead() {
    return this.request<{ message: string }>('/notifications/read-all', {
      method: 'PUT'
    });
  }

  // 10. Official Puppeteer PDF Generation & Download
  async downloadOfferLetterPdf(id: string, offerNo = 'Offer_Letter') {
    const token = this.getToken();
    const url = `${API_BASE_URL}/offer-letters/${id}/pdf`;
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (!res.ok) {
      let errMsg = 'Failed to generate or download offer letter PDF';
      try {
        const errJson = await res.json();
        if (errJson && errJson.error) errMsg = errJson.error;
      } catch {
        // use default message
      }
      throw new Error(errMsg);
    }
    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `Enterprenex_Offer_Letter_${offerNo}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => {
      window.URL.revokeObjectURL(downloadUrl);
    }, 5000);
  }

  // 11. Reports & Performance Telemetry
  async getWorkforceSummaryReport() {
    return this.request<{ summary: any }>('/reports/workforce-summary');
  }

  async getEmployeePerformanceReport(params: Record<string, string> = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request<{ performance: any[] }>(`/reports/employee-performance${qs ? `?${qs}` : ''}`);
  }

  // 14. Projects & Team Sprints
  async getProjects(params: Record<string, string> = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request<{ projects: any[] }>(`/projects${qs ? `?${qs}` : ''}`);
  }

  async createProject(data: any) {
    return this.request<{ message: string; project: any }>('/projects', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateProject(id: string, data: any) {
    return this.request<{ message: string; project: any }>(`/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async updateProjectMilestones(id: string, milestones: any[], completionRate?: number) {
    return this.request<{ message: string; project: any }>(`/projects/${id}/milestones`, {
      method: 'PATCH',
      body: JSON.stringify({ milestones, completionRate })
    });
  }

  async updateProjectTeam(id: string, teamMembers: any[]) {
    return this.request<{ message: string; project: any }>(`/projects/${id}/team`, {
      method: 'PATCH',
      body: JSON.stringify({ teamMembers })
    });
  }

  // 15. Company Announcements
  async getAnnouncements() {
    return this.request<{ announcements: any[] }>('/announcements');
  }

  async createAnnouncement(data: any) {
    return this.request<{ message: string; announcement: any }>('/announcements', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async markAnnouncementRead(id: string) {
    return this.request<{ message: string }>(`/announcements/${id}/read`, {
      method: 'POST'
    });
  }

  async acknowledgeAnnouncement(id: string) {
    return this.request<{ message: string }>(`/announcements/${id}/acknowledge`, {
      method: 'POST'
    });
  }

  // 16. Payroll & Payslips
  async getPayroll(params: Record<string, string> = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request<{ payroll: any[] }>(`/payroll${qs ? `?${qs}` : ''}`);
  }

  async generatePayrollBatch(month: string, year: number) {
    return this.request<{ message: string; count: number; records: any[] }>('/payroll/generate-batch', {
      method: 'POST',
      body: JSON.stringify({ month, year })
    });
  }

  async approvePayroll(id: string, remarks?: string) {
    return this.request<{ message: string; record: any }>(`/payroll/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ remarks })
    });
  }

  async payPayroll(id: string, paymentMethod = 'NEFT/RTGS', paymentReference?: string) {
    return this.request<{ message: string; record: any }>(`/payroll/${id}/pay`, {
      method: 'PATCH',
      body: JSON.stringify({ paymentMethod, paymentReference })
    });
  }

  async downloadPayslipPdf(id: string, payrollNo = 'Payslip') {
    const token = this.getToken();
    const url = `${API_BASE_URL}/payroll/${id}/payslip`;
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Failed to generate or download payslip PDF');
    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `Enterprenex_${payrollNo}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
  }

  // 17. Employee Exit Management
  async getExitRequests(params: Record<string, string> = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request<{ exits: any[] }>(`/exit${qs ? `?${qs}` : ''}`);
  }

  async submitResignation(data: { proposedLastWorkingDay: string; reason: string; noticePeriodDays?: number }) {
    return this.request<{ message: string; exit: any }>('/exit/resignation', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async reviewExitRequest(id: string, status: string, actualLastWorkingDay?: string, directorRemarks?: string) {
    return this.request<{ message: string; exit: any }>(`/exit/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ status, actualLastWorkingDay, directorRemarks })
    });
  }

  async updateExitClearance(id: string, data: any) {
    return this.request<{ message: string; exit: any }>(`/exit/${id}/clearance`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async downloadRelievingLetterPdf(id: string, empId = 'Emp') {
    const token = this.getToken();
    const url = `${API_BASE_URL}/exit/${id}/letter`;
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Failed to generate or download relieving letter PDF');
    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `Enterprenex_Relieving_Letter_${empId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
  }

  // 18. Asset Management
  async getAssets(params: Record<string, string> = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request<{ assets: any[] }>(`/assets${qs ? `?${qs}` : ''}`);
  }

  async createAsset(data: any) {
    return this.request<{ message: string; asset: any }>('/assets', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async allocateAsset(id: string, employeeId: string, employeeName: string) {
    return this.request<{ message: string; asset: any }>(`/assets/${id}/allocate`, {
      method: 'PATCH',
      body: JSON.stringify({ employeeId, employeeName })
    });
  }

  async returnAsset(id: string, condition = 'Good') {
    return this.request<{ message: string; asset: any }>(`/assets/${id}/return`, {
      method: 'PATCH',
      body: JSON.stringify({ condition })
    });
  }

  async requestAsset(data: { category: string; reason: string; urgency?: string }) {
    return this.request<{ message: string }>('/assets/request', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // 19. Expense Management
  async getExpenses(params: Record<string, string> = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request<{ expenses: any[] }>(`/expenses${qs ? `?${qs}` : ''}`);
  }

  async submitExpense(data: any) {
    return this.request<{ message: string; expense: any }>('/expenses', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async reviewExpense(id: string, status: string, remarks?: string) {
    return this.request<{ message: string; expense: any }>(`/expenses/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ status, remarks })
    });
  }

  async reimburseExpense(id: string) {
    return this.request<{ message: string; expense: any }>(`/expenses/${id}/reimburse`, {
      method: 'PATCH'
    });
  }

  // 20. Dashboard Snapshots
  async getWorkspaceSnapshot() {
    return this.request<any>('/dashboard/workspace');
  }

  async getExecutiveDashboard() {
    return this.request<any>('/dashboard/executive');
  }

  // Health check
  async checkBackendHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return res.ok;
    } catch {
      return false;
    }
  }
}

export const api = new ApiClient();
