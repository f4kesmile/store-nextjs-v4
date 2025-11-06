import React from 'react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../../ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Eye, Copy } from 'lucide-react';
import { cn } from '../../../lib/utils';

// Status Badge Component
interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  variant = 'default',
  className 
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'danger':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getStatusVariant = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    if (['active', 'completed', 'published', 'approved', 'success'].includes(normalizedStatus)) {
      return 'success';
    }
    if (['pending', 'processing', 'draft', 'review'].includes(normalizedStatus)) {
      return 'warning';
    }
    if (['inactive', 'cancelled', 'rejected', 'failed', 'error'].includes(normalizedStatus)) {
      return 'danger';
    }
    if (['info', 'shipped', 'in_transit'].includes(normalizedStatus)) {
      return 'info';
    }
    return 'default';
  };

  const finalVariant = variant === 'default' ? getStatusVariant(status) : variant;

  return (
    <Badge 
      className={cn(
        getVariantClasses(),
        'capitalize font-medium',
        className
      )}
    >
      {status.replace(/_/g, ' ')}
    </Badge>
  );
};

// Icon Button Component
interface IconButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  variant?: 'ghost' | 'outline' | 'default';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  tooltip?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onClick,
  variant = 'ghost',
  size = 'sm',
  className,
  disabled = false,
  tooltip,
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-8 w-8 p-0';
      case 'md':
        return 'h-10 w-10 p-0';
      case 'lg':
        return 'h-12 w-12 p-0';
      default:
        return 'h-8 w-8 p-0';
    }
  };

  return (
    <Button
      variant={variant}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        getSizeClasses(),
        'hover:bg-gray-100 transition-colors',
        className
      )}
      title={tooltip}
    >
      {icon}
    </Button>
  );
};

// Action Dropdown Component
interface ActionItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'destructive';
  separator?: boolean;
}

interface ActionDropdownProps {
  actions: ActionItem[];
  className?: string;
  disabled?: boolean;
}

export const ActionDropdown: React.FC<ActionDropdownProps> = ({
  actions,
  className,
  disabled = false,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={cn('h-8 w-8 p-0', className)}
          disabled={disabled}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {actions.map((action, index) => (
          <React.Fragment key={index}>
            {action.separator && index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={action.onClick}
              className={cn(
                'flex items-center gap-2 cursor-pointer',
                action.variant === 'destructive' && 'text-red-600 focus:text-red-600'
              )}
            >
              {action.icon}
              {action.label}
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Common action sets for reuse
export const createCommonActions = {
  crud: (onView?: () => void, onEdit?: () => void, onDelete?: () => void): ActionItem[] => [
    ...(onView ? [{ label: 'View', icon: <Eye className="h-4 w-4" />, onClick: onView }] : []),
    ...(onEdit ? [{ label: 'Edit', icon: <Edit className="h-4 w-4" />, onClick: onEdit }] : []),
    ...(onDelete ? [{ 
      label: 'Delete', 
      icon: <Trash2 className="h-4 w-4" />, 
      onClick: onDelete, 
      variant: 'destructive' as const,
      separator: true 
    }] : []),
  ],
  
  copy: (onCopy: () => void): ActionItem => ({
    label: 'Copy',
    icon: <Copy className="h-4 w-4" />,
    onClick: onCopy,
  }),
};

// Form Grid Component for consistent form layouts
interface FormGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}

export const FormGrid: React.FC<FormGridProps> = ({
  children,
  columns = 2,
  className,
}) => {
  const getGridClasses = () => {
    switch (columns) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      default:
        return 'grid-cols-1 md:grid-cols-2';
    }
  };

  return (
    <div className={cn('grid gap-4', getGridClasses(), className)}>
      {children}
    </div>
  );
};