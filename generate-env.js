const fs = require('fs');
const envDir = './src/environments';

if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir);
}

const environmentFile = `export const environment = {
  production: false,
  apiKey: '${process.env.GEMINI_API_KEY || 'PLACEHOLDER_API_KEY'}'
};
`;

fs.writeFileSync(`${envDir}/environment.ts`, environmentFile);

// Versión prod opcional:
const environmentProdFile = `export const environment = {
  production: true,
  apiKey: '${process.env.GEMINI_API_KEY || 'PLACEHOLDER_API_KEY'}'
};
`;

fs.writeFileSync(`${envDir}/environment.development.ts`, environmentProdFile);

console.log('Environment files generated');
