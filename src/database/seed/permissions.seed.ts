export const PERMISSIONS = [
  { name: 'transaction:create', description: 'Create transactions', module: 'transaction' },
  { name: 'transaction:read', description: 'View transactions', module: 'transaction' },
  { name: 'transaction:update', description: 'Update transactions', module: 'transaction' },
  { name: 'transaction:delete', description: 'Delete transactions', module: 'transaction' },
  { name: 'member:invite', description: 'Invite members', module: 'member' },
  { name: 'member:read', description: 'View members', module: 'member' },
  { name: 'member:update', description: 'Update member roles', module: 'member' },
  { name: 'member:remove', description: 'Remove members', module: 'member' },
  { name: 'role:manage', description: 'Manage custom roles', module: 'role' },
  { name: 'workspace:update', description: 'Update workspace settings', module: 'workspace' },
  { name: 'workspace:delete', description: 'Delete workspace', module: 'workspace' },
  { name: 'goal:manage', description: 'Manage financial goals', module: 'goal' },
  { name: 'kanban:manage', description: 'Manage kanban tasks', module: 'kanban' },
  { name: 'category:manage', description: 'Manage categories', module: 'category' },
  { name: 'group:manage', description: 'Manage member groups', module: 'group' },
  { name: 'budget:manage', description: 'Manage budgets', module: 'budget' },
  { name: 'recurring:manage', description: 'Manage recurring transactions', module: 'recurring' },
  { name: 'alert:manage', description: 'Manage alert rules', module: 'alert' },
  { name: 'payment_method:manage', description: 'Manage payment methods', module: 'payment_method' },
  { name: 'income_stream:manage', description: 'Manage income streams', module: 'income_stream' },
  { name: 'reminder:manage', description: 'Manage reminder settings', module: 'reminder' },
];

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  owner: PERMISSIONS.map((p) => p.name),
  admin: [
    'transaction:create', 'transaction:read', 'transaction:update', 'transaction:delete',
    'member:invite', 'member:read', 'member:update', 'member:remove',
    'workspace:update', 'goal:manage', 'kanban:manage', 'category:manage', 'group:manage',
    'budget:manage', 'recurring:manage', 'alert:manage', 'payment_method:manage',
    'income_stream:manage', 'reminder:manage',
  ],
  member: [
    'transaction:create', 'transaction:read', 'transaction:update',
    'member:read', 'goal:manage', 'kanban:manage', 'group:manage',
    'recurring:manage', 'income_stream:manage',
  ],
  viewer: [
    'transaction:read', 'member:read',
  ],
  child: ['transaction:read', 'member:read', 'kanban:manage'],
};

/** @deprecated Use HIERARCHICAL_EXPENSE_CATEGORIES from catalogs.seed */
export const DEFAULT_CATEGORIES = [
  { name: 'Food', slug: 'food', color: '#ef4444', icon: '🍔' },
  { name: 'Bills', slug: 'bills', color: '#f97316', icon: '📄' },
  { name: 'Savings', slug: 'savings', color: '#22c55e', icon: '💰' },
  { name: 'Transport', slug: 'transport', color: '#3b82f6', icon: '🚌' },
  { name: 'Entertainment', slug: 'entertainment', color: '#a855f7', icon: '🎬' },
  { name: 'Health', slug: 'health', color: '#ec4899', icon: '🏥' },
  { name: 'Education', slug: 'education', color: '#14b8a6', icon: '📚' },
  { name: 'Shopping', slug: 'shopping', color: '#eab308', icon: '🛍️' },
  { name: 'Rent', slug: 'rent', color: '#64748b', icon: '🏠' },
  { name: 'Other', slug: 'other', color: '#6b7280', icon: '📦' },
];

export const DEFAULT_KANBAN_COLUMNS = [
  { name: 'To Do', slug: 'todo', order: 0 },
  { name: 'In Progress', slug: 'in-progress', order: 1 },
  { name: 'Done', slug: 'done', order: 2 },
];
