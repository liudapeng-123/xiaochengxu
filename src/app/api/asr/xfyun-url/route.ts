import crypto from 'crypto';

export const runtime = 'nodejs';

const XFYUN_HOST = 'iat-api.xfyun.cn';
const XFYUN_PATH = '/v2/iat';

export async function GET() {
  const appId = process.env.XFYUN_APP_ID;
  const apiKey = process.env.XFYUN_API_KEY;
  const apiSecret = process.env.XFYUN_API_SECRET;

  if (!appId || !apiKey || !apiSecret) {
    return Response.json(
      { error: '缺少讯飞 ASR 配置，请检查 XFYUN_APP_ID、XFYUN_API_KEY、XFYUN_API_SECRET' },
      { status: 500 }
    );
  }

  const date = new Date().toUTCString();
  const signatureOrigin = [
    `host: ${XFYUN_HOST}`,
    `date: ${date}`,
    `GET ${XFYUN_PATH} HTTP/1.1`,
  ].join('\n');

  const signature = crypto
    .createHmac('sha256', apiSecret)
    .update(signatureOrigin)
    .digest('base64');

  const authorizationOrigin = `api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
  const authorization = Buffer.from(authorizationOrigin).toString('base64');
  const url = `wss://${XFYUN_HOST}${XFYUN_PATH}?authorization=${encodeURIComponent(authorization)}&date=${encodeURIComponent(date)}&host=${encodeURIComponent(XFYUN_HOST)}`;

  return Response.json({ appId, url });
}