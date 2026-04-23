require('dotenv').config();
const axios = require('axios');

class UploadService {
  getAuthHeaders() {
    const jwt = process.env.PINATA_JWT;
    if (!jwt) {
      throw new Error('PINATA_JWT not configured');
    }
    return {
      Authorization: `Bearer ${jwt}`,
    };
  }

  async uploadJSON(metadata, name = 'metadata') {
    try {
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        {
          pinataContent: metadata,
          pinataMetadata: {
            name,
            keyvalues: {
              created: new Date().toISOString(),
              app: 'Roastellar',
            },
          },
        },
        { headers: this.getAuthHeaders() }
      );

      return {
        cid: response.data.IpfsHash,
        size: response.data.PinSize,
        timestamp: response.data.DatePinned,
      };
    } catch (error) {
      console.error('IPFS JSON upload failed:', error.response?.data || error.message);
      throw new Error('Failed to upload to IPFS');
    }
  }

  async uploadFile(buffer, filename, contentType = 'application/octet-stream') {
    try {
      const FormData = require('form-data');
      const formData = new FormData();
      
      formData.append('file', buffer, {
        filename,
        contentType,
      });

      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            ...this.getAuthHeaders(),
            ...formData.getHeaders(),
          },
        }
      );

      return {
        cid: response.data.IpfsHash,
        size: response.data.PinSize,
        timestamp: response.data.DatePinned,
      };
    } catch (error) {
      console.error('IPFS file upload failed:', error.response?.data || error.message);
      throw new Error('Failed to upload file to IPFS');
    }
  }

  async uploadRoast(roastText, matchId, playerId) {
    const metadata = {
      type: 'roast',
      matchId,
      playerId,
      content: roastText,
      timestamp: new Date().toISOString(),
    };

    return this.uploadJSON(metadata, `roast_${matchId}_${playerId}`);
  }

  async uploadTopic(topic, matchId) {
    const metadata = {
      type: 'topic',
      matchId,
      content: topic,
      timestamp: new Date().toISOString(),
    };

    return this.uploadJSON(metadata, `topic_${matchId}`);
  }

  async uploadProfile(user) {
    const metadata = {
      type: 'profile',
      userId: user._id?.toString(),
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      xp: user.xp,
      wins: user.wins,
      badges: user.badges,
      updated: new Date().toISOString(),
    };

    return this.uploadJSON(metadata, `profile_${user._id}`);
  }

  async pinCID(cid) {
    try {
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinByHash',
        {
          hashToPin: cid,
          hostNodes: [
            '/ipfs/pinreader01',
            '/ipfs/pinreader02',
          ],
        },
        { headers: this.getAuthHeaders() }
      );

      return {
        cid: response.data.IpfsHash,
        timestamp: response.data.DatePinned,
      };
    } catch (error) {
      console.error('IPFS pin failed:', error.response?.data || error.message);
      throw new Error('Failed to pin CID');
    }
  }

  async unpinCID(cid) {
    try {
      await axios.delete(
        'https://api.pinata.cloud/pinning/unpin',
        {
          data: { hashToUnpin: cid },
          headers: this.getAuthHeaders(),
        }
      );

      return true;
    } catch (error) {
      console.error('IPFS unpin failed:', error.response?.data || error.message);
      return false;
    }
  }

  async getFileStatus(cid) {
    try {
      const response = await axios.get(
        `https://api.pinata.cloud/data/pinList?hashContains=${cid}`,
        { headers: this.getAuthHeaders() }
      );

      return response.data.rows[0] || null;
    } catch (error) {
      return null;
    }
  }

  getGatewayURL(cid) {
    return `https://gateway.pinata.cloud/ipfs/${cid}`;
  }

  getIPFSUrl(cid) {
    return `ipfs://${cid}`;
  }
}

module.exports = new UploadService();