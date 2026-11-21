import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface ICurrencyHistory extends Document {
  userId: Types.ObjectId;
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  result: number;
  rate: number;
  createdAt: Date;
}

const CurrencyHistorySchema = new Schema<ICurrencyHistory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fromCurrency: { type: String, required: true, uppercase: true },
    toCurrency: { type: String, required: true, uppercase: true },
    amount: { type: Number, required: true },
    result: { type: Number, required: true },
    rate: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: false,
  }
);

export const CurrencyHistory: Model<ICurrencyHistory> = mongoose.model<ICurrencyHistory>('CurrencyHistory', CurrencyHistorySchema);
