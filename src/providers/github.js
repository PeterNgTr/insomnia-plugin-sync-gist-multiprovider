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
      timeout: 5000,
      headers: { Authorization: `Bearer ${this.config.token}` },
    });
  }

  async getGist(){
    try {
      const response = await this.authenticate().get(
        `${this.config.api_url}/gists/${gistKey}`,
      );

      const file = response.data.files['insomnia_data.json'];
      if (!file.truncated){
        return file.content;
      } else {
        const rawFile = await axios.get(file.raw_url);
        return rawFile
      }
    }catch (e) {}
    return null;
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
    this.config.gist_id = response.id

    // Update saved config gist ID
    // TODO, move this to a provider interface, instead of modifying it per-provider
    let conf = await context.store.getItem('gist-sync:config');
    config = JSON.parse(conf);
    config.gistID = response.id
    conf = JSON.stringify(config)
    await context.store.setItem('gist-sync:config', conf);
  }

  async updateGist(content) {
    await this.authenticate().patch(
      `${this.config.api_url}/gists/${gistKey}`,
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
  }
}

module.exports = github
