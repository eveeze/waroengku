import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  View,
} from 'react-native';

/**
 * Button Component
 * Reusable button with variants and loading state
 */

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg' | 'small'; // Added 'small' alias

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loading?: boolean; // Alias for isLoading
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  textClassName?: string;
}

const variantStyles: Record<
  ButtonVariant,
  { container: string; text: string }
> = {
  primary: {
    container: 'bg-primary-600 active:bg-primary-700',
    text: 'text-white',
  },
  secondary: {
    container: 'bg-secondary-200 active:bg-secondary-300',
    text: 'text-secondary-800',
  },
  outline: {
    container:
      'bg-transparent border-2 border-primary-600 active:bg-primary-50',
    text: 'text-primary-600',
  },
  danger: {
    container: 'bg-danger-500 active:bg-danger-600',
    text: 'text-white',
  },
  ghost: {
    container: 'bg-transparent active:bg-secondary-100',
    text: 'text-primary-600',
  },
};

const sizeStyles: Record<
  'sm' | 'md' | 'lg',
  { container: string; text: string }
> = {
  sm: {
    container: 'px-3 py-2 rounded-md',
    text: 'text-sm',
  },
  md: {
    container: 'px-4 py-3 rounded-lg',
    text: 'text-base',
  },
  lg: {
    container: 'px-6 py-4 rounded-xl',
    text: 'text-lg',
  },
};

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loading, // Alias
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className,
  textClassName,
  ...props
}: ButtonProps) {
  const variantStyle = variantStyles[variant];
  // Map 'small' to 'sm' for backwards compatibility
  const mappedSize = size === 'small' ? 'sm' : size;
  const sizeStyle = sizeStyles[mappedSize];

  // Support both isLoading and loading props
  const showLoading = isLoading || loading;
  const isDisabled = disabled || showLoading;

  return (
    <TouchableOpacity
      className={`
        flex-row items-center justify-center
        ${sizeStyle.container}
        ${variantStyle.container}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50' : ''}
        ${className || ''}
      `}
      disabled={isDisabled}
      {...props}
    >
      {showLoading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'primary' || variant === 'danger' ? '#fff' : '#3b82f6'
          }
        />
      ) : (
        <>
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <Text
            className={`
              font-semibold
              ${sizeStyle.text}
              ${variantStyle.text}
              ${textClassName || ''}
            `}
          >
            {title}
          </Text>
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
}
