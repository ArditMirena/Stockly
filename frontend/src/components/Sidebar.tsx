import { useState, useEffect } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { useDispatch } from 'react-redux';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import { 
  PiBellRingingBold,
  PiReceiptBold,
  PiFingerprintBold,
  PiKeyBold,
  PiDatabaseBold,
  PiGearBold,
  PiShoppingCartBold,
  PiReadCvLogoBold,
  PiChatCenteredTextBold,
  PiChatsBold,
  PiUsersBold,
  PiFileBold,
  PiUserSwitchBold,
  PiSignOutBold,
  PiArrowsOutLineHorizontalBold,
  PiTeaBagBold,
  PiFactoryBold
} from "react-icons/pi";
import { 
  SegmentedControl,
  Text,
  Button,
  AppShell
} from '@mantine/core';
import classes from '../style/Sidebar.module.css';
import { AppDispatch } from '../redux/store';
import { logoutAsync } from '../redux/authSlice';

const tabs = {
  account: [
    { link: '', label: 'Notifications', icon: PiBellRingingBold },
    { link: '', label: 'Billing', icon: PiReceiptBold },
    { link: '', label: 'Security', icon: PiFingerprintBold },
    { link: '', label: 'SSH Keys', icon: PiKeyBold },
    { link: '', label: 'Databases', icon: PiDatabaseBold },
    { link: '', label: 'Other Settings', icon: PiGearBold },
  ],
  general: [
    { link: '', label: 'Orders', icon: PiShoppingCartBold },
    { link: '', label: 'Receipts', icon: PiReadCvLogoBold },
    { link: '', label: 'Reviews', icon: PiChatCenteredTextBold },
    { link: '', label: 'Messages', icon: PiChatsBold },
    { link: '/admin/users', label: 'Users', icon: PiUsersBold },
    { link: '', label: 'Files', icon: PiFileBold },
    { link: '/admin/products', label: 'Products', icon: PiTeaBagBold },
    { link: '/admin/companies', label: 'Companies', icon: PiFactoryBold}
  ],
};

export function Sidebar({ children }: { children: React.ReactNode }) {
  const [section, setSection] = useState<'account' | 'general'>('account');
  const [navOpened, { toggle: toggleNav }] = useDisclosure(true); 
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine which section should be active based on current route
  useEffect(() => {
    if (location.pathname.startsWith('/admin/users')) {
      setSection('general');
    }
  }, [location.pathname]);

  const links = tabs[section].map((item) => {
    // Skip rendering if the link is empty
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
  }).filter(Boolean); // Remove null entries

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
        <AppShell.Navbar p="xs">
          <AppShell.Section grow>
            <Text fw={500} size="sm" className={classes.title} c="dimmed" mb="xs">
              administrator@stockly.dev
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
              <a href="#" className={classes.link} onClick={(event) => event.preventDefault()}>
                <PiUserSwitchBold className={classes.linkIcon} />
                <span>Change account</span>
              </a>

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
        <Button 
          variant="outline" 
          onClick={toggleNav}
          style={{
            position: 'fixed',
            top: 10,
            left: navOpened ? 310 : 10,
            zIndex: 1000,
            transition: 'left 0.3s ease'
          }}
        >
          <PiArrowsOutLineHorizontalBold size={30} />
        </Button>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}