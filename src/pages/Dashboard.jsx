import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Spin } from 'antd';
import { ShopOutlined, CommentOutlined, UserOutlined } from '@ant-design/icons';
import NFTService from '../services/nft.service.js';
import api from '../services/api.js';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    nftCount: 0,
    commentCount: 0,
    userCount: 0,
    availableNFTs: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Get NFT count
        const nftResponse = await NFTService.getNFTs();
        const nftCount = nftResponse.data?.length || 0;
        
        // Get available NFTs for purchase
        const availableResponse = await NFTService.getAvailableNFTs();
        const availableNFTs = availableResponse.count || 0;
        
        // These would depend on your API having these endpoints
        const commentResponse = await api.get('/comments/count');
        const commentCount = commentResponse.data?.count || 0;
        
        const userResponse = await api.get('/users/count');
        const userCount = userResponse.data?.count || 0;
        
        setStats({
          nftCount,
          commentCount,
          userCount,
          availableNFTs
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // If API endpoints don't exist, use dummy data
        setStats({
          nftCount: nftCount || 0,
          commentCount: 0,
          userCount: 0,
          availableNFTs: 0
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  return (
    <div>
      <div className="page-header">
        <h2>仪表盘</h2>
      </div>
      
      <Spin spinning={loading}>
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="NFT总数"
                value={stats.nftCount}
                prefix={<ShopOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="在售NFT"
                value={stats.availableNFTs}
                prefix={<ShopOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="评论总数"
                value={stats.commentCount}
                prefix={<CommentOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="用户总数"
                value={stats.userCount}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default Dashboard; 