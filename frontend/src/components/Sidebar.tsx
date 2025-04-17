import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  PiArrowsOutLineHorizontalBold
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
    { link: '', label: 'Customers', icon: PiUsersBold },
    { link: '', label: 'Files', icon: PiFileBold },
  ],
};

export function Sidebar() {
  const [section, setSection] = useState<'account' | 'general'>('account');
  const [active, setActive] = useState('Billing');
  const [navOpened, { toggle: toggleNav }] = useDisclosure(true); 
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const links = tabs[section].map((item) => (
    <a
      className={classes.link}
      data-active={item.label === active || undefined}
      href={item.link}
      key={item.label}
      onClick={(event) => {
        event.preventDefault();
        setActive(item.label);
      }}
    >
      <item.icon className={classes.linkIcon} />
      <span>{item.label}</span>
    </a>
  ));

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
      </AppShell.Main>
    </AppShell>
  );
}