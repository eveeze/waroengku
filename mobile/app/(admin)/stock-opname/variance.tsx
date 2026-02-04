import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApi } from '@/hooks/useApi';
import { getVarianceReport, finalizeOpnameSession } from '@/api/endpoints';
import { VarianceReport, OpnameVarianceItem } from '@/api/types';
import { Loading, Button } from '@/components/ui';

export default function VarianceReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<VarianceReport | null>(null);

  const { isLoading, execute: fetchReport } = useApi(() =>
    getVarianceReport(id!),
  );
  const { isLoading: isFinalizing, execute: doFinalize } = useApi((data: any) =>
    finalizeOpnameSession(id!, data),
  );

  useEffect(() => {
    if (id) loadReport();
  }, [id]);

  const loadReport = async () => {
    const data = await fetchReport();
    if (data) setReport(data);
  };

  const handleFinalize = (apply: boolean) => {
    Alert.alert(
      'Finalize Session',
      apply
        ? 'This will update system stock to match physical counts. Proceed?'
        : 'Close session without updating stock?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: apply ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await doFinalize({
                apply_adjustments: apply,
                completed_by: 'Admin',
              });
              Alert.alert('Success', 'Session Finalized');
              router.navigate('/(admin)/stock-opname'); // Go back to list
            } catch {
              Alert.alert('Error', 'Failed to finalize session');
            }
          },
        },
      ],
    );
  };

  if (isLoading || !report) return <Loading message="Generating Report..." />;

  const renderItem = ({ item }: { item: OpnameVarianceItem }) => (
    <View className="flex-row justify-between items-center py-3 border-b border-border">
      <View className="flex-1 pr-4">
        <Text className="font-heading font-bold text-foreground text-base">
          {item.product_name}
        </Text>
        <Text className="text-muted-foreground font-body text-xs font-medium mt-0.5">
          System: {item.system_stock} | Physical: {item.physical_stock}
        </Text>
      </View>
      <View className="items-end">
        <Text
          className={`font-heading font-black text-lg ${item.variance === 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
        >
          {item.variance > 0 ? '+' : ''}
          {item.variance}
        </Text>
        <Text className="text-[10px] text-muted-foreground font-bold font-body">
          Value:{' '}
          {new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
          }).format(item.variance_value)}
        </Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-background p-6">
      <Text className="text-2xl font-heading font-black uppercase text-center mb-2 tracking-tight text-foreground">
        Variance Report
      </Text>

      <View className="flex-row gap-4 mb-6">
        <View className="flex-1 bg-muted p-3 rounded-lg border border-border items-center">
          <Text className="text-muted-foreground text-[10px] font-bold uppercase">
            Total Variance
          </Text>
          <Text className="font-heading font-black text-xl text-foreground">
            {report.total_variance}
          </Text>
        </View>
        <View className="flex-1 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30 items-center">
          <Text className="text-red-500 dark:text-red-400 text-[10px] font-bold uppercase font-body tracking-wider">
            Loss Value
          </Text>
          <Text className="font-heading font-black text-lg text-red-900 dark:text-red-300">
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              maximumFractionDigits: 0,
            }).format(report.total_loss_value)}
          </Text>
        </View>
      </View>

      <Text className="text-xs font-bold uppercase tracking-widest text-foreground mb-2">
        Discrepancies
      </Text>
      <FlatList
        data={report.items}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <Text className="text-center text-muted-foreground py-4">
            No discrepancies found. Perfect match!
          </Text>
        }
        style={{ flex: 1, marginBottom: 20 }}
      />

      <View className="gap-3">
        <Button
          title="FINALIZE & UPDATE STOCK"
          variant="danger"
          onPress={() => handleFinalize(true)}
          isLoading={isFinalizing}
        />
        <Button
          title="CLOSE WITHOUT UPDATING"
          variant="outline"
          onPress={() => handleFinalize(false)}
          isLoading={isFinalizing}
        />
        <Button
          title="BACK TO COUNTING"
          variant="ghost"
          onPress={() => router.back()}
        />
      </View>
    </View>
  );
}
