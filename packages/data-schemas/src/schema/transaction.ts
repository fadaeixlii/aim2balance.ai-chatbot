import mongoose, { Schema, Document, Types } from 'mongoose';

// @ts-ignore
export interface ITransaction extends Document {
  user: Types.ObjectId;
  conversationId?: string;
  tokenType: 'prompt' | 'completion' | 'credits';
  model?: string;
  context?: string;
  valueKey?: string;
  rate?: number;
  rawAmount?: number;
  tokenValue?: number;
  inputTokens?: number;
  writeTokens?: number;
  readTokens?: number;

  // aim2balance.ai: EUR Cost Tracking
  // Primary currency is EUR, but we store both for transparency
  costUSD?: number; // Base cost in USD (from provider pricing)
  costEUR?: number; // Final cost in EUR (primary currency for billing)
  exchangeRate?: number; // USD to EUR exchange rate used
  providerMarkup?: number; // Markup percentage applied (e.g., 0.15 for 15%)
  rebalancingFee?: number; // Environmental fee percentage (e.g., 0.025 for 2.5%)

  // aim2balance.ai: Provider & Performance Tracking
  provider?: string; // AI provider: 'openai', 'anthropic', 'google', etc.
  endpoint?: string; // API endpoint used
  durationMs?: number; // Request duration in milliseconds

  createdAt?: Date;
  updatedAt?: Date;
}

const transactionSchema: Schema<ITransaction> = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      required: true,
    },
    conversationId: {
      type: String,
      ref: 'Conversation',
      index: true,
    },
    tokenType: {
      type: String,
      enum: ['prompt', 'completion', 'credits'],
      required: true,
    },
    model: {
      type: String,
    },
    context: {
      type: String,
    },
    valueKey: {
      type: String,
    },
    rate: Number,
    rawAmount: Number,
    tokenValue: Number,
    inputTokens: { type: Number },
    writeTokens: { type: Number },
    readTokens: { type: Number },

    // aim2balance.ai: EUR Cost Tracking Fields
    costUSD: { type: Number },
    costEUR: { type: Number, index: true }, // Indexed for reporting queries
    exchangeRate: { type: Number },
    providerMarkup: { type: Number },
    rebalancingFee: { type: Number },

    // aim2balance.ai: Provider & Performance Tracking
    provider: { type: String, index: true }, // Indexed for provider-based queries
    endpoint: { type: String },
    durationMs: { type: Number },
  },
  {
    timestamps: true,
  },
);

export default transactionSchema;
