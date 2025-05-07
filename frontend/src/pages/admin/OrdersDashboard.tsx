import { useState } from 'react';
import {
  Paper,
  Title,
  Divider,
  Stack,
  Group,
  ActionIcon,
  Box,
  Loader,
  Modal,
  Button,
  Text,
  Badge,
  Table,
  Menu,
} from '@mantine/core';
import { PiTrashBold, PiPencilSimpleBold } from 'react-icons/pi';
import { useGetOrdersQuery, useDeleteOrderMutation } from '../../api/ordersApi';
import { CreateOrderModal } from "../CreateOrderModal";
import UpdateOrderModal from '../UpdateOrderModal';

const OrdersDashboard = () => {
  const { data: orders, isLoading, isError } = useGetOrdersQuery();
  const [deleteOrder] = useDeleteOrderMutation();

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderDTO | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDelete = async () => {
    if (deleteId !== null) {
      await deleteOrder(deleteId).unwrap();
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  if (isLoading) return <Loader size="xl" />;
  if (isError) return <Text color="red">Error loading orders</Text>;

  return (
    <Paper p="md" radius="md">
      <Stack>
        <Group justify="space-between">
          <Title order={3}>Orders Management</Title>
         <Button onClick={() => {
           console.log('Button clicked');
           setCreateModalOpen(true);
           console.log('Modal state should be true now');
         }}>
           Create New Order
         </Button>
        </Group>

        <Divider />

        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Buyer</Table.Th>
              <Table.Th>Supplier</Table.Th>
              <Table.Th>Order Date</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Total</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {orders?.map((order) => (
              <Table.Tr key={order.id}>
                <Table.Td>{order.id}</Table.Td>
                <Table.Td>{order.buyerId}</Table.Td>
                <Table.Td>{order.supplierId}</Table.Td>
                <Table.Td>
                  {new Date(order.orderDate).toLocaleDateString()}
                </Table.Td>
                <Table.Td>
                  <Badge color={
                    order.status === 'CANCELLED' ? 'red' :
                    order.status === 'COMPLETED' ? 'green' : 'blue'
                  }>
                    {order.status}
                  </Badge>
                </Table.Td>
                <Table.Td>${order.totalPrice?.toFixed(2)}</Table.Td>
                <Table.Td>
                  <Group>
                    <ActionIcon
                      variant="subtle"
                      onClick={() => {
                        setSelectedOrder(order);
                        setUpdateModalOpen(true);
                      }}
                    >
                      <PiPencilSimpleBold />
                    </ActionIcon>
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => {
                        setDeleteId(order.id!);
                        setConfirmOpen(true);
                      }}
                    >
                      <PiTrashBold />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        <CreateOrderModal
          opened={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
        />

        {/* Update Order Modal */}
        {selectedOrder && (
          <UpdateOrderModal
            opened={updateModalOpen}
            onClose={() => {
              setUpdateModalOpen(false);
              setSelectedOrder(null);
            }}
            order={selectedOrder}
          />
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          opened={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title="Confirm Deletion"
          centered
        >
          <Text>Are you sure you want to delete this order?</Text>
          <Group mt="md" justify="flex-end">
            <Button variant="default" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDelete}>
              Delete
            </Button>
          </Group>
        </Modal>
      </Stack>
    </Paper>
  );
};

export default OrdersDashboard;