import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, InputNumber, Upload, Card, Select, Space, Divider, Typography } from 'antd';
import { UploadOutlined, ArrowLeftOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import MysteryBoxService from '../../services/mysteryBox.service.js';
import api from '../../services/api.js';

const { Option } = Select;
const { Title } = Typography;

const MysteryBoxCreate = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [nfts, setNfts] = useState([]);
  const [loadingNfts, setLoadingNfts] = useState(false);
  const navigate = useNavigate();

  // 加载NFT列表
  useEffect(() => {
    const fetchNfts = async () => {
      setLoadingNfts(true);
      try {
        const response = await MysteryBoxService.getNFTs();
        setNfts(response.data.data || []);
      } catch (error) {
        console.error('Error fetching NFTs:', error);
        message.error('获取NFT列表失败');
      } finally {
        setLoadingNfts(false);
      }
    };

    fetchNfts();
  }, []);

  // 处理表单提交
  const onFinish = async (values) => {
    setLoading(true);
    try {
      // 准备盲盒数据
      const mysteryBoxData = {
        name: values.name,
        description: values.description,
        imageUrl: values.imageUrl,
        price: parseFloat(values.price),
        totalQuantity: values.totalQuantity,
        openLimit: values.openLimit || 0,
        status: values.status,
        items: values.items?.map(item => ({
          nft: item.nft,
          weight: item.weight,
          quantity: item.quantity
        })) || []
      };

      // 提交到API
      await MysteryBoxService.createMysteryBox(mysteryBoxData);
      message.success('盲盒创建成功');
      navigate('/mystery-boxes');
    } catch (error) {
      console.error('Error creating mystery box:', error);
      message.error('创建盲盒失败: ' + (error.response?.data?.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  // 图片上传配置
  const uploadProps = {
    name: 'file',
    action: `${api.defaults.baseURL}/upload/image`,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 上传成功`);
        // 设置图片URL到表单
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
        <h2>创建盲盒</h2>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/mystery-boxes')}
        >
          返回列表
        </Button>
      </div>
      
      <Card className="form-container">
        <Form
          form={form}
          name="mysteryBoxCreate"
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            totalQuantity: 1000,
            status: 1,
            openLimit: 0,
            items: [{ weight: 1, quantity: 10 }]
          }}
        >
          <Title level={4}>基本信息</Title>
          <Form.Item
            name="name"
            label="盲盒名称"
            rules={[{ required: true, message: '请输入盲盒名称' }]}
          >
            <Input placeholder="输入盲盒名称" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea rows={4} placeholder="输入盲盒描述" />
          </Form.Item>
          
          <Form.Item
            name="imageUrl"
            label="图片URL"
            rules={[{ required: true, message: '请上传盲盒图片或提供URL' }]}
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
            <InputNumber min={0} style={{ width: '100%' }} placeholder="输入盲盒价格" />
          </Form.Item>
          
          <Form.Item
            name="totalQuantity"
            label="总数量"
            rules={[{ required: true, message: '请输入总数量' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="输入盲盒总数量" />
          </Form.Item>

          <Form.Item
            name="openLimit"
            label="开启次数限制(0表示无限制)"
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="输入开启次数限制" />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="选择盲盒状态">
              <Option value={1}>未发布</Option>
              <Option value={2}>已发布</Option>
              <Option value={4}>已下架</Option>
            </Select>
          </Form.Item>
          
          <Divider />
          <Title level={4}>盲盒内容配置</Title>

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} style={{ display: 'flex', marginBottom: 8, alignItems: 'flex-start' }}>
                    <Space direction="vertical" style={{ display: 'flex', marginRight: 8 }}>
                      <Form.Item
                        {...restField}
                        name={[name, 'nft']}
                        label="选择NFT"
                        rules={[{ required: true, message: '请选择NFT' }]}
                      >
                        <Select 
                          placeholder="选择NFT" 
                          loading={loadingNfts}
                          showSearch
                          optionFilterProp="children"
                          style={{ width: 300 }}
                        >
                          {nfts.map(nft => (
                            <Option key={nft._id} value={nft._id}>
                              {nft.name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Space>

                    <Space direction="vertical" style={{ display: 'flex', marginRight: 8 }}>
                      <Form.Item
                        {...restField}
                        name={[name, 'weight']}
                        label="权重"
                        rules={[{ required: true, message: '请输入权重' }]}
                      >
                        <InputNumber min={1} placeholder="权重" />
                      </Form.Item>
                    </Space>

                    <Space direction="vertical" style={{ display: 'flex', marginRight: 8 }}>
                      <Form.Item
                        {...restField}
                        name={[name, 'quantity']}
                        label="数量"
                        rules={[{ required: true, message: '请输入数量' }]}
                      >
                        <InputNumber min={1} placeholder="数量" />
                      </Form.Item>
                    </Space>

                    <MinusCircleOutlined 
                      onClick={() => remove(name)} 
                      style={{ marginTop: 32 }}
                    />
                  </div>
                ))}
                <Form.Item>
                  <Button 
                    type="dashed" 
                    onClick={() => add()} 
                    block 
                    icon={<PlusOutlined />}
                  >
                    添加NFT
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              创建盲盒
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default MysteryBoxCreate;