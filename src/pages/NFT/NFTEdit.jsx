import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Select, Spin, Upload, Card, Table, Tag, Space } from 'antd';
import { UploadOutlined, ArrowLeftOutlined, EditOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import NFTService from '../../services/nft.service.js';
import api from '../../services/api.js';

const { Option } = Select;

const NFTEdit = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [categories, setCategories] = useState([]);
  const [nft, setNft] = useState(null);
  const [selectedEditions, setSelectedEditions] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch NFT data and categories
  useEffect(() => {
    const fetchData = async () => {
      setFetchingData(true);
      try {
        // Fetch NFT data
        const nftResponse = await NFTService.getNFT(id);
        setNft(nftResponse.data);
        
        // Set form values
        form.setFieldsValue({
          name: nftResponse.data.name,
          description: nftResponse.data.description,
          imageUrl: nftResponse.data.imageUrl,
          price: nftResponse.data.price,
          author: nftResponse.data.author,
          category: nftResponse.data.category._id,
        });

        // Fetch categories
        const categoryResponse = await api.get('/nft-categories');
        setCategories(categoryResponse.data.data || []);
      } catch (error) {
        console.error('Error fetching NFT data:', error);
        message.error('获取NFT数据失败');
        navigate('/nfts');
      } finally {
        setFetchingData(false);
      }
    };

    fetchData();
  }, [id, form, navigate]);

  // Handle form submission
  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Prepare NFT data for update
      const nftData = {
        name: values.name,
        description: values.description,
        imageUrl: values.imageUrl,
        price: values.price,
        author: values.author,
        category: values.category,
        status: values.status,
      };

      // Update NFT
      await NFTService.updateNFT(id, nftData);
      message.success('NFT更新成功');
      navigate('/nfts');
    } catch (error) {
      console.error('Error updating NFT:', error);
      message.error('更新NFT失败: ' + (error.response?.data?.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  // Handle edition status update
  const handleEditionUpdate = async (nftId, subId, status, price) => {
    try {
      await NFTService.updateNFTEdition(nftId, subId, { status, price });
      message.success('NFT版本状态更新成功');
      
      // Refresh NFT data
      const nftResponse = await NFTService.getNFT(id);
      setNft(nftResponse.data);
    } catch (error) {
      message.error('更新NFT版本状态失败: ' + (error.response?.data?.message || '未知错误'));
    }
  };

  // Handle publishing selected editions to the market
  const handlePublishToMarket = async () => {
    if (selectedEditions.length === 0) {
      return message.warning('请选择要发布的NFT版本');
    }

    setPublishLoading(true);
    try {
      // Use the publishNFT endpoint to publish selected editions
      await NFTService.publishNFT(id, {
        editionIds: selectedEditions
      });
      
      message.success('NFT已成功发布到市场');
      
      // Refresh NFT data
      const nftResponse = await NFTService.getNFT(id);
      setNft(nftResponse.data);
      
      // Clear selection
      setSelectedEditions([]);
    } catch (error) {
      console.error('Error publishing NFT:', error);
      message.error('发布NFT失败: ' + (error.response?.data?.message || '未知错误'));
    } finally {
      setPublishLoading(false);
    }
  };

  // Configuration for image upload
  const uploadProps = {
    name: 'file',
    action: `${api.defaults.baseURL}/upload`,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 上传成功`);
        // Set image URL in form
        form.setFieldsValue({
          imageUrl: info.file.response.url
        });
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 上传失败`);
      }
    },
  };

  // Handle table selection change
  const rowSelection = {
    selectedRowKeys: selectedEditions,
    onChange: (selectedRowKeys) => {
      setSelectedEditions(selectedRowKeys);
    },
    getCheckboxProps: (record) => ({
      // Disable editions that are not eligible for publishing (already for sale or sold)
      disabled: record.status === 2 || record.status === 4 || record.status === 5,
    }),
  };

  // Columns for editions table
  const editionsColumns = [
    {
      title: '编号',
      dataIndex: 'sub_id',
      key: 'sub_id',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: '状态',
      key: 'status',
      render: (_, record) => {
        const statusColors = {
          1: 'default',  // 未寄售
          2: 'green',    // 寄售中
          3: 'orange',   // 锁定中
          4: 'red',      // 已售出
          5: 'blue',     // 已发布
          6: 'purple',   // 空投
          7: 'cyan',     // 合成
        };
        return <Tag color={statusColors[record.status]}>{record.statusStr}</Tag>;
      },
    },
    {
      title: '拥有者',
      key: 'owner',
      render: (_, record) => (
        <span>{record.owner?.name || '未知'}</span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          {record.status !== 2 && record.status !== 4 && record.status !== 5 && (
            <Button 
              type="primary" 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => handleEditionUpdate(id, record.sub_id, 2, record.price)}
            >
              寄售
            </Button>
          )}
          {record.status === 2 && (
            <Button 
              danger 
              size="small"
              onClick={() => handleEditionUpdate(id, record.sub_id, 1, record.price)}
            >
              取消寄售
            </Button>
          )}
        </Space>
      ),
    },
  ];

  if (fetchingData) {
    return <Spin size="large" />;
  }

  return (
    <div>
      <div className="page-header">
        <h2>编辑NFT: {nft?.name}</h2>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/nfts')}
        >
          返回列表
        </Button>
      </div>

    
      <Card className="form-container" title="基本信息" style={{ marginBottom: 24 }}>
        <Form
          form={form}
          name="nftEdit"
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="name"
            label="NFT名称"
            rules={[{ required: true, message: '请输入NFT名称' }]}
          >
            <Input placeholder="输入NFT名称" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea rows={4} placeholder="输入NFT描述" />
          </Form.Item>
          
          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="选择分类">
              {categories.map(category => (
                <Option key={category._id} value={category._id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="imageUrl"
            label="图片URL"
            rules={[{ required: true, message: '请上传NFT图片或提供URL' }]}
          >
            <Input placeholder="输入图片URL或上传图片" />
          </Form.Item>
          
          <Form.Item label="图片预览">
            {nft?.imageUrl && (
              <img 
                src={nft.imageUrl} 
                alt="NFT" 
                style={{ maxWidth: '100%', maxHeight: '200px', marginBottom: '10px' }} 
              />
            )}
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>更换图片</Button>
            </Upload>
          </Form.Item>
          
          <Form.Item
            name="price"
            label="基础价格"
            rules={[{ required: true, message: '请输入价格' }]}
          >
            <Input placeholder="输入NFT价格" />
          </Form.Item>
          
          <Form.Item
            name="author"
            label="作者"
            rules={[{ required: true, message: '请输入作者' }]}
          >
            <Input placeholder="输入作者名称" />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
            initialValue={1}
          >
            <Select placeholder="选择NFT状态">
              <Option value={1}>未发布</Option>
              <Option value={2}>已发布</Option>
              <Option value={3}>已售罄</Option>
              <Option value={4}>已下架</Option>
              <Option value={5}>限时发售</Option>
              <Option value={6}>预售</Option>
              <Option value={7}>热卖中</Option>
              <Option value={7}>即将售罄</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存更改
            </Button>
          </Form.Item>
        </Form>
      </Card>
      <Card title="NFT版本管理" className="card-container" 
        extra={
          <Button 
            type="primary" 
            icon={<ShoppingOutlined />} 
            onClick={handlePublishToMarket}
            loading={publishLoading}
            disabled={selectedEditions.length === 0}
          >
            发布选中NFT到市场({selectedEditions.length})
          </Button>
        }
      >
        <Table
          rowSelection={rowSelection}
          columns={editionsColumns}
          dataSource={nft?.editions || []}
          rowKey="sub_id"
          pagination={false}
        />
      </Card>

    </div>
  );
};

export default NFTEdit; 