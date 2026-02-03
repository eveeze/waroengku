import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchWithCache } from '@/api/client';
import { getUsers, deleteUser } from '@/api/endpoints/users';
import { User, UserListResponse } from '@/api/types';
import { Loading } from '@/components/ui';
import { useOptimisticMutation } from '@/hooks';

// Minimalist role labels
const roleConfig: Record<string, string> = {
  admin: 'ADMINISTRATOR',
  cashier: 'CASHIER',
  inventory: 'INVENTORY',
};

/**
 * Users List Screen
 * Swiss Minimalist Refactor
 */
export default function UsersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Query key must follow [url, params] pattern for fetchWithCache
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['/users', { page }],
    queryFn: ({ queryKey }) => fetchWithCache<UserListResponse>({ queryKey }),
  });

  useEffect(() => {
    if (data?.data) {
      if (page === 1) {
        setAllUsers(data.data);
      } else {
        // Append unique users
        setAllUsers((prev) => {
          const existingIds = new Set(prev.map((u) => u.id));
          const newUsers = data.data.filter((u) => !existingIds.has(u.id));
          return [...prev, ...newUsers];
        });
      }
    }
  }, [data, page]);

  const { mutate: mutateDelete } = useOptimisticMutation(
    async (id: string) => deleteUser(id),
    {
      queryKey: ['/users', { page: 1 }], // Invalidate page 1 primarily
      updater: (old: UserListResponse | undefined, deletedId: string) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((u: User) => u.id !== deletedId),
        };
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/users'] });
        setPage(1);
      },
      onError: (err: Error) => {
        Alert.alert('Error', err.message || 'Failed to delete user');
      },
    },
  );

  const handleRefresh = () => {
    setPage(1);
    refetch();
  };

  const handleLoadMore = () => {
    if (!isLoading && data && page < data.meta.total_pages) {
      setPage((prev) => prev + 1);
    }
  };

  const handleDelete = (user: User) => {
    Alert.alert('DELETE USER', `Permanently remove ${user.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setAllUsers((prev) => prev.filter((u) => u.id !== user.id));
          mutateDelete(user.id);
        },
      },
    ]);
  };

  const renderUser = ({ item }: { item: User }) => {
    const roleLabel = roleConfig[item.role] || item.role.toUpperCase();
    const isAdmin = item.role === 'admin';

    return (
      <TouchableOpacity
        onPress={() => router.push(`/(admin)/users/${item.id}`)}
        onLongPress={() => handleDelete(item)}
        className="mb-0 border-b border-secondary-100 bg-white active:bg-secondary-50"
      >
        <View className="px-6 py-5 flex-row items-center justify-between">
          <View>
            <Text className="text-lg font-bold text-primary-900 tracking-tight mb-0.5 font-heading">
              {item.name}
            </Text>
            <Text className="text-xs font-medium text-secondary-500 uppercase tracking-wider font-body">
              {item.email}
            </Text>
          </View>
          <View
            className={`px-2 py-1 border ${isAdmin ? 'border-primary-900' : 'border-secondary-300'}`}
          >
            <Text
              className={`text-[10px] font-bold uppercase tracking-widest font-heading ${isAdmin ? 'text-primary-900' : 'text-secondary-500'}`}
            >
              {roleLabel}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      {/* Swiss Header */}
      <View
        className="px-6 pb-6 border-b border-secondary-200"
        style={{ paddingTop: insets.top + 24 }}
      >
        <View className="flex-row items-end justify-between">
          <View>
            <TouchableOpacity onPress={() => router.back()} className="mb-4">
              <Text className="text-xs font-bold uppercase tracking-widest text-secondary-500 font-body">
                ← Back
              </Text>
            </TouchableOpacity>
            <Text className="text-4xl font-black tracking-tighter text-primary-900 uppercase font-heading">
              USERS
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(admin)/users/create')}
            className="bg-black px-5 py-3 items-center justify-center"
          >
            <Text className="text-white font-bold text-xs uppercase tracking-widest font-heading">
              + NEW USER
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <FlatList
        data={allUsers}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && page === 1}
            onRefresh={handleRefresh}
            tintColor="#000"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center py-20 px-10">
              <Text className="text-secondary-300 font-black text-6xl mb-4">
                👥
              </Text>
              <Text className="text-secondary-900 font-bold text-lg text-center uppercase tracking-wide mb-2">
                No Users Found
              </Text>
              <Text className="text-secondary-500 text-center text-sm">
                Create users to manage your store.
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          allUsers.length > 0 ? (
            <View className="py-6 items-center border-t border-secondary-50 mt-4">
              <Text className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest font-body">
                Long press to delete user
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}
