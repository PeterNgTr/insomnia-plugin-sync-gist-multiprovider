const RestHelper = require('../helpers/apiHelper');

class Github {
  constructor(context, config) {
    this.config = [];
    this.context = context;

    this.config.apiURL = 'https://api.github.com';
    this.loadConfig(config);
    this.api = new RestHelper(this.config);
  }

  async getGist() {
    try {
      const response = await this.api.get(
        `${this.config.apiURL}/gists/${this.config.gistID}`,
      );

      const file = response.data.files['insomnia_data.json'];
      if (!file.truncated) {
        return JSON.parse(file.content);
      }
      return this.api.get(file.raw_url);
    } catch (e) {
      console.log(e);
      throw new Error('Retrieving the file failed');
    }
  }

  async createGist(content) {
    const response = await this.api.post(
      `${this.config.apiURL}/gists`,
      {
        files: {
          'insomnia_data.json': {
            content,
          },
        },
        description: 'Insomnia Sync Data',
        public: false,
      },
    );

    // Update gist ID on config
    this.config.gistID = response.id;

    // Update saved config gist ID
    // TODO, move this to a provider interface, instead of modifying it per-provider
    let conf = await this.context.store.getItem('gist-sync:config');
    const config = JSON.parse(conf);
    config.gistID = response.id;
    conf = JSON.stringify(config);
    await this.context.store.setItem('gist-sync:config', conf);
  }

  async updateGist(content) {
    await this.api.patch(
      `${this.config.apiURL}/gists/${this.config.gistID}`,
      {
        files: {
          'insomnia_data.json': {
            content,
          },
        },
      },
    );
  }

  /**
   * Validate is the configuration parameters are complete, and set defaults if required.
   * Then, save the configuration in the instance of the class
   * @param {configObject} config
   * @returns boolean Tells if the configuration is correct
   */
  loadConfig(config) {
    if (typeof (config.token) !== 'string' || config.token === '') throw new Error('Invalid token');
    this.config.token = config.token;

    if (typeof (config.gistID) !== 'string' || config.gistID === '') {
      this.config.gistID = null;
    } else {
      this.config.gistID = config.gistID;
    }

    if (typeof (config.visibility) !== 'string' || config.visibility === '') {
      this.config.visibility = 'private';
    } else {
      this.config.visibility = config.visibility;
    }

    if (typeof (config.timeout) !== 'number' || config.timeout === '') {
      this.config.timeout = 5000;
    } else {
      this.config.timeout = config.timeout;
    }
  }
}

module.exports = Github;
