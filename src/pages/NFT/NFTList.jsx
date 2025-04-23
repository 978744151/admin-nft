import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, message, Tag, Select, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import NFTService from '../../services/nft.service.js';
import api from '../../services/api.js';

const { confirm } = Modal;
const { Option } = Select;

const NFTList = () => {
  const [loading, setLoading] = useState(false);
  const [nfts, setNfts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();

  // Fetch NFTs and categories
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch NFT categories
        const categoryResponse = await api.get('/nft-categories');
        setCategories(categoryResponse.data.data || []);

        // Fetch NFTs with category filter if selected
        const nftResponse = await NFTService.getNFTs(selectedCategory);
        setNfts(nftResponse.data?.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('获取NFT数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory]);

  // Handle category filter change
  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  // Handle NFT deletion
  const handleDelete = (id) => {
    confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除这个NFT吗？此操作无法撤销。',
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await NFTService.deleteNFT(id);
          message.success('NFT删除成功');
          // Refresh the list
          const response = await NFTService.getNFTs(selectedCategory);
          setNfts(response.data?.data || []);
        } catch (error) {
          message.error('删除失败: ' + (error.response?.data?.message || '未知错误'));
        }
      },
    });
  };

  // Table columns definition
  const columns = [
    {
      title: 'ID',
      dataIndex: '_id',
      key: '_id',
      ellipsis: true,
      width: '80px',
    },
    {
      title: '图片',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: '80px',
      render: (imageUrl) => (
        <img 
          src={imageUrl} 
          alt="NFT" 
          style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
        />
      ),
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category) => <Tag color="blue">{category?.name || '未分类'}</Tag>,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: '已售',
      dataIndex: 'soldQty',
      key: 'soldQty',
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: '操作',
      key: 'action',
      width: '150px',
      render: (_, record) => (
        <Space size="small" className="table-actions">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => navigate(`/nfts/edit/${record._id}`)}
          >
            编辑
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
            onClick={() => handleDelete(record._id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h2>NFT管理</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => navigate('/nfts/create')}
        >
          创建NFT
        </Button>
      </div>
      
      <Card className="card-container">
        <Space>
          <span>分类筛选:</span>
          <Select
            style={{ width: 200 }}
            placeholder="选择分类"
            allowClear
            onChange={handleCategoryChange}
            value={selectedCategory}
          >
            {categories.map(category => (
              <Option key={category._id} value={category._id}>
                {category.name}
              </Option>
            ))}
          </Select>
        </Space>
      </Card>
      
      <Table
        columns={columns}
        dataSource={nfts}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1000 }}
      />
    </div>
  );
};

export default NFTList; 