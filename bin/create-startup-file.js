#!/usr/bin/env node

const path = require('node:path');
const fs = require('node:fs');
const fse = require('fs-extra');
const prompts = require('prompts');
const validatePackageName = require('validate-npm-package-name');

const LICENSE_CHOICES = [
  { title: 'MIT', value: 'MIT' },
  { title: 'Apache-2.0', value: 'Apache-2.0' },
  { title: 'ISC', value: 'ISC' },
  { title: 'UNLICENSED', value: 'UNLICENSED' },
];

function parseArgs(argv) {
  const options = {
    projectName: undefined,
    version: '1.0.0',
    description: 'NestJS RBAC admin backend',
    author: '',
    license: 'MIT',
    keywords: 'nestjs,rbac,jwt,drizzle,postgresql',
    directory: undefined,
    yes: false,
    help: false,
  };

  const positional = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case '--yes':
      case '-y':
        options.yes = true;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
      case '--version':
        options.version = argv[++index] ?? options.version;
        break;
      case '--description':
        options.description = argv[++index] ?? options.description;
        break;
      case '--author':
        options.author = argv[++index] ?? options.author;
        break;
      case '--license':
        options.license = argv[++index] ?? options.license;
        break;
      case '--keywords':
        options.keywords = argv[++index] ?? options.keywords;
        break;
      case '--directory':
        options.directory = argv[++index] ?? options.directory;
        break;
      default:
        if (!arg.startsWith('-')) {
          positional.push(arg);
        }
        break;
    }
  }

  if (positional[0]) {
    options.projectName = positional[0];
  }

  if (!options.directory) {
    options.directory = options.projectName;
  }

  return options;
}

function printHelp() {
  console.log(`
Usage:
  npx create-startup-file [project-name] [options]

Options:
  -y, --yes                 Use defaults (non-interactive)
  --version <version>       Project version (default: 1.0.0)
  --description <text>      Project description
  --author <name>           Author name
  --license <license>       License (MIT, Apache-2.0, ISC, UNLICENSED)
  --keywords <csv>          Comma-separated keywords
  --directory <path>        Output directory (default: project name)
  -h, --help                Show help

Examples:
  npx create-startup-file
  npx create-startup-file my-admin-app
  npx create-startup-file my-admin-app -y --author "Pawas Mishra"
`);
}

function getBackendPackageName(projectName) {
  if (projectName.startsWith('@') && projectName.includes('/')) {
    const [scope, name] = projectName.split('/');
    return `${scope}/${name}-backend`;
  }

  return `${projectName}-backend`;
}

function getWebPackageName(projectName) {
  if (projectName.startsWith('@') && projectName.includes('/')) {
    const [scope, name] = projectName.split('/');
    return `${scope}/${name}-web`;
  }

  return `${projectName}-web`;
}

function formatProjectTitle(projectName) {
  const baseName = projectName.includes('/') ? projectName.split('/')[1] : projectName;

  return baseName
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function validateProjectName(name) {
  const result = validatePackageName(name);

  if (!result.validForNewPackages) {
    return (
      result.errors?.[0] ??
      result.warnings?.[0] ??
      'Project name is not a valid npm package name'
    );
  }

  return true;
}

function parseKeywords(keywords) {
  return keywords
    .split(',')
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

function updatePackageJson(filePath, metadata) {
  const packageJson = fse.readJsonSync(filePath);

  packageJson.name = metadata.name;
  packageJson.version = metadata.version;
  packageJson.description = metadata.description;
  packageJson.author = metadata.author;
  packageJson.license = metadata.license;

  if (metadata.keywords !== undefined) {
    packageJson.keywords = metadata.keywords;
  }

  fse.writeJsonSync(filePath, packageJson, { spaces: 2 });
}

function printNextSteps(projectDir, projectName) {
  const relativeDir = path.relative(process.cwd(), projectDir) || '.';

  console.log('\nProject created successfully.\n');
  console.log(`  cd ${relativeDir}`);
  console.log('  npm run backend:install');
  console.log('  npm run web:install');
  console.log('  cp apps/backend/.env.example apps/backend/.env');
  console.log('  cp apps/web/.env.example apps/web/.env');
  console.log('  npm run backend:db:push');
  console.log('  npm run backend:dev');
  console.log('  npm run web:dev');
  console.log('\nAPI docs: http://localhost:3000/api/docs');
  console.log('Web app: http://localhost:3001');
  console.log(`Root package: ${projectName}`);
  console.log(`Backend package: ${getBackendPackageName(projectName)}\n`);
  console.log(`Web package: ${getWebPackageName(projectName)}\n`);
}

async function collectProjectConfig(cliOptions) {
  const isInteractive = process.stdin.isTTY && process.stdout.isTTY;

  if (!isInteractive || cliOptions.yes) {
    if (!cliOptions.projectName) {
      throw new Error(
        'Project name is required in non-interactive mode. Example: create-startup-file my-app -y',
      );
    }

    const projectNameError = validateProjectName(cliOptions.projectName);
    if (projectNameError !== true) {
      throw new Error(projectNameError);
    }

    return {
      projectName: cliOptions.projectName.trim(),
      version: cliOptions.version.trim(),
      description: cliOptions.description.trim(),
      author: cliOptions.author.trim(),
      license: cliOptions.license,
      keywords: parseKeywords(cliOptions.keywords),
      directory: (cliOptions.directory ?? cliOptions.projectName).trim(),
    };
  }

  const response = await prompts(
    [
      {
        type: 'text',
        name: 'projectName',
        message: 'Project name (npm package name)',
        initial: cliOptions.projectName ?? '',
        validate: validateProjectName,
      },
      {
        type: 'text',
        name: 'version',
        message: 'Version',
        initial: cliOptions.version,
        validate: (value) =>
          /^\d+\.\d+\.\d+(-[\w.-]+)?$/.test(value) ||
          'Version must follow semver (e.g. 1.0.0)',
      },
      {
        type: 'text',
        name: 'description',
        message: 'Description',
        initial: cliOptions.description,
      },
      {
        type: 'text',
        name: 'author',
        message: 'Author',
        initial: cliOptions.author,
      },
      {
        type: 'select',
        name: 'license',
        message: 'License',
        choices: LICENSE_CHOICES,
        initial: LICENSE_CHOICES.findIndex(
          (choice) => choice.value === cliOptions.license,
        ),
      },
      {
        type: 'text',
        name: 'keywords',
        message: 'Keywords (comma separated, optional)',
        initial: cliOptions.keywords,
      },
      {
        type: 'text',
        name: 'directory',
        message: 'Target directory',
        initial: (_, values) =>
          cliOptions.directory ?? values.projectName ?? cliOptions.projectName ?? '',
        validate: (value) =>
          value.trim().length > 0 || 'Target directory is required',
      },
    ],
    {
      onCancel: () => {
        console.log('\nProject creation cancelled.');
        process.exit(0);
      },
    },
  );

  return {
    projectName: response.projectName.trim(),
    version: response.version.trim(),
    description: response.description.trim(),
    author: response.author.trim(),
    license: response.license,
    keywords: parseKeywords(response.keywords),
    directory: response.directory.trim(),
  };
}

async function createProject(config) {
  const targetDir = path.resolve(process.cwd(), config.directory);

  if (fs.existsSync(targetDir)) {
    throw new Error(`Directory already exists: ${targetDir}`);
  }

  const templateDir = path.join(__dirname, '..', 'template');

  if (!fs.existsSync(templateDir)) {
    throw new Error(
      'Template not found. Run `npm run sync:template` from the repository root.',
    );
  }

  await fse.copy(templateDir, targetDir);

  updatePackageJson(path.join(targetDir, 'package.json'), {
    name: config.projectName,
    version: config.version,
    description: config.description,
    author: config.author,
    license: config.license,
    keywords: config.keywords,
  });

  updatePackageJson(path.join(targetDir, 'apps/backend/package.json'), {
    name: getBackendPackageName(config.projectName),
    version: config.version,
    description: config.description,
    author: config.author,
    license: config.license,
  });
  updatePackageJson(path.join(targetDir, 'apps/web/package.json'), {
    name: getWebPackageName(config.projectName),
    version: config.version,
    description: `${config.description} web application`,
    author: config.author,
    license: config.license,
  });

  const mainTsPath = path.join(targetDir, 'apps/backend/src/main.ts');
  const mainTs = await fse.readFile(mainTsPath, 'utf8');
  const projectTitle = formatProjectTitle(config.projectName);
  const apiDescription = config.description || `${projectTitle} API documentation`;

  await fse.writeFile(
    mainTsPath,
    mainTs
      .replace("'RBAC Backend API'", `'${projectTitle} API'`)
      .replace(
        "'NestJS RBAC backend API documentation'",
        `'${apiDescription}'`,
      )
      .replace("'1.0'", `'${config.version}'`),
  );

  const readmePath = path.join(targetDir, 'README.md');
  const readme = await fse.readFile(readmePath, 'utf8');

  await fse.writeFile(
    readmePath,
    readme.replaceAll('__PROJECT_NAME__', config.projectName),
  );

  printNextSteps(targetDir, config.projectName);
}

async function main() {
  const cliOptions = parseArgs(process.argv.slice(2));

  if (cliOptions.help) {
    printHelp();
    return;
  }

  const config = await collectProjectConfig(cliOptions);
  await createProject(config);
}

main().catch((error) => {
  console.error(`\nFailed to create project: ${error.message}`);
  process.exit(1);
});
