import {
  Modal,
  Stack,
  NumberInput,
  Button,
  Group,
  TextInput,
  Select,
  Text as MantineText,
  Table,
  ActionIcon,
  Divider
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useCreateOrderMutation } from '../api/ordersApi';
import { OrderDTO, OrderItemDTO } from '../api/ordersApi';
import { useState } from 'react';
import { PiTrashBold } from 'react-icons/pi';

interface CreateOrderModalProps {
  opened: boolean;
  onClose: () => void;
}

const orderStatusOptions = [
  { value: 'CREATED', label: 'Created' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export function CreateOrderModal({ opened, onClose }: CreateOrderModalProps) {
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const [items, setItems] = useState<OrderItemDTO[]>([]);
  const [currentItem, setCurrentItem] = useState<Omit<OrderItemDTO, 'id'>>({
    productId: 0,
    quantity: 1,
    productTitle: '',
    unitPrice: 0
  });
  const [formError, setFormError] = useState('');

  const form = useForm({
    initialValues: {
      buyerId: 0,
      supplierId: 0,
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'CREATED',
      totalPrice: 0,
    } as Omit<OrderDTO, 'id' | 'items'>,
  });

  const addItem = () => {
    if (currentItem.productId && currentItem.quantity > 0) {
      setItems([...items, {
        ...currentItem,
        id: Math.random(),
        totalPrice: (currentItem.unitPrice || 0) * currentItem.quantity
      }]);
      setCurrentItem({
        productId: 0,
        quantity: 1,
        productTitle: '',
        unitPrice: 0
      });
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

  const handleSubmit = async (values: Omit<OrderDTO, 'id' | 'items'>) => {
    if (items.length === 0) {
      setFormError('Please add at least one item');
      return;
    }

    try {
      setFormError('');
      await createOrder({
        ...values,
        items,
        totalPrice: calculateTotal()
      }).unwrap();
      onClose();
      form.reset();
      setItems([]);
    } catch (error) {
      console.error('Failed to create order:', error);
      setFormError(error.data?.detail || 'Failed to create order');
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Create New Order"
      size="lg"
      styles={{
        root: { position: 'fixed' },
        inner: {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        },
        content: {
          zIndex: 1001,
          position: 'relative',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          width: '80%',
          maxWidth: '600px'
        },
        overlay: {
          zIndex: 999,
          backgroundColor: 'rgba(0,0,0,0.5)'
        }
      }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <NumberInput
            label="Buyer ID"
            required
            min={1}
            {...form.getInputProps('buyerId')}
          />
          <NumberInput
            label="Supplier ID"
            required
            min={1}
            {...form.getInputProps('supplierId')}
          />
          <TextInput
            type="date"
            label="Order Date"
            required
            {...form.getInputProps('orderDate')}
          />
          <TextInput
            type="date"
            label="Delivery Date"
            required
            {...form.getInputProps('deliveryDate')}
          />
          <Select
            label="Order Status"
            data={orderStatusOptions}
            searchable
            nothingFound="No options"
            {...form.getInputProps('status')}
          />

          <Divider label="Order Items" />

          <Group align="flex-end">
            <NumberInput
              label="Product ID"
              min={1}
              value={currentItem.productId}
              onChange={(val) => setCurrentItem({...currentItem, productId: Number(val) || 0})}
            />
            <TextInput
              label="Product Name"
              value={currentItem.productTitle || ''}
              onChange={(e) => setCurrentItem({...currentItem, productTitle: e.target.value})}
            />
            <NumberInput
              label="Quantity"
              min={1}
              value={currentItem.quantity}
              onChange={(val) => setCurrentItem({...currentItem, quantity: Number(val) || 1})}
            />
            <NumberInput
              label="Unit Price"
              min={0}
              precision={2}
              value={currentItem.unitPrice || 0}
              onChange={(val) => setCurrentItem({...currentItem, unitPrice: Number(val) || 0})}
            />
            <Button onClick={addItem}>Add Item</Button>
          </Group>

          {items.length > 0 && (
            <Table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.productTitle || `Product ${item.productId}`}</td>
                    <td>{item.quantity}</td>
                    <td>${item.unitPrice?.toFixed(2)}</td>
                    <td>${item.totalPrice?.toFixed(2)}</td>
                    <td>
                      <ActionIcon color="red" onClick={() => removeItem(index)}>
                        <PiTrashBold />
                      </ActionIcon>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          <MantineText size="lg" fw={500}>Order Total: ${calculateTotal().toFixed(2)}</MantineText>

          {formError && (
            <MantineText color="red" size="sm">
              {formError}
            </MantineText>
          )}

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={isLoading} disabled={items.length === 0}>
              Create Order
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}