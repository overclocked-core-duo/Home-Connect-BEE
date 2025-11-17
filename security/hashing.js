const crypto = require('crypto');

/**
 * Hashing examples using MD5 and SHA256
 * Demonstrates cryptographic hashing for security purposes
 */

/**
 * Generate MD5 hash
 * Note: MD5 is NOT recommended for password hashing (use bcrypt instead)
 * MD5 is suitable for checksums and non-security critical applications
 * @param {String} data - Data to hash
 * @returns {String} MD5 hash in hexadecimal format
 */
const generateMD5 = (data) => {
  return crypto.createHash('md5').update(data).digest('hex');
};

/**
 * Generate SHA256 hash
 * SHA256 is more secure than MD5 but still not recommended for passwords
 * Use for data integrity verification and non-password hashing
 * @param {String} data - Data to hash
 * @returns {String} SHA256 hash in hexadecimal format
 */
const generateSHA256 = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Generate SHA512 hash (stronger variant)
 * @param {String} data - Data to hash
 * @returns {String} SHA512 hash in hexadecimal format
 */
const generateSHA512 = (data) => {
  return crypto.createHash('sha512').update(data).digest('hex');
};

/**
 * Example usage and comparison
 */
const demonstrateHashing = () => {
  const sampleText = 'Hello, Home Connect!';
  
  console.log('\n=== Hashing Examples ===');
  console.log('Original text:', sampleText);
  console.log('\nMD5 Hash:');
  console.log(generateMD5(sampleText));
  console.log('Length:', generateMD5(sampleText).length, 'characters');
  
  console.log('\nSHA256 Hash:');
  console.log(generateSHA256(sampleText));
  console.log('Length:', generateSHA256(sampleText).length, 'characters');
  
  console.log('\nSHA512 Hash:');
  console.log(generateSHA512(sampleText));
  console.log('Length:', generateSHA512(sampleText).length, 'characters');
  
  console.log('\n=== Security Notes ===');
  console.log('- MD5: Fast but vulnerable to collisions, NOT for passwords');
  console.log('- SHA256: Good for data integrity, NOT for passwords');
  console.log('- For passwords: Use bcrypt (implemented in auth routes)');
  console.log('- Hashing is one-way (cannot be reversed)');
  console.log('======================\n');
};

module.exports = {
  generateMD5,
  generateSHA256,
  generateSHA512,
  demonstrateHashing
};
