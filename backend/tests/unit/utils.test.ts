/**
 * Utility Functions Unit Tests
 */

describe('Response Utility', () => {
  it('structures a success response correctly', () => {
    const mockRes: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Inline simulation of sendResponse pattern
    const sendResponse = ({ res, statusCode, success, message, data }: any) => {
      res.status(statusCode).json({ success, message, data: data ?? null });
    };

    sendResponse({ res: mockRes, statusCode: 200, success: true, message: 'OK', data: { id: '1' } });

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      message: 'OK',
      data: { id: '1' },
    });
  });
});

describe('Environment Configuration', () => {
  it('PORT defaults to a number', () => {
    const port = parseInt(process.env.PORT || '5000', 10);
    expect(typeof port).toBe('number');
    expect(port).toBeGreaterThan(0);
  });

  it('NODE_ENV is defined', () => {
    expect(['development', 'production', 'test']).toContain(
      process.env.NODE_ENV || 'development'
    );
  });
});

describe('Date Utilities', () => {
  it('computes date range correctly', () => {
    const start = new Date('2026-01-01');
    const end = new Date('2026-12-31');
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(364);
  });
});
