import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApi } from '@/hooks/useApi';
import { getOpnameSessions, startOpnameSession } from '@/api/endpoints';
import { OpnameSession } from '@/api/types';
import { Loading, Button } from '@/components/ui';

export default function StockOpnameListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [sessions, setSessions] = useState<OpnameSession[]>([]);

  const { isLoading, execute: fetchSessions } = useApi(getOpnameSessions);
  const { isLoading: isCreating, execute: createSession } =
    useApi(startOpnameSession);

  const loadData = async () => {
    const data = await fetchSessions();
    if (data) setSessions(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const handleCreateSession = async () => {
    try {
      const newSession = await createSession({
        created_by: 'Admin', // TODO: Auth
        notes: 'Session started from mobile',
      });
      if (newSession) {
        router.push(`/(admin)/stock-opname/${newSession.id}`);
      }
    } catch {
      Alert.alert('Error', 'Failed to start new session');
    }
  };

  const renderItem = ({ item }: { item: OpnameSession }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(admin)/stock-opname/${item.id}`)}
      className="bg-secondary-50 p-4 rounded-xl mb-3 border border-secondary-100 flex-row justify-between items-center"
    >
      <View>
        <Text className="font-heading font-black text-lg text-primary-900 uppercase tracking-tight">
          {item.session_number}
        </Text>
        <Text className="text-secondary-500 font-body text-xs font-bold mt-1 tracking-wide">
          {new Date(item.created_at).toLocaleDateString()} • {item.created_by}
        </Text>
      </View>
      <View
        className={`px-3 py-1 rounded-full ${item.status === 'active' ? 'bg-green-500' : 'bg-secondary-300'}`}
      >
        <Text className="text-white text-[10px] font-bold uppercase tracking-widest font-body">
          {item.status}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View
        className="px-6 py-6 border-b border-secondary-100 bg-white flex-row justify-between items-end"
        style={{ paddingTop: insets.top + 16 }}
      >
        <View>
          <TouchableOpacity onPress={() => router.back()} className="mb-4">
            <Text className="text-xs font-bold uppercase tracking-widest text-secondary-500 font-body">
              ← Back
            </Text>
          </TouchableOpacity>
          <Text className="text-4xl font-heading font-black uppercase tracking-tighter text-black">
            Stock Opname
          </Text>
        </View>
        <Button
          title="NEW SESSION"
          size="sm"
          onPress={handleCreateSession}
          isLoading={isCreating}
        />
      </View>

      <FlatList
        data={sessions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 24 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadData} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center mt-10">
              <Text className="text-secondary-500 font-bold">
                No sessions found.
              </Text>
              <Text className="text-secondary-400 text-xs mt-1">
                Start a new session to begin accounting.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}
