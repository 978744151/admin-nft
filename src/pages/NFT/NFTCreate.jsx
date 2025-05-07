import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Select, InputNumber, Upload, Card } from 'antd';
import { UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import NFTService from '../../services/nft.service.js';
import api from '../../services/api.js';

const { Option } = Select;

const NFTCreate = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  // Fetch NFT categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/nft-categories');
        setCategories(response.data.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        message.error('获取分类数据失败');
      }
    };

    fetchCategories();
  }, []);

  // Handle form submission
  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Create editions array based on quantity
      const editionsCount = parseInt(values.quantity) || 1;
      const editions = [];
      
      for (let i = 1; i <= editionsCount; i++) {
        const sub_id = String(i).padStart(3, '0');
        editions.push({
          sub_id,
          price: values.price,
          status: values.status || 1, // 使用选择的状态或默认为未寄售
        });
      }

      // Prepare NFT data
      const nftData = {
        name: values.name,
        description: values.description,
        imageUrl: values.imageUrl,
        price: values.price,
        author: values.author,
        quantity: values.quantity,
        category: values.category,
        // editions,
        status: values.status || 1,
        type: values.type || 1,
      };

      // Submit to API
      await NFTService.createNFT(nftData);
      message.success('NFT创建成功');
      navigate('/nfts');
    } catch (error) {
      console.error('Error creating NFT:', error);
      message.error('创建NFT失败: ' + (error.response?.data?.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  // Configuration for image upload
  const uploadProps = {
    name: 'file',
    action: `${api.defaults.baseURL}/upload/image`,
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

  return (
    <div>
      <div className="page-header">
        <h2>创建NFT</h2>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/nfts')}
        >
          返回列表
        </Button>
      </div>
      
      <Card className="form-container">
        <Form
          form={form}
          name="nftCreate"
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            quantity: "1"
          }}
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
          
          <Form.Item label="上传图片">
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>点击上传</Button>
            </Upload>
          </Form.Item>
          
          <Form.Item
            name="price"
            label="价格"
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
            name="quantity"
            label="数量"
            rules={[{ required: true, message: '请输入数量' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="输入NFT数量" />
          </Form.Item>

          {/* <Form.Item
            name="type"
            label="类型"
            rules={[{ required: true, message: '请选择NFT类型' }]}
            initialValue={1}
          >
            <Select placeholder="选择NFT类型">
              <Option value={1}>普通NFT</Option>
              <Option value={2}>盲盒</Option>
            </Select>
          </Form.Item> */}
          
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
              <Option value={8}>即将售罄</Option>
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              创建NFT
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default NFTCreate;