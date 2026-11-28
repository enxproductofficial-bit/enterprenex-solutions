"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.optionalAuth = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || 'enterprenex_enterprise_jwt_secret_2026_super_secure';
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];
    // Also support ?token= in query parameter
    if (!token && req.query.token) {
        token = String(req.query.token);
    }
    if (!token && req.headers.cookie) {
        const match = req.headers.cookie.match(/ewms_session=([^;]+)/);
        if (match) {
            token = match[1];
        }
    }
    // Also support HttpOnly secure session cookie
    if (!token && req.headers.cookie) {
        const match = req.headers.cookie.match(/ewms_session=([^;]+)/);
        if (match) {
            token = match[1];
        }
    }
    if (token === 'undefined' || token === 'null' || token === '') {
        token = undefined;
    }
    // Strict Token Authentication: All protected endpoints require a valid token
    if (!token) {
        res.status(401).json({ error: 'Access denied. Missing bearer authorization token.' });
        return;
    }
    try {
        const verified = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    }
    catch (err) {
        res.status(403).json({ error: 'Invalid or expired authentication session token.' });
        return;
    }
};
exports.authenticateToken = authenticateToken;
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];
    if (!token && req.query.token) {
        token = String(req.query.token);
    }
    if (!token && req.headers.cookie) {
        const match = req.headers.cookie.match(/ewms_session=([^;]+)/);
        if (match) {
            token = match[1];
        }
    }
    if (token === 'undefined' || token === 'null' || token === '') {
        token = undefined;
    }
    if (token) {
        try {
            const verified = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            req.user = verified;
        }
        catch {
            // Invalidate bad token quietly for optional auth
        }
    }
    next();
};
exports.optionalAuth = optionalAuth;
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required.' });
            return;
        }
        const userRole = req.user.role || '';
        const userEmail = (req.user.email || '').toLowerCase();
        const isDirector = userRole === 'Super Admin' ||
            userRole === 'Director / CEO' ||
            userRole.includes('Director') ||
            userRole.includes('CMD') ||
            userEmail.includes('director');
        const isManager = isDirector ||
            userRole === 'Project Manager' ||
            userRole === 'Manager' ||
            userRole.includes('Manager') ||
            userEmail.includes('manager');
        const isHR = isDirector ||
            userRole === 'HR Manager' ||
            userRole === 'HR' ||
            userRole.includes('HR') ||
            req.user.department === 'Human Resources' ||
            userEmail.includes('hr');
        // Director has universal access across all modules
        if (isDirector) {
            next();
            return;
        }
        // Match role against allowed list with aliases
        const isAuthorized = !allowedRoles || allowedRoles.some(allowed => {
            if (allowed === userRole)
                return true;
            if (allowed === 'Super Admin' && isDirector)
                return true;
            if (allowed === 'Project Manager' && isManager)
                return true;
            if (allowed === 'HR Manager' && isHR)
                return true;
            if ((allowed === 'Team Member' || allowed === 'Developer') && (userRole === 'Employee' || userRole === 'Developer' || userRole === 'Team Member'))
                return true;
            return false;
        });
        if (isAuthorized) {
            next();
        }
        else {
            res.status(403).json({
                error: `Access forbidden: Role '${userRole}' is not authorized for this enterprise action.`
            });
            return;
        }
    };
};
exports.requireRole = requireRole;
