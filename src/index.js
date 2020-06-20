const gitlab = require('./providers/gitlab.js');

// Global provier variable
var provider;

/**
 * Function to get the config from object sorage, or prompt for it
 * @param {*} context
 */
async function loadConfig(context, forceReprompt) {
  const oldConfig = await context.store.getItem('gist-sync:config');
  if (!oldConfig || forceReprompt) {
    // Prompt for the configuration
    try {
      var config = await context.app.prompt(
      'Gist Sync - Configuration', {
        label: 'JSON string',
        defaultValue: oldConfig || '{ "provider": "github", "token": "", "gistID": "" }',
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
  config = JSON.parse(oldConfig)
  loadProvider(context, config)
  return config;
}

function loadProvider(context, config){
  console.log("LoadProvider@config", config)
  try {
    switch (config.provider) {
      case "gitlab":
          provider = new gitlab(context, config);
          break;
      default:
        context.app.alert( "Invalid configuration!", `Provider ${config.provider} not found` );
        return false;
    }
  } catch (e) {
    context.app.alert('Configuration error', e.message);
  }
  return true
}

/**
 *
 * @complexity O(2n^2)
 * @param {*} context
 * @param {*} remote
 */
async function solveConflicts(context, remote) {
  let resources = [];
  const lc = await context.data.export.insomnia({
    includePrivate: false,
    format: 'json',
  });
  const local = JSON.parse(lc);

  // Compare local and remote, create new list the newest items from both
  remote.resources.forEach( function(entrie) {

    // Check if exists in local
    localEntrie = local.resources.find( (item) => item._id == entrie._id );

    if ( localEntrie !== undefined ) {
      // If it exists in both, check the newest version and save it
      if ( entrie.modified > localEntrie.modified ){
        resources.push( entrie );
      } else {
        resources.push( localEntrie );
      }
    } else {
      // If we don't have it in local, push it
      // TODO: Check if this is a bug that prevents items from being deleted
      resources.push( entrie );
    }
  });

  // Check if there are any new resource that is not already on the list (new elements on local)
  local.resources.forEach(function(entrie){
    remoteEntrie = resources.find( (item) => item._id == entrie._id );
    if(remoteEntrie === undefined ){
      resources.push(entrie);
    }
  })

  ret = local; ret.resources = resources;
  return ret;
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
        if ( typeof(config.gistID) !== "string" || config.gistID == "" ) {
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
        const file = await provider.getGist();
        const remote = await solveConflicts(context, file);

        const content = JSON.stringify(remote);
        await context.data.import.raw(content);
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
