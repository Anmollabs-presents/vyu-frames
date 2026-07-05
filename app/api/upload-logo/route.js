import { uploadLogo } from '../../../lib/github';
import { verifyToken, getTokenFromRequest } from '../../../lib/auth';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
const MAX_SIZE_BYTES = 3 * 1024 * 1024; // 3MB

export async function POST(request) {
  const token = getTokenFromRequest(request);
  if (!verifyToken(token)) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const base64 = formData.get('base64');

    if (!file || !base64) {
      return Response.json({ success: false, error: 'Missing file or base64' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json({ success: false, error: 'Unsupported file type' }, { status: 400 });
    }
    if (file.size > MAX_SIZE_BYTES) {
      return Response.json({ success: false, error: 'File too large (max 3MB)' }, { status: 400 });
    }

    await uploadLogo('logo.png', base64);
    return Response.json({ success: true, filename: 'logo.png' });
  } catch (e) {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}
