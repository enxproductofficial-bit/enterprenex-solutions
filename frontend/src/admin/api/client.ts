/**
 * Enterprenex EWMS - Enterprise API Client
 * Automatically manages JWT authorization headers and connects to Port 5000.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
