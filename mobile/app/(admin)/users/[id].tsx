import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '@/components/shared';
import { Button, Card, Loading } from '@/components/ui';
import { getUserById, updateUser, deleteUser } from '@/api/endpoints/users';
import { User } from '@/api/types';
import { useApi } from '@/hooks/useApi';

const roleLabels: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  admin: { label: 'Admin', color: 'text-purple-700', bg: 'bg-purple-100', icon: '👑' },
  cashier: { label: 'Kasir', color: 'text-blue-700', bg: 'bg-blue-100', icon: '💵' },
  inventory: { label: 'Gudang', color: 'text-green-700', bg: 'bg-green-100', icon: '📦' },
};

const roles = [
  { value: 'admin', label: 'Admin' },
  { value: 'cashier', label: 'Kasir' },
  { value: 'inventory', label: 'Gudang' },
];

/**
 * User Detail Screen
 */
export default function UserDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isLoading, execute: fetchUser } = useApi(() => getUserById(id!));

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const result = await fetchUser();
    if (result) {
      setUser(result);
      setSelectedRole(result.role);
    }
  };

  const handleUpdateRole = async () => {
    if (selectedRole === user?.role) {
      Alert.alert('Info', 'Role tidak berubah');
      return;
    }

    try {
      setIsSubmitting(true);
      await updateUser(id!, { role: selectedRole as 'admin' | 'cashier' | 'inventory' });
      Alert.alert('Berhasil', 'Role user berhasil diperbarui');
      loadUser();
    } catch (error) {
      Alert.alert(
        'Gagal',
        error instanceof Error ? error.message : 'Gagal memperbarui role'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Hapus User',
      `Yakin ingin menghapus "${user?.name}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(id!);
              Alert.alert('Berhasil', 'User berhasil dihapus');
              router.back();
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (isLoading && !user) {
    return <Loading fullScreen message="Memuat..." />;
  }

  if (!user) {
    return (
      <View className="flex-1 bg-secondary-50 items-center justify-center">
        <Text className="text-4xl mb-4">❌</Text>
        <Text className="text-secondary-500">User tidak ditemukan</Text>
        <Button
          title="Kembali"
          variant="outline"
          onPress={() => router.back()}
          className="mt-4"
        />
      </View>
    );
  }

  const roleInfo = roleLabels[user.role] || roleLabels.cashier;

  return (
    <View className="flex-1 bg-secondary-50">
      <Header title="Detail User" onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 16 }}
      >
        {/* User Profile */}
        <Card className="mb-4">
          <View className="items-center py-4">
            <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-3">
              <Text className="text-4xl">{roleInfo.icon}</Text>
            </View>
            <Text className="text-xl font-bold text-secondary-900">
              {user.name}
            </Text>
            <Text className="text-secondary-500">{user.email}</Text>
            <View className={`px-4 py-1 rounded-full mt-2 ${roleInfo.bg}`}>
              <Text className={`text-sm font-medium ${roleInfo.color}`}>
                {roleInfo.label}
              </Text>
            </View>
          </View>
        </Card>

        {/* Info */}
        <Card title="Informasi" className="mb-4">
          <View className="flex-row justify-between items-center py-2 border-b border-secondary-100">
            <Text className="text-secondary-500">Dibuat</Text>
            <Text className="text-secondary-900">
              {formatDate(user.created_at)}
            </Text>
          </View>
          <View className="flex-row justify-between items-center py-2">
            <Text className="text-secondary-500">Diperbarui</Text>
            <Text className="text-secondary-900">
              {formatDate(user.updated_at)}
            </Text>
          </View>
        </Card>

        {/* Change Role */}
        <Card title="Ubah Role" className="mb-4">
          <View className="flex-row flex-wrap">
            {roles.map((role) => (
              <TouchableOpacity
                key={role.value}
                onPress={() => setSelectedRole(role.value)}
                className={`px-4 py-2 rounded-lg mr-2 mb-2 ${
                  selectedRole === role.value
                    ? 'bg-primary-600'
                    : 'bg-secondary-100'
                }`}
              >
                <Text
                  className={
                    selectedRole === role.value
                      ? 'text-white font-medium'
                      : 'text-secondary-700'
                  }
                >
                  {role.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedRole !== user.role && (
            <Button
              title="Simpan Perubahan Role"
              size="small"
              onPress={handleUpdateRole}
              loading={isSubmitting}
              className="mt-3"
            />
          )}
        </Card>

        {/* Actions */}
        <Button
          title="Hapus User"
          variant="danger"
          fullWidth
          onPress={handleDelete}
        />
      </ScrollView>
    </View>
  );
}
