import axios from 'axios';
import { CountryData, ICountryData } from '../models/CountryData.js';
import { ENV } from '../config/env.js';

const COUNTRIES_SOURCE_URL =
  'https://gist.githubusercontent.com/yesoreyeram/2433ce69862f452b9d0460c947ee191f/raw/countries.json';

interface CountryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  region?: string;
  sortBy?: 'name' | 'population' | 'area';
  sortOrder?: 'asc' | 'desc';
}

export class CountryService {
  /**
   * Ensure cache is populated in MongoDB
   */
  public static async ensureCache(): Promise<void> {
    const count = await CountryData.countDocuments();
    if (count > 0) {
      // Check if any fresh record exists
      const freshRecord = await CountryData.findOne({ expiresAt: { $gt: new Date() } });
      if (freshRecord) {
        return; // Cache is still valid
      }
    }

    console.log('🔄 [CountryService] Refreshing Country Cache from external source...');
    await this.fetchAndCacheAll();
  }

  /**
   * Fetch all country records and bulk upsert into MongoDB
   */
  public static async fetchAndCacheAll(): Promise<number> {
    const response = await axios.get<any[]>(COUNTRIES_SOURCE_URL, { timeout: 15000 });
    const rawCountries = response.data;

    if (!Array.isArray(rawCountries) || rawCountries.length === 0) {
      throw new Error('Failed to retrieve valid country records from external provider.');
    }

    const expiryDate = new Date(Date.now() + ENV.CACHE_TTL_MINUTES * 60 * 1000);
    const now = new Date();

    const bulkOps = rawCountries.map((c) => {
      const cca2 = (c.alpha2Code || '').toUpperCase();
      const cca3 = (c.alpha3Code || cca2).toUpperCase();
      const name = c.name || '';
      const officialName = c.nativeName || name;
      const capital = Array.isArray(c.capital) ? c.capital : c.capital ? [c.capital] : [];
      const region = c.region || 'Other';
      const subregion = c.subregion || '';
      const population = typeof c.population === 'number' ? c.population : 0;
      const area = typeof c.area === 'number' ? c.area : 0;
      const flagEmoji = c.flag || '🌐';

      // Currencies transformation
      const currenciesMap: Record<string, { name: string; symbol: string }> = {};
      if (Array.isArray(c.currencies)) {
        c.currencies.forEach((cur: any) => {
          if (cur && cur.code) {
            currenciesMap[cur.code] = {
              name: cur.name || cur.code,
              symbol: cur.symbol || cur.code,
            };
          }
        });
      }

      // Languages transformation
      const languagesMap: Record<string, string> = {};
      if (Array.isArray(c.languages)) {
        c.languages.forEach((lang: any) => {
          if (lang && lang.name) {
            const key = lang.iso639_1 || lang.iso639_2 || lang.name.toLowerCase();
            languagesMap[key] = lang.name;
          }
        });
      }

      return {
        updateOne: {
          filter: { cca3 },
          update: {
            $set: {
              cca2,
              cca3,
              name,
              officialName,
              capital,
              region,
              subregion,
              population,
              area,
              flag: flagEmoji,
              flags: {
                png: `https://flagcdn.com/w320/${cca2.toLowerCase()}.png`,
                svg: `https://flagcdn.com/${cca2.toLowerCase()}.svg`,
                alt: `Flag of ${name}`,
              },
              currencies: currenciesMap,
              languages: languagesMap,
              timezones: Array.isArray(c.timezones) ? c.timezones : [],
              borders: Array.isArray(c.borders) ? c.borders : [],
              latlng: Array.isArray(c.latlng) ? c.latlng : [],
              maps: {
                googleMaps: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`,
                openStreetMaps: `https://www.openstreetmap.org/search?query=${encodeURIComponent(name)}`,
              },
              cachedAt: now,
              expiresAt: expiryDate,
            },
          },
          upsert: true,
        },
      };
    });

    await CountryData.bulkWrite(bulkOps);
    console.log(`✅ [CountryService] Cached ${bulkOps.length} country records into MongoDB.`);
    return bulkOps.length;
  }

  /**
   * Get countries with filtering, sorting, and pagination
   */
  public static async getCountries(params: CountryQueryParams) {
    await this.ensureCache();

    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 12));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (params.region && params.region.toLowerCase() !== 'all') {
      filter.region = new RegExp(`^${params.region.trim()}$`, 'i');
    }

    if (params.search && params.search.trim()) {
      const q = params.search.trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { officialName: { $regex: q, $options: 'i' } },
        { cca2: { $regex: `^${q}$`, $options: 'i' } },
        { cca3: { $regex: `^${q}$`, $options: 'i' } },
        { capital: { $regex: q, $options: 'i' } },
      ];
    }

    const sortField = params.sortBy || 'name';
    const sortDir = params.sortOrder === 'desc' ? -1 : 1;
    const sortOptions: Record<string, 1 | -1> = { [sortField]: sortDir };

    const [total, countries] = await Promise.all([
      CountryData.countDocuments(filter),
      CountryData.find(filter).sort(sortOptions).skip(skip).limit(limit).lean(),
    ]);

    return {
      countries,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      cached: true,
    };
  }

  /**
   * Search countries specifically by keyword
   */
  public static async searchCountries(keyword: string) {
    await this.ensureCache();

    const q = keyword.trim();
    if (!q) {
      return [];
    }

    return CountryData.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { officialName: { $regex: q, $options: 'i' } },
        { cca2: { $regex: `^${q}$`, $options: 'i' } },
        { cca3: { $regex: `^${q}$`, $options: 'i' } },
        { capital: { $regex: q, $options: 'i' } },
      ],
    })
      .sort({ population: -1 })
      .limit(20)
      .lean();
  }

  /**
   * Get single country by CCA2 or CCA3 code
   */
  public static async getCountryByCode(code: string): Promise<ICountryData | null> {
    await this.ensureCache();
    const normalized = code.trim().toUpperCase();

    const country = await CountryData.findOne({
      $or: [{ cca2: normalized }, { cca3: normalized }],
    }).lean();

    return country as ICountryData | null;
  }

  /**
   * Get countries by geographic region
   */
  public static async getCountriesByRegion(region: string) {
    await this.ensureCache();

    return CountryData.find({
      region: new RegExp(`^${region.trim()}$`, 'i'),
    })
      .sort({ population: -1 })
      .lean();
  }

  /**
   * Compare two countries side by side with calculated comparative metrics
   */
  public static async compareCountries(code1: string, code2: string) {
    await this.ensureCache();

    const [country1, country2] = await Promise.all([
      this.getCountryByCode(code1),
      this.getCountryByCode(code2),
    ]);

    if (!country1 || !country2) {
      throw new Error(
        `One or both countries could not be found for comparison (Code 1: '${code1}', Code 2: '${code2}')`
      );
    }

    // Comparative metrics
    const pop1 = country1.population || 0;
    const pop2 = country2.population || 0;
    const popDiff = Math.abs(pop1 - pop2);
    const popRatio = pop2 > 0 ? (pop1 / pop2).toFixed(2) : 'N/A';

    const area1 = country1.area || 0;
    const area2 = country2.area || 0;
    const areaDiff = Math.abs(area1 - area2);

    const sameRegion = country1.region.toLowerCase() === country2.region.toLowerCase();

    // Check if they share a border
    const c1Borders = Array.isArray(country1.borders) ? country1.borders : [];
    const c2Borders = Array.isArray(country2.borders) ? country2.borders : [];
    const shareBorder =
      c1Borders.includes(country2.cca3) ||
      c2Borders.includes(country1.cca3) ||
      c1Borders.includes(country2.cca2) ||
      c2Borders.includes(country1.cca2);

    // Currencies overlap
    const c1Currs = Object.keys(country1.currencies || {});
    const c2Currs = Object.keys(country2.currencies || {});
    const commonCurrencies = c1Currs.filter((c) => c2Currs.includes(c));

    return {
      country1,
      country2,
      metrics: {
        population: {
          higher: pop1 >= pop2 ? country1.name : country2.name,
          difference: popDiff,
          ratio: popRatio,
        },
        area: {
          larger: area1 >= area2 ? country1.name : country2.name,
          difference: areaDiff,
        },
        geographic: {
          sameRegion,
          shareBorder,
        },
        economic: {
          currenciesShared: commonCurrencies,
        },
      },
    };
  }

  /**
   * Get Cache Status Information
   */
  public static async getCacheInfo() {
    const totalCount = await CountryData.countDocuments();
    const activeCount = await CountryData.countDocuments({ expiresAt: { $gt: new Date() } });
    const sampleRecord = await CountryData.findOne().sort({ cachedAt: -1 }).lean();

    return {
      totalRecords: totalCount,
      activeRecords: activeCount,
      lastCachedAt: sampleRecord?.cachedAt || null,
      expiresAt: sampleRecord?.expiresAt || null,
      ttlMinutes: ENV.CACHE_TTL_MINUTES,
    };
  }
}
