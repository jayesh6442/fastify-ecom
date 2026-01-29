import 'dotenv/config';

export const envs = {
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
    JWT_SECRET: process.env.JWT_SECRET,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
    ADMIN_REGISTRATION_SECRET: process.env.ADMIN_REGISTRATION_SECRET,
};

if (process.env.NODE_ENV !== 'test') {
    for (const key of Object.keys(envs)) {
        if (key !== 'DB_PASSWORD' && key !== 'JWT_SECRET' && key !== 'RAZORPAY_KEY_SECRET' && key !== 'RAZORPAY_WEBHOOK_SECRET' && key !== 'ADMIN_REGISTRATION_SECRET') {
            console.log(`${key}: ${envs[key as keyof typeof envs] ? '[set]' : '[unset]'}`);
        }
    }
}