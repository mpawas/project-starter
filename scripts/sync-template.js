const path = require('node:path');
const fse = require('fs-extra');

const ROOT = path.join(__dirname, '..');
const APPS_SOURCE = path.join(ROOT, 'apps');
const TEMPLATE_DIR = path.join(ROOT, 'template');

const EXCLUDED_SEGMENTS = new Set([
  'node_modules',
  'dist',
  'coverage',
  'package-lock.json',
]);

function shouldCopy(filePath) {
  const relativePath = path.relative(APPS_SOURCE, filePath);

  if (!relativePath || relativePath === '.') {
    return true;
  }

  const segments = relativePath.split(path.sep);

  return !segments.some((segment) => EXCLUDED_SEGMENTS.has(segment));
}

async function writeRootPackageJson() {
  const rootPackageJson = {
    name: '__PROJECT_NAME__',
    version: '__VERSION__',
    description: '__DESCRIPTION__',
    author: '__AUTHOR__',
    license: '__LICENSE__',
    private: true,
    keywords: [],
    scripts: {
      'backend:install': 'npm install --prefix apps/backend',
      'backend:dev': 'npm run start:dev --prefix apps/backend',
      'backend:build': 'npm run build --prefix apps/backend',
      'backend:test': 'npm test --prefix apps/backend',
      'backend:db:generate': 'npm run db:generate --prefix apps/backend',
      'backend:db:migrate': 'npm run db:migrate --prefix apps/backend',
      'backend:db:push': 'npm run db:push --prefix apps/backend',
      'backend:db:studio': 'npm run db:studio --prefix apps/backend',
      'web:install': 'npm install --prefix apps/web',
      'web:dev': 'npm run dev --prefix apps/web',
      'web:build': 'npm run build --prefix apps/web',
      'web:start': 'npm run start --prefix apps/web',
    },
  };

  await fse.writeJson(path.join(TEMPLATE_DIR, 'package.json'), rootPackageJson, {
    spaces: 2,
  });
}

async function writeTemplateReadme() {
  const readme = `# __PROJECT_NAME__

NestJS RBAC backend starter with a Next.js web app generated with \`create-startup-file\`.

## Setup

\`\`\`bash
npm run backend:install
npm run web:install
cp apps/backend/.env.example apps/backend/.env
cp apps/web/.env.example apps/web/.env
npm run backend:db:push
npm run backend:dev
npm run web:dev
\`\`\`

## API Docs

- Swagger UI: \`http://localhost:3000/api/docs\`

## Web App

- Home route: \`http://localhost:3001\`
- Admin route: \`http://localhost:3001/admin\` (admin role required)
- Login route: \`http://localhost:3001/login\`

## Scripts

- \`npm run backend:dev\`
- \`npm run backend:build\`
- \`npm run backend:test\`
- \`npm run backend:db:push\`
- \`npm run web:dev\`
- \`npm run web:build\`
- \`npm run web:start\`
`;

  await fse.writeFile(path.join(TEMPLATE_DIR, 'README.md'), readme);
}

async function writeGitignore() {
  const gitignore = `node_modules
dist
coverage
.env
*.log
.DS_Store
`;

  await fse.writeFile(path.join(TEMPLATE_DIR, '.gitignore'), gitignore);
}

async function syncTemplate() {
  await fse.remove(TEMPLATE_DIR);
  await fse.ensureDir(path.join(TEMPLATE_DIR, 'apps'));

  await fse.copy(APPS_SOURCE, path.join(TEMPLATE_DIR, 'apps'), { filter: shouldCopy });

  await writeRootPackageJson();
  await writeTemplateReadme();
  await writeGitignore();

  console.log('Template synced from apps/ to template/');
}

syncTemplate().catch((error) => {
  console.error('Failed to sync template:', error);
  process.exit(1);
});
