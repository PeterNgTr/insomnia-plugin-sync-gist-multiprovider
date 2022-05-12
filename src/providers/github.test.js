const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const Github = require('./github');

const mock = new MockAdapter(axios);

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

test('get gist - invalid id', async () => {
  try {
    const gitHub = new Github({ }, {
      token: '123', gistID: '123', baseURL: '', projectID: '123', visibility: 'public',
    });
    await gitHub.getGist();
  } catch (e) {
    expect(e.message).toEqual('Retrieving the file failed');
  }
});

test('get gist - valid id', async () => {
  const gitHub = new Github({ }, {
    token: '123', gistID: '123', baseURL: '', projectID: '123', visibility: 'public',
  });
  mock.onGet('https://api.github.com/gists/123').reply(200, { files: { 'insomnia_data.json': { content: JSON.stringify({ hello: '123' }) } } });
  const t = await gitHub.getGist();
  expect(t).toEqual({ hello: '123' });
});

test('update gist - valid id', async () => {
  const gitHub = new Github({ }, {
    token: '123', gistID: '123', baseURL: '', projectID: '123', visibility: 'public',
  });
  mock.onPatch('https://api.github.com/gists/123').reply(200, { });
  const t = await gitHub.updateGist({});
  expect(t).toEqual(undefined);
});

test('create gist', async () => {
  const config = {
    token: '123',
    gistID: '123',
    projectID: '123',
    visibility: 'public',
    apiURL: 'https://api.github.com',
    timeout: 5000,
  };

  const localStorageMock = (function () {
    return {
      store: {

        getItem(key) {
          const store = { 'gist-sync:config': config };
          return JSON.stringify(store[key]);
        },

        setItem(key, value) {
          const store = { 'gist-sync:config': config };
          store[key] = value.toString();
        },
      },
    };
  }());

  const gitHub = new Github(localStorageMock, {
    token: '123', visibility: 'public',
  });
  mock.onPost('https://api.github.com/gists').reply(200, { });
  const t = await gitHub.createGist({});
  expect(t).toEqual(undefined);
});
