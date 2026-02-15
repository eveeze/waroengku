import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchWithCache } from '@/api/client';
import { Button, Loading } from '@/components/ui';
import { updateUser, deleteUser } from '@/api/endpoints/users';
import { User, ApiResponse, UserListResponse } from '@/api/types';
import { useOptimisticMutation } from '@/hooks';

const roles = [
  { value: 'admin', label: 'ADMIN' },
  { value: 'cashier', label: 'CASHIER' },
  { value: 'inventory', label: 'INVENTORY' },
  { value: 'kitchen', label: 'GKITCHEN' },
];

/**
 * User Detail Screen
 * Swiss Minimalist Design
 */
export default function UserDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<string>('');

  const { data: response, isLoading } = useQuery({
    queryKey: ['/users', id],
    queryFn: ({ queryKey }) => fetchWithCache<ApiResponse<User>>({ queryKey }),
    initialData: () => {
      // Find in list cache
      const queries = queryClient
        .getQueryCache()
        .findAll({ queryKey: ['/users'] });
      for (const query of queries) {
        const state = query.state.data as UserListResponse | undefined;
        if (state && Array.isArray(state.data)) {
          const found = state.data.find((u: User) => u.id === id);
          if (found) return { success: true, data: found };
        }
      }
      return undefined;
    },
  });

  const user = response?.data;

  const { mutate: mutateUpdate, isPending: isUpdating } = useOptimisticMutation(
    async (payload: any) => updateUser(id!, payload),
    {
      queryKey: ['/users', id],
      updater: (old: ApiResponse<User> | undefined, variables: any) => {
        if (!old) return old;
        return {
          ...old,
          data: { ...old.data, ...variables },
        };
      },
      onSuccess: () => {
        Alert.alert('SUCCESS', 'User role updated.');
        queryClient.invalidateQueries({ queryKey: ['/users'] });
      },
      onError: (err: Error) => {
        Alert.alert('ERROR', err.message || 'Failed to update role');
      },
    },
  );

  const { mutate: mutateDelete, isPending: isDeleting } = useOptimisticMutation(
    async () => deleteUser(id!),
    {
      queryKey: ['/users'],
      updater: (old: any) => old,
      onSuccess: () => {
        Alert.alert('SUCCESS', 'User deleted.');
        router.back();
      },
      onError: (err: Error) => {
        Alert.alert('ERROR', err.message || 'Failed to delete user');
      },
    },
  );

  const handleUpdateRole = () => {
    if (selectedRole === user?.role) {
      return;
    }
    mutateUpdate({ role: selectedRole });
  };

  const handleDelete = () => {
    Alert.alert('DELETE USER', `Permanently delete "${user?.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => mutateDelete(),
      },
    ]);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr)
      .toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
      .toUpperCase();
  };

  if (isLoading && !user) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Loading message="LOADING PROFILE..." />
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-4xl mb-4">❌</Text>
        <Text className="font-bold uppercase tracking-widest text-muted-foreground mb-6">
          User Not Found
        </Text>
        <Button
          title="BACK TO LIST"
          variant="outline"
          onPress={() => router.back()}
        />
      </View>
    );
  }

  // Use a derived variable for display if selectedRole is empty
  const currentSelectedRole = selectedRole || user.role;

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="default" />

      {/* Swiss Header */}
      <View
        className="px-6 py-6 border-b border-border bg-background"
        style={{ paddingTop: insets.top + 16 }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            ← Back
          </Text>
        </TouchableOpacity>
        <Text className="text-4xl font-black uppercase tracking-tighter text-foreground">
          USER PROFILE
        </Text>
        <Text className="text-muted-foreground font-bold uppercase tracking-widest text-xs mt-1">
          {user.id.substring(0, 8)}...
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 24,
          paddingBottom: insets.bottom + 40,
        }}
        refreshControl={
          // Add refresh control if needed, but not present in original
          undefined
        }
      >
        {/* User Info Block */}
        <View className="mb-10">
          <View className="w-24 h-24 bg-foreground rounded-full items-center justify-center mb-6">
            <Text className="text-4xl text-background">👤</Text>
          </View>

          <Text className="text-3xl font-black text-foreground tracking-tight uppercase mb-1">
            {user.name}
          </Text>
          <Text className="text-muted-foreground font-medium text-sm uppercase tracking-wide mb-6">
            {user.email}
          </Text>

          <View className="flex-row gap-8 py-4 border-y border-border">
            <View>
              <Text className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                Joined
              </Text>
              <Text className="text-sm font-bold text-foreground uppercase">
                {formatDate(user.created_at)}
              </Text>
            </View>
            <View>
              <Text className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                Updated
              </Text>
              <Text className="text-sm font-bold text-foreground uppercase">
                {formatDate(user.updated_at)}
              </Text>
            </View>
          </View>
        </View>

        {/* Role Selection */}
        <View className="mb-12">
          <Text className="text-xs font-bold uppercase tracking-widest text-foreground mb-6">
            ASSIGN ROLE
          </Text>

          <View className="flex-row flex-wrap gap-3">
            {roles.map((role) => {
              const isActive = currentSelectedRole === role.value;
              return (
                <TouchableOpacity
                  key={role.value}
                  onPress={() => setSelectedRole(role.value)}
                  className={`px-5 py-3 border ${
                    isActive
                      ? 'bg-foreground border-foreground'
                      : 'bg-background border-border'
                  }`}
                >
                  <Text
                    className={`text-xs font-bold uppercase tracking-widest ${
                      isActive ? 'text-background' : 'text-muted-foreground'
                    }`}
                  >
                    {role.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {currentSelectedRole !== user.role && (
            <View className="mt-6">
              <Button
                title="SAVE NEW ROLE"
                onPress={handleUpdateRole}
                isLoading={isUpdating}
                className="rounded-none h-14"
                textClassName="font-black tracking-widest text-lg"
              />
              <Text className="text-center text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-widest">
                This update will be applied immediately
              </Text>
            </View>
          )}
        </View>

        {/* Danger Zone */}
        <View className="border-t border-border pt-8">
          <Text className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-4">
            Danger Zone
          </Text>
          <Button
            title="DELETE USER PERMANENTLY"
            variant="outline"
            className="border-red-500 rounded-none h-14"
            textClassName="text-red-500 font-bold tracking-widest"
            onPress={handleDelete}
            isLoading={isDeleting}
          />
        </View>
      </ScrollView>
    </View>
  );
}
