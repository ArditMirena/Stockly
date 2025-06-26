import { Modal, Button, Stack, Group, Alert } from '@mantine/core';
import { ReactNode } from 'react';
import { PiWarningBold } from 'react-icons/pi';

export type ModalType = 'view' | 'edit' | 'create';

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
  modalType?: ModalType;
  errors?: string[];
  size?: string;
  additionalActions?: ReactNode;
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
  modalType = 'create',
  errors = [],
  size = "md",
  additionalActions,
}: DashboardCrudModalProps) {
  const getSubmitLabel = () => {
    if (submitLabel !== 'Save') return submitLabel;
    
    switch (modalType) {
      case 'create': return 'Create';
      case 'edit': return 'Update';
      default: return 'Save';
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      centered
      radius="md"
      padding="lg"
      size={size}
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        zIndex: 20
      }}
      styles={{
        overlay: {
          zIndex: 20
        }
      }}
    >
      {/* ADD noValidate to disable HTML5 validation */}
      <form 
        noValidate 
        onSubmit={(e) => {
          e.preventDefault();
          console.log('Form submitted in DashboardCrudModal');
          onSubmit?.();
        }}
      >
        <Stack>
          {/* Form Errors */}
          {errors.length > 0 && (
            <Alert 
              icon={<PiWarningBold size={16} />} 
              title="Please fix the following errors:" 
              color="red"
              variant="light"
            >
              <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}

          {children}
          
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              Close
            </Button>
            {additionalActions}
            {showSubmitButton && modalType !== 'view' && (
              <Button 
                type="submit" 
                loading={isSubmitting} 
                disabled={disableSubmit}
              >
                {getSubmitLabel()}
              </Button>
            )}
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
