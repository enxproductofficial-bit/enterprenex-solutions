/**
 * Enterprenex EWMS - Enterprise API Client
 * Automatically manages JWT authorization headers and connects to Port 5000.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

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
  async getAttendance() {
    return this.request<{ attendance: any[] }>('/attendance');
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
  async getLeaves() {
    return this.request<{ leaves: any[] }>('/leaves');
  }

  async applyLeave(leaveData: { employeeName?: string; type: string; startDate: string; endDate: string; reason: string }) {
    return this.request<{ message: string; leave: any }>('/leaves', {
      method: 'POST',
      body: JSON.stringify(leaveData)
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
    if (!res.ok) throw new Error('Failed to generate or download offer letter PDF');
    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `Enterprenex_Offer_Letter_${offerNo}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
  }

  // 11. Reports & Performance Telemetry
  async getWorkforceSummaryReport() {
    return this.request<{ summary: any }>('/reports/workforce-summary');
  }

  async getEmployeePerformanceReport(params: Record<string, string> = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request<{ performance: any[] }>(`/reports/employee-performance${qs ? `?${qs}` : ''}`);
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
