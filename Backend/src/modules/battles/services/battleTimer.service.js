const logger = require('../../../utils/logger');

class BattleTimerService {
  constructor() {
    this.phaseTimers = new Map();
    this.tickIntervals = new Map();
  }

  clear(matchId) {
    const timeout = this.phaseTimers.get(matchId);
    if (timeout) {
      clearTimeout(timeout);
      this.phaseTimers.delete(matchId);
    }

    const interval = this.tickIntervals.get(matchId);
    if (interval) {
      clearInterval(interval);
      this.tickIntervals.delete(matchId);
    }
  }

  schedule({ matchId, durationSec, onTick, onExpire }) {
    this.clear(matchId);

    let remaining = Math.max(0, Number(durationSec || 0));
    if (remaining <= 0) {
      onExpire?.();
      return;
    }

    onTick?.(remaining);

    const interval = setInterval(() => {
      remaining -= 1;
      if (remaining > 0) {
        onTick?.(remaining);
      }
    }, 1000);
    this.tickIntervals.set(matchId, interval);

    const timeout = setTimeout(async () => {
      try {
        this.clear(matchId);
        await onExpire?.();
      } catch (error) {
        logger.error('Battle timer expiration callback failed', { matchId, message: error?.message });
      }
    }, remaining * 1000);

    this.phaseTimers.set(matchId, timeout);
  }
}

module.exports = new BattleTimerService();
