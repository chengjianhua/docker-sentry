const execa = require('execa');
const request = require('request-promise-native');

buildGitImages()
  .then(() => {
    console.log('Build git image successfully');
  })
  .catch(error => {
    console.error(error, 'Build git image occurs error');
    process.exit(1);
  });

async function buildGitImages() {
  const dockerRegistry = readEnv('DOCKER_REG', 'stag-reg.llsops.com');
  const dockerProject = readEnv('DOCKER_PROJECT', 'platform-rls');
  const sentryBuild = readEnv('SENTRY_BUILD', await getLatestSha());
  const dockerImageName = 'sentry';

  const commonOptions = {
    dockerRegistry,
    dockerProject,
    sentryBuild,
    dockerImageName,
  };

  await buildGit(commonOptions);

  await buildGitOnBuild(commonOptions);
}

async function buildGit({
  dockerRegistry,
  dockerProject,
  sentryBuild,
  dockerImageName,
}) {
  const dockerImageTag = 'git';
  const dockerImageFull = `${dockerRegistry}/${dockerProject}/${dockerImageName}:${dockerImageTag}`;

  await exec('docker', [
    'build',
    '--rm',
    '--build-arg',
    `SENTRY_BUILD=${sentryBuild}`,
    '-t',
    dockerImageFull,
    'git',
  ]);

  await exec('docker', ['push', dockerImageFull]);

  await exec('docker', ['rm', dockerImageFull]);
}

async function buildGitOnBuild({
  dockerRegistry,
  dockerProject,
  sentryBuild,
  dockerImageName,
  sentryGitImage,
}) {
  const dockerImageTag = 'git-onbuild';
  const dockerImageFull = `${dockerRegistry}/${dockerProject}/${dockerImageName}:${dockerImageTag}`;

  await exec('docker', [
    'build',
    '--rm',
    '--build-arg',
    sentryGitImage,
    '-t',
    dockerImageFull,
    'git/onbuild',
  ]);

  await exec('docker', ['push', dockerImageFull]);

  await exec('docker', ['rm', dockerImageFull]);
}

async function getLatestSha() {
  const githubOAuthToken = readEnv('GITHUB_OAUTH_TOKEN');

  try {
    const data = await request.get({
      uri:
        'https://api.github.com/repos/getsentry/sentry/git/refs/heads/master',
      headers: {
        'User-Agent': 'Nodejs',
        // 为了消除 Github API 的 Rate Limit
        Authorization: `token ${githubOAuthToken}`,
      },
      json: true,
    });

    return data.object.sha;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

function readEnv(envName, defaultValue) {
  if (!(envName in process.env)) {
    if (typeof defaultValue === 'undefined') {
      throw new Error(`"${envName}" is required, but not specified it`);
    }

    return defaultValue;
  }

  const env = process.env[envName];

  return env;
}

function exec(
  file,
  args = [],
  options = {
    stdio: 'inherit',
  },
) {
  const commandToExec = [file, ...args].join(' ');

  console.log(`+ ${commandToExec}\n`);

  return execa(file, args, options);
}
