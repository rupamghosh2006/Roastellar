const axios = require('axios');
const logger = require('../../../utils/logger');

class IpfsService {
  get enabled() {
    return Boolean(process.env.PINATA_JWT);
  }

  async uploadJSON(content, name) {
    if (!this.enabled) {
      return '';
    }

    try {
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        {
          pinataContent: content,
          pinataMetadata: { name: name || `roastellar-${Date.now()}` },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PINATA_JWT}`,
          },
          timeout: 15000,
        }
      );

      return response.data?.IpfsHash || '';
    } catch (error) {
      logger.error('Pinata uploadJSON failed', { message: error?.message });
      return '';
    }
  }
}

module.exports = new IpfsService();
