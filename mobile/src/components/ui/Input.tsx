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
  ({ label, error, helperText, leftIcon, rightIcon, className, ...props }, ref) => {
    const hasError = !!error;

    return (
      <View className="mb-4">
        {label && (
          <Text className="text-sm font-medium text-secondary-700 mb-2">
            {label}
          </Text>
        )}
        <View
          className={`
            flex-row items-center
            bg-white border rounded-lg px-4
            ${hasError ? 'border-danger-500' : 'border-secondary-300'}
            focus-within:border-primary-500
          `}
        >
          {leftIcon && <View className="mr-3">{leftIcon}</View>}
          <RNTextInput
            ref={ref}
            className={`
              flex-1 py-3 text-base text-secondary-900
              ${className || ''}
            `}
            placeholderTextColor="#94a3b8"
            {...props}
          />
          {rightIcon && <View className="ml-3">{rightIcon}</View>}
        </View>
        {hasError && (
          <Text className="text-sm text-danger-500 mt-1">{error}</Text>
        )}
        {!hasError && helperText && (
          <Text className="text-sm text-secondary-500 mt-1">{helperText}</Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';
