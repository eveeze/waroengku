import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/shared';
import { Button, Loading, Card } from '@/components/ui';
// import { getConsignorById } from '@/api/endpoints/consignment';
import { fetcher } from '@/api/client';
import { Consignor, ApiResponse } from '@/api/types';
import { useOptimisticMutation } from '@/hooks';

// Dummy delete function until endpoint exists/imported
const deleteConsignor = async (id: string) => {
  // Implement API call
  return true;
};

export default function ConsignorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  // Consignor fetches usually return bare data via fetcher?
  // Let's assume fetcher usage is correct or check previous usage.
  // Using fetcher<Consignor> suggests unwrapped data.
  const { data: consignor, isLoading } = useQuery({
    queryKey: [`/consignors/${id}`],
    queryFn: ({ queryKey }) => fetcher<Consignor>({ queryKey }),
    enabled: !!id,
    initialData: () => {
      // Find in list cache: ['/consignors']
      const listResponse = queryClient.getQueryData<ApiResponse<Consignor[]>>([
        '/consignors',
      ]);
      if (listResponse?.data && Array.isArray(listResponse.data)) {
        return listResponse.data.find((c) => c.id === id);
      }
      return undefined;
    },
  });

  const { mutate: mutateDelete } = useOptimisticMutation(
    async () => deleteConsignor(id!),
    {
      queryKey: ['/consignors'],
      updater: (old: Consignor[] | undefined) => {
        if (!old) return old;
        return old.filter((c) => c.id !== id);
      },
      onSuccess: () => {
        Alert.alert('Success', 'Consignor deleted');
        router.back();
      },
      onError: () => Alert.alert('Error', 'Failed to delete'),
    },
  );

  const handleDelete = () => {
    Alert.alert('Delete', `Delete ${consignor?.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => mutateDelete() },
    ]);
  };

  if (isLoading && !consignor) {
    return <Loading fullScreen message="Loading..." />;
  }

  if (!consignor) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Not found</Text>
        <Button title="Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-secondary-50">
      <View
        className="px-6 pb-6 border-b border-secondary-100 bg-white"
        style={{ paddingTop: insets.top + 16 }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-xs font-bold uppercase tracking-widest text-secondary-500">
            ← Back
          </Text>
        </TouchableOpacity>
        <Text className="text-4xl font-black uppercase tracking-tighter text-black">
          {consignor.name}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Card className="mb-4">
          <Text className="text-lg font-bold">{consignor.name}</Text>
          <Text className="text-secondary-500">{consignor.phone}</Text>
        </Card>

        <Button title="Delete" variant="danger" onPress={handleDelete} />
      </ScrollView>
    </View>
  );
}
