import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useQuery } from '@tanstack/react-query';
import { fetchWithCache } from '@/api/client';
import { DailyReportData } from '@/api/types';
import { Loading } from '@/components/ui';

export default function DailyReportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const dateString = selectedDate.toISOString().split('T')[0];

  const {
    data: report,
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ['/reports/daily', dateString],
    queryFn: ({ queryKey }) => fetchWithCache<DailyReportData>({ queryKey }),
  });

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
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

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View
        className="px-6 py-6 border-b border-secondary-100 bg-white"
        style={{ paddingTop: insets.top + 16 }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <Text className="text-xs font-bold uppercase tracking-widest text-secondary-500">
            ← Back
          </Text>
        </TouchableOpacity>
        <Text className="text-4xl font-black uppercase tracking-tighter text-black">
          DAILY REPORT
        </Text>
      </View>

      {/* Date Selector */}
      <View className="bg-white px-6 py-4 border-b border-secondary-100 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={goToPreviousDay}
          className="w-10 h-10 border border-secondary-200 items-center justify-center bg-white active:bg-black active:border-black"
        >
          <Text className="text-lg font-bold">←</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          className="flex-1 mx-4 items-center bg-secondary-50 py-2 border border-secondary-100"
        >
          <Text className="text-primary-900 font-black text-sm uppercase tracking-widest">
            {formatDate(dateString)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={goToNextDay}
          disabled={isToday}
          className={`w-10 h-10 border items-center justify-center ${
            isToday
              ? 'border-secondary-100 bg-secondary-50 opacity-50'
              : 'border-secondary-200 bg-white active:bg-black active:border-black'
          }`}
        >
          <Text className="text-lg font-bold">→</Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
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
            tintColor="#000"
          />
        }
      >
        {error && (
          <View className="bg-black p-4 mb-6">
            <Text className="text-white font-bold uppercase tracking-wide text-xs">
              Error loading report
            </Text>
          </View>
        )}

        {/* Summary Cards */}
        {report && (
          <>
            <View className="flex-row mb-6">
              <View className="flex-1 mr-3 p-4 border border-secondary-200 bg-white">
                <Text className="text-secondary-500 text-[10px] font-bold uppercase tracking-widest mb-2">
                  Total Sales
                </Text>
                <Text
                  className="text-primary-900 text-lg font-black tracking-tight"
                  numberOfLines={1}
                >
                  {formatCurrency(report.total_sales)}
                </Text>
              </View>
              <View className="flex-1 ml-3 p-4 border border-secondary-200 bg-white">
                <Text className="text-secondary-500 text-[10px] font-bold uppercase tracking-widest mb-2">
                  Transactions
                </Text>
                <Text className="text-primary-900 text-lg font-black tracking-tight">
                  {report.total_transactions}
                </Text>
              </View>
            </View>

            <View className="border border-secondary-200 bg-white p-6 mb-6">
              <Text className="text-xs font-bold uppercase tracking-widest text-primary-900 mb-6 border-b border-secondary-100 pb-2">
                Financial Breakdown
              </Text>

              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-secondary-500 font-bold uppercase text-xs tracking-wider">
                  Est. Profit
                </Text>
                <Text className="text-xl font-black text-primary-900">
                  {formatCurrency(report.estimated_profit)}
                </Text>
              </View>

              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-secondary-500 font-bold uppercase text-xs tracking-wider">
                  Avg. Transaction
                </Text>
                <Text className="text-sm font-bold text-secondary-700">
                  {report.total_transactions > 0
                    ? formatCurrency(
                        report.total_sales / report.total_transactions,
                      )
                    : '-'}
                </Text>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-secondary-500 font-bold uppercase text-xs tracking-wider">
                  Profit Margin
                </Text>
                <Text className="text-sm font-black text-black bg-secondary-100 px-2 py-1">
                  {report.total_sales > 0
                    ? `${((report.estimated_profit / report.total_sales) * 100).toFixed(1)}%`
                    : '0%'}
                </Text>
              </View>
            </View>
          </>
        )}

        {/* Empty State */}
        {!isLoading && !report && !error && (
          <View className="items-center py-20 opacity-50">
            <Text className="text-lg font-medium text-primary-900 uppercase tracking-widest">
              No Data
            </Text>
          </View>
        )}

        {/* No Sales */}
        {report && report.total_transactions === 0 && (
          <View className="items-center py-20 px-10 border border-dashed border-secondary-300">
            <Text className="text-secondary-900 font-bold text-lg text-center uppercase tracking-wide mb-2">
              Quiet Day
            </Text>
            <Text className="text-secondary-500 text-center text-xs uppercase tracking-wide">
              No transactions recorded for this date.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
