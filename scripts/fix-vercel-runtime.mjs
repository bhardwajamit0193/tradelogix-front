import fs from 'node:fs';
import path from 'node:path';

const functionsDir = path.resolve(process.cwd(), '.vercel/output/functions');

if (fs.existsSync(functionsDir)) {
  console.log('[fix-vercel-runtime] Checking Vercel serverless functions in:', functionsDir);
  const entries = fs.readdirSync(functionsDir, { withFileTypes: true });
  let count = 0;
  for (const entry of entries) {
    if (entry.isDirectory() && entry.name.endsWith('.func')) {
      const configPath = path.join(functionsDir, entry.name, '.vc-config.json');
      if (fs.existsSync(configPath)) {
        try {
          const content = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
          if (!content.runtime || content.runtime === 'nodejs18.x') {
            console.log(`[fix-vercel-runtime] Updating ${entry.name} runtime from "${content.runtime}" to "nodejs20.x"`);
            content.runtime = 'nodejs20.x';
            fs.writeFileSync(configPath, JSON.stringify(content, null, 2));
            count++;
          }
        } catch (err) {
          console.error(`[fix-vercel-runtime] Error processing ${configPath}:`, err);
        }
      }
    }
  }
  console.log(`[fix-vercel-runtime] Successfully updated ${count} function runtime config(s).`);
} else {
  console.log('[fix-vercel-runtime] No .vercel/output/functions directory found. Skipping.');
}
