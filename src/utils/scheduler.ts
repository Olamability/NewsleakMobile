import { IngestionService } from '../services/ingestion.service';

interface SchedulerConfig {
  intervalMinutes?: number;
  maxRetries?: number;
  retryDelayMinutes?: number;
  onSuccess?: (results: Array<{ success: boolean }>) => void;
  onError?: (error: Error) => void;
}

export class IngestionScheduler {
  private ingestionService: IngestionService;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private config: Required<SchedulerConfig>;

  constructor(config?: SchedulerConfig) {
    this.ingestionService = new IngestionService();
    this.config = {
      intervalMinutes: config?.intervalMinutes || 60, // Default: every hour
      maxRetries: config?.maxRetries || 3,
      retryDelayMinutes: config?.retryDelayMinutes || 5,
      onSuccess: config?.onSuccess || (() => {}),
      onError: config?.onError || ((error) => console.error('Scheduler error:', error)),
    };
  }

  /**
   * Start the scheduler
   */
  start(): void {
    if (this.isRunning) {
      console.warn('Scheduler is already running');
      return;
    }

    console.warn(`Starting ingestion scheduler (interval: ${this.config.intervalMinutes} minutes)`);
    this.isRunning = true;

    // Run immediately on start
    this.runIngestion();

    // Schedule periodic runs
    const intervalMs = this.config.intervalMinutes * 60 * 1000;
    this.intervalId = setInterval(() => {
      this.runIngestion();
    }, intervalMs);
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (!this.isRunning) {
      console.warn('Scheduler is not running');
      return;
    }

    console.warn('Stopping ingestion scheduler');
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Check if scheduler is running
   */
  getStatus(): {
    isRunning: boolean;
    intervalMinutes: number;
    nextRunIn?: number;
  } {
    return {
      isRunning: this.isRunning,
      intervalMinutes: this.config.intervalMinutes,
    };
  }

  /**
   * Run ingestion with retry logic
   */
  private async runIngestion(retryCount: number = 0): Promise<void> {
    try {
      console.warn(`\n[${new Date().toISOString()}] Running scheduled ingestion...`);
      const results = await this.ingestionService.ingestFromAllSources();

      // Check if any ingestions failed
      const failedCount = results.filter((r) => !r.success).length;

      if (failedCount > 0 && retryCount < this.config.maxRetries) {
        console.warn(
          `${failedCount} sources failed. Retrying in ${this.config.retryDelayMinutes} minutes...`
        );

        // Retry failed sources after delay
        setTimeout(
          () => {
            this.runIngestion(retryCount + 1);
          },
          this.config.retryDelayMinutes * 60 * 1000
        );
      } else {
        this.config.onSuccess(results);
      }
    } catch (error) {
      console.error('Error during scheduled ingestion:', error);
      this.config.onError(error as Error);

      // Retry on error
      if (retryCount < this.config.maxRetries) {
        console.warn(`Retrying in ${this.config.retryDelayMinutes} minutes...`);
        setTimeout(
          () => {
            this.runIngestion(retryCount + 1);
          },
          this.config.retryDelayMinutes * 60 * 1000
        );
      }
    }
  }

  /**
   * Update scheduler configuration
   */
  updateConfig(config: Partial<SchedulerConfig>): void {
    const wasRunning = this.isRunning;

    // Stop if running
    if (wasRunning) {
      this.stop();
    }

    // Update config
    this.config = {
      ...this.config,
      ...config,
    };

    // Restart if was running
    if (wasRunning) {
      this.start();
    }
  }

  /**
   * Trigger manual ingestion (doesn't affect schedule)
   */
  async triggerManual(): Promise<void> {
    console.warn('Triggering manual ingestion...');
    await this.runIngestion();
  }
}

/**
 * Create and configure a default scheduler instance
 */
export function createDefaultScheduler(): IngestionScheduler {
  return new IngestionScheduler({
    intervalMinutes: 15, // Run every 15 minutes for realtime news curation
    maxRetries: 3,
    retryDelayMinutes: 5,
    onSuccess: (results) => {
      const summary = {
        total: results.length,
        successful: results.filter((r: { success: boolean }) => r.success).length,
        failed: results.filter((r: { success: boolean }) => !r.success).length,
      };
      console.warn('Ingestion completed:', summary);
    },
    onError: (error) => {
      console.error('Ingestion scheduler error:', error);
    },
  });
}

/**
 * Singleton instance for global scheduler
 */
let globalScheduler: IngestionScheduler | null = null;

/**
 * Get or create global scheduler instance
 */
export function getGlobalScheduler(): IngestionScheduler {
  if (!globalScheduler) {
    globalScheduler = createDefaultScheduler();
  }
  return globalScheduler;
}

/**
 * Start global scheduler
 */
export function startGlobalScheduler(): void {
  const scheduler = getGlobalScheduler();
  scheduler.start();
}

/**
 * Stop global scheduler
 */
export function stopGlobalScheduler(): void {
  if (globalScheduler) {
    globalScheduler.stop();
  }
}
