import React from 'react';
import {
  Text,
  ActivityIndicator,
  View,
  Pressable,
  PressableProps,
} from 'react-native';
import { useIsTablet } from '@/hooks/useResponsive';

/**
 * Button Component (Minimalist Futuristic)
 * High precision, tactile feedback, solid typography.
 * Responsive sizing for phones and tablets.
 */

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string; // Container class override
  textClassName?: string;
}

const variantStyles: Record<
  ButtonVariant,
  { container: string; text: string; loader: string }
> = {
  primary: {
    container: 'bg-primary border border-primary shadow-sm',
    text: 'text-primary-foreground',
    loader: 'hsl(var(--primary-foreground))',
  },
  secondary: {
    container: 'bg-background border border-border',
    text: 'text-foreground',
    loader: 'hsl(var(--foreground))',
  },
  outline: {
    container: 'bg-transparent border border-border',
    text: 'text-foreground',
    loader: 'hsl(var(--foreground))',
  },
  danger: {
    container: 'bg-destructive border border-destructive',
    text: 'text-destructive-foreground',
    loader: 'hsl(var(--destructive-foreground))',
  },
  ghost: {
    container: 'bg-transparent border-transparent',
    text: 'text-muted-foreground',
    loader: 'hsl(var(--muted-foreground))',
  },
};

// Phone size styles
const phoneSizeStyles: Record<
  ButtonSize,
  { container: string; text: string; icon: string }
> = {
  sm: {
    container: 'px-4 py-2 rounded-sm',
    text: 'text-sm font-medium tracking-tight',
    icon: 'mr-1.5',
  },
  md: {
    container: 'px-5 py-3 rounded-md',
    text: 'text-base font-semibold tracking-tight',
    icon: 'mr-2',
  },
  lg: {
    container: 'px-8 py-4 rounded-lg',
    text: 'text-lg font-bold tracking-tight',
    icon: 'mr-3',
  },
};

// Tablet size styles (scaled up)
const tabletSizeStyles: Record<
  ButtonSize,
  { container: string; text: string; icon: string }
> = {
  sm: {
    container: 'px-5 py-2.5 rounded-sm',
    text: 'text-base font-medium tracking-tight',
    icon: 'mr-2',
  },
  md: {
    container: 'px-6 py-3.5 rounded-md',
    text: 'text-lg font-semibold tracking-tight',
    icon: 'mr-2.5',
  },
  lg: {
    container: 'px-10 py-5 rounded-lg',
    text: 'text-xl font-bold tracking-tight',
    icon: 'mr-3',
  },
};

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className,
  textClassName,
  ...props
}: ButtonProps) {
  const isTablet = useIsTablet();
  const variantStyle = variantStyles[variant];
  const sizeStyle = isTablet ? tabletSizeStyles[size] : phoneSizeStyles[size];
  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      disabled={isDisabled}
      {...props}
      style={({ pressed }) => [
        {
          width: fullWidth ? '100%' : 'auto',
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <View
        className={`
          flex-row items-center justify-center
          ${sizeStyle.container}
          ${variantStyle.container}
          ${isDisabled ? 'opacity-50' : ''}
          ${className || ''}
        `}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={variantStyle.loader} />
        ) : (
          <>
            {leftIcon && <View className={sizeStyle.icon}>{leftIcon}</View>}

            <Text
              className={`
                ${sizeStyle.text}
                ${variantStyle.text}
                ${textClassName || ''}
              `}
            >
              {title}
            </Text>

            {rightIcon && (
              <View className={`${sizeStyle.icon} ml-2 mr-0`}>{rightIcon}</View>
            )}
          </>
        )}
      </View>
    </Pressable>
  );
}
