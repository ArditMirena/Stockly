import { PiChartLineBold } from 'react-icons/pi';
import { Center, Group, Paper, RingProgress, SimpleGrid, Text } from '@mantine/core';
import { useEffect, useState } from 'react';

const icons = {
  cl: PiChartLineBold
};

const data = [
  { label: 'Products', stats: 456578, progress: 65, color: 'green', icon: 'cl' },
  { label: 'New users', stats: 2550, progress: 72, color: 'blue', icon: 'cl' },
  { label: 'Orders', stats: 4735, progress: 30, color: 'red', icon: 'cl' },
] as const;

export function StatsRing() {
  const [displayedStats, setDisplayedStats] = useState(
    data.map(() => 0)
  );

  useEffect(() => {
    const duration = 2000;
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      const newDisplayedStats = data.map((stat) => {
        return Math.floor(stat.stats * progress);
      });
      
      setDisplayedStats(newDisplayedStats);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, []);

  const stats = data.map((stat, index) => {
    const Icon = icons[stat.icon];
    
    const formattedStats = displayedStats[index].toLocaleString();
    
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
              {formattedStats}
            </Text>
          </div>
        </Group>
      </Paper>
    );
  });

  return <SimpleGrid cols={{ base: 1, sm: 3 }}>{stats}</SimpleGrid>;
}