// import { Modal, Stack, TextInput, Button, Group, Badge } from '@mantine/core';
// import { useForm } from '@mantine/form';
// import { useUpdateOrderMutation } from "../api/ordersApi";
// import { OrderDTO } from '../api/ordersApi';

// interface UpdateOrderModalProps {
//   opened: boolean;
//   onClose: () => void;
//   order: OrderDTO;
// }

// const UpdateOrderModal = ({ opened, onClose, order }: UpdateOrderModalProps) => {
//   const [updateOrder, { isLoading }] = useUpdateOrderMutation();

//   const form = useForm({
//     initialValues: {
//       ...order,
//       orderDate: order.orderDate.split('T')[0],
//       deliveryDate: order.deliveryDate?.split('T')[0] || '',
//     },
//   });

//   const handleSubmit = async (values: any) => {
//     try {
//       await updateOrder({ id: order.id!, order: values }).unwrap();
//       onClose();
//     } catch (error) {
//       console.error('Failed to update order:', error);
//     }
//   };

//   return (
//     <Modal opened={opened} onClose={onClose} title={`Update Order #${order.id}`} size="lg">
//       <form onSubmit={form.onSubmit(handleSubmit)}>
//         <Stack>
//           <Badge variant="light" size="lg">
//             Current Status: {order.status}
//           </Badge>
//           <TextInput
//             type="date"
//             label="Order Date"
//             required
//             {...form.getInputProps('orderDate')}
//           />
//           <TextInput
//             type="date"
//             label="Delivery Date"
//             {...form.getInputProps('deliveryDate')}
//           />
//           <Group justify="flex-end" mt="md">
//             <Button variant="default" onClick={onClose}>
//               Cancel
//             </Button>
//             <Button type="submit" loading={isLoading}>
//               Update Order
//             </Button>
//           </Group>
//         </Stack>
//       </form>
//     </Modal>
//   );
// };

// export default UpdateOrderModal;