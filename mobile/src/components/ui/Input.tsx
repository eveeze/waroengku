import React, { forwardRef } from 'react';
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  View,
  Text,
} from 'react-native';

/**
 * Input Component
 * Reusable text input with label and error state
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
    const hasError = !!error;

    return (
      <View className="mb-5">
        {label && (
          <Text className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-2 font-body">
            {label}
          </Text>
        )}
        <View
          className={`
            flex-row items-center
            bg-muted border rounded-lg px-4
            ${hasError ? 'border-destructive' : 'border-border'}
            focus-within:border-primary focus-within:bg-background focus-within:shadow-sm
          `}
        >
          {leftIcon && <View className="mr-3">{leftIcon}</View>}
          <RNTextInput
            ref={ref}
            className={`
              flex-1 py-3.5 text-base font-bold text-foreground font-heading
              ${className || ''}
            `}
            placeholderTextColor="hsl(var(--muted-foreground))"
            {...props}
          />
          {rightIcon && <View className="ml-3">{rightIcon}</View>}
        </View>
        {hasError && (
          <Text className="text-xs font-medium text-destructive mt-1.5 ml-1 font-body">
            {error}
          </Text>
        )}
        {!hasError && helperText && (
          <Text className="text-xs text-secondary-400 mt-1.5 ml-1 font-body">
            {helperText}
          </Text>
        )}
      </View>
    );
  },
);

Input.displayName = 'Input';
