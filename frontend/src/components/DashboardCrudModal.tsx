import { Modal, Button, Stack, Group } from '@mantine/core';
import { ReactNode } from 'react';

interface DashboardCrudModalProps {
  opened: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  onSubmit?: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  disableSubmit?: boolean;
  showSubmitButton?: boolean;
}

export default function DashboardCrudModal({
  opened,
  title,
  onClose,
  children,
  onSubmit,
  submitLabel = 'Save',
  isSubmitting = false,
  disableSubmit = false,
  showSubmitButton = true,
}: DashboardCrudModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      centered
      radius="md"
      padding="lg"
      size="md"
      style={{
        position: 'fixed',
        top: '0',
        left: '0'
      }}
    >
      <form onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}>
        <Stack>
          {children}
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              Close
            </Button>
            {showSubmitButton && (
              <Button type="submit" loading={isSubmitting} disabled={disableSubmit}>
                {submitLabel}
              </Button>
            )}
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
