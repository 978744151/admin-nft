import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, message, Tag, Card, Select, Form, Input, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, FilterOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import MysteryBoxService from '../../services/mysteryBox.service.js';

const { confirm } = Modal;
const { Option } = Select;

const MysteryBoxList = () => {
  const [loading, setLoading] = useState(false);
  const [mysteryBoxes, setMysteryBoxes] = useState([]);
  const [filteredBoxes, setFilteredBoxes] = useState([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // 获取所有盲盒
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await MysteryBoxService.getMysteryBoxes();
        setMysteryBoxes(response.data || []);
        setFilteredBoxes(response.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('获取盲盒数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 处理删除盲盒
  const handleDelete = (id) => {
    confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除这个盲盒吗？此操作无法撤销。',
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await MysteryBoxService.deleteMysteryBox(id);
          message.success('盲盒删除成功');
          // 刷新列表
          const response = await MysteryBoxService.getMysteryBoxes();
          setMysteryBoxes(response.data || []);
          setFilteredBoxes(response.data || []);
        } catch (error) {
          message.error('删除失败: ' + (error.response?.data?.message || '未知错误'));
        }
      },
    });
  };

  // 处理筛选
  const handleFilter = (values) => {
    let filtered = [...mysteryBoxes];
    
    // 按名称筛选
    if (values.name) {
      filtered = filtered.filter(box => 
        box.name.toLowerCase().includes(values.name.toLowerCase())
      );
    }
    
    // 按状态筛选
    if (values.status) {
      filtered = filtered.filter(box => box.status === parseInt(values.status));
    }
    
    // 按价格范围筛选
    if (values.minPrice) {
      filtered = filtered.filter(box => parseFloat(box.price) >= parseFloat(values.minPrice));
    }
    
    if (values.maxPrice) {
      filtered = filtered.filter(box => parseFloat(box.price) <= parseFloat(values.maxPrice));
    }
    
    setFilteredBoxes(filtered);
  };

  // 重置筛选
  const resetFilters = () => {
    form.resetFields();
    setFilteredBoxes(mysteryBoxes);
  };

  // 渲染状态标签
  const renderStatusTag = (status) => {
    const statusMap = {
      1: { color: 'orange', text: '未发布' },
      2: { color: 'green', text: '已发布' },
      3: { color: 'red', text: '已售罄' },
      4: { color: 'gray', text: '已下架' },
      5: { color: 'cyan', text: '限时发售' },
      6: { color: 'purple', text: '预售' },
      7: { color: 'blue', text: '热卖中' },
      8: { color: 'magenta', text: '即将售罄' }
    };

    const { color, text } = statusMap[status] || { color: 'default', text: '未知状态' };
    return <Tag color={color}>{text}</Tag>;
  };

  // 变更状态
  const handleChangeStatus = async (id, newStatus) => {
    try {
      await MysteryBoxService.updateMysteryBoxStatus(id, newStatus);
      message.success('状态更新成功');
      // 刷新列表
      const response = await MysteryBoxService.getMysteryBoxes();
      setMysteryBoxes(response.data || []);
      setFilteredBoxes(response.data || []);
    } catch (error) {
      message.error('更新状态失败: ' + (error.response?.data?.message || '未知错误'));
    }
  };

  // 表格列定义
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
          alt="盲盒" 
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
      title: '总数量',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
    },
    {
      title: '实例数量',
      key: 'editionsCount',
      render: (_, record) => {
        return <span>{record.editions?.length || 0} / {record.totalQuantity || 0}</span>;
      },
    },
    {
      title: '已售数量',
      dataIndex: 'soldQuantity',
      key: 'soldQuantity',
    },
    {
      title: '开启次数',
      key: 'openCount',
      render: (_, record) => (
        <span>{record.openedCount || 0} / {record.openLimit > 0 ? record.openLimit : '无限制'}</span>
      ),
    },
    {
      title: '包含NFT',
      key: 'nftCount',
      render: (_, record) => (
        <span>{record.items?.length || 0}种</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: renderStatusTag,
    },
    {
      title: '操作',
      key: 'action',
      width: '280px',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => navigate(`/mystery-boxes/edit/${record._id}`)}
          >
            编辑
          </Button>
          <Select
            defaultValue={record.status}
            style={{ width: 110 }}
            size="small"
            onChange={(value) => handleChangeStatus(record._id, value)}
          >
            <Option value={1}>未发布</Option>
            <Option value={2}>已发布</Option>
            <Option value={3}>已售罄</Option>
            <Option value={4}>已下架</Option>
            <Option value={5}>限时发售</Option>
            <Option value={6}>预售</Option>
            <Option value={7}>热卖中</Option>
            <Option value={8}>即将售罄</Option>
          </Select>
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
        <h2>盲盒管理</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => navigate('/mystery-boxes/create')}
        >
          创建盲盒
        </Button>
      </div>
      
      <Card style={{ marginBottom: 16 }}>
        <Form form={form} layout="horizontal" onFinish={handleFilter}>
          <Row gutter={16}>
            <Col span={5}>
              <Form.Item name="name" label="名称">
                <Input placeholder="输入盲盒名称" />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item name="status" label="状态">
                <Select placeholder="选择状态" allowClear>
                  <Option value="1">未发布</Option>
                  <Option value="2">已发布</Option>
                  <Option value="3">已售罄</Option>
                  <Option value="4">已下架</Option>
                  <Option value="5">限时发售</Option>
                  <Option value="6">预售</Option>
                  <Option value="7">热卖中</Option>
                  <Option value="8">即将售罄</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item name="minPrice" label="最低价格">
                <Input type="number" placeholder="最低价格" />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item name="maxPrice" label="最高价格">
                <Input type="number" placeholder="最高价格" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" icon={<FilterOutlined />}>
                    筛选
                  </Button>
                  <Button onClick={resetFilters} icon={<SearchOutlined />}>
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
      
      <Card>
        <Table 
          columns={columns} 
          dataSource={filteredBoxes} 
          rowKey="_id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default MysteryBoxList;