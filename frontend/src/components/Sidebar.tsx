import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  PiPresentationChartBold,
  PiChartLineUpBold,
  PiBuildingsBold,
  PiUsersBold,
  PiListBold,
  PiXBold,
  PiWarehouseBold,
  PiPackageBold,
  PiSignOutBold,
  PiShoppingCartBold,
  PiTruckBold,
  PiFileTextBold,
  PiTagBold
} from "react-icons/pi";
import {
  ScrollArea,
  Button,
  AppShell,
  Tooltip,
  UnstyledButton,
  Text,
  Group,
  Avatar,
  Divider
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import classes from '../style/Sidebar.module.css';
import { AppDispatch, RootState } from '../redux/store';
import { logoutAsync } from '../redux/authSlice';
import { ROLES } from '../utils/Roles';

interface MenuItem {
  label: string;
  icon: React.ComponentType<any>;
  link: string;
  roles: string[];
}

const menuData: MenuItem[] = [
  { 
    label: 'Dashboard', 
    icon: PiPresentationChartBold,
    link: '/admin',
    roles: [ROLES.SUPER_ADMIN, ROLES.BUYER, ROLES.SUPPLIER]
  },
  {
    label: 'Users',
    icon: PiUsersBold,
    link: '/admin/users',
    roles: [ROLES.SUPER_ADMIN],
  },
  {
    label: 'Products',
    icon: PiShoppingCartBold,
    link: '/admin/products',
    roles: [ROLES.SUPER_ADMIN, ROLES.SUPPLIER],
  },
  {
    label: 'Companies',
    icon: PiBuildingsBold,
    link: '/admin/companies',
    roles: [ROLES.SUPER_ADMIN, ROLES.BUYER, ROLES.SUPPLIER],
  },
  {
    label: 'Warehouses',
    icon: PiWarehouseBold,
    link: '/admin/warehouses',
    roles: [ROLES.SUPER_ADMIN, ROLES.SUPPLIER],
  },
  {
    label: 'Warehouse Products',
    icon: PiTagBold,
    link: '/admin/warehouse/products',
    roles: [ROLES.SUPER_ADMIN, ROLES.SUPPLIER],
  },
  {
    label: 'Orders',
    icon: PiPackageBold,
    link: '/admin/orders',
    roles: [ROLES.SUPER_ADMIN, ROLES.BUYER, ROLES.SUPPLIER],
  },
  {
    label: 'Track Shipments',
    icon: PiTruckBold,
    link: '/admin/shipments/track',
    roles: [ROLES.SUPER_ADMIN, ROLES.BUYER, ROLES.SUPPLIER],
  },
  { 
    label: 'Demand Forecasting', 
    icon: PiChartLineUpBold,
    link: '/admin/predictions',
    roles: [ROLES.SUPER_ADMIN]
  },
  // {
  //   label: 'Messages',
  //   icon: PiChatsBold,
  //   link: '/admin/messages',
  //   roles: [ROLES.SUPER_ADMIN, ROLES.BUYER, ROLES.SUPPLIER],
  // },
  // {
  //   label: 'Notifications',
  //   icon: PiBellBold,
  //   link: '/admin/notifications',
  //   roles: [ROLES.SUPER_ADMIN, ROLES.BUYER, ROLES.SUPPLIER],
  // },
  {
    label: 'Reports',
    icon: PiFileTextBold,
    link: '/admin/receipts',
    roles: [ROLES.SUPER_ADMIN, ROLES.BUYER, ROLES.SUPPLIER],
  },
  // {
  //   label: 'Settings',
  //   icon: PiGearBold,
  //   link: '/admin/settings',
  //   roles: [ROLES.SUPER_ADMIN, ROLES.BUYER, ROLES.SUPPLIER],
  // },
];

export function Sidebar({ children }: { children: React.ReactNode }) {
  const [navOpened, { toggle: toggleNav }] = useDisclosure(true);
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const user = useSelector((state: RootState) => state.auth.user);
  const userRole = user?.role;

  const hasAccess = (allowedRoles: string[]) => {
    return userRole && allowedRoles.includes(userRole);
  };

  const filteredMenuData = menuData.filter(item => hasAccess(item.roles));

  const handleSignOut = async () => {
    try {
      await dispatch(logoutAsync()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Logout failed. Please try again.');
    }
  };

  return (
    <AppShell
      padding="md"
      navbar={{
        width: 280,
        breakpoint: 'sm',
        collapsed: { mobile: !navOpened, desktop: !navOpened }
      }}
    >
      {navOpened && (
        <AppShell.Navbar className={classes.navbar}>
          {/* Header Section */}
          <div className={classes.header}>
            <Group justify="space-between" p="md">
              <Link to='/admin' className={classes.logoLink}>
                <Text size="lg" fw={700} c="green">Stockly</Text>
                <Text size="xs" c="dimmed">Admin Panel</Text>
              </Link>
              <Tooltip label="Close sidebar" position="bottom">
                <Button
                  variant="subtle"
                  size="xs"
                  onClick={toggleNav}
                  className={classes.closeButton}
                >
                  <PiXBold size={16} />
                </Button>
              </Tooltip>
            </Group>
            <Divider />
          </div>

          

          {/* Navigation Menu */}
          <ScrollArea className={classes.menuContainer} flex={1}>
            <div className={classes.menuList}>
              {filteredMenuData.map((item) => {
                const isCurrentPage = location.pathname === item.link;
                return (
                  <UnstyledButton
                    key={item.label}
                    component={Link}
                    to={item.link}
                    className={`${classes.menuItem} ${isCurrentPage ? classes.active : ''}`}
                  >
                    <Group gap="md">
                      <item.icon size={22} />
                      <Text size="md" fw={500}>{item.label}</Text>
                    </Group>
                  </UnstyledButton>
                );
              })}
            </div>
          </ScrollArea>

          {/* User Info Section */}
          <div className={classes.userSection}>
            <Group p="md" gap="sm">
              <Avatar size="md" radius="xl" color="green">
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
              <div style={{ flex: 1 }}>
                <Text size="sm" fw={500}>{user?.username}</Text>
                <Text size="xs" c="dimmed">{user?.role}</Text>
              </div>
            </Group>
            <Divider />
          </div>
          {/* Footer Section */}
          <div className={classes.footer}>
            <Divider />
            <UnstyledButton
              className={classes.signOutButton}
              onClick={handleSignOut}
            >
              <Group gap="md" p="md">
                <PiSignOutBold size={22} />
                <Text size="md" fw={500}>Sign Out</Text>
              </Group>
            </UnstyledButton>
          </div>
        </AppShell.Navbar>
      )}

      <AppShell.Main>
        {/* Toggle Button - Only show when sidebar is closed */}
        {!navOpened && (
          <Tooltip label="Open sidebar" position="right" withArrow>
            <Button
              variant="light"
              size="sm"
              onClick={toggleNav}
              className={classes.toggleButton}
              style={{
                position: 'fixed',
                top: '20px',
                left: '20px',
                zIndex: 100
              }}
            >
              <PiListBold size={18} />
            </Button>
          </Tooltip>
        )}
        
        {/* Main Content */}
        <div className={classes.mainContent}>
          {children}
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
