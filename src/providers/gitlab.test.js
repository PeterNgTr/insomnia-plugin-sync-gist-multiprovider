const Gitlab = require('./gitlab');

test('Invalid token', () => {
  try {
    new Gitlab({ }, { token: '' });
  } catch (e) {
    expect(e.message).toEqual('Invalid token');
  }
});

test('Null gistID', () => {
  const gitlab = new Gitlab({ }, { token: '123', gistID: '' });
  expect(gitlab.config.gistID).toEqual(null);
});

test('Provided gistID', () => {
  const gitlab = new Gitlab({ }, { token: '123', gistID: '123' });
  expect(gitlab.config.gistID).toEqual('123');
});

test('Base URL', () => {
  const gitlab = new Gitlab({ }, { token: '123', gistID: '123', baseURL: '' });
  expect(gitlab.config.baseURL).toEqual('https://gitlab.com');
});

test('Null Project ID', () => {
  const gitlab = new Gitlab({ }, { token: '123', gistID: '123', baseURL: '' });
  expect(gitlab.config.projectID).toEqual(null);
});

test('Provided Project ID', () => {
  const gitlab = new Gitlab({ }, {
    token: '123', gistID: '123', baseURL: '', projectID: '123',
  });
  expect(gitlab.config.projectID).toEqual('123');
});

test('default visibility', () => {
  const gitlab = new Gitlab({ }, {
    token: '123', gistID: '123', baseURL: '', projectID: '123',
  });
  expect(gitlab.config.visibility).toEqual('private');
});

test('public visibility', () => {
  const gitlab = new Gitlab({ }, {
    token: '123', gistID: '123', baseURL: '', projectID: '123', visibility: 'public',
  });
  expect(gitlab.config.visibility).toEqual('public');
});
