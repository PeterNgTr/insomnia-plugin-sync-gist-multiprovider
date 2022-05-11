const RestHelper = require('../helpers/apiHelper');

class Gitlab {
  constructor(context, config) {
    this.context = context;
    this.loadConfig(config);
    console.log('Loaded config@gitlab', this.config);
    this.api = new RestHelper(this.config);
  }

  async getGist() {
    try {
      return this.api.get(`${this.config.apiURL}/snippets/${this.config.gistID}/raw`);
    } catch (e) {
      throw new Error('Retrieving of the file failed');
    }
  }

  async createGist(content) {
    const response = await this.api.post(
      `${this.config.apiURL}/snippets`,
      {
        title: 'Insomnia sync data',

        file_name: 'insomnia_data.json',
        content,

        visibility: this.config.visibility,
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
    await this.api.put(
      `${this.config.apiURL}/snippets/${this.config.gistID}`,
      {
        content,
      },
    );
    return 'Gist is updated';
  }

  /**
   * Validate is the configuration parameters are complete, and set defaults if required.
   * Then, save the configuration in the instance of the class
   * @param {configObject} config
   * @returns boolean Tells if the configuration is correct
   */
  loadConfig(config) {
    this.config = [];

    if (typeof (config.token) !== 'string' || config.token === '') throw new Error('Invalid token');
    this.config.token = config.token;

    if (typeof (config.gistID) !== 'string' || config.gistID === '') {
      this.config.gistID = null;
    } else {
      this.config.gistID = config.gistID;
    }

    if (!config.baseURL || config.baseURL === '') {
      this.config.baseURL = 'https://gitlab.com';
    } else {
      this.config.baseURL = config.baseURL;
    }

    if (typeof (config.projectID) !== 'string' || config.projectID === '') {
      this.config.projectID = null;
    } else {
      this.config.projectID = config.projectID;
    }

    if (typeof (config.visibility) !== 'string' || config.visibility === '') {
      this.config.visibility = 'private';
    } else {
      this.config.visibility = config.visibility;
    }

    if (this.config.projectID === null) {
      this.config.apiURL = `${this.config.baseURL}/api/v4`;
    } else {
      this.config.apiURL = `${this.config.baseURL}/api/v4/projects/${this.config.projectID}`;
    }

    if (typeof (config.timeout) !== 'number' || config.timeout === '') {
      this.config.timeout = 5000;
    } else {
      this.config.timeout = config.timeout;
    }
  }
}

module.exports = Gitlab;
