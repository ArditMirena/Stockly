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
  Badge,
  Tooltip,
  Select,
  Stack,
  Center,
  Transition,
} from '@mantine/core';
import { 
  PiArrowsDownUpBold, 
  PiMagnifyingGlassBold, 
  PiPlusBold, 
  PiWarningBold,
  PiCaretUpBold,
  PiCaretDownBold,
  PiCaretLeftBold,
  PiCaretRightBold,
  PiCaretDoubleLeftBold,
  PiCaretDoubleRightBold,
  PiTableBold
} from 'react-icons/pi';

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
  totalItems?: number; // New prop for showing total items
  
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
  pageSize?: number; // New prop for page size
  pageSizeOptions?: number[]; // New prop for page size options
  onPageSizeChange?: (size: number) => void; // New prop for page size change
  emptyStateMessage?: string; // New prop for empty state
  emptyStateIcon?: React.ReactNode; // New prop for empty state icon
  showQuickJump?: boolean; // New prop for quick jump to page
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
  totalItems,
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
  pageSize = 10,
  pageSizeOptions = [5, 10, 25, 50, 100],
  onPageSizeChange,
  emptyStateMessage = 'No data available',
  emptyStateIcon = <PiTableBold size={48} />,
  showQuickJump = true,
}: DashboardTableProps<T>) => {
  const theme = useMantineTheme();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columnHelper = createColumnHelper<T>();

  // Enhanced columns with actions
  const enhancedColumns = [
    ...allColumns.map((col) =>
      columnHelper.accessor((row: any) => row[col.accessorKey], {
        id: col.accessorKey as string,
        header: () => (
          <Group gap={4} justify="center">
            <Text fw={600} truncate size="sm">{col.header}</Text>
          </Group>
        ),
        cell: (info) => (
          <Box style={{ textAlign: 'center' }}>
            {col.cell ? col.cell(info) : (
              <Text size="sm" truncate>
                {info.getValue()}
              </Text>
            )}
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
            <Text fw={600} size="sm">Actions</Text>
          </Group>
        ),
        cell: ({ row }) => (
          <Group gap="xs" justify="center">
            {actions.map((action, index) => (
              <Tooltip key={index} label={action.title} position="top">
                <ActionIcon
                  color={action.color}
                  variant="light"
                  onClick={() => action.onClick(row.original)}
                  size="sm"
                  style={{
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    }
                  }}
                >
                  {action.icon}
                </ActionIcon>
              </Tooltip>
            ))}
          </Group>
        ),
        enableSorting: false,
        size: Math.max(100, actions.length * 40),
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

  const getSortIcon = (column: any) => {
    const sortDirection = column.getIsSorted();
    if (sortDirection === 'asc') {
      return <PiCaretUpBold size={14} style={{ color: theme.colors.blue[6] }} />;
    }
    if (sortDirection === 'desc') {
      return <PiCaretDownBold size={14} style={{ color: theme.colors.blue[6] }} />;
    }
    return <PiArrowsDownUpBold size={14} style={{ opacity: 0.5 }} />;
  };

  const renderPaginationInfo = () => {
    const startItem = currentPage * pageSize + 1;
    const endItem = Math.min((currentPage + 1) * pageSize, totalItems || tableData.length);
    const total = totalItems || tableData.length;
    
    return (
      <Text size="sm" c="dimmed">
        Showing {startItem}-{endItem} of {total} results
      </Text>
    );
  };

  const renderEmptyState = () => (
    <Center py={60}>
      <Stack align="center" gap="md">
        <Box c="dimmed" style={{ opacity: 0.5 }}>
          {emptyStateIcon}
        </Box>
        <Stack align="center" gap="xs">
          <Text size="lg" fw={500} c="dimmed">
            {emptyStateMessage}
          </Text>
          {searchTerm && (
            <Text size="sm" c="dimmed">
              Try adjusting your search terms
            </Text>
          )}
        </Stack>
        {onCreateNew && !searchTerm && (
          <Button
            variant="light"
            leftSection={createButtonIcon}
            onClick={onCreateNew}
            mt="md"
          >
            {createButtonLabel}
          </Button>
        )}
      </Stack>
    </Center>
  );

  return (
    <Paper shadow="xs" radius="md" p="lg" style={{ overflow: 'hidden' }}>
      {/* Header Section */}
      <Group justify="space-between" align="flex-start" mb="lg">
        <Stack gap="xs">
          <Group gap="sm" align="center">
            {titleIcon && (
              <Box c={theme.colors.blue[6]}>
                {titleIcon}
              </Box>
            )}
            <Title order={2} c={theme.colors.dark[8]}>
              {title}
            </Title>
            {totalItems !== undefined && (
              <Badge variant="light" color="blue" size="sm">
                {totalItems}
              </Badge>
            )}
          </Group>
          {subtitle && (
            <Text size="sm" c="dimmed" maw={600}>
              {subtitle}
            </Text>
          )}
        </Stack>
        
        <Group gap="md" align="flex-end">
          {enableSearch && onSearchChange && (
            <TextInput
              placeholder={searchPlaceholder}
              leftSection={<PiMagnifyingGlassBold size={16} />}
              w={searchWidth}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.currentTarget.value)}
              styles={{
                input: {
                  '&:focus': {
                    borderColor: theme.colors.blue[6],
                    boxShadow: `0 0 0 1px ${theme.colors.blue[6]}`,
                  }
                }
              }}
            />
          )}
          {onCreateNew && (
            <Button 
              leftSection={createButtonIcon}
              onClick={onCreateNew}
              loading={createButtonLoading}
              gradient={{ from: 'blue', to: 'cyan' }}
              variant="gradient"
              style={{
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: theme.shadows.md,
                }
              }}
            >
              {createButtonLabel}
            </Button>
          )}
        </Group>
      </Group>

      {/* Error Alert */}
      <Transition mounted={!!error} transition="fade" duration={200}>
        {(styles) => error && (
          <Alert 
            icon={<PiWarningBold size={16} />} 
            title="Error Loading Data" 
            color="red"
            variant="light"
            mb="lg"
            style={styles}
            radius="md"
          >
            There was an error loading the data. Please try refreshing the page.
          </Alert>
        )}
      </Transition>

      {/* Table Section */}
      {isLoading ? (
        <Center py={80}>
          <Stack align="center" gap="md">
            <Loader size="lg" color="blue" />
            <Text c="dimmed">Loading data...</Text>
          </Stack>
        </Center>
      ) : tableData.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          <Box style={{ 
            border: `1px solid ${theme.colors.gray[3]}`,
            borderRadius: theme.radius.md,
            overflow: 'hidden'
          }}>
            <ScrollArea>
              <Table
                withColumnBorders
                withRowBorders={false}
                highlightOnHover
                striped={false}
                layout="fixed"
                style={{ minWidth: 700 }}
              >
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th 
                          key={header.id} 
                          style={{ 
                            padding: '16px 12px',
                            width: header.column.getSize(),
                            minWidth: header.column.getSize(),
                            textAlign: 'center',
                            backgroundColor: theme.colors.gray[1],
                            borderBottom: `2px solid ${theme.colors.gray[3]}`,
                            position: 'sticky',
                            top: 0,
                            zIndex: 10,
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
                              transition: 'all 0.2s ease',
                              borderRadius: theme.radius.sm,
                              padding: '4px 8px',
                              '&:hover': header.column.getCanSort() ? {
                                backgroundColor: theme.colors.gray[2],
                              } : undefined,
                            }}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getCanSort() && getSortIcon(header.column)}
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
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.colors.yellow[0]
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = idx % 2 === 0 ? theme.white : theme.colors.gray[0]
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td 
                          key={cell.id} 
                          style={{ 
                            padding: '16px 12px',
                            width: cell.column.getSize(),
                            minWidth: cell.column.getSize(),
                            textAlign: 'center',
                            borderBottom: `1px solid ${theme.colors.gray[2]}`,
                          }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}                </tbody>
              </Table>
            </ScrollArea>
          </Box>
          <Divider my="lg" />

          {/* Enhanced Pagination Section */}
          <Group justify="space-between" align="center" wrap="wrap" gap="md">
            {/* Left side - Items per page and info */}
            <Group gap="md" align="center">
              {onPageSizeChange && (
                <Group gap="xs" align="center">
                  <Text size="sm" c="dimmed">Show:</Text>
                  <Select
                    value={pageSize.toString()}
                    onChange={(value) => value && onPageSizeChange(parseInt(value))}
                    data={pageSizeOptions.map(size => ({ 
                      value: size.toString(), 
                      label: size.toString() 
                    }))}
                    size="sm"
                    w={70}
                    comboboxProps={{ withinPortal: false }}
                  />
                  <Text size="sm" c="dimmed">per page</Text>
                </Group>
              )}
              {renderPaginationInfo()}
            </Group>

            {/* Right side - Pagination controls */}
            <Group gap="xs" align="center">
              {/* Quick jump to first page */}
              {showQuickJump && totalPages > 5 && (
                <Tooltip label="First page">
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    disabled={currentPage === 0}
                    onClick={() => fetchData(0)}
                    size="sm"
                  >
                    <PiCaretDoubleLeftBold size={14} />
                  </ActionIcon>
                </Tooltip>
              )}

              {/* Previous page */}
              <Tooltip label="Previous page">
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  disabled={currentPage === 0}
                  onClick={() => fetchData(currentPage - 1)}
                  size="sm"
                >
                  <PiCaretLeftBold size={14} />
                </ActionIcon>
              </Tooltip>

              {/* Page numbers */}
              <Group gap="xs">
                {(() => {
                  const pages = [];
                  const maxVisiblePages = 5;
                  let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
                  let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
                  
                  // Adjust start page if we're near the end
                  if (endPage - startPage < maxVisiblePages - 1) {
                    startPage = Math.max(0, endPage - maxVisiblePages + 1);
                  }

                  // Add ellipsis at the beginning if needed
                  if (startPage > 0) {
                    pages.push(
                      <Button
                        key={0}
                        variant={0 === currentPage ? "filled" : "subtle"}
                        color={0 === currentPage ? "blue" : "gray"}
                        size="sm"
                        onClick={() => fetchData(0)}
                        style={{ minWidth: 36, height: 32 }}
                      >
                        1
                      </Button>
                    );
                    if (startPage > 1) {
                      pages.push(
                        <Text key="ellipsis-start" size="sm" c="dimmed" px="xs">
                          ...
                        </Text>
                      );
                    }
                  }

                  // Add visible page numbers
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <Button
                        key={i}
                        variant={i === currentPage ? "filled" : "subtle"}
                        color={i === currentPage ? "blue" : "gray"}
                        size="sm"
                        onClick={() => fetchData(i)}
                        style={{ 
                          minWidth: 36, 
                          height: 32,
                          fontWeight: i === currentPage ? 600 : 400
                        }}
                      >
                        {i + 1}
                      </Button>
                    );
                  }

                  // Add ellipsis at the end if needed
                  if (endPage < totalPages - 1) {
                    if (endPage < totalPages - 2) {
                      pages.push(
                        <Text key="ellipsis-end" size="sm" c="dimmed" px="xs">
                          ...
                        </Text>
                      );
                    }
                    pages.push(
                      <Button
                        key={totalPages - 1}
                        variant={totalPages - 1 === currentPage ? "filled" : "subtle"}
                        color={totalPages - 1 === currentPage ? "blue" : "gray"}
                        size="sm"
                        onClick={() => fetchData(totalPages - 1)}
                        style={{ minWidth: 36, height: 32 }}
                      >
                        {totalPages}
                      </Button>
                    );
                  }

                  return pages;
                })()}
              </Group>

              {/* Next page */}
              <Tooltip label="Next page">
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  disabled={currentPage + 1 >= totalPages}
                  onClick={() => fetchData(currentPage + 1)}
                  size="sm"
                >
                  <PiCaretRightBold size={14} />
                </ActionIcon>
              </Tooltip>

              {/* Quick jump to last page */}
              {showQuickJump && totalPages > 5 && (
                <Tooltip label="Last page">
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    disabled={currentPage + 1 >= totalPages}
                    onClick={() => fetchData(totalPages - 1)}
                    size="sm"
                  >
                    <PiCaretDoubleRightBold size={14} />
                  </ActionIcon>
                </Tooltip>
              )}
            </Group>
          </Group>
        </>
      )}
    </Paper>
  );
};

export default DashboardTable;
