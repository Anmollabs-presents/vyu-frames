import { createToken } from '../../../lib/auth';

export async function POST(request) {
  const body = await request.json();
  const correctPin = process.env.EDITOR_PIN || '150106';

  if (body.pin === correctPin) {
    const token = createToken();
    return Response.json({ success: true, token });
  }
  return Response.json({ success: false }, { status: 401 });
}
