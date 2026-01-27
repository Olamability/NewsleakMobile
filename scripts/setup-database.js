#!/usr/bin/env node

/**
 * Database Setup Script
 * 
 * This script helps users set up their Supabase database by displaying
 * the migration files that need to be applied.
 */

const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname, '../supabase/migrations');
const SAMPLE_DATA = path.join(__dirname, '../supabase/sample-articles.sql');

console.log('\n🚀 NewsleakMobile Database Setup\n');
console.log('This script will guide you through setting up your Supabase database.\n');

// Check if migrations directory exists
if (!fs.existsSync(MIGRATIONS_DIR)) {
  console.error('❌ Error: Migrations directory not found!');
  console.error('Expected location:', MIGRATIONS_DIR);
  process.exit(1);
}

// Get all migration files
const migrations = fs.readdirSync(MIGRATIONS_DIR)
  .filter(file => file.endsWith('.sql'))
  .sort();

if (migrations.length === 0) {
  console.error('❌ Error: No migration files found!');
  process.exit(1);
}

console.log('📋 Migration Files Found:\n');
migrations.forEach((file, index) => {
  console.log(`   ${index + 1}. ${file}`);
});

console.log('\n📖 Instructions:\n');
console.log('1. Log in to your Supabase Dashboard: https://app.supabase.com');
console.log('2. Select your project');
console.log('3. Go to the SQL Editor (left sidebar)');
console.log('4. Apply each migration file in the order listed above:\n');

migrations.forEach((file, index) => {
  const filePath = path.join(MIGRATIONS_DIR, file);
  const relativePath = path.relative(process.cwd(), filePath);
  console.log(`   Step ${index + 1}: Copy and paste the content of '${relativePath}'`);
  console.log(`           Then click "Run" in the SQL Editor\n`);
});

console.log('5. (Optional) Add sample data for testing:');
const sampleRelativePath = path.relative(process.cwd(), SAMPLE_DATA);
console.log(`   Copy and paste the content of '${sampleRelativePath}'`);
console.log('   Then click "Run" in the SQL Editor\n');

console.log('✅ After completing all steps, your database will be ready!\n');

console.log('💡 Alternative: Using Supabase CLI (if installed)\n');
console.log('   If you have the Supabase CLI installed and initialized:');
console.log('   $ supabase db push\n');

console.log('🔍 Verification:\n');
console.log('   After setup, verify in Supabase Table Editor that you see:');
console.log('   - categories, news_sources, news_articles tables');
console.log('   - article_likes, article_comments tables');
console.log('   - Sample data in categories and news_sources\n');

console.log('📚 For more detailed instructions, see: DATABASE_SETUP.md\n');

// Print summary of each migration
console.log('📄 Migration Details:\n');
migrations.forEach((file, index) => {
  const filePath = path.join(MIGRATIONS_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract comments from the SQL file
  const comments = content
    .split('\n')
    .filter(line => line.trim().startsWith('--'))
    .slice(0, 3) // First 3 comment lines
    .map(line => line.replace(/^--\s*/, '').trim())
    .join(' ');
  
  const description = comments || 'Database migration';
  console.log(`   ${index + 1}. ${file}`);
  console.log(`      ${description}\n`);
});

console.log('✨ Happy coding!\n');
