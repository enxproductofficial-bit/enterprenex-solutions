"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/kpis (List employee KPI scorecards with RBAC ownership)
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const isDirectorOrManager = req.user?.role === 'Super Admin' ||
            req.user?.role === 'Director' ||
            req.user?.role === 'Project Manager' ||
            req.user?.role === 'HR Manager';
        let scorecards;
        if (isDirectorOrManager) {
            scorecards = await db_1.prisma.kpiScorecard.findMany();
        }
        else {
            const empId = req.user?.employeeId || req.user?.id || '__none__';
            scorecards = await db_1.prisma.kpiScorecard.findMany({
                where: {
                    OR: [
                        { employeeId: empId },
                        { employeeName: req.user?.name }
                    ]
                }
            });
        }
        const formatted = scorecards.map(s => ({
            ...s,
            metrics: JSON.parse(s.metricsJson)
        }));
        res.json({ kpis: formatted });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// PUT /api/kpis/:employeeId/metric (Update quantitative KPI metric & recalculate weighted sum)
router.put('/:employeeId/metric', auth_1.authenticateToken, (0, auth_1.requireRole)(['Super Admin', 'Project Manager']), async (req, res) => {
    try {
        const { employeeId } = req.params;
        const { metricId, actual, score } = req.body;
        const scorecard = await db_1.prisma.kpiScorecard.findFirst({
            where: { employeeId }
        });
        if (!scorecard) {
            res.status(404).json({ error: 'KPI scorecard not found for this employee.' });
            return;
        }
        const currentMetrics = JSON.parse(scorecard.metricsJson);
        const updatedMetrics = currentMetrics.map((m) => m.id === metricId ? { ...m, actual, score: Number(score) } : m);
        // Mathematical weighted formula: sum(score * weight / 100)
        const newFinalScore = Math.round(updatedMetrics.reduce((sum, m) => sum + (m.score * (m.weight / 100)), 0) * 10) / 10;
        const updated = await db_1.prisma.kpiScorecard.update({
            where: { id: scorecard.id },
            data: {
                metricsJson: JSON.stringify(updatedMetrics),
                finalKpiScore: newFinalScore
            }
        });
        // Also update Employee profile kpiScore
        await db_1.prisma.employee.updateMany({
            where: { employeeId },
            data: { kpiScore: newFinalScore }
        });
        res.json({
            message: 'KPI metric updated and weighted score recalculated.',
            finalKpiScore: newFinalScore,
            scorecard: {
                ...updated,
                metrics: updatedMetrics
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET /api/okrs
router.get('/okrs', auth_1.authenticateToken, async (req, res) => {
    try {
        const okrs = await db_1.prisma.objectiveKeyResult.findMany();
        const formatted = okrs.map(o => ({
            ...o,
            keyResults: JSON.parse(o.keyResultsJson)
        }));
        res.json({ okrs: formatted });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// PUT /api/okrs/:id/progress
router.put('/okrs/:id/progress', auth_1.authenticateToken, (0, auth_1.requireRole)(['Super Admin', 'Project Manager']), async (req, res) => {
    try {
        const { id } = req.params;
        const { krId, current, progressPercent } = req.body;
        const okr = await db_1.prisma.objectiveKeyResult.findUnique({ where: { id } });
        if (!okr) {
            res.status(404).json({ error: 'OKR not found.' });
            return;
        }
        const currentKrs = JSON.parse(okr.keyResultsJson);
        const updatedKrs = currentKrs.map((kr) => kr.id === krId ? { ...kr, current, progressPercent: Number(progressPercent) } : kr);
        const overallProgress = Math.round(updatedKrs.reduce((sum, kr) => sum + kr.progressPercent, 0) / updatedKrs.length);
        const updated = await db_1.prisma.objectiveKeyResult.update({
            where: { id },
            data: {
                keyResultsJson: JSON.stringify(updatedKrs),
                progressPercent: overallProgress
            }
        });
        res.json({
            message: 'OKR key result progress updated.',
            okr: {
                ...updated,
                keyResults: updatedKrs
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
