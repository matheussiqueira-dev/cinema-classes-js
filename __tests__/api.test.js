const request = require('supertest');
const { createApp } = require('../src/backend/app');

async function login(app, { email, password }) {
  const response = await request(app).post('/api/v1/auth/login').send({ email, password });
  return {
    accessToken: response.body?.data?.accessToken,
    csrfToken: response.body?.data?.csrfToken,
    status: response.statusCode,
  };
}

describe('Backend API v1', () => {
  let app;

  beforeEach(() => {
    app = createApp();
  });

  test('health endpoints respond with success', async () => {
    const live = await request(app).get('/api/v1/health/live');
    const ready = await request(app).get('/api/v1/health/ready');

    expect(live.statusCode).toBe(200);
    expect(ready.statusCode).toBe(200);
    expect(live.body.success).toBe(true);
    expect(ready.body.success).toBe(true);
  });

  test('login returns bearer token and csrf token', async () => {
    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'gerente@cinema.com',
      password: 'gerente123',
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.csrfToken).toBeDefined();
  });

  test('protected routes require authentication', async () => {
    const response = await request(app).get('/api/v1/sessions');
    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test('session creation and ticket sale flow works with auth + csrf', async () => {
    const gerente = await login(app, { email: 'gerente@cinema.com', password: 'gerente123' });
    expect(gerente.status).toBe(200);

    const createSessionResponse = await request(app)
      .post('/api/v1/sessions')
      .set('Authorization', `Bearer ${gerente.accessToken}`)
      .set('X-CSRF-Token', gerente.csrfToken)
      .send({
        id: 'SESS-API-1',
        filme: 'Blade Runner',
        sala: 'Sala 2',
        horario: '20:00',
        capacidade: 40,
        precoBase: 30,
        dublado: false,
      });

    expect(createSessionResponse.statusCode).toBe(201);
    expect(createSessionResponse.body.data.sessaoId).toBe('SESS-API-1');

    const vendedor = await login(app, { email: 'vendedor@cinema.com', password: 'vendedor123' });
    expect(vendedor.status).toBe(200);

    const saleResponse = await request(app)
      .post('/api/v1/sessions/SESS-API-1/sales')
      .set('Authorization', `Bearer ${vendedor.accessToken}`)
      .set('X-CSRF-Token', vendedor.csrfToken)
      .send({
        tipo: 'inteira',
        quantidade: 2,
      });

    expect(saleResponse.statusCode).toBe(201);
    expect(saleResponse.body.data.venda.total).toBe(60);
    expect(saleResponse.body.data.resumoSessao.ingressosVendidos).toBe(2);
  });

  test('mutating route without csrf token is blocked', async () => {
    const gerente = await login(app, { email: 'gerente@cinema.com', password: 'gerente123' });
    expect(gerente.status).toBe(200);

    const response = await request(app)
      .post('/api/v1/inventory/items')
      .set('Authorization', `Bearer ${gerente.accessToken}`)
      .send({
        sku: 'BOM-1',
        nome: 'Bombom',
        quantidadeAtual: 10,
        estoqueMinimo: 3,
        custoUnitario: 1.5,
        precoVenda: 4,
      });

    expect(response.statusCode).toBe(403);
  });

  test('analytics dashboard is available for manager', async () => {
    const gerente = await login(app, { email: 'gerente@cinema.com', password: 'gerente123' });
    expect(gerente.status).toBe(200);

    const response = await request(app)
      .get('/api/v1/analytics/dashboard')
      .set('Authorization', `Bearer ${gerente.accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data.operacao).toBeDefined();
    expect(response.body.data.estoque).toBeDefined();
  });

  test('analytics workspace snapshot returns integration payload', async () => {
    const gerente = await login(app, { email: 'gerente@cinema.com', password: 'gerente123' });
    expect(gerente.status).toBe(200);

    const response = await request(app)
      .get('/api/v1/analytics/workspace-snapshot')
      .set('Authorization', `Bearer ${gerente.accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data.sessions).toBeDefined();
    expect(response.body.data.inventory).toBeDefined();
  });

  test('analytics report supports csv format', async () => {
    const gerente = await login(app, { email: 'gerente@cinema.com', password: 'gerente123' });
    expect(gerente.status).toBe(200);

    const response = await request(app)
      .get('/api/v1/analytics/report?format=csv')
      .set('Authorization', `Bearer ${gerente.accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(String(response.headers['content-type'])).toContain('text/csv');
    expect(response.text).toContain('sessionId');
  });

  test('idempotency key replays mutating request result', async () => {
    const gerente = await login(app, { email: 'gerente@cinema.com', password: 'gerente123' });
    expect(gerente.status).toBe(200);

    const payload = {
      id: 'SESS-IDEMP-1',
      filme: 'Matrix',
      sala: 'Sala 5',
      horario: '22:00',
      capacidade: 50,
      precoBase: 32,
      dublado: false,
    };

    const first = await request(app)
      .post('/api/v1/sessions')
      .set('Authorization', `Bearer ${gerente.accessToken}`)
      .set('X-CSRF-Token', gerente.csrfToken)
      .set('Idempotency-Key', 'same-session-creation')
      .send(payload);

    const second = await request(app)
      .post('/api/v1/sessions')
      .set('Authorization', `Bearer ${gerente.accessToken}`)
      .set('X-CSRF-Token', gerente.csrfToken)
      .set('Idempotency-Key', 'same-session-creation')
      .send(payload);

    expect(first.statusCode).toBe(201);
    expect(second.statusCode).toBe(201);
    expect(second.headers['x-idempotent-replay']).toBe('true');
    expect(second.body.data.sessaoId).toBe('SESS-IDEMP-1');
  });

  test('audit events endpoint returns paginated list', async () => {
    const gerente = await login(app, { email: 'gerente@cinema.com', password: 'gerente123' });
    expect(gerente.status).toBe(200);

    const response = await request(app)
      .get('/api/v1/analytics/audit-events?limit=5&page=1')
      .set('Authorization', `Bearer ${gerente.accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body.data.items)).toBe(true);
    expect(response.body.data.pagination).toBeDefined();
  });
});
