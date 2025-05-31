import { forwardRef } from 'react';
import { Group, Avatar, Text, UnstyledButton } from '@mantine/core';
import { PiSignOutBold } from 'react-icons/pi';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

interface UserButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  image?: string;
  name?: string;
  email?: string;
  icon?: React.ReactNode;
}

export const UserButton = forwardRef<HTMLButtonElement, UserButtonProps>(
  ({ image, name, email, icon, ...others }: UserButtonProps, ref) => {
    const user = useSelector((state: RootState) => state.auth.user);

    return (
      <UnstyledButton
        ref={ref}
        style={{
          padding: 'var(--mantine-spacing-md)',
          color: 'var(--mantine-color-text)',
          borderRadius: 'var(--mantine-radius-sm)',
          width: '100%',
        }}
        {...others}
      >
        <Group>
          <Avatar src={image} radius="xl" />

          <div style={{ flex: 1 }}>
            <Text size="sm" fw={500}>
              {name || user?.username || 'User'}
            </Text>

            <Text c="dimmed" size="xs">
              {email || user?.email || 'user@example.com'}
            </Text>
          </div>

          {icon || <PiSignOutBold size="1rem" />}
        </Group>
      </UnstyledButton>
    );
  }
);
