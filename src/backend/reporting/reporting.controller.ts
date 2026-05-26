import { Router } from 'express';
import { prisma } from '../db/prisma';

export const reportingRouter = Router();

// Export settlement CSV 
reportingRouter.get('/export/settlements', async (req, res) => {
  try {
    const settlements = await prisma.settlement.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const csvRows = [
      ['ID', 'Reference', 'Amount', 'Currency', 'Status', 'Date'],
      ...settlements.map(s => [
        s.id,
        s.reference,
        s.amount.toString(),
        s.currency,
        s.status,
        s.createdAt.toISOString()
      ])
    ];

    const csvString = csvRows.map(r => r.join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=settlements.csv');
    res.status(200).send(csvString);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate report' });
  }
});
