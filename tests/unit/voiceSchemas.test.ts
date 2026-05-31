// Lightweight manual validation for the intent payload used in tests.
const isValidIntent = (payload) => {
  if (typeof payload !== 'object' || payload === null) return false;
  const { intent, confidence, requiresConfirmation, entities } = payload;
  const allowedIntents = ['create_task', 'update_task_status', 'query_today_tasks', 'unknown'];
  if (!allowedIntents.includes(intent)) return false;
  if (typeof confidence !== 'number' || confidence < 0 || confidence > 1) return false;
  if (typeof requiresConfirmation !== 'boolean') return false;
  if (typeof entities !== 'object' || entities === null) return false;
  if ('title' in entities && entities.title !== null && typeof entities.title !== 'string') return false;
  return true;
};

describe('voice intent schema (manual validator)', () => {
  it('accepts valid intent payload', () => {
    const payload = {
      intent: 'create_task',
      confidence: 0.9,
      requiresConfirmation: true,
      entities: {
        title: 'Finalize budget',
        priority: 'High',
        assigneeName: 'Ali',
        assigneeUserId: null,
        deadlineIso: '2026-06-01T10:00:00Z',
        status: 'pending',
        description: null,
      },
      missingFields: [],
    };

    expect(isValidIntent(payload)).toBe(true);
  });

  it('rejects invalid confidence', () => {
    const payload = {
      intent: 'create_task',
      confidence: 2,
      requiresConfirmation: true,
      entities: {
        title: 'Finalize budget',
        priority: 'High',
        assigneeName: 'Ali',
        assigneeUserId: null,
        deadlineIso: '2026-06-01T10:00:00Z',
        status: 'pending',
        description: null,
      },
    };

    expect(isValidIntent(payload)).toBe(false);
  });
});
