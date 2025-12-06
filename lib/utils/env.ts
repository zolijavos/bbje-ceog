/**
 * Environment Variable Validation
 *
 * Validates required environment variables at startup to prevent runtime errors.
 * Import this file in layout.tsx or middleware to ensure validation runs early.
 */

interface EnvConfig {
  // Database
  DATABASE_URL: string;

  // App secrets
  APP_SECRET: string;
  QR_SECRET: string;

  // Stripe
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string;

  // Email (SMTP)
  SMTP_HOST: string;
  SMTP_PORT: string;
  SMTP_USER: string;
  SMTP_PASS: string;
  SMTP_FROM?: string; // Optional, has default

  // NextAuth
  NEXTAUTH_URL: string;
  NEXTAUTH_SECRET: string;

  // App URL
  APP_URL?: string; // Optional, has default
  NEXT_PUBLIC_APP_URL?: string; // Optional

  // Event config
  EVENT_DATE?: string; // Optional, has default
}

/**
 * Validates a single environment variable
 */
function validateEnvVar(name: keyof EnvConfig, required: boolean = true): string {
  const value = process.env[name];

  if (!value) {
    if (required) {
      throw new Error(
        `Missing required environment variable: ${name}\n` +
          `Please add it to your .env.local file.\n` +
          `See .env.example for reference.`
      );
    }
    return ''; // Optional var
  }

  return value;
}

/**
 * Validates minimum length for secrets
 */
function validateSecret(name: keyof EnvConfig, minLength: number = 32): string {
  const value = validateEnvVar(name);

  if (value.length < minLength) {
    throw new Error(
      `Environment variable ${name} must be at least ${minLength} characters long.\n` +
        `Current length: ${value.length}\n` +
        `Use a cryptographically secure random string.`
    );
  }

  return value;
}

/**
 * Validates email configuration
 */
function validateEmail(): void {
  validateEnvVar('SMTP_HOST');
  validateEnvVar('SMTP_PORT');
  validateEnvVar('SMTP_USER');
  validateEnvVar('SMTP_PASS');

  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid SMTP_PORT: ${process.env.SMTP_PORT}. Must be a valid port number (1-65535).`);
  }
}

/**
 * Validates all required environment variables
 *
 * Call this function at app startup (e.g., in root layout or middleware)
 * to fail fast if critical config is missing.
 */
export function validateEnv(): void {
  const errors: string[] = [];

  try {
    // Database
    validateEnvVar('DATABASE_URL');

    // App secrets (must be at least 64 chars)
    validateSecret('APP_SECRET', 64);
    validateSecret('QR_SECRET', 64);

    // Stripe
    validateEnvVar('STRIPE_SECRET_KEY');
    validateEnvVar('STRIPE_WEBHOOK_SECRET');
    validateEnvVar('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');

    // Email
    validateEmail();

    // NextAuth (must be at least 32 chars)
    validateEnvVar('NEXTAUTH_URL');
    validateSecret('NEXTAUTH_SECRET', 32);

    // Optional vars (don't throw if missing)
    validateEnvVar('APP_URL', false);
    validateEnvVar('NEXT_PUBLIC_APP_URL', false);
    validateEnvVar('EVENT_DATE', false);
    validateEnvVar('SMTP_FROM', false);

    console.log('✅ Environment variables validated successfully');
  } catch (error) {
    if (error instanceof Error) {
      errors.push(error.message);
    }
  }

  if (errors.length > 0) {
    console.error('\n❌ Environment validation failed:\n');
    errors.forEach((err) => console.error(`  - ${err}\n`));
    throw new Error('Environment validation failed. Fix the errors above and restart the application.');
  }
}

/**
 * Get validated environment variables (use after validateEnv)
 */
export function getEnv(): EnvConfig {
  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    APP_SECRET: process.env.APP_SECRET!,
    QR_SECRET: process.env.QR_SECRET!,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
    SMTP_HOST: process.env.SMTP_HOST!,
    SMTP_PORT: process.env.SMTP_PORT!,
    SMTP_USER: process.env.SMTP_USER!,
    SMTP_PASS: process.env.SMTP_PASS!,
    SMTP_FROM: process.env.SMTP_FROM,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
    APP_URL: process.env.APP_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    EVENT_DATE: process.env.EVENT_DATE,
  };
}
