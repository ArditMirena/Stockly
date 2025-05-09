import {
  Modal,
  Button,
  Stack,
  TextInput,
  Select,
} from '@mantine/core';
import { useForm, Controller, FieldValues, DefaultValues } from 'react-hook-form';
import { useEffect } from 'react';

interface Field<T> {
  name: keyof T;
  label: string;
  type: 'text' | 'select';
  options?: { value: string; label: string }[];
}

interface DashboardCrudModalProps<T extends FieldValues> {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: T) => void;
  defaultValues?: Partial<T>;
  fields: Field<T>[];
  title: string;
  submitLabel?: string;
}

export function DashboardCrudModal<T extends FieldValues>({
  opened,
  onClose,
  onSubmit,
  defaultValues,
  fields,
  title,
  submitLabel = 'Save',
}: DashboardCrudModalProps<T>) {
  const {
    register,
    handleSubmit,
    reset,
    control,
  } = useForm<T>({
    defaultValues: defaultValues as DefaultValues<T>,
  });

  useEffect(() => {
    reset(defaultValues as T);
  }, [defaultValues, reset]);

  return (
    <Modal 
      opened={opened}
      onClose={onClose}
      title={title}
      centered
      style={{
            position: 'fixed',
            top: '0',
            left: '0'
          }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          {fields.map((field) => {
            if (field.type === 'select') {
              return (
                <Controller
                  key={String(field.name)}
                  control={control}
                  name={field.name as any}
                  render={({ field: controllerField }) => (
                    <Select
                      label={field.label}
                      data={field.options || []}
                      value={controllerField.value}
                      onChange={controllerField.onChange}
                    />
                  )}
                />
              );
            }

            return (
              <TextInput
                key={String(field.name)}
                label={field.label}
                {...register(field.name as any)}
              />
            );
          })}
          <Button type="submit" fullWidth>
            {submitLabel}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
