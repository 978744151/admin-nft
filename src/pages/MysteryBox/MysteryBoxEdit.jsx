import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, InputNumber, Upload, Card, Select, Space, Divider, Typography, Table, Tag } from 'antd';
import { UploadOutlined, ArrowLeftOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import MysteryBoxService from '../../services/mysteryBox.service.js';
import api from '../../services/api.js';

const { Option } = Select;
const { Title } = Typography;

const MysteryBoxEdit = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [nfts, setNfts] = useState([]);
  const [loadingNfts, setLoadingNfts] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  // 加载NFT列表
  useEffect(() => {
    const fetchNfts = async () => {
      setLoadingNfts(true);
      try {
        const response = await MysteryBoxService.getNFTs();
        setNfts(response.data || []);
      } catch (error) {
        console.error('Error fetching NFTs:', error);
        message.error('获取NFT列表失败');
      } finally {
        setLoadingNfts(false);
      }
    };

    fetchNfts();
  }, []);

  // 获取盲盒详情
  useEffect(() => {
    const fetchMysteryBox = async () => {
      try {
        const response = await MysteryBoxService.getMysteryBox(id);
        const mysteryBox = response.data;
        
        // 设置表单初始值
        form.setFieldsValue({
          ...response.data,
          name: mysteryBox.name,
          description: mysteryBox.description,
          imageUrl: mysteryBox.imageUrl,
          price: mysteryBox.price,
          totalQuantity: mysteryBox.totalQuantity,
          soldQuantity: mysteryBox.soldQuantity,
          openLimit: mysteryBox.openLimit || 0,
          openedCount: mysteryBox.openedCount || 0,
          status: mysteryBox.status,
          items: mysteryBox.items || []
        });
      } catch (error) {
        console.error('Error fetching mystery box:', error);
        message.error('获取盲盒详情失败');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchMysteryBox();
  }, [id, form]);

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
          quantity: item.quantity,
          remainingQuantity: item.remainingQuantity !== undefined ? item.remainingQuantity : item.quantity
        })) || []
      };

      // 提交到API
      await MysteryBoxService.updateMysteryBox(id, mysteryBoxData);
      message.success('盲盒更新成功');
      navigate('/mystery-boxes');
    } catch (error) {
      console.error('Error updating mystery box:', error);
      message.error('更新盲盒失败: ' + (error.response?.data?.message || '未知错误'));
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

  // 处理盲盒实例状态变更
  const handleEditionStatusChange = async (editionId, newStatus) => {
    setLoading(true);
    try {
      const mysteryBox = form.getFieldValue('editions');
      const editionIndex = mysteryBox.findIndex(edition => edition.sub_id === editionId);
      
      if (editionIndex === -1) {
        throw new Error('找不到对应的盲盒实例');
      }
      
      // 更新本地状态
      mysteryBox[editionIndex].status = newStatus;
      
      // 根据状态设置状态描述
      const statusMap = {
        1: '未寄售',
        2: '寄售中',
        3: '锁定中',
        4: '已售出',
        5: '已发布',
        6: '空投',
        7: '合成',
      };
      
      mysteryBox[editionIndex].statusStr = statusMap[newStatus] || '未知状态';
      
      // 提交到API
      await MysteryBoxService.updateMysteryBoxEdition(id, editionId, { status: newStatus });
      
      // 更新表单数据
      form.setFieldsValue({ editions: mysteryBox });
      
      message.success('盲盒实例状态更新成功');
    } catch (error) {
      console.error('Error updating edition status:', error);
      message.error('更新盲盒实例状态失败: ' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  // 更新盲盒实例表格定义
  const editionsColumns = [
    {
      title: '编号',
      dataIndex: 'sub_id',
      key: 'sub_id',
    },
    {
      title: '状态',
      key: 'status',
      render: (_, record) => {
        const statusMap = {
          1: { color: 'green', text: '未寄售' },
          2: { color: 'blue', text: '寄售中' },
          3: { color: 'orange', text: '锁定中' },
          4: { color: 'red', text: '已售出' },
          5: { color: 'cyan', text: '已发布' },
          6: { color: 'purple', text: '空投' },
          7: { color: 'magenta', text: '合成' }
        };
        const { color, text } = statusMap[record.status] || { color: 'default', text: '未知状态' };
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '拥有者',
      key: 'owner',
      ellipsis: true,
      render: (_, record) => <span>{record.owner}</span>,
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Select
          value={record.status}
          style={{ width: 120 }}
          onChange={(value) => handleEditionStatusChange(record.sub_id, value)}
        >
          <Option value={1}>未寄售</Option>
          <Option value={2}>寄售中</Option>
          <Option value={3}>锁定中</Option>
          <Option value={4}>已售出</Option>
          <Option value={5}>已发布</Option>
          <Option value={6}>空投</Option>
          <Option value={7}>合成</Option>
        </Select>
      ),
    },
  ];

  if (initialLoading) {
    return <div>加载中...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>编辑盲盒</h2>
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
          name="mysteryBoxEdit"
          layout="vertical"
          onFinish={onFinish}
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
            name="soldQuantity"
            label="已售数量"
          >
            <InputNumber disabled style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="openLimit"
            label="开启次数限制(0表示无限制)"
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="输入开启次数限制" />
          </Form.Item>

          <Form.Item
            name="openedCount"
            label="已开启次数"
          >
            <InputNumber disabled style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="选择盲盒状态">
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
                          {nfts.length > 0 && nfts.map(nft => (
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
                        label="总数量"
                        rules={[{ required: true, message: '请输入数量' }]}
                      >
                        <InputNumber min={1} placeholder="总数量" />
                      </Form.Item>
                    </Space>

                    <Space direction="vertical" style={{ display: 'flex', marginRight: 8 }}>
                      <Form.Item
                        {...restField}
                        name={[name, 'remainingQuantity']}
                        label="剩余数量"
                      >
                        <InputNumber min={0} placeholder="剩余数量" />
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
          
          <Divider />
          <Title level={4}>盲盒实例信息</Title>
          <Table
            columns={editionsColumns}
            rowKey="sub_id"
            dataSource={form.getFieldValue('editions') || []}
            pagination={{ pageSize: 10 }}
          />
          
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              更新盲盒
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default MysteryBoxEdit;