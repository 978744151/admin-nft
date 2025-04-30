import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, message, Tag, Select, Card, Tooltip, InputNumber, Form } from 'antd';
import { ShoppingOutlined, StopOutlined, ExclamationCircleOutlined, GiftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import NFTService from '../../services/nft.service.js';
import api from '../../services/api.js';

const { confirm } = Modal;
const { Option } = Select;

const NFTMarketplace = () => {
  const [loading, setLoading] = useState(false);
  const [nfts, setNfts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [syntheticAirdropModal, setSyntheticAirdropModal] = useState(false);
  const [currentNftId, setCurrentNftId] = useState(null);
  const [airdropForm] = Form.useForm();
  const navigate = useNavigate();

  // Fetch published NFTs and categories
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch NFT categories
        const categoryResponse = await api.get('/nft-categories');
        setCategories(categoryResponse.data.data || []);

        // Fetch available NFTs for purchase
        const nftResponse = await NFTService.getAvailableNFTs();
        setNfts(nftResponse.data || []);
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

  // Handle NFT publication for users to purchase
  const handlePublish = (id) => {
    confirm({
      title: '确认发布NFT',
      icon: <ShoppingOutlined />,
      content: '确定要将此NFT发布到市场供用户购买吗？',
      okText: '确认',
      okType: 'primary',
      cancelText: '取消',
      onOk: async () => {
        try {
          // 获取NFT详情
          const nftResponse = await NFTService.getNFT(id);
          const nft = nftResponse.data;
          
          // 检查是否有未售出的版本
          const unpublishedEditions = nft.editions.filter(
            edition => edition.status === 1 // 未寄售状态
          );
          
          if (unpublishedEditions.length === 0) {
            return message.warning('没有可发布的NFT版本');
          }
          
          // 将所有未寄售状态的版本更新为寄售中状态
          const updatePromises = unpublishedEditions.map(edition => 
            NFTService.updateNFTEdition(id, edition.sub_id, { 
              status: 2,  // 改为寄售中状态
              price: edition.price || nft.price
            })
          );
          
          await Promise.all(updatePromises);
          message.success('NFT已成功发布到市场');
          
          // 刷新列表
          const availableResponse = await NFTService.getAvailableNFTs();
          setNfts(availableResponse.data || []);
        } catch (error) {
          message.error('发布失败: ' + (error.response?.data?.message || '未知错误'));
        }
      },
    });
  };

  // Handle removing NFT from marketplace
  const handleRemoveFromMarket = (id, subId) => {
    confirm({
      title: '确认下架',
      icon: <StopOutlined />,
      content: '确定要将此NFT从市场下架吗？',
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await NFTService.updateNFTEdition(id, subId, { status: 1 }); // 改为未寄售状态
          message.success('NFT已从市场下架');
          
          // 刷新列表
          const availableResponse = await NFTService.getAvailableNFTs();
          setNfts(availableResponse.data || []);
        } catch (error) {
          message.error('下架失败: ' + (error.response?.data?.message || '未知错误'));
        }
      },
    });
  };

  // Handle synthetic airdrop
  const handleSyntheticAirdrop = (id) => {
    setCurrentNftId(id);
    setSyntheticAirdropModal(true);
  };

  const submitSyntheticAirdrop = async () => {
    try {
      const values = await airdropForm.validateFields();
      
      await NFTService.publishSyntheticAirdrop(currentNftId, {
        quantity: values.quantity,
        price: values.price
      });
      
      message.success('合成空投发布成功');
      setSyntheticAirdropModal(false);
      airdropForm.resetFields();
      
      // 刷新列表
      const availableResponse = await NFTService.getAvailableNFTs();
      setNfts(availableResponse.data || []);
    } catch (error) {
      if (error.errorFields) {
        return; // 表单验证错误
      }
      message.error('合成空投发布失败: ' + (error.response?.data?.message || '未知错误'));
    }
  };

  // Columns for editions table
  const editionsColumns = [
    {
      title: '编号',
      dataIndex: 'sub_id',
      key: 'sub_id',
      width: '80px',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: '100px',
    },
    {
      title: '状态',
      key: 'status',
      width: '100px',
      render: (_, record) => (
        <Tag color="green">{record.statusStr || '寄售中'}</Tag>
      ),
    },
    {
      title: '拥有者',
      key: 'owner',
      width: '120px',
      render: (_, record) => (
        <span>{record.owner?.name || '平台'}</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: '100px',
      render: (_, record) => (
        <Space size="small">
          <Button 
            danger 
            size="small"
            icon={<StopOutlined />}
            onClick={() => handleRemoveFromMarket(record.nftId, record.sub_id)}
          >
            下架
          </Button>
        </Space>
      ),
    },
  ];

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
      title: '基础价格',
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
      title: '在售数量',
      key: 'availableCount',
      render: (_, record) => record.availableEditions?.length || 0,
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: '操作',
      key: 'actions',
      width: '120px',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="default"
            style={{ background: '#722ed1', color: 'white' }}
            icon={<GiftOutlined />}
            size="small"
            onClick={() => handleSyntheticAirdrop(record._id)}
          >
            合成空投
          </Button>
        </Space>
      )
    }
  ];

  const expandedRowRender = (record) => {
    const editions = record.availableEditions.map(edition => ({
      ...edition, 
      nftId: record._id
    }));
    
    return (
      <Card title="在售版本" size="small" bordered={false}>
        <Table
          columns={editionsColumns}
          dataSource={editions}
          rowKey="sub_id"
          pagination={false}
          size="small"
        />
      </Card>
    );
  };

  return (
    <div>
      <div className="page-header">
        <h2>NFT市场管理</h2>
        <Button 
          type="primary" 
          icon={<ShoppingOutlined />}
          onClick={() => navigate('/nfts')}
        >
          管理NFT
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
        expandable={{
          expandedRowRender,
          rowExpandable: record => record.availableEditions && record.availableEditions.length > 0,
        }}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1100 }}
      />

      {/* Synthetic Airdrop Modal */}
      <Modal
        title="发布合成空投"
        open={syntheticAirdropModal}
        onOk={submitSyntheticAirdrop}
        onCancel={() => {
          setSyntheticAirdropModal(false);
          airdropForm.resetFields();
        }}
        okText="确认"
        cancelText="取消"
      >
        <Form
          form={airdropForm}
          layout="vertical"
        >
          <Form.Item
            name="quantity"
            label="空投数量"
            rules={[
              { required: true, message: '请输入空投数量' },
              { type: 'number', min: 1, message: '数量必须大于0' }
            ]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="输入空投数量" min={1} />
          </Form.Item>

          <Form.Item
            name="price"
            label="单价"
            rules={[
              { required: true, message: '请输入单价' },
              { type: 'number', min: 0, message: '价格必须大于或等于0' }
            ]}
          >
            <InputNumber 
              style={{ width: '100%' }} 
              placeholder="输入单价" 
              min={0}
              precision={2}
              addonAfter="元" 
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NFTMarketplace;