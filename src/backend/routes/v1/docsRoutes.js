const express = require('express');
const path = require('node:path');
const { ok } = require('../../core/http');

const docsRoutes = express.Router();

docsRoutes.get('/', (req, res) => {
  ok(res, {
    message: 'Documentacao da API',
    data: {
      openApiJson: `${req.baseUrl}/openapi`,
      version: 'v1',
    },
  });
});

docsRoutes.get('/openapi', (req, res) => {
  const filePath = path.resolve(process.cwd(), 'docs', 'openapi.v1.json');
  res.sendFile(filePath);
});

module.exports = { docsRoutes };
