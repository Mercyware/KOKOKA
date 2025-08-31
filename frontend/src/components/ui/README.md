# KOKOKA Modern Component System

A next-generation component library built specifically for KOKOKA school management system. This is a completely new design system without backward compatibility constraints.

## 🎯 Philosophy

This component system is built with these principles:
- **Modern First**: No legacy baggage, built for 2024+
- **Accessibility Built-in**: WCAG 2.1 AA compliance by default
- **Dark Mode Native**: Every component supports dark mode
- **TypeScript Native**: Full type safety and IntelliSense
- **Performance Focused**: Tree-shakeable, optimized renders
- **Design System Driven**: Consistent tokens and patterns

## 🚀 Quick Start

```tsx
import {
  Button,
  Form,
  FormField,
  Input,
  StatusBadge,
  Card,
  StatsCard
} from '@/components/ui';

function UserRegistration() {
  return (
    <Form spacing="lg">
      <Card variant="elevated">
        <FormField 
          label="Email" 
          required 
          description="Your school email address"
        >
          <Input 
            type="email" 
            leftIcon={<MailIcon />}
            placeholder="admin@yourschool.edu"
          />
        </FormField>
        
        <Button 
          intent="primary" 
          size="lg" 
          loading={isSubmitting}
          width="full"
        >
          Create Account
        </Button>
      </Card>
    </Form>
  );
}
```

## 🎨 Design System

### Design Tokens (`design-system.ts`)

Our design system provides a comprehensive set of tokens:

```tsx
import { palette, tokens, theme } from '@/lib/design-system';

// Colors
palette.brand.primary[500]     // Primary blue
palette.semantic.success[600]  // Success green
palette.neutral[200]           // Light gray

// Typography
tokens.typography.fontSize.lg  // [18px, 28px]
tokens.typography.fontWeight.semibold // 600

// Spacing
tokens.spacing[4]             // 16px
tokens.spacing[6]             // 24px

// Components
components.button.height.md   // 40px
components.card.borderRadius  // 8px
```

### Color Palette

- **Brand Colors**: Blue primary, purple secondary
- **Semantic Colors**: Success (green), error (red), warning (amber), info (blue)
- **Neutral Scale**: 11-step gray scale from 50-950
- **Dark Mode**: Every color has dark mode equivalent

## 🧩 Core Components

### 1. Button System

Modern button component with multiple intents and built-in loading states:

```tsx
// Intent-based variants
<Button intent="primary">Primary Action</Button>
<Button intent="secondary">Secondary</Button>
<Button intent="success">Approve</Button>
<Button intent="danger">Delete</Button>

// Advanced features
<Button 
  intent="primary"
  size="lg"
  leftIcon={<SaveIcon />}
  loading={isSaving}
  loadingText="Saving..."
  pulse={hasUpdates}
>
  Save Changes
</Button>

// Icon-only buttons
<Button intent="ghost" iconOnly={<EditIcon />} size="sm" />

// Button groups
<ButtonGroup orientation="horizontal">
  <Button intent="secondary">Cancel</Button>
  <Button intent="primary">Confirm</Button>
</ButtonGroup>
```

### 2. Form System

Comprehensive form components with built-in validation and accessibility:

```tsx
<Form spacing="lg">
  <FormSection 
    title="User Information"
    description="Basic details for the new user"
    icon={<UserIcon />}
  >
    <FormField 
      label="Full Name" 
      required
      description="Enter the user's complete name"
      error={errors.name}
    >
      <Input 
        leftIcon={<UserIcon />}
        clearable
        onClear={() => setName('')}
      />
    </FormField>
    
    <FormField label="Bio" optional>
      <Textarea 
        variant="default"
        resize="vertical"
        rows={4}
      />
    </FormField>
  </FormSection>
</Form>
```

### 3. Status System

Comprehensive status indicators for different contexts:

```tsx
// Status badges
<StatusBadge status="success">Active</StatusBadge>
<StatusBadge status="processing" animate>Processing</StatusBadge>
<StatusBadge status="error" variant="solid">Failed</StatusBadge>

// Status indicators (minimal dots)
<StatusIndicator status="success" pulse />

// Progress status for multi-step processes
<ProgressStatus
  orientation="horizontal"
  steps={[
    { id: '1', label: 'Submit', status: 'completed' },
    { id: '2', label: 'Review', status: 'current' },
    { id: '3', label: 'Approve', status: 'pending' },
  ]}
/>

// Status cards for detailed status display
<StatusCard
  status="warning"
  title="Action Required"
  description="Please review these pending applications"
  action={<Button size="sm">Review</Button>}
/>
```

### 4. Card System

Modern card components for different use cases:

```tsx
// Basic cards
<Card variant="elevated" padding="lg">
  <CardHeader>
    <CardTitle>User Profile</CardTitle>
    <CardDescription>Manage your account settings</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    <CardActions justify="end">
      <Button intent="primary">Save</Button>
    </CardActions>
  </CardFooter>
</Card>

// Stats cards for metrics
<StatsCard
  title="Total Students"
  value="1,245"
  trend={{ value: "+12%", direction: "up", label: "from last month" }}
  icon={<UsersIcon />}
  variant="elevated"
/>

// Feature cards for highlighting services
<FeatureCard
  title="AI Insights"
  description="Get intelligent analytics for better decisions"
  icon={<BrainIcon />}
  featured
  action={<Button intent="primary">Learn More</Button>}
/>

// Action cards for lists/directories
<ActionCard
  title="John Smith"
  description="Grade 10 - Mathematics Teacher"
  meta="Last active 2 hours ago"
  status={<StatusBadge status="success" size="sm">Online</StatusBadge>}
  actions={
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button intent="ghost" iconOnly={<MoreIcon />} size="sm" />
      </DropdownMenuTrigger>
      {/* Menu items */}
    </DropdownMenu>
  }
/>
```

## 📋 Common Patterns

### User Registration Form

```tsx
function RegistrationForm() {
  return (
    <Card variant="elevated" className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Join KOKOKA school management</CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form spacing="md">
          <FormField label="School Name" required>
            <Input leftIcon={<SchoolIcon />} />
          </FormField>
          
          <FormField label="Admin Email" required>
            <Input type="email" leftIcon={<MailIcon />} />
          </FormField>
          
          <FormField label="Password" required>
            <Input type="password" />
          </FormField>
        </Form>
      </CardContent>
      
      <CardFooter>
        <Button intent="primary" size="lg" width="full">
          Create Account
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### Dashboard Stats Section

```tsx
function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatsCard
        title="Total Students"
        value="1,245"
        trend={{ value: "+12%", direction: "up" }}
        icon={<UsersIcon />}
      />
      
      <StatsCard
        title="Active Teachers"
        value="67"
        trend={{ value: "+3", direction: "up" }}
        icon={<UserCheckIcon />}
      />
      
      <StatsCard
        title="Completion Rate"
        value="94.2%"
        trend={{ value: "+2.1%", direction: "up" }}
        icon={<TrendingUpIcon />}
      />
    </div>
  );
}
```

### Student List with Actions

```tsx
function StudentList() {
  return (
    <div className="space-y-4">
      {students.map(student => (
        <ActionCard
          key={student.id}
          title={student.name}
          description={`${student.grade} - ${student.class}`}
          meta={`ID: ${student.studentId}`}
          status={<StatusBadge status={student.status} size="sm" />}
          actions={
            <ButtonGroup>
              <Button intent="ghost" size="sm" leftIcon={<EyeIcon />}>
                View
              </Button>
              <Button intent="ghost" size="sm" leftIcon={<EditIcon />}>
                Edit
              </Button>
            </ButtonGroup>
          }
        />
      ))}
    </div>
  );
}
```

## 🎨 Customization

### Extending Components

```tsx
// Create custom variants
const customButtonVariants = cva(
  [...buttonVariants.base],
  {
    variants: {
      ...buttonVariants.variants,
      intent: {
        ...buttonVariants.variants.intent,
        school: 'bg-gradient-to-r from-green-500 to-blue-500 text-white',
      }
    }
  }
);

// Custom component
const SchoolButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => (
    <Button 
      ref={ref} 
      className={cn(customButtonVariants({ intent: 'school' }), className)}
      {...props} 
    />
  )
);
```

### Theme Customization

```tsx
// Extend the design system
const customTheme = {
  ...theme,
  light: {
    ...theme.light,
    background: {
      ...theme.light.background,
      primary: '#f8fafc', // Custom background
    }
  }
};
```

## 🔧 Development

### Component Architecture

Each component follows this structure:
- **Variants**: Using `class-variance-authority` for type-safe variants
- **Composition**: Compound components for complex patterns
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **TypeScript**: Full type safety with proper prop interfaces

### Performance

- **Tree Shaking**: Import only what you need
- **Bundle Size**: Optimized for minimal impact
- **React Patterns**: Proper memo usage, stable references
- **CSS**: Utility-first with Tailwind, no CSS-in-JS overhead

### Testing

Components include:
- Unit tests with Jest and React Testing Library
- Visual regression tests with Chromatic
- Accessibility tests with axe-core
- Type checking with TypeScript

## 🚀 Migration from Legacy

This system replaces all legacy components. Use the ComponentGuide for recommendations:

```tsx
import { ComponentGuide } from '@/components/ui';

// See what to use instead of legacy components
console.log(ComponentGuide.recommend.buttons); // "Button, ButtonGroup"
console.log(ComponentGuide.deprecated.formError); // Migration advice
```

## 📚 Component Reference

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `Button` | Interactive actions | `intent`, `size`, `loading`, `leftIcon` |
| `Form` | Form containers | `spacing` |
| `FormField` | Form field wrapper | `label`, `required`, `error`, `description` |
| `Input` | Text input | `variant`, `leftIcon`, `rightIcon`, `clearable` |
| `StatusBadge` | Status indicators | `status`, `variant`, `animate` |
| `Card` | Content containers | `variant`, `padding` |
| `StatsCard` | Metric display | `title`, `value`, `trend`, `icon` |
| `ActionCard` | Interactive list items | `title`, `description`, `actions`, `status` |

## 🎯 Best Practices

1. **Use Intent Over Color**: `<Button intent="primary">` not `<Button className="bg-blue-500">`
2. **Semantic Status**: Use meaningful status values like `success`, `error`, `warning`
3. **Consistent Spacing**: Use form `spacing` props instead of custom margins
4. **Accessibility First**: Always provide labels, descriptions, and ARIA attributes
5. **Performance**: Use `React.memo` for heavy components, stable references for props
6. **TypeScript**: Let TypeScript guide you with proper prop types and IntelliSense

This component system provides everything needed for a modern, accessible, and maintainable school management interface. All components are designed to work together seamlessly while providing the flexibility needed for complex educational workflows.