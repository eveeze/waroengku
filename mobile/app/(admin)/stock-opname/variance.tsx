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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApi } from '@/hooks/useApi';
import { useResponsive } from '@/hooks/useResponsive';
import { getVarianceReport, finalizeOpnameSession } from '@/api/endpoints';
import { VarianceReport, OpnameVarianceItem } from '@/api/types';
import { Loading, Button } from '@/components/ui';

export default function VarianceReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { breakpoints } = useResponsive();
  const isTablet = breakpoints.isTablet;

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
    <View
      className={`flex-row justify-between items-center border-b border-border ${isTablet ? 'py-4' : 'py-3'}`}
    >
      <View className="flex-1 pr-4">
        <Text
          className={`font-heading font-bold text-foreground ${isTablet ? 'text-lg' : 'text-base'}`}
        >
          {item.product_name}
        </Text>
        <Text
          className={`text-muted-foreground font-body font-medium mt-0.5 ${isTablet ? 'text-sm' : 'text-xs'}`}
        >
          System: {item.system_stock} | Physical: {item.physical_stock}
        </Text>
      </View>
      <View className="items-end">
        <Text
          className={`font-heading font-black ${isTablet ? 'text-2xl' : 'text-lg'} ${item.variance === 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
        >
          {item.variance > 0 ? '+' : ''}
          {item.variance}
        </Text>
        <Text
          className={`text-muted-foreground font-bold font-body ${isTablet ? 'text-xs' : 'text-[10px]'}`}
        >
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
    <View
      className="flex-1 bg-background"
      style={{
        paddingTop: insets.top + (isTablet ? 32 : 24),
        paddingBottom: insets.bottom + 24,
      }}
    >
      <View
        className={`flex-1 w-full ${isTablet ? 'max-w-3xl self-center px-8' : 'px-6'}`}
      >
        <Text
          className={`font-heading font-black uppercase text-center mb-6 tracking-tight text-foreground ${isTablet ? 'text-4xl' : 'text-2xl'}`}
        >
          Variance Report
        </Text>

        <View className="flex-row gap-4 mb-8">
          <View
            className={`flex-1 bg-muted rounded-lg border border-border items-center justify-center ${isTablet ? 'p-6' : 'p-3'}`}
          >
            <Text
              className={`text-muted-foreground font-bold uppercase mb-1 ${isTablet ? 'text-xs' : 'text-[10px]'}`}
            >
              Total Variance
            </Text>
            <Text
              className={`font-heading font-black text-foreground ${isTablet ? 'text-4xl' : 'text-xl'}`}
            >
              {report.total_variance}
            </Text>
          </View>
          <View
            className={`flex-1 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/30 items-center justify-center ${isTablet ? 'p-6' : 'p-3'}`}
          >
            <Text
              className={`text-red-500 dark:text-red-400 font-bold uppercase font-body tracking-wider mb-1 ${isTablet ? 'text-xs' : 'text-[10px]'}`}
            >
              Loss Value
            </Text>
            <Text
              className={`font-heading font-black text-red-900 dark:text-red-300 ${isTablet ? 'text-3xl' : 'text-lg'}`}
            >
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0,
              }).format(report.total_loss_value)}
            </Text>
          </View>
        </View>

        <Text
          className={`font-bold uppercase tracking-widest text-foreground ${isTablet ? 'text-sm mb-4' : 'text-xs mb-2'}`}
        >
          Discrepancies
        </Text>
        <FlatList
          data={report.items}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text
              className={`text-center text-muted-foreground py-8 ${isTablet ? 'text-lg' : 'text-sm'}`}
            >
              No discrepancies found. Perfect match!
            </Text>
          }
          style={{ flex: 1, marginBottom: 24 }}
        />

        <View className={`gap-3 ${isTablet ? 'mt-4' : ''}`}>
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
    </View>
  );
}
