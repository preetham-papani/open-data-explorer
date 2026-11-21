import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface ISearchHistory extends Document {
  userId: Types.ObjectId;
  query: string;
  type: 'country' | 'weather' | 'currency';
  metadata?: Record<string, any>;
  createdAt: Date;
}

const SearchHistorySchema = new Schema<ISearchHistory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    query: { type: String, required: true, trim: true },
    type: { type: String, enum: ['country', 'weather', 'currency'], required: true, index: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: false,
  }
);

export const SearchHistory: Model<ISearchHistory> = mongoose.model<ISearchHistory>('SearchHistory', SearchHistorySchema);
