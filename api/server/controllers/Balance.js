const { Balance } = require('~/db/models');
const PricingService = require('~/server/services/PricingService');

async function balanceController(req, res) {
  const balanceData = await Balance.findOne(
    { user: req.user.id },
    '-_id tokenCredits autoRefillEnabled refillIntervalValue refillIntervalUnit lastRefill refillAmount',
  ).lean();

  if (!balanceData) {
    return res.status(404).json({ error: 'Balance not found' });
  }

  // aim2balance.ai: Calculate EUR and USD from tokenCredits
  // tokenCredits now represents EUR (1M credits = €1)
  const balanceEUR = PricingService.tokenCreditsToEur(balanceData.tokenCredits);
  const exchangeRate = await PricingService.getExchangeRate();
  const balanceUSD = balanceEUR / exchangeRate;

  // If auto-refill is not enabled, remove auto-refill related fields from the response
  if (!balanceData.autoRefillEnabled) {
    delete balanceData.refillIntervalValue;
    delete balanceData.refillIntervalUnit;
    delete balanceData.lastRefill;
    delete balanceData.refillAmount;
  }

  res.status(200).json({
    ...balanceData,
    balanceEUR,
    balanceUSD,
    exchangeRate,
  });
}

module.exports = balanceController;
