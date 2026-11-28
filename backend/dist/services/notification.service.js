"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyTaskReviewed = exports.notifyTaskCompletedSubmitted = exports.notifyTaskSubmitted = exports.notifyTaskAssigned = exports.notifyAccountActivated = exports.notifyOfferResponse = exports.notifyOfferSent = exports.notifyOfferReviewed = exports.notifyOfferPendingApproval = exports.notifyEmployeeApproved = exports.notifyNewEmployeeRegistered = exports.emitNotification = exports.createNotification = void 0;
const db_1 = require("../db");
const socket_service_1 = require("./socket.service");
const createNotification = async (params) => {
    try {
        const notif = await db_1.prisma.ewmsNotification.create({
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
        (0, socket_service_1.emitRealtimeNotification)(notif);
        return notif;
    }
    catch (err) {
        console.error('[NotificationService] Error creating notification:', err);
        return null;
    }
};
exports.createNotification = createNotification;
exports.emitNotification = exports.createNotification;
const notifyNewEmployeeRegistered = async (empName, empId, department, hrName) => {
    return (0, exports.createNotification)({
        type: 'EMPLOYEE_REGISTERED',
        title: 'New Employee Registration',
        message: `${empName} (${empId}) was registered for ${department} by ${hrName}. Awaiting Director approval.`,
        recipientRole: 'Super Admin',
        actionUrl: '/admin/team'
    });
};
exports.notifyNewEmployeeRegistered = notifyNewEmployeeRegistered;
const notifyEmployeeApproved = async (empName, empId, isApproved, remarks) => {
    return (0, exports.createNotification)({
        type: isApproved ? 'EMPLOYEE_APPROVED' : 'EMPLOYEE_REJECTED',
        title: isApproved ? 'Employee Onboarding Approved' : 'Employee Onboarding Rejected',
        message: isApproved
            ? `Onboarding for ${empName} (${empId}) has been approved by the Director. HR can now create the offer letter or activate account.`
            : `Onboarding for ${empName} (${empId}) was rejected by the Director. Remarks: ${remarks || 'None'}`,
        recipientRole: 'Project Manager',
        actionUrl: '/admin/team'
    });
};
exports.notifyEmployeeApproved = notifyEmployeeApproved;
const notifyOfferPendingApproval = async (offerNo, empName, createdBy) => {
    return (0, exports.createNotification)({
        type: 'OFFER_PENDING_APPROVAL',
        title: 'Offer Letter Pending Approval',
        message: `Offer letter ${offerNo} for ${empName} was prepared by ${createdBy} and is awaiting Director review and approval.`,
        recipientRole: 'Super Admin',
        actionUrl: '/admin/offer-letters'
    });
};
exports.notifyOfferPendingApproval = notifyOfferPendingApproval;
const notifyOfferReviewed = async (offerNo, empName, isApproved, remarks) => {
    return (0, exports.createNotification)({
        type: isApproved ? 'OFFER_APPROVED' : 'OFFER_REJECTED',
        title: isApproved ? 'Offer Letter Approved' : 'Offer Letter Rejected',
        message: isApproved
            ? `Director approved offer letter ${offerNo} for ${empName}. HR can now send the finalized letter.`
            : `Director rejected offer letter ${offerNo} for ${empName}. Remarks: ${remarks || 'Needs revision'}.`,
        recipientRole: 'Project Manager',
        actionUrl: '/admin/offer-letters'
    });
};
exports.notifyOfferReviewed = notifyOfferReviewed;
const notifyOfferSent = async (offerNo, empName, empEmail) => {
    return (0, exports.createNotification)({
        type: 'OFFER_SENT',
        title: 'Offer Letter Dispatched',
        message: `Official Offer Letter ${offerNo} has been dispatched to ${empName} (${empEmail}).`,
        recipientEmail: empEmail,
        actionUrl: '/admin/offer-letters'
    });
};
exports.notifyOfferSent = notifyOfferSent;
const notifyOfferResponse = async (offerNo, empName, isAccepted, remarks) => {
    return (0, exports.createNotification)({
        type: isAccepted ? 'OFFER_ACCEPTED' : 'OFFER_DECLINED',
        title: isAccepted ? 'Offer Letter Accepted' : 'Offer Letter Declined',
        message: isAccepted
            ? `Congratulations! ${empName} has officially accepted Offer Letter ${offerNo}. HR can now activate the employee account.`
            : `${empName} has declined Offer Letter ${offerNo}. Candidate remarks: ${remarks || 'None'}.`,
        recipientRole: 'Project Manager',
        actionUrl: '/admin/offer-letters'
    });
};
exports.notifyOfferResponse = notifyOfferResponse;
const notifyAccountActivated = async (empName, empEmail, role) => {
    return (0, exports.createNotification)({
        type: 'ACCOUNT_ACTIVATED',
        title: 'Employee Account Activated',
        message: `Corporate account credentials created for ${empName} (${empEmail}) with role ${role}.`,
        recipientEmail: empEmail,
        actionUrl: '/admin/login'
    });
};
exports.notifyAccountActivated = notifyAccountActivated;
const notifyTaskAssigned = async (p1, p2, p3, p4, p5, p6) => {
    const isSixArgs = Boolean(p6);
    const title = isSixArgs ? p2 : p1;
    const assignedBy = isSixArgs ? (p5 || 'Director') : (p3 || 'Director');
    const dueDate = isSixArgs ? (p6 || 'On Schedule') : (p4 || 'On Schedule');
    const email = isSixArgs ? p4 : p5;
    return (0, exports.createNotification)({
        type: 'TASK_ASSIGNED',
        title: 'New Sprint Task Assigned',
        message: `You were assigned "${title}" by ${assignedBy}. Deadline: ${dueDate}.`,
        recipientEmail: email,
        actionUrl: '/admin/tasks'
    });
};
exports.notifyTaskAssigned = notifyTaskAssigned;
const notifyTaskSubmitted = async (p1, p2, p3, p4) => {
    const title = p2 || p1;
    const empName = p3 || p2 || p1;
    const reviewer = p4 || p3;
    return (0, exports.createNotification)({
        type: 'TASK_SUBMITTED',
        title: 'Task Completion Submitted',
        message: `${empName} submitted completion report for "${title}". Awaiting review approval.`,
        recipientRole: 'Super Admin',
        actionUrl: '/admin/tasks'
    });
};
exports.notifyTaskSubmitted = notifyTaskSubmitted;
exports.notifyTaskCompletedSubmitted = exports.notifyTaskSubmitted;
const notifyTaskReviewed = async (p1, p2, p3, p4, p5, p6) => {
    const isSixArgs = Boolean(p6);
    const title = isSixArgs ? p2 : p1;
    const isApproved = p3;
    const email = isSixArgs ? p5 : p4;
    const remarks = isSixArgs ? p6 : p5;
    return (0, exports.createNotification)({
        type: isApproved ? 'TASK_APPROVED' : 'TASK_CHANGES_REQUESTED',
        title: isApproved ? 'Task Approved & Verified' : 'Task Revision Requested',
        message: isApproved
            ? `Your task "${title}" has been approved and marked complete.`
            : `Revisions requested on "${title}". Notes: ${remarks || 'Please address feedback'}.`,
        recipientEmail: email,
        actionUrl: '/admin/tasks'
    });
};
exports.notifyTaskReviewed = notifyTaskReviewed;
