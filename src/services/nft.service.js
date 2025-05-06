import api from './api';

const NFTService = {
  // Get all NFTs with optional category and type filter
  getNFTs: async (category, type) => {
    console.log(category, type);
    const params = {};
    if (category) params.category = category;
    if (type) params.type = type;
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
    const response = await api.get('/nfts/available-list');
    return response.data;
  },

  // Publish NFT to marketplace for users to purchase (sets all editions to status 2 - on sale)
  publishNFT: async (id, data) => {
    const response = await api.post(`/nfts/${id}/publish`, data);
    return response.data;
  },

  // Batch publish multiple NFTs to marketplace
  publishNFTBatch: async (nftIds, price) => {
    const response = await api.post('/nfts/publish-batch', {
      nftIds,
      price
    });
    return response.data;
  },

  // Publish synthetic airdrop for NFT
  publishSyntheticAirdrop: async (id, airdropData) => {
    const response = await api.post(`/nfts/${id}/synthetic-airdrop`, airdropData);
    return response.data;
  }
};

export default NFTService;