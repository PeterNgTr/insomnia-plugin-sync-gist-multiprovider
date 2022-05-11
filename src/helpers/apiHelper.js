const axios = require('axios');

class RestHelper {
  constructor(config) {
    this.axios = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: { Authorization: `Bearer ${config.token}` },
    });
  }

  async get(endpoint) {
    try {
      const response = await this.axios.get(endpoint);
      return response.data;
    } catch (e) {
      throw new Error(`Something went wrong: ${e.message}`);
    }
  }

  async post(endpoint, payload) {
    try {
      const response = await this.axios.post(endpoint, payload);
      return response.data;
    } catch (e) {
      throw new Error(`Something went wrong: ${e.message}`);
    }
  }

  async put(endpoint, payload) {
    try {
      const response = await this.axios.put(endpoint, payload);
      return response.data;
    } catch (e) {
      throw new Error(`Something went wrong: ${e.message}`);
    }
  }

  async patch(endpoint, payload) {
    try {
      const response = await this.axios.patch(endpoint, payload);
      return response.data;
    } catch (e) {
      throw new Error(`Something went wrong: ${e.message}`);
    }
  }
}

module.exports = RestHelper;
