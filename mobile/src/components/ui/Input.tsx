import React, { forwardRef } from 'react';
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  View,
  Text,
} from 'react-native';
import { useIsTablet } from '@/hooks/useResponsive';

/**
 * Input Component
 * Reusable text input with label and error state
 * Responsive sizing for phones and tablets
 */

interface InputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<RNTextInput, InputProps>(
  (
    { label, error, helperText, leftIcon, rightIcon, className, ...props },
    ref,
  ) => {
    const isTablet = useIsTablet();
    const hasError = !!error;

    return (
      <View className={isTablet ? 'mb-6' : 'mb-5'}>
        {label && (
          <Text
            className={`font-bold tracking-widest text-muted-foreground uppercase mb-2 font-body ${
              isTablet ? 'text-sm' : 'text-xs'
            }`}
          >
            {label}
          </Text>
        )}
        <View
          className={`
            flex-row items-center
            bg-muted border rounded-lg
            ${isTablet ? 'px-5' : 'px-4'}
            ${hasError ? 'border-destructive' : 'border-border'}
            focus-within:border-primary focus-within:bg-background focus-within:shadow-sm
          `}
        >
          {leftIcon && (
            <View className={isTablet ? 'mr-4' : 'mr-3'}>{leftIcon}</View>
          )}
          <RNTextInput
            ref={ref}
            className={`
              flex-1 font-black text-foreground font-heading
              ${isTablet ? 'py-5 text-2xl' : 'py-4 text-xl'}
              ${className || ''}
            `}
            placeholderTextColor="hsl(var(--muted-foreground))"
            {...props}
          />
          {rightIcon && (
            <View className={isTablet ? 'ml-4' : 'ml-3'}>{rightIcon}</View>
          )}
        </View>
        {hasError && (
          <Text
            className={`font-medium text-destructive mt-1.5 ml-1 font-body ${
              isTablet ? 'text-sm' : 'text-xs'
            }`}
          >
            {error}
          </Text>
        )}
        {!hasError && helperText && (
          <Text
            className={`text-secondary-400 mt-1.5 ml-1 font-body ${
              isTablet ? 'text-sm' : 'text-xs'
            }`}
          >
            {helperText}
          </Text>
        )}
      </View>
    );
  },
);

Input.displayName = 'Input';
