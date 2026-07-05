import { Octokit } from 'octokit';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const [owner, repo] = (process.env.GITHUB_REPO || '').split('/');

export async function getFileContent(path) {
  try {
    const { data } = await octokit.rest.repos.getContent({ owner, repo, path });
    return Buffer.from(data.content, 'base64').toString('utf-8');
  } catch (e) {
    if (e.status === 404) return null;
    throw e;
  }
}

export async function updateFile(path, content, message = 'Update via editor') {
  let sha = null;
  try {
    const existing = await octokit.rest.repos.getContent({ owner, repo, path });
    sha = existing.data.sha;
  } catch (e) { /* file doesn't exist yet */ }

  await octokit.rest.repos.createOrUpdateFileContents({
    owner, repo, path, message,
    content: Buffer.from(content).toString('base64'),
    sha,
  });
}

export async function uploadImage(filename, base64Data) {
  const path = `public/images/${filename}`;
  let sha = null;
  try {
    const existing = await octokit.rest.repos.getContent({ owner, repo, path });
    sha = existing.data.sha;
  } catch (e) { /* new file */ }

  await octokit.rest.repos.createOrUpdateFileContents({
    owner, repo, path,
    message: `Upload image: ${filename}`,
    content: base64Data,
    sha,
  });
  return filename;
}

export async function uploadLogo(filename, base64Data) {
  const path = `public/${filename}`;
  let sha = null;
  try {
    const existing = await octokit.rest.repos.getContent({ owner, repo, path });
    sha = existing.data.sha;
  } catch (e) { /* new file */ }

  await octokit.rest.repos.createOrUpdateFileContents({
    owner, repo, path,
    message: `Upload logo: ${filename}`,
    content: base64Data,
    sha,
  });
  return filename;
}
