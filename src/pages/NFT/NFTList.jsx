import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, message, Tag, Select, Card, InputNumber, Form, Checkbox } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, ShoppingOutlined, GiftOutlined } from '@ant-design/icons';
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
  const [syntheticAirdropModal, setSyntheticAirdropModal] = useState(false);
  const [currentNftId, setCurrentNftId] = useState(null);
  const [airdropForm] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [batchPublishModal, setBatchPublishModal] = useState(false);
  const [publishForm] = Form.useForm();
  const [selectedType, setSelectType] = useState('');

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
        const nftResponse = await NFTService.getNFTs(selectedCategory,selectedType);
        setNfts(nftResponse.data?.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('获取NFT数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory,selectedType]);

  // Handle category filter change
  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };
  // Handle category filter change
  const handleTypeChange = (value) => {
    
  };

  const handlePublish = (id) => {
    confirm({
      title: '确认发布',
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
          const response = await NFTService.getNFTs(selectedCategory);
          setNfts(response.data?.data || []);
        } catch (error) {
          message.error('发布失败: ' + (error.response?.data?.message || '未知错误'));
        }
      },
    });
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
      const response = await NFTService.getNFTs(selectedCategory, selectedType);
      setNfts(response.data?.data || []);
    } catch (error) {
      if (error.errorFields) {
        return; // 表单验证错误
      }
      message.error('合成空投发布失败: ' + (error.response?.data?.message || '未知错误'));
    }
  };

  // Handle batch publish
  const handleBatchPublish = () => {
    if (selectedRowKeys.length === 0) {
      return message.warning('请先选择要发布的NFT');
    }
    
    setBatchPublishModal(true);
  };
  
  const submitBatchPublish = async () => {
    try {
      const values = await publishForm.validateFields();
      
      await NFTService.publishNFTBatch(selectedRowKeys, values.price);
      
      message.success('NFT批量发布成功');
      setBatchPublishModal(false);
      publishForm.resetFields();
      setSelectedRowKeys([]);
      
      // 刷新列表
      const response = await NFTService.getNFTs(selectedCategory, selectedType);
      setNfts(response.data?.data || []);
    } catch (error) {
      if (error.errorFields) {
        return; // 表单验证错误
      }
      message.error('批量发布失败: ' + (error.response?.data?.message || '未知错误'));
    }
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
      title: '类型',
      dataIndex: 'typeStr',
      key: 'typeStr',
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
      title: '状态',
      dataIndex: 'statusStr',
      key: 'statusStr',
    },
    {
      title: '操作',
      key: 'action',
      width: '300px',
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
          type="default"
          style={{ background: '#52c41a', color: 'white' }}
          icon={<ShoppingOutlined />} 
          size="small"
          onClick={() => handlePublish(record._id)}
        >
          发布
        </Button>
        <Button 
          type="default"
          style={{ background: '#722ed1', color: 'white' }}
          icon={<GiftOutlined />} 
          size="small"
          onClick={() => handleSyntheticAirdrop(record._id)}
        >
          合成空投
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

  // Table row selection config
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  return (
    <div>
      <div className="page-header">
        <h2>NFT管理</h2>
        <Space>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => navigate('/nfts/create')}
          >
            创建NFT
          </Button>
          
          <Button 
            type="default"
            style={{ background: '#52c41a', color: 'white' }}
            icon={<ShoppingOutlined />}
            onClick={handleBatchPublish}
            disabled={selectedRowKeys.length === 0}
          >
            批量发布
          </Button>
        </Space>
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
          
          <span>类型筛选:</span>
          <Select
            style={{ width: 200 }}
            placeholder="按类型筛选"
            allowClear
            onChange={value => setSelectType(value)}
            value={selectedType}
          >
            <Option value="1">普通NFT</Option>
            <Option value="2">盲盒</Option>
          </Select>
        </Space>
      </Card>
      
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={nfts}
        rowKey="_id"
        loading={loading}
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

      {/* Batch Publish Modal */}
      <Modal
        title="批量发布NFT"
        open={batchPublishModal}
        onOk={submitBatchPublish}
        onCancel={() => {
          setBatchPublishModal(false);
          publishForm.resetFields();
        }}
        okText="确认"
        cancelText="取消"
      >
        <p>您已选择 {selectedRowKeys.length} 个NFT进行批量发布</p>
        <Form
          form={publishForm}
          layout="vertical"
        >
          <Form.Item
            name="price"
            label="发布价格(可选)"
            extra="留空则使用每个NFT的原始价格"
          >
            <InputNumber 
              style={{ width: '100%' }} 
              placeholder="输入统一发布价格" 
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

export default NFTList;