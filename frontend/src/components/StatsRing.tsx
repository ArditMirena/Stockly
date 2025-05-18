import {PiChartLineBold, PiFactoryBold, PiPackageBold, PiUsersBold, PiWarehouseBold, PiHandbagBold} from 'react-icons/pi';
import { Center, Group, Paper, RingProgress, SimpleGrid, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useGetProductsCountQuery } from '../api/productsApi';
import { useGetCompaniesCountQuery } from '../api/companiesApi';
import { useGetOrdersCountQuery } from '../api/ordersApi';
import { useGetWarehousesCountQuery } from '../api/warehousesApi';
import { useGetUsersCountQuery } from '../api/UsersApi';

const icons = {
  us: PiUsersBold,
  cm: PiFactoryBold,
  wh: PiWarehouseBold,
  or: PiPackageBold,
  pd: PiHandbagBold
};

export function StatsRing() {
  const { data: productCount = 0 } = useGetProductsCountQuery();
  const { data: companiesCount = 0 } = useGetCompaniesCountQuery();
  const { data: ordersCount = 0 } = useGetOrdersCountQuery();
  const { data: warehousesCount = 0 } = useGetWarehousesCountQuery();
  const { data: usersCount = 0 } = useGetUsersCountQuery();

  const baseData = [
    { label: 'Users', stats: usersCount, color: 'yellow', icon: 'us' },
    { label: 'Products', stats: productCount, color: 'green', icon: 'pd' },
    { label: 'Companies', stats: companiesCount, color: 'blue', icon: 'cm' },
    { label: 'Orders', stats: ordersCount, color: 'red', icon: 'or' },
    { label: 'Warehouses', stats: warehousesCount, color: 'orange', icon: 'wh' },
  ] as const;

  const [animatedStats, setAnimatedStats] = useState<number[]>([]);
  const [animatedProgress, setAnimatedProgress] = useState<number[]>([]);

  useEffect(() => {
    const maxCount = Math.max(...baseData.map((s) => s.stats), 1);
    const duration = 1500;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);

      const stats = baseData.map((stat) => Math.floor(stat.stats * progress));
      const progressValues = baseData.map((stat) => {
        const percent = (stat.stats / maxCount) * 100;
        return percent * progress;
      });

      setAnimatedStats(stats);
      setAnimatedProgress(progressValues);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [productCount, usersCount, companiesCount, ordersCount, warehousesCount]);

  const stats = baseData.map((stat, index) => {
    const Icon = icons[stat.icon];
    const displayedStat = animatedStats[index]?.toLocaleString() ?? '0';
    const progress = animatedProgress[index] ?? 0;

    return (
        <Paper withBorder radius="md" p="lg" key={stat.label}>
          <Group>
            <RingProgress
                size={80}
                roundCaps
                thickness={8}
                sections={[{ value: progress, color: stat.color }]}
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
                {displayedStat}
              </Text>
            </div>
          </Group>
        </Paper>
    );
  });

  return <SimpleGrid cols={{ base: 1, sm: 3 }}>{stats}</SimpleGrid>;
}
