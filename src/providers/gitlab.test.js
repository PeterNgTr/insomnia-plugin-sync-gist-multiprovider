const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const Gitlab = require('./gitlab');

const mock = new MockAdapter(axios);

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

test('get gist - invalid id', async () => {
  try {
    const gitlab = new Gitlab({ }, {
      token: '123', gistID: '123', baseURL: '', projectID: '123', visibility: 'public',
    });
    await gitlab.getGist();
  } catch (e) {
    expect(e.message).toEqual('Something went wrong: Request failed with status code 404');
  }
});

test('get gist - valid id', async () => {
  const gitlab = new Gitlab({ }, {
    token: '123', gistID: '123', baseURL: '', projectID: '123', visibility: 'public',
  });
  mock.onGet('https://gitlab.com/api/v4/projects/123/snippets/123/raw').reply(200, { public_url: 'http://test.link.abc' });
  const t = await gitlab.getGist();
  expect(t).toEqual({ public_url: 'http://test.link.abc' });
});

test('update gist - valid id', async () => {
  const gitlab = new Gitlab({ }, {
    token: '123', gistID: '123', baseURL: '', projectID: '123', visibility: 'public',
  });
  mock.onPut('https://gitlab.com/api/v4/projects/123/snippets/123').reply(200, { });
  const t = await gitlab.updateGist({});
  expect(t).toEqual('Gist is updated');
});

test('create gist', async () => {
  const config = {
    token: '123',
    gistID: '123',
    baseURL: 'https://gitlab.com',
    projectID: '123',
    visibility: 'public',
    apiURL: 'https://gitlab.com/api/v4/projects/123',
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

  const gitlab = new Gitlab(localStorageMock, {
    token: '123', gistID: '123', baseURL: '', projectID: '123', visibility: 'public',
  });
  mock.onPost('https://gitlab.com/api/v4/projects/123/snippets').reply(200, { });
  const t = await gitlab.createGist({});
  expect(t).toEqual(undefined);
});
