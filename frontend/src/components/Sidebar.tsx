import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  PiReceiptBold,
  PiGearBold,
  PiChatsBold,
  PiUsersBold,
  PiListBold,
  PiXBold,
  PiFactoryBold,
  PiWarehouseBold,
  PiPackageBold,
  PiChartLineBold
} from "react-icons/pi";
import {
  ScrollArea,
  Button,
  AppShell,
  Tooltip
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { LinksGroup } from './/NavbarLinksGroup';
import { UserButton } from './UserButton';
import classes from '../style/Sidebar.module.css';
import { AppDispatch, RootState } from '../redux/store';
import { logoutAsync } from '../redux/authSlice';
import { ROLES } from '../utils/Roles';

const mockdata = [
  { 
    label: 'Dashboard', 
    icon: PiChartLineBold,
    link: '/admin',
    roles: [ROLES.SUPER_ADMIN, ROLES.BUYER, ROLES.SUPPLIER]
  },
  {
    label: 'User Management',
    icon: PiUsersBold,
    roles: [ROLES.SUPER_ADMIN],
    links: [
      { label: 'All Users', link: '/admin/users', roles: [ROLES.SUPER_ADMIN] },
    ],
  },
  {
    label: 'Inventory & Products',
    icon: PiWarehouseBold,
    roles: [ROLES.SUPER_ADMIN, ROLES.SUPPLIER],
    initiallyOpened: true,
    links: [
      { label: 'Products', link: '/admin/products', roles: [ROLES.SUPER_ADMIN, ROLES.SUPPLIER] },
      { label: 'Warehouses', link: '/admin/warehouses', roles: [ROLES.SUPER_ADMIN, ROLES.SUPPLIER] },
      { label: 'Warehouse Products', link: '/admin/warehouse/products', roles: [ROLES.SUPER_ADMIN, ROLES.SUPPLIER] },
    ],
  },
  {
    label: 'Companies',
    icon: PiFactoryBold,
    roles: [ROLES.SUPER_ADMIN, ROLES.BUYER, ROLES.SUPPLIER],
    links: [
      { label: 'All Companies', link: '/admin/companies', roles: [ROLES.SUPER_ADMIN, ROLES.BUYER, ROLES.SUPPLIER] },
    ],
  },
  {
    label: 'Orders & Shipping',
    icon: PiPackageBold,
    roles: [ROLES.SUPER_ADMIN, ROLES.BUYER, ROLES.SUPPLIER],
    links: [
      { label: 'Orders', link: '/admin/orders', roles: [ROLES.SUPER_ADMIN, ROLES.BUYER, ROLES.SUPPLIER] },
      { label: 'Shipments', link: '/admin/shipments/track', roles: [ROLES.SUPER_ADMIN, ROLES.BUYER, ROLES.SUPPLIER] },
      { label: 'Receipts', link: '', roles: [ROLES.SUPER_ADMIN, ROLES.BUYER] },
    ],
  },
  { 
    label: 'Analytics & Reports', 
    icon: PiReceiptBold,
    link: '/admin/predictions',
    roles: [ROLES.SUPER_ADMIN]
  },
  {
    label: 'Communication',
    icon: PiChatsBold,
    roles: [ROLES.SUPER_ADMIN, ROLES.BUYER, ROLES.SUPPLIER],
    links: [
      { label: 'Messages', link: '', roles: [ROLES.SUPER_ADMIN, ROLES.BUYER, ROLES.SUPPLIER] },
      { label: 'Reviews', link: '', roles: [ROLES.SUPER_ADMIN, ROLES.BUYER, ROLES.SUPPLIER] },
      { label: 'Notifications', link: '', roles: [ROLES.SUPER_ADMIN, ROLES.BUYER, ROLES.SUPPLIER] },
    ],
  },
  {
    label: 'System & Settings',
    icon: PiGearBold,
    roles: [ROLES.SUPER_ADMIN, ROLES.BUYER, ROLES.SUPPLIER],
    links: [
      { label: 'General Settings', link: '', roles: [ROLES.SUPER_ADMIN, ROLES.BUYER, ROLES.SUPPLIER] },
      { label: 'Security', link: '', roles: [ROLES.SUPER_ADMIN, ROLES.BUYER, ROLES.SUPPLIER] },
      { label: 'SSH Keys', link: '', roles: [ROLES.SUPER_ADMIN] },
      { label: 'Databases', link: '', roles: [ROLES.SUPER_ADMIN] },
      { label: 'Files', link: '', roles: [ROLES.SUPER_ADMIN, ROLES.BUYER, ROLES.SUPPLIER] },
    ],
  },
];

export function Sidebar({ children }: { children: React.ReactNode }) {
  const [navOpened, { toggle: toggleNav }] = useDisclosure(true);
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  
  const user = useSelector((state: RootState) => state.auth.user);
  const userRole = user?.role;

  const hasAccess = (allowedRoles: string[]) => {
    return userRole && allowedRoles.includes(userRole);
  };

  const filterItemsByRole = (items: any[]) => {
    return items
      .filter(item => hasAccess(item.roles))
      .map(item => ({
        ...item,
        links: item.links ? item.links.filter((link: any) => hasAccess(link.roles)) : undefined
      }))
      .filter(item => !item.links || item.links.length > 0);
  };

  const filteredData = filterItemsByRole(mockdata);
  const links = filteredData.map((item) => <LinksGroup {...item} key={item.label} />);

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
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !navOpened, desktop: !navOpened }
      }}
    >
      {navOpened && (
        <AppShell.Navbar className={classes.navbar}>
          {/* Header Section with Toggle Button */}
          <div className={classes.header}>
            <div className={classes.headerContent}>
              <Link to='/admin' className={classes.logoLink}>
                administrator@stockly.dev
              </Link>
              <Tooltip label="Close sidebar" position="bottom">
                <Button
                  variant="subtle"
                  size="xs"
                  onClick={toggleNav}
                  className={classes.headerToggle}
                >
                  <PiXBold size={16} />
                </Button>
              </Tooltip>
            </div>
          </div>

          {/* Navigation Links */}
          <ScrollArea className={classes.links}>
            <div className={classes.linksInner}>
              {links}
            </div>
          </ScrollArea>

          {/* Footer Section */}
          <div className={classes.footer}>
            <UserButton 
              name={user?.username}
              email={user?.email}
              onClick={handleSignOut}
            />
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
            >
              <PiListBold size={18} />
            </Button>
          </Tooltip>
        )}
        
        {/* Main Content */}
        <div className={classes.mainContent} data-nav-opened={navOpened}>
          {children}
        </div>
      </AppShell.Main>
    </AppShell>
  );
}

