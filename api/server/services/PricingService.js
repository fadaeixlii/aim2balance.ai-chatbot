const { logger } = require('~/config');

/**
 * PricingService - EUR-based pricing calculations for aim2balance.ai
 *
 * Primary currency: EUR
 * Display: Both USD and EUR
 *
 * Calculation flow:
 * 1. Get base USD cost from provider pricing
 * 2. Apply provider markup (+15%)
 * 3. Apply rebalancing fee (+2-3%)
 * 4. Convert to EUR using current exchange rate
 * 5. Store both USD and EUR for transparency
 */
class PricingService {
  constructor() {
    this.exchangeRate = null;
    this.lastFetch = null;
    this.CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    // Configuration from environment variables
    this.PROVIDER_MARKUP = parseFloat(process.env.PROVIDER_MARKUP || '0.15'); // 15% default
    this.REBALANCING_FEE = parseFloat(process.env.REBALANCING_FEE || '0.025'); // 2.5% default
    this.FALLBACK_RATE = parseFloat(process.env.FALLBACK_EUR_RATE || '0.92'); // EUR per 1 USD

    logger.info('[PricingService] Initialized with config:', {
      providerMarkup: `${this.PROVIDER_MARKUP * 100}%`,
      rebalancingFee: `${this.REBALANCING_FEE * 100}%`,
      fallbackRate: this.FALLBACK_RATE,
    });
  }

  /**
   * Fetches the current USD to EUR exchange rate
   * Uses exchangerate-api.com (free tier: 1,500 requests/month)
   * Falls back to hardcoded rate if API unavailable
   *
   * @returns {Promise<number>} Exchange rate (EUR per 1 USD)
   */
  async getExchangeRate() {
    // Check cache
    if (this.exchangeRate && this.lastFetch && Date.now() - this.lastFetch < this.CACHE_DURATION) {
      logger.debug('[PricingService] Using cached exchange rate:', this.exchangeRate);
      return this.exchangeRate;
    }

    try {
      // Fetch from exchangerate-api.com (free tier)
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();

      if (data.rates?.EUR) {
        this.exchangeRate = data.rates.EUR;
        this.lastFetch = Date.now();
        logger.info('[PricingService] Exchange rate updated:', {
          rate: this.exchangeRate,
          source: 'exchangerate-api.com',
          timestamp: new Date().toISOString(),
        });
        return this.exchangeRate;
      }

      throw new Error('Invalid API response - missing EUR rate');
    } catch (error) {
      logger.warn('[PricingService] Failed to fetch exchange rate, using fallback:', {
        error: error.message,
        fallbackRate: this.FALLBACK_RATE,
      });
      this.exchangeRate = this.FALLBACK_RATE;
      this.lastFetch = Date.now();
      return this.exchangeRate;
    }
  }

  /**
   * Calculates EUR cost for token usage
   * Primary currency is EUR, but we calculate and store both USD and EUR
   *
   * Formula:
   * 1. costUSD = (tokens / 1,000,000) * rateUSD
   * 2. costWithMarkup = costUSD * (1 + providerMarkup)
   * 3. costWithFees = costWithMarkup * (1 + rebalancingFee)
   * 4. costEUR = costWithFees * exchangeRate
   *
   * @param {Object} params
   * @param {number} params.tokens - Number of tokens used
   * @param {number} params.rateUSD - USD rate per 1M tokens (from provider pricing)
   * @param {string} [params.provider] - AI provider name (for logging)
   * @param {string} [params.model] - Model name (for logging)
   * @returns {Promise<Object>} Cost details with both USD and EUR
   */
  async calculateCost({ tokens, rateUSD, provider, model }) {
    // 1. Calculate base USD cost (what the provider charges)
    const costUSD = (tokens / 1_000_000) * rateUSD;

    // 2. Get current USD to EUR exchange rate
    const exchangeRate = await this.getExchangeRate();

    // 3. Apply provider markup (our margin)
    const costWithMarkup = costUSD * (1 + this.PROVIDER_MARKUP);

    // 4. Apply rebalancing fee (environmental contribution)
    const costWithFees = costWithMarkup * (1 + this.REBALANCING_FEE);

    // 5. Convert to EUR (primary currency)
    const costEUR = costWithFees * exchangeRate;

    // Log calculation for debugging
    logger.debug('[PricingService] Cost calculation:', {
      tokens,
      rateUSD,
      costUSD: costUSD.toFixed(6),
      providerMarkup: `${this.PROVIDER_MARKUP * 100}%`,
      costWithMarkup: costWithMarkup.toFixed(6),
      rebalancingFee: `${this.REBALANCING_FEE * 100}%`,
      costWithFees: costWithFees.toFixed(6),
      exchangeRate,
      costEUR: costEUR.toFixed(6),
      provider,
      model,
    });

    return {
      costUSD,
      costEUR,
      exchangeRate,
      providerMarkup: this.PROVIDER_MARKUP,
      rebalancingFee: this.REBALANCING_FEE,
    };
  }

  /**
   * Converts EUR to token credits for backward compatibility
   * 1,000,000 credits = €1.00
   *
   * @param {number} costEUR - Cost in EUR
   * @returns {number} Token credits
   */
  eurToTokenCredits(costEUR) {
    return costEUR * 1000000;
  }

  /**
   * Converts token credits to EUR
   * 1,000,000 credits = €1.00
   *
   * @param {number} credits - Token credits
   * @returns {number} Cost in EUR
   */
  tokenCreditsToEur(credits) {
    return credits / 1000000;
  }

  /**
   * Manually set exchange rate (for testing or manual override)
   *
   * @param {number} rate - EUR per 1 USD
   */
  setExchangeRate(rate) {
    this.exchangeRate = rate;
    this.lastFetch = Date.now();
    logger.info('[PricingService] Exchange rate manually set:', rate);
  }

  /**
   * Get current configuration
   *
   * @returns {Object} Current pricing configuration
   */
  getConfig() {
    return {
      providerMarkup: this.PROVIDER_MARKUP,
      rebalancingFee: this.REBALANCING_FEE,
      exchangeRate: this.exchangeRate,
      fallbackRate: this.FALLBACK_RATE,
      lastFetch: this.lastFetch ? new Date(this.lastFetch).toISOString() : null,
    };
  }
}

// Export singleton instance
module.exports = new PricingService();
