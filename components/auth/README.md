# Auth Components

This directory contains reusable authentication components for Wapsell signup and login flows.

## Components

### RegisterForm

Reusable signup form component with built-in validation, error handling, and API integration.

#### Features
- Form validation (name, email, password, terms)
- Real-time error clearing on user input
- Loading state with spinner
- Success/error alert handling
- Terms and privacy checkbox
- Responsive design (mobile-first)
- Accessibility (ARIA labels, focus rings)
- Email normalization (lowercase, trim)

#### Usage

```tsx
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function SignupPage() {
  return (
    <RegisterForm
      onSuccess={() => {
        // Handle successful registration
        router.push("/onboarding");
      }}
      onError={(error) => {
        // Handle error
        console.error(error);
      }}
    >
      {/* Optional: Custom content before form fields */}
      <div className="mb-4">
        <p>Create your account to get started</p>
      </div>
    </RegisterForm>
  );
}
```

#### Props

```tsx
interface RegisterFormProps {
  onSuccess?: () => void;          // Callback on successful registration
  onError?: (error: string) => void; // Callback on error
  children?: ReactNode;             // Optional content to inject
}
```

#### Validation Rules

| Field | Rules |
|-------|-------|
| Name | Min 2 characters (trimmed) |
| Email | Valid email format (RFC 5322 simplified) |
| Password | Min 8 chars, 1 uppercase, 1 number |
| Confirm Password | Must match password field |
| Terms | Must be checked |

#### Error Messages

```
Name:
- "El nombre debe tener al menos 2 caracteres"

Email:
- "Por favor ingresa un email válido"

Password:
- "La contraseña debe tener al menos 8 caracteres"
- "La contraseña debe contener una mayúscula"
- "La contraseña debe contener un número"

Password Confirm:
- "Las contraseñas no coinciden"

Terms:
- "Debes aceptar los términos y condiciones"
```

#### Styling

All styles use Tailwind CSS utility classes from the Wapsell design system:

- **Colors**: Brand terracotta (#D97757), cream background (#FAF9F5)
- **Typography**: Inter (UI) + Fraunces (display)
- **Spacing**: 4px base unit scale
- **Responsive**: Mobile-first approach

#### States

**Default State**
- All inputs: border-neutral-200
- Button: bg-brand-600, cursor-pointer
- Checkbox: unchecked

**Focus State**
- Focus ring: 2px solid brand-600, 3px offset
- Input border: brand-600
- Ring: brand-100

**Error State**
- Input border: red-500
- Input background: red-50
- Error text: red-600
- Persists until user starts typing

**Loading State**
- Spinner icon in button
- Button text: "Creando cuenta..."
- All inputs: disabled
- Cursor: not-allowed

**Success State**
- Alert: bg-green-50, border-green-200
- Icon: ✓
- Animation: pulse
- Auto-redirect after 2 seconds

#### API Integration

**Endpoint**: `POST {NEXT_PUBLIC_API_URL}/auth/register`

**Request**:
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "SecurePass123"
}
```

**Success Response** (200):
```json
{
  "accessToken": "eyJhbGc...",
  "cliente": {
    "id": "user_123",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "empresaId": "empresa_456"
  }
}
```

**Error Response** (4xx/5xx):
```json
{
  "detail": "El email ya está registrado"
}
```

#### Storage

On successful registration, the form stores:
- `accessToken` → JWT token (API authentication)
- `wapsell_token` → Same token (backward compatibility)
- `user` → User object (JSON stringified)
- `empresaId` → User's company ID

#### Mobile Responsiveness

| Breakpoint | Logo Size | Padding | Button Height |
|-----------|-----------|---------|---|
| Mobile (<640px) | text-3xl | p-4 | py-4 |
| Tablet (640px+) | text-4xl | p-4 md:p-6 | py-4 |
| Desktop (1024px+) | text-4xl | p-6 md:p-8 | py-4 |

Max width always: `max-w-md` (448px)

#### Accessibility

- ✓ Semantic HTML (`<form>`, `<label>`, `<input>`)
- ✓ ARIA labels on all inputs
- ✓ Focus ring visible on all elements
- ✓ Error messages associated with fields
- ✓ Tab order preserved
- ✓ Disabled button not focusable
- ✓ Color contrast 9:1+ (WCAG AAA)
- ✓ Touch targets min 48px

---

## File Organization

```
components/auth/
├── RegisterForm.tsx  ← Main form component
├── README.md         ← This file
└── (future: LoginForm, ResetPasswordForm, etc.)
```

## Design System Reference

See `docs/SIGNUP_DESIGN_SPEC.md` for complete design specifications including:
- Color palette
- Typography scales
- Spacing system
- Responsive grid
- Component variants
- Validation rules
- Testing checklist

## Related Files

- **Page**: `app/[locale]/auth/register/page.tsx`
- **UI Components**: `components/ui/{Button,Input,Card}`
- **Styles**: `app/globals.css`
- **Config**: `tailwind.config.ts`

---

## Browser Support

- ✓ Chrome 90+
- ✓ Firefox 88+
- ✓ Safari 14+
- ✓ Edge 90+
- ✓ Mobile browsers (iOS Safari 14+, Chrome Android)

## Version

**Created**: 2026-10-27  
**Last Updated**: 2026-10-27  
**Status**: Production Ready
