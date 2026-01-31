import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApi } from '@/hooks/useApi';
import { getUsers, deleteUser } from '@/api/endpoints/users';
import { User } from '@/api/types';
import { Card, Loading } from '@/components/ui';

const roleLabels: Record<string, { label: string; color: string; bg: string }> = {
  admin: { label: 'Admin', color: 'text-purple-700', bg: 'bg-purple-100' },
  cashier: { label: 'Kasir', color: 'text-blue-700', bg: 'bg-blue-100' },
  inventory: { label: 'Gudang', color: 'text-green-700', bg: 'bg-green-100' },
};

/**
 * Users List Screen
 */
export default function UsersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { isLoading, execute: fetchUsers } = useApi((params?: { page?: number }) =>
    getUsers(params)
  );

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async (pageNum = 1, append = false) => {
    try {
      const result = await fetchUsers({ page: pageNum });
      if (result) {
        if (append) {
          setUsers((prev) => [...prev, ...result.data]);
        } else {
          setUsers(result.data);
        }
        setHasMore(pageNum < result.meta.total_pages);
      }
    } catch {}
  };

  const handleRefresh = () => {
    setPage(1);
    loadUsers(1, false);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadUsers(nextPage, true);
    }
  };

  const handleDelete = (user: User) => {
    Alert.alert(
      'Hapus User',
      `Yakin ingin menghapus "${user.name}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(user.id);
              Alert.alert('Berhasil', 'User berhasil dihapus');
              loadUsers();
            } catch (err) {
              Alert.alert(
                'Gagal',
                err instanceof Error ? err.message : 'Gagal menghapus user'
              );
            }
          },
        },
      ]
    );
  };

  const renderUser = ({ item }: { item: User }) => {
    const roleInfo = roleLabels[item.role] || roleLabels.cashier;

    return (
      <TouchableOpacity
        onPress={() => router.push(`/(admin)/users/${item.id}`)}
        onLongPress={() => handleDelete(item)}
        className="mb-3"
      >
        <Card>
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-secondary-200 rounded-full items-center justify-center mr-3">
              <Text className="text-xl">👤</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-secondary-900">
                {item.name}
              </Text>
              <Text className="text-sm text-secondary-500">{item.email}</Text>
            </View>
            <View className={`px-3 py-1 rounded-full ${roleInfo.bg}`}>
              <Text className={`text-xs font-medium ${roleInfo.color}`}>
                {roleInfo.label}
              </Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-secondary-50">
      {/* Header */}
      <View
        className="bg-primary-600 px-4 pb-4"
        style={{ paddingTop: insets.top + 16 }}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-white text-xl font-bold">Users</Text>
          <TouchableOpacity
            onPress={() => router.push('/(admin)/users/create')}
            className="bg-white px-4 py-2 rounded-lg"
          >
            <Text className="text-primary-600 font-medium">+ Tambah</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && page === 1}
            onRefresh={handleRefresh}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center py-8">
              <Text className="text-4xl mb-4">👥</Text>
              <Text className="text-secondary-500">Tidak ada user</Text>
              <Text className="text-secondary-400 mt-1">
                Tap "Tambah" untuk menambah user baru
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          <>
            {isLoading && users.length > 0 && (
              <View className="py-4">
                <Loading message="Memuat..." />
              </View>
            )}
            <Text className="text-center text-secondary-400 text-xs mt-4">
              Tekan lama untuk menghapus user
            </Text>
          </>
        }
      />
    </View>
  );
}
