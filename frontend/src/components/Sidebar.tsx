import { useState, useEffect } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink, useLocation, Link } from 'react-router-dom';
import {
  PiBellRingingBold,
  PiReceiptBold,
  PiFingerprintBold,
  PiKeyBold,
  PiDatabaseBold,
  PiGearBold,
  PiShoppingCartBold,
  PiTruckBold,
  PiReadCvLogoBold,
  PiChatCenteredTextBold,
  PiChatsBold,
  PiUsersBold,
  PiFileBold,
  PiUserBold,
  PiSignOutBold,
  PiListBold,
  PiXBold,
  PiTeaBagBold,
  PiFactoryBold,
  PiWarehouseBold,
  PiPackageBold
} from "react-icons/pi";
import {
  SegmentedControl,
  Text,
  Button,
  AppShell,
  Tooltip,
  Stack
} from '@mantine/core';
import classes from '../style/Sidebar.module.css';
import { AppDispatch, RootState } from '../redux/store';
import { logoutAsync } from '../redux/authSlice';
import { ROLES } from '../utils/Roles';

const tabs = {
  account: [
    { link: '', label: 'Notifications', icon: PiBellRingingBold, roles: [ROLES.SUPER_ADMIN, ROLES.BUYER, ROLES.SUPPLIER] },
    { link: '/admin/predictions', label: 'Predictions', icon: PiReceiptBold, roles: [ROLES.SUPER_ADMIN] },
    { link: '', label: 'Security', icon: PiFingerprintBold, roles: [ROLES.SUPER_ADMIN, ROLES.BUYER, ROLES.SUPPLIER] },
    { link: '', label: 'SSH Keys', icon: PiKeyBold, roles: [ROLES.SUPER_ADMIN] },
    { link: '', label: 'Databases', icon: PiDatabaseBold, roles: [ROLES.SUPER_ADMIN] },
    { link: '', label: 'Other Settings', icon: PiGearBold, roles: [ROLES.SUPER_ADMIN, ROLES.BUYER, ROLES.SUPPLIER] },
    { link: '/admin/warehouse/products', label: 'Warehouse Products', icon: PiShoppingCartBold, roles: [ROLES.SUPER_ADMIN, ROLES.SUPPLIER] },
  ],
  general: [
    { link: '/admin/users', label: 'Users', icon: PiUsersBold, roles: [ROLES.SUPER_ADMIN] },
    { link: '/admin/products', label: 'Products', icon: PiTeaBagBold, roles: [ROLES.SUPER_ADMIN, ROLES.SUPPLIER] },
    { link: '/admin/companies', label: 'Companies', icon: PiFactoryBold, roles: [ROLES.SUPER_ADMIN, ROLES.BUYER, ROLES.SUPPLIER] },
    { link: '/admin/warehouses', label: 'Warehouses', icon: PiWarehouseBold, roles: [ROLES.SUPER_ADMIN, ROLES.SUPPLIER] },
    { link: '/admin/orders', label: 'Orders', icon: PiPackageBold, roles: [ROLES.SUPER_ADMIN, ROLES.BUYER, ROLES.SUPPLIER] },
    { link: '/admin/shipments/track', label: 'Shipments', icon: PiTruckBold, roles: [ROLES.SUPER_ADMIN, ROLES.BUYER, ROLES.SUPPLIER] },
    { link: '', label: 'Receipts', icon: PiReadCvLogoBold, roles: [ROLES.SUPER_ADMIN, ROLES.BUYER] },
    { link: '', label: 'Reviews', icon: PiChatCenteredTextBold, roles: [ROLES.SUPER_ADMIN, ROLES.BUYER, ROLES.SUPPLIER] },
    { link: '', label: 'Messages', icon: PiChatsBold, roles: [ROLES.SUPER_ADMIN, ROLES.BUYER, ROLES.SUPPLIER] },
    { link: '', label: 'Files', icon: PiFileBold, roles: [ROLES.SUPER_ADMIN, ROLES.BUYER, ROLES.SUPPLIER] },
  ],
};

export function Sidebar({ children }: { children: React.ReactNode }) {
  const [section, setSection] = useState<'account' | 'general'>('general');
  const [navOpened, { toggle: toggleNav }] = useDisclosure(true);
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const user = useSelector((state: RootState) => state.auth.user);
  const userRole = user?.role;

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) {
      setSection('general');
    }
  }, [location.pathname]);

  const hasAccess = (allowedRoles: string[]) => {
    return userRole && allowedRoles.includes(userRole);
  };

  const links = tabs[section]
    .filter(item => hasAccess(item.roles))
    .map((item) => {
      if (!item.link) return null;

      return (
        <NavLink
          className={({ isActive }) =>
            `${classes.link} ${isActive ? classes.linkActive : ''}`
          }
          to={item.link}
          key={item.label}
          end
        >
          <item.icon className={classes.linkIcon} />
          <span>{item.label}</span>
        </NavLink>
      );
    }).filter(Boolean);

  const handleSignOut = async () => {
    try {
      await dispatch(logoutAsync()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Logout failed. Please try again.');
    }
  };

  const userTooltipContent = (
    <Stack gap="xs" style={{ minWidth: '200px' }}>
      <Text size="sm" fw={500}>Account Information</Text>
      <Text size="xs">
        <strong>Username:</strong> {user?.username || 'N/A'}
      </Text>
      <Text size="xs">
        <strong>Email:</strong> {user?.email || 'N/A'}
      </Text>
      <Text size="xs">
        <strong>Role:</strong> {user?.role || 'N/A'}
      </Text>
    </Stack>
  );

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
        <AppShell.Navbar p="xs">
          <AppShell.Section grow>
            <Text fw={500} size="sm" className={classes.title} c="dimmed" mb="xs">
              <Link to='/admin' style={{textDecoration: 'none', color: 'green', fontWeight: 'bold'}} >
                administrator@stockly.dev
              </Link>
            </Text>

            <SegmentedControl
              value={section}
              onChange={(value: any) => setSection(value)}
              transitionTimingFunction="ease"
              fullWidth
              data={[
                { label: 'Account', value: 'account' },
                { label: 'System', value: 'general' },
              ]}
            />

            <div className={classes.navbarMain}>{links}</div>
          </AppShell.Section>

          <AppShell.Section>
            <div className={classes.footer}>
              <Tooltip 
                label={userTooltipContent}
                position="top"
                withArrow
                multiline
                w={220}
              >
                <a 
                  href="#" 
                  className={classes.link} 
                  onClick={(event) => event.preventDefault()}
                >
                  <PiUserBold className={classes.linkIcon} />
                  <span>Your account</span>
                </a>
              </Tooltip>

              <a
                href="#"
                className={classes.link}
                onClick={(e) => {
                  e.preventDefault();
                  handleSignOut();
                }}
              >
                <PiSignOutBold className={classes.linkIcon} />
                <span>Logout</span>
              </a>
            </div>
          </AppShell.Section>
        </AppShell.Navbar>
      )}

      <AppShell.Main>
        <Tooltip 
          label={navOpened ? "Close sidebar" : "Open sidebar"} 
          position="right"
          withArrow
        >
          <Button
            variant="light"
            size="sm"
            onClick={toggleNav}
            style={{
              position: 'fixed',
              top: 20,
              left: navOpened ? 310 : 20,
              zIndex: 1000,
              transition: 'left 0.3s ease',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
            }}
          >
            {navOpened ? <PiXBold size={18} /> : <PiListBold size={18} />}
          </Button>
        </Tooltip>
        <div style={{ paddingTop: navOpened ? '0' : '60px' }}>
          {children}
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
