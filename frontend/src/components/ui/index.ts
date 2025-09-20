// KOKOKA Modern Component System
// Unified exports for next-generation school management UI

// Design System
export * from '@/lib/design-system';

// Icon Utilities
export {
  normalizeIcon,
  IconContainer,
  iconSizes,
  iconPatterns,
  getIconConfig,
  createIconComponent,
  type IconSize,
} from '@/lib/icon-utils';

// Core Interactive Components
export {
  Button,
  ButtonGroup,
  buttonVariants,
  type ButtonProps,
} from './button';

// Forms & Inputs
export {
  Form,
  FormSection,
  FormField,
  FormLabel,
  FormDescription,
  FormMessage,
  Input,
  Textarea,
  type InputProps,
} from './form';

// Status & Feedback
export {
  StatusBadge,
  StatusIndicator,
  ProgressStatus,
  StatusCard,
  statusBadgeVariants,
  statusIndicatorVariants,
  type StatusBadgeProps,
  type StatusIndicatorProps,
  type ProgressStatusProps,
  type StatusCardProps,
} from './status';

// Layout & Cards
export {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
  CardActions,
  StatsCard,
  FeatureCard,
  ActionCard,
  cardVariants,
  type CardProps,
  type StatsCardProps,
  type FeatureCardProps,
  type ActionCardProps,
} from './modern-card';

// Legacy Typography (to be replaced)
export {
  Typography,
  Heading,
  Text,
  Label as TypographyLabel,
  Caption,
  typographyVariants,
  type TypographyProps,
} from './typography';

// Loading States
export {
  Loading,
  LoadingSpinner,
  PageLoading,
  CardLoading,
  OverlayLoading,
  ButtonLoading,
  InlineLoading,
  loadingVariants,
  containerVariants,
} from './loading';

// Icons
export {
  Icon,
  StatusIcon,
  IconAvatar,
  iconVariants,
  type IconProps,
} from './icon';

// Legacy Status Badge (deprecated - use StatusBadge from status.tsx)
export {
  StatusBadge as LegacyStatusBadge,
  statusBadgeVariants as legacyStatusBadgeVariants,
  type StatusBadgeProps as LegacyStatusBadgeProps,
} from './status-badge';

// Legacy Form Error (deprecated - use FormMessage from form.tsx)
export {
  FormError,
  FormMessage as LegacyFormMessage,
  FormField as LegacyFormField,
  FormSection as LegacyFormSection,
  type FormMessageType,
} from './form-error';

// Essential Radix UI Components (curated selection)
export { Badge } from './badge';
export { Avatar, AvatarFallback, AvatarImage } from './avatar';
export { Separator } from './separator';
export { Progress } from './progress';
export { Skeleton } from './skeleton';
export { ScrollArea } from './scroll-area';
export { Label } from './label';

// Navigation Components
export {
  Navigation,
  NavigationHeader,
  NavigationContent,
  NavigationFooter,
  NavigationGroup,
  NavigationItem,
  NavigationSubmenu,
  NavigationSubitem,
  NavigationProfile,
  navigationVariants,
  navigationItemVariants,
  type NavigationProps,
  type NavigationItemProps,
} from './navigation';

// Top Navigation & Header Components
export {
  TopNavigation,
  TopNavigationList,
  TopNavigationItem,
  TopNavigationDropdown,
  TopNavigationDropdownItem,
  HeaderBar,
  HeaderContent,
  HeaderUserInfo,
  HeaderAction,
  topNavigationVariants,
  topNavigationItemVariants,
  type TopNavigationProps,
  type TopNavigationItemProps,
  type TopNavigationDropdownProps,
} from './top-navigation';

// Page Layout Components
export {
  PageContainer,
  PageHeader,
  PageTitle,
  PageDescription,
  PageActions,
  PageContent,
  TabContainer,
  TabList,
  Tab,
  TabContent,
  pageContainerVariants,
  pageHeaderVariants,
  pageTitleVariants,
  pageDescriptionVariants,
  pageContentVariants,
  type PageContainerProps,
  type PageHeaderProps,
  type PageTitleProps,
  type PageDescriptionProps,
  type PageActionsProps,
  type PageContentProps,
} from './page';

// Navigation & Overlays
export { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';
export {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet';
export {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './popover';
export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';

// Form Controls
export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
export { Checkbox } from './checkbox';
export { RadioGroup, RadioGroupItem } from './radio-group';
export { Switch } from './switch';

// Data Display
export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';

// Feedback & Alerts
export {
  Alert,
  AlertDescription,
  AlertTitle,
} from './alert';
export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog';

// Menus
export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut,
} from './dropdown-menu';

// Toast System
export { Toaster } from './toaster';
export { toast, useToast } from './use-toast';

// Utility Types
export type {
  VariantProps,
} from 'class-variance-authority';

// Component Recommendations for common patterns
export const ComponentGuide = {
  // Use these modern components
  recommend: {
    buttons: 'Button, ButtonGroup',
    forms: 'Form, FormField, FormSection',
    status: 'StatusBadge, StatusIndicator, StatusCard',
    cards: 'Card, StatsCard, FeatureCard, ActionCard',
    feedback: 'FormMessage, StatusBadge',
  },
  
  // Avoid these legacy components
  deprecated: {
    statusBadge: 'Use StatusBadge from status.tsx instead',
    formError: 'Use FormMessage from form.tsx instead',
    typography: 'Consider using semantic HTML with Tailwind classes',
  },
  
  // Common patterns
  patterns: {
    userForm: 'Form + FormSection + FormField + Input/Select',
    dashboard: 'StatsCard + StatusCard + ActionCard',
    dataTable: 'Table + StatusBadge + DropdownMenu',
    settings: 'FormSection + Switch/Checkbox + Button',
  },
} as const;