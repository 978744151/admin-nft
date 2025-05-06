import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, message, Tag, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import MysteryBoxService from '../../services/mysteryBox.service.js';

const { confirm } = Modal;

const MysteryBoxList = () => {
  const [loading, setLoading] = useState(false);
  const [mysteryBoxes, setMysteryBoxes] = useState([]);
  const navigate = useNavigate();

  // 获取所有盲盒
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await MysteryBoxService.getMysteryBoxes();
        setMysteryBoxes(response.data || []);
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
        } catch (error) {
          message.error('删除失败: ' + (error.response?.data?.message || '未知错误'));
        }
      },
    });
  };

  // 渲染状态标签
  const renderStatusTag = (status) => {
    const statusMap = {
      1: { color: 'orange', text: '未发布' },
      2: { color: 'green', text: '已发布' },
      3: { color: 'red', text: '已售罄' },
      4: { color: 'gray', text: '已下架' }
    };

    const { color, text } = statusMap[status] || { color: 'default', text: '未知状态' };
    return <Tag color={color}>{text}</Tag>;
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
      width: '200px',
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
      
      <Card>
        <Table 
          columns={columns} 
          dataSource={mysteryBoxes} 
          rowKey="_id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default MysteryBoxList;