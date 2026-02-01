import React, { useRef } from 'react';
import {
  Text,
  ActivityIndicator,
  View,
  Pressable,
  Animated,
  PressableProps,
} from 'react-native';

/**
 * Button Component (Minimalist Futuristic)
 * High precision, tactile feedback, solid typography.
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
    container: 'bg-primary-900 border border-primary-900 shadow-sm',
    text: 'text-primary-50',
    loader: '#fafafa',
  },
  secondary: {
    container: 'bg-white border border-secondary-200',
    text: 'text-primary-900',
    loader: '#18181b', // primary-900
  },
  outline: {
    container: 'bg-transparent border border-secondary-300',
    text: 'text-primary-900',
    loader: '#18181b',
  },
  danger: {
    container: 'bg-danger-600 border border-danger-600',
    text: 'text-white',
    loader: '#fff',
  },
  ghost: {
    container: 'bg-transparent border-transparent',
    text: 'text-primary-600',
    loader: '#18181b',
  },
};

const sizeStyles: Record<
  ButtonSize,
  { container: string; text: string; icon: string }
> = {
  sm: {
    container: 'px-4 py-2 rounded-md',
    text: 'text-sm font-medium tracking-tight',
    icon: 'mr-1.5',
  },
  md: {
    container: 'px-5 py-3 rounded-lg',
    text: 'text-base font-semibold tracking-tight',
    icon: 'mr-2',
  },
  lg: {
    container: 'px-8 py-4 rounded-xl',
    text: 'text-lg font-bold tracking-tight',
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
  const scale = useRef(new Animated.Value(1)).current;

  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];
  const isDisabled = disabled || isLoading;

  const handlePressIn = () => {
    if (isDisabled) return;
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 20,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    if (isDisabled) return;
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  return (
    <Pressable
      disabled={isDisabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...props}
      style={{ width: fullWidth ? '100%' : 'auto' }}
    >
      <Animated.View
        className={`
          flex-row items-center justify-center
          transform
          ${sizeStyle.container}
          ${variantStyle.container}
          ${isDisabled ? 'opacity-50' : ''}
          ${className || ''}
        `}
        style={{ transform: [{ scale }] }}
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
      </Animated.View>
    </Pressable>
  );
}
