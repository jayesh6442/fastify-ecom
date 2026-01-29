module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
    '!src/db/migrate.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^razorpay$': '<rootDir>/src/__mocks__/razorpay.js',
    '^nodemailer$': '<rootDir>/src/__mocks__/nodemailer.js',
    '^bcrypt$': '<rootDir>/src/__mocks__/bcrypt.js',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { module: 'commonjs', moduleResolution: 'node' } }],
  },
  transformIgnorePatterns: ['/node_modules/(?!(@fastify)/)'],
};
