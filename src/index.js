const Gitlab = require('./providers/gitlab');
const Github = require('./providers/github');

// Global provider variable
let provider;

function loadProvider(context, config) {
  console.log('LoadProvider@config', config);
  try {
    switch (config.provider) {
      case 'gitlab':
        provider = new Gitlab(context, config);
        break;
      case 'github':
        provider = new Github(context, config);
        break;
      default:
        context.app.alert('Invalid configuration!', `Provider ${config.provider} not found`);
        return false;
    }
  } catch (e) {
    context.app.alert('Configuration error', e.message);
  }
  return true;
}

/**
 * Function to get the config from object storage, or prompt for it
 * @param {*} context
 * @param {boolean} forceReprompt
 */
async function loadConfig(context, forceReprompt) {
  const oldConfig = await context.store.getItem('gist-sync:config');
  let configObject;
  let config;

  if (!oldConfig || forceReprompt) {
    // Prompt for the configuration
    try {
      config = await context.app.prompt('Gist Sync - Configuration', {
        label: 'JSON string',
        defaultValue: oldConfig || '{ "provider": "github", "token": "", "gistID": "" }',
        submitName: 'Save',
        cancelable: true,
      });
    } catch (e) { return false; }

    // Validate the JSON config
    try {
      configObject = JSON.parse(config);
    } catch (e) {
      context.app.alert('Invalid JSON!', `Error: ${e.message}`);
      return false;
    }

    // Check if it is possible to instantiate the provider with the config
    if (!loadProvider(context, configObject)) {
      return false;
    }

    await context.store.setItem('gist-sync:config', config);
    return configObject;
  }
  config = JSON.parse(oldConfig);
  loadProvider(context, config);

  return config;
}

/**
 *
 * @complexity O(2n^2)
 * @param {*} context
 * @param {*} remote
 */
async function solveConflicts(context, remote) {
  const resources = [];
  const lc = await context.data.export.insomnia({
    includePrivate: false,
    format: 'json',
  });
  const local = JSON.parse(lc);

  // Compare local and remote, create new list the newest items from both
  remote.resources.forEach((entrie) => {
    // Check if exists in local
    const localEntrie = local.resources.find((item) => item._id === entrie._id);

    if (localEntrie !== undefined) {
      // If it exists in both, check the newest version and save it
      if (entrie.modified > localEntrie.modified) {
        resources.push(entrie);
      } else {
        resources.push(localEntrie);
      }
    } else {
      // If we don't have it in local, push it
      // TODO: Check if this is a bug that prevents items from being deleted
      resources.push(entrie);
    }
  });

  // Check if there are any new resource that is not already on the list (new elements on local)
  local.resources.forEach((entrie) => {
    const remoteEntrie = resources.find((item) => item._id === entrie._id);
    if (remoteEntrie === undefined) {
      resources.push(entrie);
    }
  });

  const ret = local; ret.resources = resources;
  return ret;
}

module.exports.workspaceActions = [
  {
    label: 'Gist Sync - Send',
    icon: 'fa-upload',
    action: async (context, models) => {
      const config = await loadConfig(context, false);
      if (!config) {
        await context.app.alert('Configuration error', 'No configuration defined');
        return;
      }

      // Load insomnia data
      const data = await context.data.export.insomnia({
        includePrivate: false,
        format: 'json',
        workspace: models.workspace,
      });
      const content = JSON.stringify(JSON.parse(data), null, 2);

      try {
        if (typeof (config.gistID) !== 'string' || config.gistID === '') {
          provider.createGist(content);
        } else {
          provider.updateGist(content);
        }
      } catch (e) {
        await context.app.alert('Failed to send!', e.message);
      }
    },
  },
  {
    label: 'Gist Sync - Receive',
    icon: 'fa-download',
    action: async (context) => {
      const config = await loadConfig(context, false);
      if (!config) {
        await context.app.alert('Configuration error', 'No configuration defined');
      }

      try {
        const file = await provider.getGist();
        const remote = await solveConflicts(context, file);

        const content = JSON.stringify(remote);
        await context.data.import.raw(content);
      } catch (e) {
        await context.app.alert('Failed to receive!', e.message);
      }
    },
  },
  {
    label: 'Gist Sync - Configure',
    icon: 'fa-cogs',
    action: async (context) => {
      await loadConfig(context, true);
    },
  },
];
