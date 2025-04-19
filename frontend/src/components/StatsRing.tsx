import { PiChartLineBold } from 'react-icons/pi';
import { Center, Group, Paper, RingProgress, SimpleGrid, Text } from '@mantine/core';

const icons = {
  cl: PiChartLineBold
};

const data = [
  { label: 'Products', stats: '456,578', progress: 65, color: 'green', icon: 'cl' },
  { label: 'New users', stats: '2,550', progress: 72, color: 'blue', icon: 'cl' },
  {
    label: 'Orders',
    stats: '4,735',
    progress: 30,
    color: 'red',
    icon: 'cl',
  },
] as const;

export function StatsRing() {
  const stats = data.map((stat) => {
    const Icon = icons[stat.icon];
    return (
      <Paper withBorder radius="md" p="lg" key={stat.label}>
        <Group>
          <RingProgress
            size={80}
            roundCaps
            thickness={8}
            sections={[{ value: stat.progress, color: stat.color }]}
            label={
              <Center>
                <Icon size={20} />
              </Center>
            }
          />

          <div>
            <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
              {stat.label}
            </Text>
            <Text fw={700} size="xl">
              {stat.stats}
            </Text>
          </div>
        </Group>
      </Paper>
    );
  });

  return <SimpleGrid cols={{ base: 1, sm: 3 }}>{stats}</SimpleGrid>;
}