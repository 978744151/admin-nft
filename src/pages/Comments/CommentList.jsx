import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, message, Card, Select, Input, Tag } from 'antd';
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import api from '../../services/api.js';
import CommentService from '../../services/comment.service.js';

const { confirm } = Modal;
const { Option } = Select;
const { Search } = Input;

const CommentList = () => {
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [searchText, setSearchText] = useState('');

  // Fetch blogs and comments
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch blogs
        const blogResponse = await api.get('/blogs');
        setBlogs(blogResponse.data.data || []);
        
        // If a blog is selected, fetch its comments
        if (selectedBlog) {
          const commentResponse = await CommentService.getBlogComments(selectedBlog);
          let commentList = commentResponse.data || [];
          
          // Apply search filter if any
          if (searchText) {
            commentList = commentList.filter(comment => 
              comment.content.toLowerCase().includes(searchText.toLowerCase())
            );
          }
          
          setComments(commentList);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('获取数据失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedBlog, searchText]);

  // Handle blog selection change
  const handleBlogChange = (value) => {
    setSelectedBlog(value);
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchText(value);
  };

  // Handle comment deletion
  const handleDelete = (id) => {
    confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除这条评论吗？此操作无法撤销，并将删除该评论下的所有回复。',
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await CommentService.deleteComment(id);
          message.success('评论删除成功');
          
          // Refresh comments
          if (selectedBlog) {
            const response = await CommentService.getBlogComments(selectedBlog);
            setComments(response.data || []);
          }
        } catch (error) {
          message.error('删除失败: ' + (error.response?.data?.message || '未知错误'));
        }
      },
    });
  };

  // Table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: '_id',
      key: '_id',
      ellipsis: true,
      width: '100px',
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      render: (text) => <div style={{ maxWidth: '400px', wordWrap: 'break-word' }}>{text}</div>,
    },
    {
      title: '用户',
      key: 'user',
      render: (_, record) => (
        <span>{record.user?.name || record.fromUserName || '未知用户'}</span>
      ),
    },
    {
      title: '回复给',
      key: 'replyTo',
      render: (_, record) => (
        record.replyTo ? (
          <span>{record.toUserName || '用户'}</span>
        ) : (
          <Tag color="green">主评论</Tag>
        )
      ),
    },
    {
      title: '点赞数',
      dataIndex: 'likeCount',
      key: 'likeCount',
      sorter: (a, b) => (a.likeCount || 0) - (b.likeCount || 0),
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString(),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: '操作',
      key: 'action',
      width: '100px',
      render: (_, record) => (
        <Button 
          danger 
          icon={<DeleteOutlined />} 
          size="small"
          onClick={() => handleDelete(record._id)}
        >
          删除
        </Button>
      ),
    },
  ];

  // Columns for replies
  const replyColumns = [
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      render: (text) => <div style={{ maxWidth: '300px', wordWrap: 'break-word' }}>{text}</div>,
    },
    {
      title: '用户',
      key: 'user',
      render: (_, record) => (
        <span>{record.user?.name || record.fromUserName || '未知用户'}</span>
      ),
    },
    {
      title: '回复给',
      key: 'replyTo',
      render: (_, record) => (
        <span>{record.toUserName || '用户'}</span>
      ),
    },
    {
      title: '点赞数',
      dataIndex: 'likeCount',
      key: 'likeCount',
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: '100px',
      render: (_, record) => (
        <Button 
          danger 
          icon={<DeleteOutlined />} 
          size="small"
          onClick={() => handleDelete(record._id)}
        >
          删除
        </Button>
      ),
    },
  ];

  // Expandable row for replies
  const expandedRowRender = (record) => {
    const replies = record.replies || [];
    return (
      <Card title="回复列表" size="small" bordered={false}>
        <Table
          columns={replyColumns}
          dataSource={replies}
          rowKey="_id"
          pagination={false}
          size="small"
        />
      </Card>
    );
  };

  return (
    <div>
      <div className="page-header">
        <h2>评论管理</h2>
      </div>
      
      <Card className="card-container">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <span>选择博客:</span>
              <Select
                style={{ width: 300, marginLeft: 8 }}
                placeholder="选择要查看评论的博客"
                allowClear
                onChange={handleBlogChange}
                value={selectedBlog}
              >
                {blogs.map(blog => (
                  <Option key={blog._id} value={blog._id}>
                    {blog.title}
                  </Option>
                ))}
              </Select>
            </div>
            <div style={{ flex: 1 }}>
              <Search
                placeholder="搜索评论内容"
                onSearch={handleSearch}
                style={{ width: 300 }}
                allowClear
              />
            </div>
          </div>
          
          {selectedBlog ? (
            <Table
              columns={columns}
              dataSource={comments}
              rowKey="_id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              expandable={{
                expandedRowRender,
                rowExpandable: record => (record.replies && record.replies.length > 0),
              }}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              请选择一个博客来查看评论
            </div>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default CommentList; 