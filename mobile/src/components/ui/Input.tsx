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
          <Text className="text-xs font-bold tracking-widest text-secondary-500 uppercase mb-2 font-body">
            {label}
          </Text>
        )}
        <View
          className={`
            flex-row items-center
            bg-secondary-50 border rounded-lg px-4
            ${hasError ? 'border-danger-500' : 'border-secondary-200'}
            focus-within:border-primary-900 focus-within:bg-white focus-within:shadow-sm
          `}
        >
          {leftIcon && <View className="mr-3">{leftIcon}</View>}
          <RNTextInput
            ref={ref}
            className={`
              flex-1 py-3.5 text-base font-bold text-primary-900 font-heading
              ${className || ''}
            `}
            placeholderTextColor="#a1a1aa"
            {...props}
          />
          {rightIcon && <View className="ml-3">{rightIcon}</View>}
        </View>
        {hasError && (
          <Text className="text-xs font-medium text-danger-600 mt-1.5 ml-1 font-body">
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
