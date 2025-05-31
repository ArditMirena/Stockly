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
  TextInput,
  Loader,
  Alert,
  Title,
  ActionIcon,
} from '@mantine/core';
// import { useDebouncedValue } from '@mantine/hooks';
import { PiArrowsDownUpBold, PiMagnifyingGlassBold, PiPlusBold, PiWarningBold } from 'react-icons/pi';

export interface Column<T> {
  accessorKey: keyof T;
  header: string;
  cell?: (info: { row: any, getValue: () => any }) => React.ReactNode;
  enableSorting?: boolean;
  size?: number;
}

export interface DashboardAction<T> {
  icon: React.ReactNode;
  color: string;
  title: string;
  onClick: (item: T) => void;
}

interface DashboardTableProps<T> {
  // Data props
  tableData: T[];
  allColumns: Column<T>[];
  
  // Pagination props
  totalPages: number;
  currentPage: number;
  fetchData: (page: number) => void;
  
  // Search props
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  searchPlaceholder?: string;
  
  // Header props
  title: string;
  subtitle?: string;
  titleIcon?: React.ReactNode;
  
  // Action props
  actions?: DashboardAction<T>[];
  onCreateNew?: () => void;
  createButtonLabel?: string;
  createButtonIcon?: React.ReactNode;
  createButtonLoading?: boolean;
  
  // State props
  enableSort?: boolean;
  isLoading?: boolean;
  error?: any;
  
  // Styling props
  enableSearch?: boolean;
  searchWidth?: number;
}

interface WithId {
  id: string | number;
}

const DashboardTable = <T extends WithId>({
  tableData,
  allColumns,
  totalPages,
  currentPage,
  fetchData,
  searchTerm = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  title,
  subtitle,
  titleIcon,
  actions = [],
  onCreateNew,
  createButtonLabel = 'Create New',
  createButtonIcon = <PiPlusBold size={16} />,
  createButtonLoading = false,
  enableSort = true,
  isLoading = false,
  error,
  enableSearch = true,
  searchWidth = 300,
}: DashboardTableProps<T>) => {
  const theme = useMantineTheme();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  // const [debouncedSearch] = useDebouncedValue(searchTerm, 300);

  const columnHelper = createColumnHelper<T>();

  // Enhanced columns with actions
  const enhancedColumns = [
    ...allColumns.map((col) =>
      columnHelper.accessor((row: any) => row[col.accessorKey], {
        id: col.accessorKey as string,
        header: () => (
          <Group gap={4} justify="center">
            <Text fw={600} truncate>{col.header}</Text>
          </Group>
        ),
        cell: (info) => (
          <Box style={{ textAlign: 'center' }}>
            {col.cell ? col.cell(info) : info.getValue()}
          </Box>
        ),
        enableSorting: enableSort && col.enableSorting,
        size: col.size,
      })
    ),
    // Add actions column if actions are provided
    ...(actions.length > 0 ? [
      columnHelper.accessor((row: any) => row.id, {
        id: 'actions',
        header: () => (
          <Group gap={4} justify="center">
            <Text fw={600}>Actions</Text>
          </Group>
        ),
        cell: ({ row }) => (
          <Group gap="xs" justify="center">
            {actions.map((action, index) => (
              <ActionIcon
                key={index}
                color={action.color}
                variant="light"
                onClick={() => action.onClick(row.original)}
                title={action.title}
              >
                {action.icon}
              </ActionIcon>
            ))}
          </Group>
        ),
        enableSorting: false,
        size: 100,
      })
    ] : [])
  ];

  const table = useReactTable({
    data: tableData,
    columns: enhancedColumns,
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
    <Paper p="md">
      {/* Header Section */}
      <Group justify="space-between" align="center" mb="md">
        <div>
          <Title order={2} mb="xs">
            {titleIcon && <span style={{ marginRight: 8, verticalAlign: 'middle' }}>{titleIcon}</span>}
            {title}
          </Title>
          {subtitle && (
            <Text size="sm" c="dimmed">
              {subtitle}
            </Text>
          )}
        </div>
        
        <Group gap="md">
          {enableSearch && onSearchChange && (
            <TextInput
              placeholder={searchPlaceholder}
              leftSection={<PiMagnifyingGlassBold size={16} />}
              w={searchWidth}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.currentTarget.value)}
            />
          )}
          {onCreateNew && (
            <Button 
              leftSection={createButtonIcon}
              onClick={onCreateNew}
              loading={createButtonLoading}
            >
              {createButtonLabel}
            </Button>
          )}
        </Group>
      </Group>

      {/* Error Alert */}
      {error && (
        <Alert 
          icon={<PiWarningBold size={16} />} 
          title="Error Loading Data" 
          color="red"
          variant="light"
          mb="md"
        >
          There was an error loading the data. Please try refreshing the page.
        </Alert>
      )}

      {/* Table Section */}
      {isLoading ? (
        <Box py="xl" style={{ textAlign: 'center' }}>
          <Loader size="lg" />
          <Text mt="md" c="dimmed">Loading data...</Text>
        </Box>
      ) : (
        <>
          <ScrollArea>
            <Table
              withColumnBorders
              withRowBorders={false}
              highlightOnHover
              striped={false}
              layout="fixed"
            >
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th 
                        key={header.id} 
                        style={{ 
                          padding: '12px',
                          width: header.column.getSize(),
                          minWidth: header.column.getSize(),
                          textAlign: 'center',
                          backgroundColor: theme.colors.dark[3],
                          color: theme.white,
                          position: 'sticky',
                          top: 0,
                        }}
                      >
                        <Flex
                          align="center"
                          justify="center"
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
                      backgroundColor: idx % 2 === 0 ? theme.white : theme.colors.gray[0],
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td 
                        key={cell.id} 
                        style={{ 
                          padding: '12px',
                          width: cell.column.getSize(),
                          minWidth: cell.column.getSize(),
                          textAlign: 'center'
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
        </>
      )}
    </Paper>
  );
};

export default DashboardTable;
