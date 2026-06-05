const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3000;

app.use(cors());

app.use('/api/auth', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true
}));

app.use('/api', createProxyMiddleware({
  target: 'http://localhost:3002',
  changeOrigin: true
}));

app.use('/', createProxyMiddleware({
  target: 'http://localhost:3002',
  changeOrigin: true
}));

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`  Auth routes -> http://localhost:3001/api/auth`);
  console.log(`  API routes  -> http://localhost:3002/api`);
  console.log(`  Static      -> http://localhost:3002/`);
});
