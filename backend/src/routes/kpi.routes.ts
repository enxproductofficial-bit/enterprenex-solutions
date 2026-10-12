import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/kpis (List all employee KPI scorecards)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const scorecards = await prisma.kpiScorecard.findMany();
    const formatted = scorecards.map(s => ({
      ...s,
      metrics: JSON.parse(s.metricsJson)
    }));
    res.json({ kpis: formatted });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/kpis/:employeeId/metric (Update quantitative KPI metric & recalculate weighted sum)
router.put('/:employeeId/metric', authenticateToken, requireRole(['Super Admin', 'Project Manager']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { employeeId } = req.params;
    const { metricId, actual, score } = req.body;

    const scorecard = await prisma.kpiScorecard.findFirst({
      where: { employeeId }
    });

    if (!scorecard) {
      res.status(404).json({ error: 'KPI scorecard not found for this employee.' });
      return;
    }

    const currentMetrics = JSON.parse(scorecard.metricsJson);
    const updatedMetrics = currentMetrics.map((m: any) =>
      m.id === metricId ? { ...m, actual, score: Number(score) } : m
    );

    // Mathematical weighted formula: sum(score * weight / 100)
    const newFinalScore = Math.round(
      updatedMetrics.reduce((sum: number, m: any) => sum + (m.score * (m.weight / 100)), 0) * 10
    ) / 10;

    const updated = await prisma.kpiScorecard.update({
      where: { id: scorecard.id },
      data: {
        metricsJson: JSON.stringify(updatedMetrics),
        finalKpiScore: newFinalScore
      }
    });

    // Also update Employee profile kpiScore
    await prisma.employee.updateMany({
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/okrs
router.get('/okrs', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const okrs = await prisma.objectiveKeyResult.findMany();
    const formatted = okrs.map(o => ({
      ...o,
      keyResults: JSON.parse(o.keyResultsJson)
    }));
    res.json({ okrs: formatted });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/okrs/:id/progress
router.put('/okrs/:id/progress', authenticateToken, requireRole(['Super Admin', 'Project Manager']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { krId, current, progressPercent } = req.body;

    const okr = await prisma.objectiveKeyResult.findUnique({ where: { id } });
    if (!okr) {
      res.status(404).json({ error: 'OKR not found.' });
      return;
    }

    const currentKrs = JSON.parse(okr.keyResultsJson);
    const updatedKrs = currentKrs.map((kr: any) =>
      kr.id === krId ? { ...kr, current, progressPercent: Number(progressPercent) } : kr
    );

    const overallProgress = Math.round(
      updatedKrs.reduce((sum: number, kr: any) => sum + kr.progressPercent, 0) / updatedKrs.length
    );

    const updated = await prisma.objectiveKeyResult.update({
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
