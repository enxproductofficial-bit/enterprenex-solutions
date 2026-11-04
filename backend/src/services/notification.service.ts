import { prisma } from '../db';

export interface CreateNotificationParams {
  type: string;
  title: string;
  message: string;
  recipientRole?: string;
  recipientEmail?: string;
  recipientEmployeeId?: string;
  actionUrl?: string;
}

export const createNotification = async (params: CreateNotificationParams) => {
  try {
    return await prisma.ewmsNotification.create({
      data: {
        type: params.type,
        title: params.title,
        message: params.message,
        recipientRole: params.recipientRole || null,
        recipientEmail: params.recipientEmail || null,
        recipientEmployeeId: params.recipientEmployeeId || null,
        actionUrl: params.actionUrl || null,
        read: false
      }
    });
  } catch (err) {
    console.error('[NotificationService] Error creating notification:', err);
    return null;
  }
};

export const notifyNewEmployeeRegistered = async (empName: string, empId: string, department: string, hrName: string) => {
  return createNotification({
    type: 'EMPLOYEE_REGISTERED',
    title: 'New Employee Registration',
    message: `${empName} (${empId}) was registered for ${department} by ${hrName}. Awaiting Director approval.`,
    recipientRole: 'Super Admin',
    actionUrl: '/admin/team'
  });
};

export const notifyEmployeeApproved = async (empName: string, empId: string, isApproved: boolean, remarks?: string) => {
  return createNotification({
    type: isApproved ? 'EMPLOYEE_APPROVED' : 'EMPLOYEE_REJECTED',
    title: isApproved ? 'Employee Onboarding Approved' : 'Employee Onboarding Rejected',
    message: isApproved
      ? `Onboarding for ${empName} (${empId}) has been approved by the Director. HR can now create the offer letter or activate account.`
      : `Onboarding for ${empName} (${empId}) was rejected by the Director. Remarks: ${remarks || 'None'}`,
    recipientRole: 'Project Manager',
    actionUrl: '/admin/team'
  });
};

export const notifyOfferPendingApproval = async (offerNo: string, empName: string, createdBy: string) => {
  return createNotification({
    type: 'OFFER_PENDING_APPROVAL',
    title: 'Offer Letter Pending Approval',
    message: `Offer letter ${offerNo} for ${empName} was prepared by ${createdBy} and is awaiting Director review and approval.`,
    recipientRole: 'Super Admin',
    actionUrl: '/admin/offer-letters'
  });
};

export const notifyOfferReviewed = async (offerNo: string, empName: string, isApproved: boolean, remarks?: string) => {
  return createNotification({
    type: isApproved ? 'OFFER_APPROVED' : 'OFFER_REJECTED',
    title: isApproved ? 'Offer Letter Approved' : 'Offer Letter Rejected',
    message: isApproved
      ? `Director approved offer letter ${offerNo} for ${empName}. HR can now send the finalized letter.`
      : `Director rejected offer letter ${offerNo} for ${empName}. Remarks: ${remarks || 'Needs revision'}.`,
    recipientRole: 'Project Manager',
    actionUrl: '/admin/offer-letters'
  });
};

export const notifyOfferSent = async (offerNo: string, empName: string, empEmail: string) => {
  return createNotification({
    type: 'OFFER_SENT',
    title: 'Offer Letter Dispatched',
    message: `Official Offer Letter ${offerNo} has been dispatched to ${empName} (${empEmail}).`,
    recipientEmail: empEmail,
    actionUrl: '/admin/offer-letters'
  });
};

export const notifyOfferResponse = async (offerNo: string, empName: string, isAccepted: boolean, remarks?: string) => {
  return createNotification({
    type: isAccepted ? 'OFFER_ACCEPTED' : 'OFFER_DECLINED',
    title: isAccepted ? 'Offer Letter Accepted' : 'Offer Letter Declined',
    message: isAccepted
      ? `Congratulations! ${empName} has officially accepted Offer Letter ${offerNo}. HR can now activate the employee account.`
      : `${empName} has declined Offer Letter ${offerNo}. Candidate remarks: ${remarks || 'None'}.`,
    recipientRole: 'Project Manager',
    actionUrl: '/admin/offer-letters'
  });
};

export const notifyAccountActivated = async (empName: string, empEmail: string, role: string) => {
  return createNotification({
    type: 'ACCOUNT_ACTIVATED',
    title: 'EWMS Portal Account Activated',
    message: `Your account has been activated with role ${role}. You can now sign in using ${empEmail}.`,
    recipientEmail: empEmail,
    actionUrl: '/login'
  });
};

export const notifyTaskAssigned = async (taskId: string, title: string, empName: string, empId: string, assignedBy: string, dueDate: string) => {
  return createNotification({
    type: 'TASK_ASSIGNED',
    title: 'New Task Assignment',
    message: `You have been assigned task "${title}" by ${assignedBy}. Due: ${dueDate}.`,
    recipientEmployeeId: empId,
    actionUrl: '/admin/tasks'
  });
};

export const notifyTaskCompletedSubmitted = async (taskId: string, title: string, empName: string, assignedBy: string) => {
  return createNotification({
    type: 'TASK_COMPLETED_SUBMITTED',
    title: 'Task Submitted for Review',
    message: `${empName} has marked task "${title}" as completed and submitted it for review.`,
    recipientRole: 'Super Admin',
    actionUrl: '/admin/tasks'
  });
};

export const notifyTaskReviewed = async (taskId: string, title: string, isApproved: boolean, remarks: string | undefined, empId: string) => {
  return createNotification({
    type: isApproved ? 'TASK_APPROVED' : 'TASK_REJECTED',
    title: isApproved ? 'Task Approved & Completed' : 'Task Revisions Required',
    message: isApproved
      ? `Your submission for task "${title}" was reviewed and approved as Completed!`
      : `Your submission for task "${title}" was reviewed: Revisions required. Remarks: ${remarks || 'Please update and resubmit.'}`,
    recipientEmployeeId: empId,
    actionUrl: '/admin/tasks'
  });
};
