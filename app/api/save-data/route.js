import { updateFile } from '../../../lib/github';
import { verifyToken, getTokenFromRequest } from '../../../lib/auth';

export async function POST(request) {
  const token = getTokenFromRequest(request);
  if (!verifyToken(token)) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    await updateFile('data.json', JSON.stringify(data, null, 2), 'Update site data via editor');
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}
