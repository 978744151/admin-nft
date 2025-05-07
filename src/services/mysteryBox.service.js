import api from './api';

const MysteryBoxService = {
    // 获取所有盲盒
    getMysteryBoxes: async () => {
        const response = await api.get('/mystery-boxes');
        return response.data;
    },

    // 获取单个盲盒详情
    getMysteryBox: async (id) => {
        const response = await api.get(`/mystery-boxes/${id}`);
        return response.data;
    },

    // 创建新盲盒
    createMysteryBox: async (mysteryBoxData) => {
        const response = await api.post('/mystery-boxes', mysteryBoxData);
        return response.data;
    },

    // 更新盲盒
    updateMysteryBox: async (id, mysteryBoxData) => {
        const response = await api.put(`/mystery-boxes/${id}`, mysteryBoxData);
        return response.data;
    },

    // 更新盲盒状态
    updateMysteryBoxStatus: async (id, status) => {
        const response = await api.put(`/mystery-boxes/${id}/status`, { status });
        return response.data;
    },

    // 更新盲盒实例状态
    updateMysteryBoxEdition: async (mysteryBoxId, editionId, editionData) => {
        const response = await api.put(`/mystery-boxes/${mysteryBoxId}/editions/${editionId}`, editionData);
        return response.data;
    },

    // 删除盲盒
    deleteMysteryBox: async (id) => {
        const response = await api.delete(`/mystery-boxes/${id}`);
        return response.data;
    },

    // 获取用户购买的盲盒
    getUserMysteryBoxes: async () => {
        const response = await api.get('/mystery-boxes/user/boxes');
        return response.data;
    },
    
    // 获取NFT列表（用于盲盒配置）
    getNFTs: async () => {
        const response = await api.get('/nfts');
        return response.data;
    },
    
    // 开启盲盒
    openMysteryBox: async (id) => {
        const response = await api.post(`/mystery-boxes/${id}/open`);
        return response.data;
    }
};

export default MysteryBoxService;