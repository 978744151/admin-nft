import React, { useState } from 'react';
import { Layout, Menu, Button, theme, Dropdown } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  ShopOutlined,
  CommentOutlined,
  UserOutlined,
  LogoutOutlined,
  GiftOutlined,
} from '@ant-design/icons';
import AuthService from '../services/auth.service.js';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const currentUser = AuthService.getCurrentUser();

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'logout',
      label: (
        <div onClick={handleLogout}>
          <LogoutOutlined /> 退出登录
        </div>
      ),
    },
  ];

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '仪表盘',
      onClick: () => navigate('/'),
    },
    {
      key: '/nfts',
      icon: <ShopOutlined />,
      label: 'NFT管理',
      onClick: () => navigate('/nfts'),
    },
    {
      key: '/mystery-boxes',
      icon: <GiftOutlined />,
      label: '盲盒管理',
      onClick: () => navigate('/mystery-boxes'),
    },
    {
      key: '/comments',
      icon: <CommentOutlined />,
      label: '评论管理',
      onClick: () => navigate('/comments'),
    },
  ];

  // Determine which menu item is selected based on current path
  const selectedKey = menuItems.find(item => 
    location.pathname === item.key || 
    location.pathname.startsWith(item.key + '/')
  )?.key || '/';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo">
          <span>MS Admin</span>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '16px' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 64, height: 64 }}
            />
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <Button type="text" icon={<UserOutlined />}>
                {currentUser?.name || '管理员'}
              </Button>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;