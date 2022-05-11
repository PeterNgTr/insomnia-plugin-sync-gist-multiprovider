const Github = require('./github');

test('Invalid token', () => {
  try {
    new Github({ }, { token: '' });
  } catch (e) {
    expect(e.message).toEqual('Invalid token');
  }
});

test('Null gistID', () => {
  const gitHub = new Github({ }, { token: '123', gistID: '' });
  expect(gitHub.config.gistID).toEqual(null);
});

test('Provided gistID', () => {
  const gitHub = new Github({ }, { token: '123', gistID: '123' });
  expect(gitHub.config.gistID).toEqual('123');
});

test('Base URL', () => {
  const gitHub = new Github({ }, { token: '123', gistID: '123' });
  expect(gitHub.config.apiURL).toEqual('https://api.github.com');
});

test('default visibility', () => {
  const gitHub = new Github({ }, {
    token: '123', gistID: '123',
  });
  expect(gitHub.config.visibility).toEqual('private');
});

test('public visibility', () => {
  const gitHub = new Github({ }, {
    token: '123', gistID: '123', visibility: 'public',
  });
  expect(gitHub.config.visibility).toEqual('public');
});
