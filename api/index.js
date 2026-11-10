import app from '../server.js';

export default function handler(req, res) {
  const requestUrl = new URL(req.url, 'http://localhost');
  const route = requestUrl.searchParams.get('__route');

  if (!route || !route.startsWith('/') || route.startsWith('//')) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      message: 'API route ไม่ถูกต้อง',
    }));
    return;
  }

  requestUrl.searchParams.delete('__route');
  req.url = `${route}${requestUrl.search}`;
  return app(req, res);
}
