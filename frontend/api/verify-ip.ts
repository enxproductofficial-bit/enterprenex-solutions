export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Extract client IP address from serverless headers
  const forwardedFor = req.headers['x-forwarded-for'];
  const realIp = req.headers['x-real-ip'];
  const clientIp = (forwardedFor ? forwardedFor.split(',')[0].trim() : null) || realIp || req.socket?.remoteAddress || '127.0.0.1';

  // Environment variable allowed IPs (comma separated), e.g. "10.206.229.155, 103.21.124.50"
  const defaultAllowed = ['10.206.229.155', '127.0.0.1', '::1'];
  const envAllowedIps = (process.env.ALLOWED_ADMIN_IPS || '').split(',').map((ip: string) => ip.trim()).filter(Boolean);
  const combinedAllowed = [...defaultAllowed, ...envAllowedIps];

  const isAllowed = combinedAllowed.includes(clientIp) || clientIp.startsWith('10.') || clientIp.startsWith('192.168.') || clientIp === '127.0.0.1' || clientIp === '::1';

  return res.status(isAllowed ? 200 : 403).json({
    allowed: isAllowed,
    clientIp,
    enforced: true,
    timestamp: new Date().toISOString()
  });
}
