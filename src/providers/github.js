const axios = require('axios');

class github {
  constructor (context, config) {
    this.config = [];
    this.context = context

    this.config.api_url = `https://api.github.com`
    this.loadConfig(config)
  }

  authenticate() {
    return axios.create({
      baseURL: `${this.config.base_url}`,
      timeout: this.config.timeout,
      headers: { Authorization: `Bearer ${this.config.token}` },
    });
  }

  async getGist(){
    try {
      const response = await this.authenticate().get(
        `${this.config.api_url}/gists/${this.config.gist_id}`,
      );

      const file = response.data.files['insomnia_data.json'];
      if (!file.truncated){
        return JSON.parse(file.content);
      } else {
        const rawFile = await axios.get(file.raw_url);
        return rawFile
      }
    }catch (e) {
      console.log(e);
      throw "Retreiving of the file failed"
    }
  }

  async createGist(content) {
    const response = await this.authenticate().post(
      `${this.config.api_url}/gists`,
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
    this.config.gist_id = response.data.id

    // Update saved config gist ID
    // TODO, move this to a provider interface, instead of modifying it per-provider
    let conf = await this.context.store.getItem('gist-sync:config');
    let config = JSON.parse(conf);
    config.gistID = response.data.id
    conf = JSON.stringify(config)
    await this.context.store.setItem('gist-sync:config', conf);
  }

  async updateGist(content) {
    await this.authenticate().patch(
      `${this.config.api_url}/gists/${this.config.gist_id}`,
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

    if( !typeof(config.token) === "string" || config.token == "" )
      throw "Invalid token";
    this.config.token = config.token

    if( !typeof(config.gistID) === "string" || config.gistID == "" ){
      this.config.gist_id = null;
    } else {
      this.config.gist_id = config.gistID;
    }

    if ( !typeof(config.visibility) === "string" || config.visibility == ""){
      this.visibility = "private"
    } else {
      this.config.visibility = config.visibility;
    }

    if ( typeof(config.timeout) !== "number" || config.timeout == ""){
      this.config.timeout = 5000;
    } else {
      this.config.timeout = config.timeout;
    }
  }
}

module.exports = github
