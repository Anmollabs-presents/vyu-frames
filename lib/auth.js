import crypto from 'crypto';

const SECRET = process.env.SESSION_SECRET || process.env.EDITOR_PIN || 'fallback-secret-change-me';
const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour editor session

export function createToken() {
  const exp = Date.now() + TOKEN_TTL_MS;
  const sig = crypto.createHmac('sha256', SECRET).update(String(exp)).digest('hex');
  return `${exp}.${sig}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false;
  const [expStr, sig] = token.split('.');
  const exp = Number(expStr);
  if (!exp || Number.isNaN(exp)) return false;
  if (Date.now() > exp) return false;

  const expectedSig = crypto.createHmac('sha256', SECRET).update(expStr).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expectedSig, 'hex'));
  } catch {
    return false;
  }
}

export function getTokenFromRequest(request) {
  const header = request.headers.get('authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}
