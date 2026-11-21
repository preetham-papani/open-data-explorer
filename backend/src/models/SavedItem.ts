import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface ISavedItem extends Document {
  userId: Types.ObjectId;
  itemType: 'country' | 'weather' | 'currency';
  itemId: string; // e.g. country cca3 (IND), city name (Hyderabad), or currency pair (USD_INR)
  title: string;
  subtitle: string;
  data: Record<string, any>;
  createdAt: Date;
}

const SavedItemSchema = new Schema<ISavedItem>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    itemType: { type: String, enum: ['country', 'weather', 'currency'], required: true, index: true },
    itemId: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    data: { type: Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate saved item per user
SavedItemSchema.index({ userId: 1, itemType: 1, itemId: 1 }, { unique: true });

export const SavedItem: Model<ISavedItem> = mongoose.model<ISavedItem>('SavedItem', SavedItemSchema);
