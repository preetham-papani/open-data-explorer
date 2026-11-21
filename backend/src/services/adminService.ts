import { User } from '../models/User.js';
import { CountryData } from '../models/CountryData.js';
import { SearchHistory } from '../models/SearchHistory.js';
import { SavedItem } from '../models/SavedItem.js';
import { CurrencyHistory } from '../models/CurrencyHistory.js';
import { CountryService } from './countryService.js';
import { Types } from 'mongoose';

export class AdminService {
  /**
   * Get application-wide dashboard overview metrics
   */
  public static async getSystemStats() {
    const [
      totalUsers,
      totalAdmins,
      activeUsers,
      totalSearches,
      searchesByType,
      totalSaved,
      totalConversions,
      cacheInfo,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ isActive: true }),
      SearchHistory.countDocuments(),
      SearchHistory.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
      SavedItem.countDocuments(),
      CurrencyHistory.countDocuments(),
      CountryService.getCacheInfo(),
      User.find().select('-password').sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    const searchesMap: Record<string, number> = {
      country: 0,
      weather: 0,
      currency: 0,
    };
    searchesByType.forEach((item: any) => {
      if (item._id) {
        searchesMap[item._id] = item.count;
      }
    });

    return {
      users: {
        total: totalUsers,
        admins: totalAdmins,
        active: activeUsers,
      },
      searches: {
        total: totalSearches,
        byType: searchesMap,
      },
      savedItems: {
        total: totalSaved,
      },
      conversions: {
        total: totalConversions,
      },
      cache: cacheInfo,
      recentUsers,
    };
  }

  /**
   * List users with pagination and search
   */
  public static async getUsers(page: number = 1, limit: number = 10, search?: string) {
    const filter: Record<string, any> = {};
    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update a user's role or status
   */
  public static async updateUser(
    userId: string,
    updates: { role?: 'user' | 'admin'; isActive?: boolean }
  ) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID format');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (updates.role) {
      user.role = updates.role;
    }
    if (typeof updates.isActive === 'boolean') {
      user.isActive = updates.isActive;
    }

    await user.save();
    return {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };
  }

  /**
   * Delete user account
   */
  public static async deleteUser(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID format');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await Promise.all([
      User.findByIdAndDelete(userId),
      SearchHistory.deleteMany({ userId: new Types.ObjectId(userId) }),
      SavedItem.deleteMany({ userId: new Types.ObjectId(userId) }),
      CurrencyHistory.deleteMany({ userId: new Types.ObjectId(userId) }),
    ]);

    return true;
  }

  /**
   * Refresh Country Cache manually
   */
  public static async refreshCountryCache() {
    return CountryService.fetchAndCacheAll();
  }

  /**
   * Clear Country Cache
   */
  public static async clearCountryCache() {
    const result = await CountryData.deleteMany({});
    return result.deletedCount || 0;
  }
}
