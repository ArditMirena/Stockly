export const ROLES = {
  USER: 'USER',
  BUYER: 'BUYER',
  SUPPLIER: 'SUPPLIER',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN'
};

export const PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: ['*'],
  [ROLES.BUYER]: ['companies', 'orders', 'trackShipment'],
  [ROLES.SUPPLIER]: ['companies', 'products', 'warehouses', 'warehouseProducts', 'orders', 'trackShipment'],
};
