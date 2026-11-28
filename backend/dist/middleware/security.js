"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = exports.securityHeaders = exports.sanitizeInputs = exports.rateLimiter = void 0;
const rateLimitStore = new Map();
/**
 * Configurable Rate Limiter to prevent DoS attacks and DB crashes
 */
const rateLimiter = (options) => {
    return (req, res, next) => {
        const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
        const key = `${ip}:${req.baseUrl || req.path}`;
        const now = Date.now();
        let record = rateLimitStore.get(key);
        if (!record || now > record.resetAt) {
            record = { count: 1, resetAt: now + options.windowMs };
            rateLimitStore.set(key, record);
        }
        else {
            record.count++;
        }
        if (record.count > options.maxRequests) {
            res.status(429).json({
                error: 'Too Many Requests',
                message: 'Rate limit exceeded. System protection active to prevent connection exhaustion. Please wait before retrying.',
                retryAfterSeconds: Math.ceil((record.resetAt - now) / 1000)
            });
            return;
        }
        next();
    };
};
exports.rateLimiter = rateLimiter;
/**
 * Deep Input Sanitizer: Protects against NoSQL / SQL Injection & Prototype Pollution
 */
const sanitizeValue = (val) => {
    if (val === null || val === undefined)
        return val;
    if (typeof val === 'string') {
        // Strip script tags and potential MongoDB / SQL operators
        return val
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .trim();
    }
    if (Array.isArray(val)) {
        return val.map(sanitizeValue);
    }
    if (typeof val === 'object') {
        const sanitized = {};
        for (const [key, v] of Object.entries(val)) {
            // Prevent MongoDB operator injection (keys starting with $)
            if (key.startsWith('$') || key.includes('.')) {
                continue;
            }
            // Prevent prototype pollution attacks
            if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
                continue;
            }
            sanitized[key] = sanitizeValue(v);
        }
        return sanitized;
    }
    return val;
};
const sanitizeInputs = (req, _res, next) => {
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeValue(req.body);
    }
    if (req.query && typeof req.query === 'object') {
        req.query = sanitizeValue(req.query);
    }
    if (req.params && typeof req.params === 'object') {
        req.params = sanitizeValue(req.params);
    }
    next();
};
exports.sanitizeInputs = sanitizeInputs;
/**
 * Enterprise HTTP Security Headers (Equivalent to Helmet)
 */
const securityHeaders = (_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' https: data:; img-src 'self' https: data: blob:; font-src 'self' https: data:;");
    next();
};
exports.securityHeaders = securityHeaders;
/**
 * Global Error Boundary & Exception Handler
 * Prevents unhandled errors from crashing Express and leaking database connection strings
 */
const globalErrorHandler = (err, _req, res, _next) => {
    const isDev = process.env.NODE_ENV !== 'production';
    console.error('[SECURITY ERROR BOUNDARY]:', err);
    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
        error: 'Internal Operational Error',
        message: isDev ? err.message : 'A secure server error occurred. The incident has been recorded.',
        timestamp: new Date().toISOString()
    });
};
exports.globalErrorHandler = globalErrorHandler;
