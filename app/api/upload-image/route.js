import { uploadImage } from '../../../lib/github';
import { verifyToken, getTokenFromRequest } from '../../../lib/auth';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

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
      return Response.json({ success: false, error: 'File too large (max 8MB)' }, { status: 400 });
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const filename = `${Date.now()}-${safeName}`;
    await uploadImage(filename, base64);
    return Response.json({ success: true, filename });
  } catch (e) {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}
