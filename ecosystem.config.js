module.exports = {
  apps: [{
    name: 'ceog',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/ceog',
    env: {
      NODE_ENV: 'production',
      // Database
      DATABASE_URL: 'mysql://ceog_user:CeogGala2026Secure!@localhost:3306/ceog',
      // App
      APP_URL: 'https://ceogala.mflevents.space',
      APP_SECRET: 'e3a145a950a22e8b37c1affc26c508b71126317619a7a8431121c6986c265367',
      QR_SECRET: '291d85a315e55892b09b911e15360a0a7fe1b097719016a77ed4ae2db7544620',
      // Stripe
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_51SeK6zEYA3kXT1EBgFxl3rnnOC4Y4EadHQTYHmqEJN0GFumEr8UJ26LZ2XYCzOT1RoNjgEtAn70bjJYJU93TEsIK00juhQkSST',
      STRIPE_SECRET_KEY: 'sk_test_51SeK6zEYA3kXT1EBHr7GuBh1ByCPAM4U9baDaHzMiGix0xgxxJQkHWtJkqJvVSdcoTjkioFv083a9y2SqOZhsaO4006R4BqMzO',
      STRIPE_WEBHOOK_SECRET: 'whsec_AJoT5MSb4T8hwaiHBV54OMapOberDYk9',
      // Email
      SMTP_HOST: 'smtp.gmail.com',
      SMTP_PORT: '587',
      SMTP_USER: 'zolijavos@gmail.com',
      SMTP_PASS: 'ucgtikfsqvukpivw',
      SMTP_FROM: 'zolijavos@gmail.com',
      // NextAuth
      NEXTAUTH_URL: 'https://ceogala.mflevents.space',
      NEXTAUTH_SECRET: '71c1bdc03f1b37757f8c4dbad9cafc107649a28b729fa8a1791519f2f3d05f6a',
    }
  }]
};
