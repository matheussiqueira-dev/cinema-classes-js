const { Usuario } = require('../usuarios');

describe('Usuario segurança', () => {
  test('bloqueia login após tentativas inválidas', () => {
    const usuario = new Usuario('A', 'a@x.com', 'senha');
    const agora = new Date('2026-02-05T20:00:00Z');

    for (let i = 0; i < 5; i += 1) {
      expect(usuario.realizarLogin('a@x.com', 'errada', agora)).toBe(false);
    }

    expect(usuario.realizarLogin('a@x.com', 'senha', agora)).toBe(false);
  });

  test('permite login correto em cenário normal', () => {
    const usuario = new Usuario('B', 'b@x.com', '123');
    expect(usuario.realizarLogin('b@x.com', '123')).toBe(true);
  });
});
