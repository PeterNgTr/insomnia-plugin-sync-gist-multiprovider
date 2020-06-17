const gitlab = require('./providers/gitlab.js');
const fs = require('fs');
const { config } = require('process');

// Global provier variable
var provider;

/**
 * Function to get the config from object sorage, or prompt for it
 * @param {*} context
 */
async function loadConfig(context) {
  const oldConfig = await context.store.getItem('gist-sync:config');
  if (!oldConfig || forceReprompt) {
    // Prompt for the configuration
    try {
      var config = await context.app.prompt(
      'Gist Sync - Configuration', {
        label: 'JSON string',
        defaultValue: '{ "provider": "github", "token": "", "gistID": "" }',
        submitName: 'Save',
        cancelable: true,
      }
      );
    } catch (e) { return false }

    // Validate the JSON config
    try {
      var configObject = JSON.parse(config);
    } catch (e) {
      context.app.alert("Invalid JSON!", "Error: " + e.message);
      return false;
    }

    // Check if it is possible to instantiate the provider with the config
    if(!loadProvider(context, configObject)){
      return false;
    }

    await context.store.setItem('gist-sync:config', config);
    return configObject;
  }
  return JSON.parse(oldConfig)
}

function loadProvider(context, config){
  try {
    switch (config.provider) {
      case 'gitlab':
          provider = new gitlab(context, config);
      default:
        context.app.alert( "Invalid configuration!", "Provider not found" );
        return false;
    }
  } catch (e) {
    context.app.alert('Configuration error', e.message);
  }
  return true
}

module.exports.workspaceActions = [
  {
    label: 'Gist Sync - Send',
    icon: 'fa-upload',
    action: async (context, models) => {
      const config = await loadConfig(context, false);
      if (!config) {
        await context.app.alert( 'Configuration error', 'No configuration defined' );
        return;
      }

      // Load insomnia data
      const data = await context.data.export.insomnia({
        includePrivate: false,
        format: 'json',
      });
      const content = JSON.stringify(JSON.parse(data), null, 2);

      try {
        if (!config.gistID) {
          provider.createGist(content);
        } else {
          provider.updateGist(content);
        }
      } catch (e) {
        await context.app.alert( 'Error', e.message );
        return;
      }
    },
  },
  {
    label: 'Gist Sync - Receive',
    icon: 'fa-download',
    action: async (context, models) => {
      const config = await loadConfig(context, false);
      if (!config) {
        await context.app.alert( 'Configuration error', 'No configuration defined' );
        return;
      }

      try{
        const response = await provider.getGist();
        const file = response.data.files['insomnia_data.json'];
        if (!file.truncated) await context.data.import.raw(file.content);
        else {
          const rawResponse = await axios.get(file.raw_url);
          const content = JSON.stringify(rawResponse.data);
          await context.data.import.raw(content);
        }
      } catch (e) {
        await context.app.alert( 'Error', e.message );
        return;
      }
    },
  },
  {
    label: 'Gist Sync - Configure',
    icon: 'fa-cogs',
    action: async (context, models) => {
      await loadConfig(context, true);
    },
  },
];
