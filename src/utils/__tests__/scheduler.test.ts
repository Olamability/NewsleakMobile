import { IngestionScheduler, createDefaultScheduler } from '../scheduler';

jest.mock('../../services/ingestion.service');

describe('IngestionScheduler', () => {
  let scheduler: IngestionScheduler;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('initialization', () => {
    it('should create scheduler with default config', () => {
      scheduler = createDefaultScheduler();
      const status = scheduler.getStatus();

      expect(status.isRunning).toBe(false);
      expect(status.intervalMinutes).toBe(15); // Updated to 15 minutes for realtime
    });

    it('should create scheduler with custom config', () => {
      scheduler = new IngestionScheduler({
        intervalMinutes: 30,
        maxRetries: 5,
      });

      const status = scheduler.getStatus();
      expect(status.isRunning).toBe(false);
      expect(status.intervalMinutes).toBe(30);
    });
  });

  describe('start/stop', () => {
    it('should start scheduler', () => {
      scheduler = createDefaultScheduler();
      scheduler.start();

      const status = scheduler.getStatus();
      expect(status.isRunning).toBe(true);
    });

    it('should stop scheduler', () => {
      scheduler = createDefaultScheduler();
      scheduler.start();
      scheduler.stop();

      const status = scheduler.getStatus();
      expect(status.isRunning).toBe(false);
    });

    it('should not start if already running', () => {
      scheduler = createDefaultScheduler();
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      scheduler.start();
      scheduler.start(); // Try to start again

      expect(consoleWarnSpy).toHaveBeenCalledWith('Scheduler is already running');
      consoleWarnSpy.mockRestore();
    });

    it('should not stop if not running', () => {
      scheduler = createDefaultScheduler();
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      scheduler.stop(); // Try to stop when not running

      expect(consoleWarnSpy).toHaveBeenCalledWith('Scheduler is not running');
      consoleWarnSpy.mockRestore();
    });
  });

  describe('manual trigger', () => {
    it('should trigger manual ingestion', async () => {
      scheduler = createDefaultScheduler();
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      await scheduler.triggerManual();

      expect(consoleWarnSpy).toHaveBeenCalledWith('Triggering manual ingestion...');
      consoleWarnSpy.mockRestore();
    });
  });

  describe('config updates', () => {
    it('should update config while running', () => {
      scheduler = createDefaultScheduler();
      scheduler.start();

      scheduler.updateConfig({ intervalMinutes: 20 });

      const status = scheduler.getStatus();
      expect(status.intervalMinutes).toBe(20);
      expect(status.isRunning).toBe(true);
    });

    it('should update config while stopped', () => {
      scheduler = createDefaultScheduler();

      scheduler.updateConfig({ intervalMinutes: 20 });

      const status = scheduler.getStatus();
      expect(status.intervalMinutes).toBe(20);
      expect(status.isRunning).toBe(false);
    });
  });
});
