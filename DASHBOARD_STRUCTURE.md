# Dashboard Structure — Visual Overview

**Purpose**: Quick reference for dashboard component structure, props, and data flow.

---

## Component Hierarchy

```
DashboardPage
│
├── DashboardLayout (Main wrapper)
│   │
│   ├── DashboardSidebar (fixed left, desktop only)
│   │   ├── Logo section
│   │   ├── Navigation items (7 items)
│   │   │   ├── Dashboard
│   │   │   ├── Ventas (Sales)
│   │   │   ├── Inventario (Inventory)
│   │   │   ├── Clientes (Customers)
│   │   │   ├── Pedidos (Orders)
│   │   │   ├── Reportes (Reports)
│   │   │   └── Configuración (Settings)
│   │   └── User section
│   │       ├── User profile
│   │       └── Logout button
│   │
│   ├── DashboardMobileHeader (fixed top, mobile only)
│   │   ├── Menu toggle button
│   │   ├── Logo
│   │   └── Notifications button
│   │
│   └── Main Content Area
│       │
│       ├── DashboardHeader (sticky top, full width)
│       │   ├── Title + Date
│       │   ├── Business Selector Dropdown
│       │   │   ├── List of businesses
│       │   │   ├── Transaction counts
│       │   │   └── Current selection indicator
│       │   └── User avatar
│       │
│       └── Main Content Sections
│           │
│           ├── Section 1: Resumen General (Stats)
│           │   └── DashboardStats
│           │       ├── Ventas Hoy
│           │       ├── Pedidos Pendientes
│           │       ├── Clientes Activos
│           │       └── Tasa de Conversión
│           │
│           ├── Section 2: Análisis (Charts)
│           │   └── DashboardCharts
│           │       ├── Ventas por Día (Bar chart)
│           │       ├── Pedidos por Día (Bar chart)
│           │       ├── Top Categorías (Stacked bars)
│           │       └── Desempeño Reciente (KPI grid)
│           │
│           ├── Section 3: Datos Detallados (Tables)
│           │   └── DashboardTables
│           │       ├── Pedidos Recientes (Table + pagination)
│           │       └── Top Clientes (Customer list)
│           │
│           └── Section 4: Actividad Reciente (Feed)
│               └── RecentActivity
│                   ├── Activity timeline (5 items)
│                   └── View all link
```

---

## Component Props

### DashboardPage

```tsx
interface DashboardPageProps {
  params: Promise<{ locale: string }>;
}

export default function DashboardPage({
  params,
}: DashboardPageProps) {
  const [selectedBusiness, setSelectedBusiness] = useState<string>("todos");
  return (
    <DashboardLayout>
      {/* Sections */}
    </DashboardLayout>
  );
}
```

### DashboardLayout

```tsx
interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Layout grid with sidebar + main content
}
```

### DashboardSidebar

```tsx
interface DashboardSidebarProps {
  onClose?: () => void; // Called when menu item clicked (mobile)
}

export function DashboardSidebar({ onClose }: DashboardSidebarProps) {
  const navigationItems = [
    { name, href, icon, badge }
  ];
}
```

### DashboardMobileHeader

```tsx
interface DashboardMobileHeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void; // Toggle sidebar visibility
}

export function DashboardMobileHeader({
  sidebarOpen,
  onToggleSidebar,
}: DashboardMobileHeaderProps) {
  // Fixed top header with menu button
}
```

### DashboardHeader

```tsx
interface DashboardHeaderProps {
  selectedBusiness: string;
  onBusinessChange: (business: string) => void;
}

export function DashboardHeader({
  selectedBusiness,
  onBusinessChange,
}: DashboardHeaderProps) {
  // Title + business selector dropdown
}
```

### DashboardStats

```tsx
export function DashboardStats() {
  const stats = [
    {
      label: string;
      value: string;
      change: string;
      trend: "up" | "down";
      icon: string;
      bgColor: string;
    }
  ];
  // 4-column grid
}
```

### DashboardCharts

```tsx
export function DashboardCharts() {
  const salesData = [
    {
      day: string;
      sales: number;
      orders: number;
    }
  ];
  // 4 different chart types
}
```

### DashboardTables

```tsx
export function DashboardTables() {
  const [currentPage, setCurrentPage] = useState(1);
  
  const orders = [
    {
      id: string;
      customer: string;
      product: string;
      date: string;
      amount: string;
      status: string;
      statusColor: string;
    }
  ];
  // 2 tables side-by-side
}
```

### RecentActivity

```tsx
export function RecentActivity() {
  const activities = [
    {
      id: number;
      type: string;
      actor: string;
      action: string;
      details: string;
      timestamp: string;
      icon: string;
      color: string;
    }
  ];
  // Activity feed timeline
}
```

---

## State Management

### DashboardPage (Top-level state)

```tsx
const [selectedBusiness, setSelectedBusiness] = useState<string>("todos");
↓
DashboardHeader (receives props)
```

### DashboardLayout (Sidebar state)

```tsx
const [sidebarOpen, setSidebarOpen] = useState(false);
↓ onToggleSidebar
DashboardMobileHeader (toggle button)
```

### DashboardHeader (Dropdown state)

```tsx
const [dropdownOpen, setDropdownOpen] = useState(false);
↓ onClick
Business selector dropdown
```

### DashboardTables (Pagination state)

```tsx
const [currentPage, setCurrentPage] = useState(1);
↓ onClick
Pagination buttons
```

---

## Data Flow

### User selects business

```
DashboardHeader (dropdown)
  ↓ onBusinessChange(businessId)
  ↓
DashboardPage.selectedBusiness
  ↓
DashboardHeader receives updated props
  ↓ Display shows new business
```

### User opens mobile sidebar

```
DashboardMobileHeader (menu button)
  ↓ onToggleSidebar()
  ↓
DashboardLayout.sidebarOpen = true
  ↓
Sidebar overlay appears
  ↓ onClick(item or overlay)
  ↓
DashboardSidebar.onClose()
  ↓ setSidebarOpen(false)
```

### User clicks pagination

```
DashboardTables (previous/next button)
  ↓ setCurrentPage(newPage)
  ↓
paginatedOrders = orders.slice(...)
  ↓
Table re-renders with new items
```

---

## Styling Breakdown

### Colors Used

```tsx
// Brand primary
bg-brand-600 / bg-brand-50 / text-brand-600

// Neutral (backgrounds/text)
bg-neutral-50 / bg-neutral-900 / text-neutral-900

// Semantic
bg-green-100 text-green-700    // Success
bg-yellow-100 text-yellow-700  // Warning
bg-red-100 text-red-700        // Error
bg-blue-100 text-blue-700      // Info

// Sidebar dark theme
bg-neutral-900 text-white

// Borders
border-neutral-200

// Hover states
hover:bg-neutral-50 / hover:bg-brand-700
```

### Responsive Classes

```tsx
// Sidebar visibility
hidden md:flex md:w-64 md:fixed

// Mobile header visibility
md:hidden

// Grid columns
grid-cols-1 md:grid-cols-2 lg:grid-cols-4

// Padding
px-5 md:px-8 / p-6 md:p-8

// Typography
text-sm md:text-base lg:text-lg
```

### Spacing Scale

```tsx
gap-4   // 16px
gap-6   // 24px

space-y-4    // 16px vertical
space-y-6    // 24px vertical
space-y-8    // 32px vertical

p-6     // 24px padding
p-8     // 32px padding
```

---

## Example: Adding a New Stat

```tsx
// 1. Edit DashboardStats.tsx
const stats = [
  {
    label: "New Metric",
    value: "$9,999",
    change: "+5%",
    trend: "up",
    icon: "📈",
    bgColor: "bg-purple-50",
  },
  // ... existing stats
];

// 2. Component will automatically render in grid
// 3. Responsive: 1→2→4 columns handled by Tailwind
```

---

## Example: Adding a New Navigation Item

```tsx
// 1. Edit DashboardSidebar.tsx
const navigationItems = [
  {
    name: "Analytics Pro",
    href: "/dashboard/analytics-pro",
    icon: "📊",
    badge: null,
  },
  // ... existing items
];

// 2. Item appears in sidebar automatically
// 3. Active state managed by usePathname()
```

---

## Example: Replacing Mock Data

```tsx
// 1. Create API service (lib/api/dashboard.ts)
export async function getStats() {
  const res = await fetch(`${API_URL}/dashboard/stats`);
  return res.json();
}

// 2. Update DashboardStats.tsx
"use client";
import { useEffect, useState } from "react";
import { getStats } from "@/lib/api/dashboard";

export function DashboardStats() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="grid...">
      {stats.map(stat => (...))}
    </div>
  );
}

// 3. Add error handling and retry logic
```

---

## Accessibility Features

### Semantic HTML

```tsx
<nav>           // Navigation wrapper
<button>        // Interactive elements
<main>          // Main content area
<section>       // Content sections
<h1>, <h2>     // Proper heading hierarchy
<a href="">    // Navigation links
```

### ARIA Labels

```tsx
<button aria-label="Toggle sidebar menu">
  {/* Menu icon */}
</button>

<nav aria-label="Main navigation">
  {/* Sidebar items */}
</nav>

<main role="main">
  {/* Main content */}
</main>
```

### Focus Management

```tsx
// Buttons have visible focus outline
*:focus-visible {
  outline: 2px solid theme("colors.brand.DEFAULT");
  outline-offset: 3px;
  border-radius: 4px;
}

// Tab navigation works throughout dashboard
```

---

## Performance Considerations

### Already Optimized ✅

- CSS-only animations (no JavaScript overhead)
- No unnecessary re-renders
- Lazy-loading ready for charts
- Image optimization compatible
- Small bundle size

### Future Optimizations

```tsx
// 1. Lazy load charts on desktop only
const DashboardCharts = dynamic(
  () => import("@/components/dashboard/DashboardCharts"),
  { loading: () => <ChartSkeleton /> }
);

// 2. Pagination to reduce table data
// 3. Caching for API responses
// 4. Code splitting for subpages
```

---

## Testing Checklist

### Unit Tests (To Add)

- [ ] DashboardSidebar nav items render
- [ ] DashboardHeader business selector works
- [ ] DashboardStats cards display correctly
- [ ] DashboardTables pagination works
- [ ] RecentActivity timeline renders

### Integration Tests (To Add)

- [ ] Business selector changes stats
- [ ] Mobile sidebar toggle works
- [ ] All sections render together
- [ ] Responsive behavior at breakpoints

### E2E Tests (To Add)

- [ ] Full dashboard load
- [ ] Business switching flow
- [ ] Navigation to subpages
- [ ] Mobile experience end-to-end

---

## Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Supported |
| Firefox | 88+ | ✅ Supported |
| Safari | 14+ | ✅ Supported |
| Edge | 90+ | ✅ Supported |
| Mobile Safari | 14+ | ✅ Supported |
| Chrome Mobile | 90+ | ✅ Supported |

---

**Last Updated**: 2026-10-27  
**Maintained By**: Wapsell Frontend Team  
**Co-Authored-By**: Claude Haiku 4.5 <noreply@anthropic.com>
