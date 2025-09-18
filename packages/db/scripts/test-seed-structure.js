/* eslint-disable no-console */
// Test script to verify seed file structure and dependencies

try {
  const { PrismaClient } = require("../prisma/generated/prisma");
  const { faker } = require("@faker-js/faker");
  const bcrypt = require("bcrypt");
  
  console.log("✅ All dependencies loaded successfully");
  console.log("📦 Faker version:", faker.version || "Available");
  console.log("🔐 Bcrypt available:", typeof bcrypt.hash === 'function');
  console.log("🗄️  Prisma client available:", typeof PrismaClient === 'function');
  
  // Test faker functionality
  console.log("👤 Sample fake name:", faker.person.fullName());
  console.log("📧 Sample fake email:", faker.internet.email());
  
  // Test bcrypt functionality
  bcrypt.hash("test", 10).then(hash => {
    console.log("🔒 Sample hash generated:", hash.substring(0, 20) + "...");
    console.log("🎉 All tests passed!");
  }).catch(err => {
    console.error("❌ Bcrypt test failed:", err);
  });
  
} catch (error) {
  console.error("❌ Dependency test failed:", error.message);
  process.exit(1);
}