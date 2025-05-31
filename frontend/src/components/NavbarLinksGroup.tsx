import { useState } from 'react';
import { Group, Box, Collapse, UnstyledButton, rem } from '@mantine/core';
import { PiCaretRightBold } from 'react-icons/pi';
import { NavLink } from 'react-router-dom';
import classes from '../style/NavbarLinksGroup.module.css';

interface LinksGroupProps {
  icon: React.FC<any>;
  label: string;
  initiallyOpened?: boolean;
  links?: { label: string; link: string }[];
  link?: string;
}

export function LinksGroup({ icon: Icon, label, initiallyOpened, links, link }: LinksGroupProps) {
  const hasLinks = Array.isArray(links);
  const [opened, setOpened] = useState(initiallyOpened || false);

  const items = (hasLinks ? links : []).map((link) => (
    <NavLink
      className={({ isActive }) =>
        `${classes.link} ${isActive ? classes.linkActive : ''}`
      }
      to={link.link}
      key={link.label}
      onClick={(event) => {
        if (!link.link) {
          event.preventDefault();
        }
      }}
    >
      {link.label}
    </NavLink>
  ));

  if (!hasLinks && link) {
    return (
      <NavLink
        className={({ isActive }) =>
          `${classes.control} ${isActive ? classes.controlActive : ''}`
        }
        to={link}
      >
        <Group justify="space-between" gap={0}>
          <Box style={{ display: 'flex', alignItems: 'center' }}>
            <Icon style={{ width: rem(18), height: rem(18) }} />
            <Box ml="md">{label}</Box>
          </Box>
        </Group>
      </NavLink>
    );
  }

  return (
    <>
      <UnstyledButton onClick={() => setOpened((o) => !o)} className={classes.control}>
        <Group justify="space-between" gap={0}>
          <Box style={{ display: 'flex', alignItems: 'center' }}>
            <Icon style={{ width: rem(18), height: rem(18) }} />
            <Box ml="md">{label}</Box>
          </Box>
          {hasLinks && (
            <PiCaretRightBold
              className={classes.chevron}
              style={{
                width: rem(16),
                height: rem(16),
                transform: opened ? 'rotate(90deg)' : 'none',
              }}
            />
          )}
        </Group>
      </UnstyledButton>
      {hasLinks ? <Collapse in={opened}>{items}</Collapse> : null}
    </>
  );
}
