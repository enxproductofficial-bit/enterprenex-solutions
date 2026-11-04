import { prisma } from '../db';
import { emitRealtimeNotification } from './socket.service';

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
    const notif = await prisma.ewmsNotification.create({
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

    // Broadcast in real-time via Socket.IO
    emitRealtimeNotification(notif);

    return notif;
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
    title: 'Employee Account Activated',
    message: `Corporate account credentials created for ${empName} (${empEmail}) with role ${role}.`,
    recipientEmail: empEmail,
    actionUrl: '/admin/login'
  });
};

export const notifyTaskAssigned = async (
  p1: string,
  p2: string,
  p3?: string,
  p4?: string,
  p5?: string,
  p6?: string
) => {
  const isSixArgs = Boolean(p6);
  const title = isSixArgs ? p2 : p1;
  const assignedBy = isSixArgs ? (p5 || 'Director') : (p3 || 'Director');
  const dueDate = isSixArgs ? (p6 || 'On Schedule') : (p4 || 'On Schedule');
  const email = isSixArgs ? p4 : p5;

  return createNotification({
    type: 'TASK_ASSIGNED',
    title: 'New Sprint Task Assigned',
    message: `You were assigned "${title}" by ${assignedBy}. Deadline: ${dueDate}.`,
    recipientEmail: email,
    actionUrl: '/admin/tasks'
  });
};

export const notifyTaskSubmitted = async (p1: string, p2?: string, p3?: string, p4?: string) => {
  const title = p2 || p1;
  const empName = p3 || p2 || p1;
  const reviewer = p4 || p3;
  return createNotification({
    type: 'TASK_SUBMITTED',
    title: 'Task Completion Submitted',
    message: `${empName} submitted completion report for "${title}". Awaiting review approval.`,
    recipientRole: 'Super Admin',
    actionUrl: '/admin/tasks'
  });
};

export const notifyTaskCompletedSubmitted = notifyTaskSubmitted;

export const notifyTaskReviewed = async (
  p1: string,
  p2: string,
  p3: boolean,
  p4?: string,
  p5?: string,
  p6?: string
) => {
  const isSixArgs = Boolean(p6);
  const title = isSixArgs ? p2 : p1;
  const isApproved = p3;
  const email = isSixArgs ? p5 : p4;
  const remarks = isSixArgs ? p6 : p5;

  return createNotification({
    type: isApproved ? 'TASK_APPROVED' : 'TASK_CHANGES_REQUESTED',
    title: isApproved ? 'Task Approved & Verified' : 'Task Revision Requested',
    message: isApproved
      ? `Your task "${title}" has been approved and marked complete.`
      : `Revisions requested on "${title}". Notes: ${remarks || 'Please address feedback'}.`,
    recipientEmail: email,
    actionUrl: '/admin/tasks'
  });
};
