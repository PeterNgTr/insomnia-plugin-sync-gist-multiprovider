const axios = require('axios');

class gitlab {
  constructor (context, config) {
    this.context = context
    this.loadConfig(config)
    console.log("Loaded config@gitlab", this.config)
  }

  authenticate() {
    return axios.create({
      baseURL: `${this.config.api_url}`,
      timeout: 5000,
      headers: { Authorization: `Bearer ${this.config.token}` },
    });
  }

  async getGist(){
    try {
      const response = await this.authenticate().get(
        `${this.config.api_url}/snippets/${this.config.gist_id}/raw`
      );
      return response.data;
    }catch (e) {}
    return null;
  }

  async createGist(content) {
    const response = await this.authenticate().post(
      `${this.config.api_url}/snippets`,
      {
        title: 'Insomnia sync data',

        file_name: 'insomnia_data.json',
        content: content,

        visibility: this.config.visibility,
      },
    );

    // Update gist ID on config
    this.config.gist_id = response.id

    // Update saved config gist ID
    // TODO, move this to a provider interface, instead of modifying it per-provider
    let conf = await this.context.store.getItem('gist-sync:config');
    let config = JSON.parse(conf);
    config.gistID = response.id
    conf = JSON.stringify(config)
    await this.context.store.setItem('gist-sync:config', conf);
  }

  async updateGist(content) {
    await this.authenticate().put(
      `${this.config.api_url}/snippets/${this.config.gist_id}`,
      {
        content: content,
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
    this.config = []
    if( typeof(config.token) !== "string" || config.token == "" )
      throw "Invalid token";
    this.config.token = config.token

    if( typeof(config.gistID) === undefined || config.gistID == "" ){
      this.config.gist_id = null;
    } else {
      this.config.gist_id = config.gistID;
    }

    if ( typeof(config.baseURL) !== "string" || config.baseURL == ""){
      this.config.base_url = "https://gitlab.com/"
    } else {
      this.config.base_url = config.baseURL;
    }

    if ( typeof(config.projectID) !== "string" || config.projectID == ""){
      this.config.project_id = null
    } else {
      this.config.project_id = config.projectID;
    }

    if ( typeof(config.visibility) !== "string" || config.visibility == "" ){
      this.config.visibility = "private"
    } else {
      this.config.visibility = config.visibility;
    }

    if ( this.config.project_id === null ){
      this.config.api_url = `${this.config.base_url}/api/v4`
    } else {
      this.config.api_url = `${this.config.base_url}/api/v4/projects/${this.config.project_id}`
    }
  }
}

module.exports = gitlab
