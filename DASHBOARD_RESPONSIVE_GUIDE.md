# Dashboard — Responsive Design Guide

**Date**: 2026-10-27  
**Breakpoints**: Mobile (< 640px) | Tablet (640–1024px) | Desktop (1024px+)

---

## Layout Evolution by Breakpoint

### 1. Mobile Layout (< 640px)

```
┌─────────────────────────────────┐
│ ☰    Wapsell    🔔              │  ← Mobile Header (fixed, 64px)
└─────────────────────────────────┘
│                                 │
│  Dashboard                      │
│  October 27, 2026              │
│                                 │
│  ┌───────────────────────────┐  │
│  │ Ventas Hoy                │  │  ← Stats: 1 column
│  │ $12,450                   │  │
│  │ +12.5%                    │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │ Pedidos Pendientes        │  │
│  │ 24                        │  │
│  │ +3                        │  │
│  └───────────────────────────┘  │
│                                 │
│  Charts (full width)            │  ← Charts: 1 column
│  ┌───────────────────────────┐  │
│  │ Ventas por Día            │  │
│  │ [Bar chart]               │  │
│  └───────────────────────────┘  │
│                                 │
│  Tables (full width)            │  ← Tables: 1 column
│  ┌───────────────────────────┐  │
│  │ Pedidos Recientes         │  │
│  │ ORD-001 | Martín | ...    │  │
│  └───────────────────────────┘  │
│                                 │
└─────────────────────────────────┘

Mobile Sidebar (overlay):
┌─────────────────┐
│ W  Wapsell  ✕  │
├─────────────────┤
│ 📊 Dashboard    │
│ 💰 Ventas       │
│ 📦 Inventario   │
│ 👥 Clientes     │
│ 🛒 Pedidos    5 │
│ 📈 Reportes     │
│ ⚙️ Configuración│
├─────────────────┤
│ FM Admin        │
│ Cerrar sesión   │
└─────────────────┘
(100% width, overlay, z-index 25)
```

### 2. Tablet Layout (640–1024px)

```
┌────────────────────────────────────────────────┐
│ ☰    Wapsell    🔔  | Business Selector | FM   │
└────────────────────────────────────────────────┘
│                                                │
│  Dashboard                      (sticky)       │
│  October 27, 2026              Business Sel   │
│                                                │
│  ┌──────────────────┐ ┌──────────────────┐   │
│  │ Ventas Hoy       │ │ Pedidos Pendientes│   │  ← Stats: 2 columns
│  │ $12,450  +12.5%  │ │ 24         +3    │   │
│  └──────────────────┘ └──────────────────┘   │
│  ┌──────────────────┐ ┌──────────────────┐   │
│  │ Clientes Activos │ │ Tasa Conversión  │   │
│  │ 156     +8.2%    │ │ 3.24%     +0.5%  │   │
│  └──────────────────┘ └──────────────────┘   │
│                                                │
│  ┌────────────────────┐ ┌─────────────────┐  │
│  │ Ventas por Día     │ │ Pedidos por Día │  │  ← Charts: 2 columns
│  │ [Bar chart]        │ │ [Bar chart]     │  │
│  └────────────────────┘ └─────────────────┘  │
│  ┌────────────────────┐ ┌─────────────────┐  │
│  │ Top Categorías     │ │ Desempeño       │  │
│  │ [Progress bars]    │ │ [KPI cards]     │  │
│  └────────────────────┘ └─────────────────┘  │
│                                                │
│  ┌────────────────────┐ ┌─────────────────┐  │
│  │ Pedidos Recientes  │ │ Top Clientes    │  │  ← Tables: 2 columns
│  │ [Table with 5 items]│ │ [Customer list] │  │
│  └────────────────────┘ └─────────────────┘  │
│                                                │
│  Actividad Reciente (full width)              │
│  ┌──────────────────────────────────────────┐ │
│  │ 🛒 Almacén Don Pedro realizó un pedido  │ │
│  │    Pack de 6 Bebidas - $125.50          │ │
│  │    Hace 2 horas                          │ │
│  └──────────────────────────────────────────┘ │
│                                                │
└────────────────────────────────────────────────┘
```

### 3. Desktop Layout (1024px+)

```
┌────────────────┬─────────────────────────────────────────────────────┐
│ W             │ Dashboard                           | Business Sel | FM
│ Wapsell       │ October 27, 2026                                      │
├────────────────┼─────────────────────────────────────────────────────┤
│                │                                                       │
│ 📊 Dashboard   │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──┐
│                │  │Ventas Hoy   │ │Pedidos...   │ │Clientes... │ │Ta│
│ 💰 Ventas      │  │$12,450      │ │24        +3 │ │156   +8.2% │ │sa│
│                │  │  +12.5%     │ └─────────────┘ └─────────────┘ └──┘
│ 📦 Inventario  │  └─────────────┘
│                │
│ 👥 Clientes    │  ┌────────────────────────────┐ ┌──────────────────┐
│                │  │ Ventas por Día             │ │ Pedidos por Día  │
│ 🛒 Pedidos   5 │  │ [Bar Chart, 7-day view]    │ │ [Horizontal bars]│
│                │  │                            │ │                  │
│ 📈 Reportes    │  └────────────────────────────┘ └──────────────────┘
│                │
│ ⚙️ Config.     │  ┌────────────────────────────┐ ┌──────────────────┐
│                │  │ Top Categorías             │ │ Desempeño        │
│ ────────────── │  │ [Stacked bars]             │ │ [KPI cards]      │
│ FM Admin       │  │                            │ │                  │
│ Cerrar sesión  │  └────────────────────────────┘ └──────────────────┘
│                │
│                │  ┌────────────────────────────┐ ┌──────────────────┐
│                │  │ Pedidos Recientes          │ │ Top Clientes     │
│                │  │ [Table, paginated]         │ │ [Customer list]  │
│                │  │                            │ │                  │
│                │  └────────────────────────────┘ └──────────────────┘
│                │
│                │  Actividad Reciente (full width, below tables)
│                │  ┌───────────────────────────────────────────────────┐
│                │  │ 🛒 Almacén Don Pedro realizó un pedido          │
│                │  │    Pack de 6 Bebidas - $125.50  Hace 2 horas    │
│                │  └───────────────────────────────────────────────────┘
│                │
└────────────────┴─────────────────────────────────────────────────────┘

Sidebar: 256px fixed left panel
Content: Remaining width
```

---

## Component Responsive Utilities

### Sidebar

```tsx
{/* Hidden on mobile, visible on desktop */}
<div className="hidden md:flex md:w-64 md:flex-col md:fixed">
  <DashboardSidebar />
</div>
```

- **Mobile**: Hidden (`hidden`)
- **Tablet+**: Visible (`md:flex`), 256px width, fixed position, flex column layout

### Mobile Header

```tsx
{/* Visible only on mobile */}
<div className="md:hidden fixed top-0 left-0 right-0 z-30">
  <DashboardMobileHeader />
</div>
```

- **Mobile**: Visible, 64px height, fixed top
- **Tablet+**: Hidden (`md:hidden`)

### Stats Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
```

- **Mobile**: 1 column (`grid-cols-1`)
- **Tablet**: 2 columns (`md:grid-cols-2`)
- **Desktop**: 4 columns (`lg:grid-cols-4`)

### Charts Grid

```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
```

- **Mobile/Tablet**: 1 column
- **Desktop**: 2 columns (`lg:grid-cols-2`)

### Tables Grid

```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
```

- **Mobile/Tablet**: 1 column
- **Desktop**: 2 columns

### Padding/Spacing

```tsx
<div className="px-5 md:px-8">  {/* 20px mobile, 32px desktop */}
  {/* Content */}
</div>

<div className="p-6 md:p-8">    {/* 24px mobile, 32px desktop */}
  {/* Content */}
</div>
```

### Typography

```tsx
<h1 className="text-3xl md:text-4xl">  {/* Scales by breakpoint */}
  Dashboard
</h1>
```

---

## Tailwind Breakpoints Used

| Breakpoint | Min Width | Use Case              |
|------------|-----------|----------------------|
| (default)  | 0px       | Mobile styles         |
| `sm`       | 640px     | Small phones          |
| `md`       | 1024px    | Tablets, small desks  |
| `lg`       | 1280px    | Large desktops        |
| `xl`       | 1536px    | XL monitors           |

**Note**: Only `md` and `lg` used in dashboard implementation.

---

## Touch-Friendly Sizing

### Button & Interactive Elements

- **Minimum tap target**: 44px × 44px (iOS) / 48px × 48px (Android)
- All buttons: `px-6 py-3` (24px × 12px minimum)
- Avatar buttons: `w-10 h-10` (40px × 40px)

### Spacing Between Elements

- **Mobile**: `gap-4` to `gap-6` (16px–24px)
- **Density**: Less compact on mobile for readability

---

## Mobile Navigation Flow

### 1. User taps menu button (☰)

```
Initial State:
┌─────────────────────┐
│ ☰  Wapsell  🔔      │
└─────────────────────┘
```

### 2. Sidebar overlay appears

```
Overlay Active:
┌─────────────────────┐
│ ☰  Wapsell  🔔      │  ← Header (still visible)
└─────────────────────┘
┌─────────────────────┐
│ 🔲 Dark Overlay     │  ← z-index 20
│ ┌─────────────────┐ │
│ │ W  Wapsell  ✕  │ │  ← Sidebar z-index 25
│ │ 📊 Dashboard    │ │
│ │ 💰 Ventas      │ │
│ │ ...             │ │
│ │ Cerrar sesión   │ │
│ └─────────────────┘ │
└─────────────────────┘
```

### 3. User taps item or closes

- **Tap item**: Navigate to page, sidebar auto-closes
- **Tap overlay**: Sidebar closes
- **Tap ✕ button**: Sidebar closes

---

## Performance Optimizations

### Lazy Loading Ready

```tsx
// Charts/tables can be lazy-loaded on desktop only
const DashboardCharts = dynamic(
  () => import("@/components/dashboard/DashboardCharts"),
  { loading: () => <ChartSkeleton /> }
);
```

### Mobile-First CSS

All styles written mobile-first, with `md:` and `lg:` prefixes for larger screens:

```tsx
// ✅ Good: Mobile default, scale up
className="text-sm md:text-base lg:text-lg"

// ❌ Bad: Desktop default, scale down
className="text-lg md:text-base sm:text-sm"
```

### Image Optimization

For future chart/asset images:

```tsx
<Image
  src="/chart.png"
  alt="Sales chart"
  width={600}
  height={400}
  className="w-full h-auto"
  // Next.js handles responsive sizes
/>
```

---

## Testing Checklist

### Mobile (375px)

- [ ] Menu toggle works
- [ ] Sidebar overlay visible and closable
- [ ] Stats: 1 column, full width
- [ ] Charts: Stack vertically
- [ ] Tables: Full width, scrollable if needed
- [ ] Typography: Readable, not cramped
- [ ] Buttons: Tappable (40px+)
- [ ] Spacing: Comfortable gaps

### Tablet (768px)

- [ ] Menu still available but sidebar may be visible
- [ ] Stats: 2 columns
- [ ] Charts: Still stacked or 2 columns
- [ ] Tables: 2 columns side-by-side
- [ ] No horizontal scroll

### Desktop (1200px)

- [ ] Sidebar visible, fixed left
- [ ] Stats: 4 columns
- [ ] Charts: 2 columns
- [ ] Tables: 2 columns
- [ ] All content visible without scroll

---

## Common Responsive Patterns

### Pattern: Hide on Mobile

```tsx
<div className="hidden md:block">
  {/* Only visible on tablet+ */}
</div>
```

### Pattern: Show Only on Mobile

```tsx
<div className="md:hidden">
  {/* Only visible on mobile */}
</div>
```

### Pattern: Conditional Layout

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  {/* Adapts column count and gap by breakpoint */}
</div>
```

### Pattern: Responsive Padding

```tsx
<div className="px-4 sm:px-6 md:px-8 lg:px-10">
  {/* Padding increases at each breakpoint */}
</div>
```

### Pattern: Responsive Typography

```tsx
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
  {/* Size increases progressively */}
</h1>
```

---

## Accessibility Notes

### Mobile Consideration

- Touch targets: 44px minimum
- Avoid hover-only interactions (use active/focus)
- Keyboard navigation works on all devices
- Screen readers announce all sections

### Viewport Meta Tag

Already in Next.js layout:

```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

---

**Last Updated**: 2026-10-27  
**Co-Authored-By**: Claude Haiku 4.5 <noreply@anthropic.com>
