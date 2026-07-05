import { getFileContent } from '../../../lib/github';

const DEFAULTS = {
  siteName: 'vyu.frames',
  logoVersion: 0,
  images: [],
};

export async function GET() {
  try {
    const content = await getFileContent('data.json');
    if (!content) {
      return Response.json({ success: true, data: DEFAULTS });
    }
    const data = JSON.parse(content);
    return Response.json({ success: true, data: { ...DEFAULTS, ...data } });
  } catch (e) {
    return Response.json({ success: false, error: e.message }, { status: 500 });
  }
}
