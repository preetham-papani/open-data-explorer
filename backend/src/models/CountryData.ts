import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICountryData extends Document {
  cca2: string;
  cca3: string;
  name: string;
  officialName: string;
  capital: string[];
  region: string;
  subregion: string;
  population: number;
  area: number;
  flag: string;
  flags: {
    png: string;
    svg: string;
    alt?: string;
  };
  currencies: Record<string, { name: string; symbol: string }>;
  languages: Record<string, string>;
  timezones: string[];
  borders: string[];
  latlng: number[];
  maps: {
    googleMaps?: string;
    openStreetMaps?: string;
  };
  cachedAt: Date;
  expiresAt: Date;
}

const CountryDataSchema = new Schema<ICountryData>(
  {
    cca2: { type: String, required: true, uppercase: true, index: true },
    cca3: { type: String, required: true, uppercase: true, unique: true, index: true },
    name: { type: String, required: true, index: true },
    officialName: { type: String, default: '' },
    capital: [{ type: String }],
    region: { type: String, required: true, index: true },
    subregion: { type: String, default: '' },
    population: { type: Number, required: true, index: true },
    area: { type: Number, default: 0 },
    flag: { type: String, default: '🌐' },
    flags: {
      png: { type: String, default: '' },
      svg: { type: String, default: '' },
      alt: { type: String, default: '' },
    },
    currencies: { type: Schema.Types.Mixed, default: {} },
    languages: { type: Schema.Types.Mixed, default: {} },
    timezones: [{ type: String }],
    borders: [{ type: String }],
    latlng: [{ type: Number }],
    maps: {
      googleMaps: { type: String, default: '' },
      openStreetMaps: { type: String, default: '' },
    },
    cachedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true, index: true },
  },
  {
    timestamps: true,
  }
);

// Compound text index for fast search by name, officialName, capital
CountryDataSchema.index({ name: 'text', officialName: 'text', capital: 'text' });

export const CountryData: Model<ICountryData> = mongoose.model<ICountryData>('CountryData', CountryDataSchema);
