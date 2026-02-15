import React from 'react';
import { View, ViewProps, Text, TouchableOpacity } from 'react-native';
import { useIsTablet } from '@/hooks/useResponsive';

/**
 * Card Component
 * Reusable card container with optional header
 * Responsive sizing for phones and tablets
 */

interface CardAction {
  title: string;
  onPress: () => void;
}

interface CardProps extends ViewProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  actions?: CardAction[]; // Array of action buttons
}

export function Card({
  title,
  subtitle,
  action,
  actions,
  children,
  className,
  ...props
}: CardProps) {
  const isTablet = useIsTablet();

  return (
    <View
      className={`
        bg-background rounded-none
        border border-border
        ${className || ''}
      `}
      {...props}
    >
      {(title || subtitle || action || actions) && (
        <View
          className={`flex-row items-center justify-between border-b border-border ${
            isTablet ? 'px-6 py-5' : 'px-5 py-4'
          }`}
        >
          <View className="flex-1">
            {title && (
              <Text
                className={`font-heading font-black uppercase tracking-tight text-foreground ${
                  isTablet ? 'text-2xl' : 'text-xl'
                }`}
              >
                {title}
              </Text>
            )}
            {subtitle && (
              <Text
                className={`font-bold uppercase tracking-widest text-muted-foreground font-body mt-1 ${
                  isTablet ? 'text-xs' : 'text-[10px]'
                }`}
              >
                {subtitle}
              </Text>
            )}
          </View>
          <View className="flex-row items-center">
            {actions?.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={item.onPress}
                className={`bg-muted rounded-none border border-border ${
                  isTablet ? 'ml-4 px-4 py-2' : 'ml-3 px-3 py-1.5'
                }`}
              >
                <Text
                  className={`font-bold text-foreground uppercase tracking-widest font-heading ${
                    isTablet ? 'text-xs' : 'text-[10px]'
                  }`}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
            {action}
          </View>
        </View>
      )}
      <View className={isTablet ? 'p-6' : 'p-5'}>{children}</View>
    </View>
  );
}
