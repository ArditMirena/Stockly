import React, { useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  SortingState
} from '@tanstack/react-table';
import {
  Table,
  Button,
  Flex,
  Group,
  Text,
  Paper,
  ScrollArea,
  Divider,
  Box,
  useMantineTheme,
} from '@mantine/core';
import { PiArrowsDownUpBold } from 'react-icons/pi';

export interface Column<T> {
  accessorKey: keyof T;
  header: string;
  cell?: (info: { row: any, getValue: () => any }) => React.ReactNode;
  enableSorting?: boolean;
}

interface DashboardTableProps<T> {
  tableData: T[];
  allColumns: Column<T>[];
  enableSort: boolean;
  totalPages: number;
  currentPage: number;
  fetchData: (page: number) => void;
}

interface WithId {
  id: string | number;
}

const DashboardTable = <T extends WithId>({
  tableData,
  allColumns,
  enableSort,
  totalPages,
  currentPage,
  fetchData,
}: DashboardTableProps<T>) => {
  const theme = useMantineTheme();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columnHelper = createColumnHelper<T>();

  const columns = allColumns.map((col) =>
    columnHelper.accessor((row: any) => row[col.accessorKey], {
      id: col.accessorKey as string,
      header: () => (
        <Group gap={4}>
          <Text fw={600}>{col.header}</Text>
        </Group>
      ),
      cell: col.cell,
      enableSorting: enableSort && col.enableSorting,
    })
  );

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    getRowId: (row) => String(row.id),
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Paper shadow="xs" p="md" radius="md" withBorder>
      <ScrollArea>
        <Table
          withColumnBorders
          withRowBorders={false}
          highlightOnHover
          striped={false}
        >
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} style={{ padding: '12px' }}>
                    <Flex
                      align="center"
                      justify="start"
                      gap="xs"
                      onClick={header.column.getToggleSortingHandler()}
                      style={{
                        cursor: header.column.getCanSort() ? 'pointer' : 'default',
                        userSelect: 'none',
                      }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <PiArrowsDownUpBold size={16} />
                      )}
                    </Flex>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, idx) => (
              <tr
                key={row.id}
                style={{
                  backgroundColor:
                    idx % 2 === 0 ? theme.white : theme.colors.gray[0],
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} style={{ padding: '12px' }}>
                    <Box>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Box>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </ScrollArea>

      <Divider my="md" />

      <Flex justify="space-between" align="center" mt="md">
        <Button
          variant="outline"
          color="grey"
          disabled={currentPage === 0}
          onClick={() => fetchData(currentPage - 1)}
        >
          Previous
        </Button>

        <Text size="sm" fw={500}>
          Page {currentPage + 1} of {totalPages}
        </Text>

        <Button
          variant="outline"
          color="grey"
          disabled={currentPage + 1 >= totalPages}
          onClick={() => fetchData(currentPage + 1)}
        >
          Next
        </Button>
      </Flex>
    </Paper>
  );
};

export default DashboardTable;
