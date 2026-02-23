import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/shared';
import { Button, Loading, Card } from '@/components/ui';
import { fetcher, etagCache } from '@/api/client';
import { deleteConsignor, getConsignorById } from '@/api/endpoints/consignment';
import { Consignor } from '@/api/types';
import { useResponsive } from '@/hooks/useResponsive';
import { useMutation } from '@tanstack/react-query';

export default function ConsignorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { breakpoints } = useResponsive();
  const isTablet = breakpoints.isTablet;

  // Consignor fetches usually return bare data via fetcher?
  // Let's assume fetcher usage is correct or check previous usage.
  // Using fetcher<Consignor> suggests unwrapped data.
  const { data: consignor, isLoading } = useQuery({
    queryKey: [`/consignors/${id}`],
    queryFn: () => getConsignorById(id as string),
    enabled: !!id,
    initialData: () => {
      // Find in list cache: ['/consignors']
      const listCache = queryClient.getQueryData<Consignor[]>(['/consignors']);
      if (listCache && Array.isArray(listCache)) {
        return listCache.find((c) => String(c.id) === String(id));
      }
      return undefined;
    },
  });

  const { mutate: mutateDelete } = useMutation({
    mutationFn: async () => deleteConsignor(id!),
    onSuccess: async () => {
      console.log('[DEBUG DELETE] >>> onSuccess fired for id:', id);

      // 1. Clear physical async storage cache ONLY for consignors
      try {
        const { apiCache } = await import('@/utils/cache');
        await apiCache.clearByPrefix('/consignors');
        etagCache.clear();
        console.log('[DEBUG DELETE] Step 1: apiCache + etagCache cleared');
      } catch (e) {
        console.log('[DEBUG DELETE] Step 1 ERROR:', e);
      }

      // 2. Check what's in the cache BEFORE mutation
      const cacheBefore = queryClient.getQueryData<Consignor[]>([
        '/consignors',
      ]);
      console.log('[DEBUG DELETE] Step 2 BEFORE setQueryData:', {
        hasCacheData: !!cacheBefore,
        type: typeof cacheBefore,
        isArray: Array.isArray(cacheBefore),
        count: Array.isArray(cacheBefore) ? cacheBefore.length : 'N/A',
        ids: Array.isArray(cacheBefore) ? cacheBefore.map((c) => c.id) : 'N/A',
      });

      // Mutate the local cache
      queryClient.setQueryData(
        ['/consignors'],
        (oldData: Consignor[] | undefined) => {
          if (!oldData) {
            console.log(
              '[DEBUG DELETE] setQueryData: oldData is FALSY, returning []',
            );
            return [];
          }
          const filtered = oldData.filter(
            (c: Consignor) => String(c.id) !== String(id),
          );
          console.log(
            '[DEBUG DELETE] setQueryData: filtered',
            oldData.length,
            '->',
            filtered.length,
          );
          return filtered;
        },
      );

      // Check what's in the cache AFTER mutation
      const cacheAfter = queryClient.getQueryData<Consignor[]>(['/consignors']);
      console.log('[DEBUG DELETE] Step 2 AFTER setQueryData:', {
        count: Array.isArray(cacheAfter) ? cacheAfter.length : 'N/A',
        ids: Array.isArray(cacheAfter) ? cacheAfter.map((c) => c.id) : 'N/A',
      });

      // 3. Remove the detail query
      queryClient.removeQueries({
        queryKey: [`/consignors/${id}`],
        exact: true,
      });
      console.log('[DEBUG DELETE] Step 3: detail query removed');

      // 4. Force refetch
      queryClient.invalidateQueries({ queryKey: ['/consignors'], exact: true });
      console.log('[DEBUG DELETE] Step 4: invalidateQueries fired');

      // Navigate
      console.log('[DEBUG DELETE] Step 5: navigating via router.replace...');
      router.replace('/(admin)/consignment');

      setTimeout(() => {
        Alert.alert('Success', 'Consignor deleted');
      }, 100);
    },
    onError: () => Alert.alert('Error', 'Failed to delete'),
  });

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
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-foreground">Not found</Text>
        <Button title="Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View
        className={`border-b border-border bg-background ${isTablet ? 'px-8 pb-8' : 'px-6 pb-6'}`}
        style={{ paddingTop: insets.top + (isTablet ? 20 : 16) }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className={isTablet ? 'mb-5' : 'mb-4'}
        >
          <Text
            className={`font-bold uppercase tracking-widest text-muted-foreground ${isTablet ? 'text-sm' : 'text-xs'}`}
          >
            ← Back
          </Text>
        </TouchableOpacity>
        <Text
          className={`font-black uppercase tracking-tighter text-foreground ${isTablet ? 'text-5xl' : 'text-4xl'}`}
        >
          {consignor.name}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: isTablet ? 40 : 24,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <View className={`w-full ${isTablet ? 'max-w-xl self-center' : ''}`}>
          <Card className="mb-6 border border-border">
            <Text
              className={`font-black text-foreground uppercase tracking-tight ${isTablet ? 'text-3xl' : 'text-2xl'}`}
            >
              {consignor.name}
            </Text>
            <Text
              className={`text-muted-foreground font-bold mt-1 ${isTablet ? 'text-lg' : 'text-base'}`}
            >
              {consignor.phone}
            </Text>
          </Card>

          <Button
            title="VIEW ASSOCIATED PRODUCTS"
            variant="outline"
            onPress={() => router.push(`/(admin)/products?consignor_id=${id}`)}
            className="mb-4 rounded-none h-14"
            textClassName="font-black tracking-widest text-sm"
          />

          <Button
            title="DELETE CONSIGNOR"
            variant="danger"
            onPress={handleDelete}
            className="rounded-none h-14"
            textClassName="font-black tracking-widest text-sm"
          />
        </View>
      </ScrollView>
    </View>
  );
}
