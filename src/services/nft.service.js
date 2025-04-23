import api from './api';

const NFTService = {
  // Get all NFTs with optional category filter
  getNFTs: async (category) => {
    const params = category ? { category } : {};
    const response = await api.get('/nfts', { params });
    return response.data;
  },

  // Get single NFT by ID
  getNFT: async (id) => {
    const response = await api.get(`/nfts/${id}`);
    return response.data;
  },

  // Create new NFT
  createNFT: async (nftData) => {
    const response = await api.post('/nfts', nftData);
    return response.data;
  },

  // Update NFT
  updateNFT: async (id, nftData) => {
    const response = await api.put(`/nfts/${id}`, nftData);
    return response.data;
  },

  // Delete NFT
  deleteNFT: async (id) => {
    const response = await api.delete(`/nfts/${id}`);
    return response.data;
  },

  // Update NFT edition status
  updateNFTEdition: async (id, subId, data) => {
    const response = await api.put(`/nfts/${id}/editions/${subId}`, data);
    return response.data;
  },

  // Transfer NFT ownership
  transferNFTEdition: async (id, subId, newOwnerId, price) => {
    const response = await api.post(`/nfts/${id}/editions/${subId}/transfer`, {
      newOwnerId,
      price
    });
    return response.data;
  },

  // Get user's NFTs
  getUserNFTs: async (userId) => {
    const response = await api.get(`/nfts/user/${userId}`);
    return response.data;
  },

  // Get available NFTs for purchase
  getAvailableNFTs: async () => {
    const response = await api.get('/nfts/available');
    return response.data;
  }
};

export default NFTService; 