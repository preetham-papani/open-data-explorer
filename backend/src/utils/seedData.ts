import { User } from '../models/User.js';
import { ENV } from '../config/env.js';

export const seedInitialUsers = async (): Promise<void> => {
  try {
    // Check if admin user exists
    const adminExists = await User.findOne({ email: ENV.ADMIN_EMAIL });
    if (!adminExists) {
      await User.create({
        username: 'AdminUser',
        email: ENV.ADMIN_EMAIL,
        password: ENV.ADMIN_PASSWORD,
        role: 'admin',
        isActive: true,
      });
      console.log(`👤 [Seed] Admin account created: ${ENV.ADMIN_EMAIL} (Password: ${ENV.ADMIN_PASSWORD})`);
    }

    // Check if regular demo user exists
    const demoUserExists = await User.findOne({ email: ENV.DEMO_USER_EMAIL });
    if (!demoUserExists) {
      await User.create({
        username: 'StudentDemo',
        email: ENV.DEMO_USER_EMAIL,
        password: ENV.DEMO_USER_PASSWORD,
        role: 'user',
        isActive: true,
      });
      console.log(`👤 [Seed] Demo student account created: ${ENV.DEMO_USER_EMAIL} (Password: ${ENV.DEMO_USER_PASSWORD})`);
    }
  } catch (err: any) {
    console.error('⚠️ [Seed] Error seeding users:', err.message);
  }
};
