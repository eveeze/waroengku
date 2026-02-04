import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useQuery } from '@tanstack/react-query';
import { fetchWithCache } from '@/api/client';
import { DailyReportDetailData, ApiResponse } from '@/api/types';
import { Loading } from '@/components/ui';

export default function DailyReportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const dateString = selectedDate.toISOString().split('T')[0];

  const {
    data: response,
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ['/reports/daily', { date: dateString }],
    queryFn: ({ queryKey }) =>
      fetchWithCache<ApiResponse<DailyReportDetailData>>({ queryKey }),
  });

  const report = response?.data;
  const summary = report?.summary;

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
    }
  };

  const formatCurrency = (amount: number | undefined | null) => {
    const val = amount || 0;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const goToPreviousDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const goToNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    if (next <= new Date()) {
      setSelectedDate(next);
    }
  };

  const isToday = dateString === new Date().toISOString().split('T')[0];

  // Simple Chart Logic
  // Simple Chart Logic
  const ChartBar = ({
    hour,
    amount,
    max,
  }: {
    hour: number;
    amount: number;
    max: number;
  }) => {
    const heightPercentage = max > 0 ? (amount / max) * 100 : 0;
    return (
      <View className="items-center mr-4" style={{ width: 30 }}>
        <View className="h-32 w-2 bg-muted rounded-full justify-end overflow-hidden">
          <View
            className="w-full bg-foreground rounded-full"
            style={{ height: `${heightPercentage}%` }}
          />
        </View>
        <Text className="text-[10px] text-muted-foreground font-bold mt-2">
          {hour}:00
        </Text>
      </View>
    );
  };

  const maxHourlySales = report?.hourly_sales
    ? Math.max(...report.hourly_sales.map((h) => h.sales))
    : 0;

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="default" />

      {/* Header */}
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
          DAILY REPORT
        </Text>
      </View>

      {/* Date Selector */}
      <View className="bg-background px-6 py-4 border-b border-border flex-row items-center justify-between">
        <TouchableOpacity
          onPress={goToPreviousDay}
          className="w-10 h-10 border border-border items-center justify-center bg-background active:bg-foreground active:border-foreground"
        >
          <Text className="text-lg font-bold text-foreground">←</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          className="flex-1 mx-4 items-center bg-muted py-2 border border-border"
        >
          <Text className="text-foreground font-black text-sm uppercase tracking-widest">
            {formatDate(dateString)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={goToNextDay}
          disabled={isToday}
          className={`w-10 h-10 border items-center justify-center ${
            isToday
              ? 'border-border bg-muted opacity-50'
              : 'border-border bg-background active:bg-foreground active:border-foreground'
          }`}
        >
          <Text className="text-lg font-bold text-foreground">→</Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
          themeVariant="light"
          textColor="black"
        />
      )}

      <ScrollView
        contentContainerStyle={{
          padding: 24,
          paddingBottom: insets.bottom + 100,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor="#888"
          />
        }
      >
        {error && (
          <View className="bg-destructive p-4 mb-6">
            <Text className="text-destructive-foreground font-bold uppercase tracking-wide text-xs">
              Error loading report
            </Text>
          </View>
        )}

        {/* Summary Cards */}
        {summary && (
          <>
            <View className="flex-row mb-6">
              <View className="flex-1 mr-3 p-4 border border-border bg-background">
                <Text className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-2">
                  Total Sales
                </Text>
                <Text
                  className="text-foreground text-lg font-black tracking-tight"
                  numberOfLines={1}
                >
                  {formatCurrency(summary.total_sales)}
                </Text>
              </View>
              <View className="flex-1 ml-3 p-4 border border-border bg-background">
                <Text className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-2">
                  Transactions
                </Text>
                <Text className="text-foreground text-lg font-black tracking-tight">
                  {summary.total_transactions}
                </Text>
              </View>
            </View>

            {/* Hourly Sales Chart */}
            <View className="border border-border bg-background p-6 mb-6">
              <Text className="text-xs font-bold uppercase tracking-widest text-foreground mb-6 border-b border-border pb-2">
                Hourly Performance
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row items-end">
                  {report?.hourly_sales?.map((hourData) => (
                    <ChartBar
                      key={hourData.hour}
                      hour={hourData.hour}
                      amount={hourData.sales}
                      max={maxHourlySales}
                    />
                  ))}
                  {(!report?.hourly_sales ||
                    report.hourly_sales.length === 0) && (
                    <Text className="text-muted-foreground italic text-xs">
                      No data available
                    </Text>
                  )}
                </View>
              </ScrollView>
            </View>

            <View className="border border-border bg-background p-6 mb-6">
              <Text className="text-xs font-bold uppercase tracking-widest text-foreground mb-6 border-b border-border pb-2">
                Financial Breakdown
              </Text>

              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-muted-foreground font-bold uppercase text-xs tracking-wider">
                  Est. Profit
                </Text>
                <Text className="text-xl font-black text-foreground">
                  {formatCurrency(summary.estimated_profit)}
                </Text>
              </View>

              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-muted-foreground font-bold uppercase text-xs tracking-wider">
                  Avg. Transaction
                </Text>
                <Text className="text-sm font-bold text-muted-foreground">
                  {summary.average_transaction
                    ? formatCurrency(summary.average_transaction)
                    : '-'}
                </Text>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-muted-foreground font-bold uppercase text-xs tracking-wider">
                  Profit Margin
                </Text>
                <Text className="text-sm font-black text-background bg-foreground px-2 py-1">
                  {summary.total_sales > 0
                    ? `${((((summary.total_profit ?? summary.estimated_profit) || 0) / summary.total_sales) * 100).toFixed(1)}%`
                    : '0%'}
                </Text>
              </View>
            </View>

            {/* Top Products */}
            <View className="border border-border bg-background p-6 mb-6">
              <Text className="text-xs font-bold uppercase tracking-widest text-foreground mb-6 border-b border-border pb-2">
                Top Selling Products
              </Text>
              {report?.top_products?.map((product, index) => (
                <View
                  key={product.product_id}
                  className="flex-row justify-between items-center mb-4 last:mb-0"
                >
                  <View className="flex-row items-center flex-1 mr-4">
                    <Text className="font-black text-muted-foreground mr-3 text-lg">
                      {index + 1}
                    </Text>
                    <View>
                      <Text className="font-bold text-foreground">
                        {product.product_name}
                      </Text>
                      <Text className="text-[10px] text-muted-foreground">
                        {product.total_quantity} sold
                      </Text>
                    </View>
                  </View>
                  <Text className="font-bold text-foreground">
                    {formatCurrency(product.total_sales)}
                  </Text>
                </View>
              ))}
              {(!report?.top_products || report.top_products.length === 0) && (
                <Text className="text-muted-foreground italic text-xs">
                  No products sold yet
                </Text>
              )}
            </View>
          </>
        )}

        {/* Empty State */}
        {!isLoading && !summary && !error && (
          <View className="items-center py-20 opacity-50">
            <Text className="text-lg font-medium text-foreground uppercase tracking-widest">
              No Data
            </Text>
          </View>
        )}

        {/* No Sales */}
        {summary && summary.total_transactions === 0 && (
          <View className="items-center py-20 px-10 border border-dashed border-border">
            <Text className="text-foreground font-bold text-lg text-center uppercase tracking-wide mb-2">
              Quiet Day
            </Text>
            <Text className="text-muted-foreground text-center text-xs uppercase tracking-wide">
              No transactions recorded for this date.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
