import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useApi } from '@/hooks/useApi';
import { getDailyReport } from '@/api/endpoints/reports';
import { Header } from '@/components/shared';
import { Card, Loading } from '@/components/ui';

/**
 * Daily Report Screen
 * Shows sales report for a specific date
 */
export default function DailyReportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const dateString = selectedDate.toISOString().split('T')[0];

  const {
    data: report,
    isLoading,
    error,
    execute: fetchReport,
  } = useApi(() => getDailyReport({ date: dateString }));

  useEffect(() => {
    fetchReport();
  }, [dateString]);

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
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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
    <View className="flex-1 bg-secondary-50">
      <Header title="Laporan Harian" onBack={() => router.back()} />

      {/* Date Selector */}
      <View className="bg-white px-4 py-3 border-b border-secondary-100">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={goToPreviousDay}
            className="w-10 h-10 bg-secondary-100 rounded-full items-center justify-center"
          >
            <Text className="text-lg">←</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="flex-1 mx-4 items-center"
          >
            <Text className="text-primary-600 font-semibold text-lg">
              {formatDate(dateString)}
            </Text>
            <Text className="text-secondary-400 text-xs">
              Tap untuk pilih tanggal
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={goToNextDay}
            disabled={isToday}
            className={`w-10 h-10 rounded-full items-center justify-center ${
              isToday ? 'bg-secondary-50' : 'bg-secondary-100'
            }`}
          >
            <Text className={`text-lg ${isToday ? 'text-secondary-300' : ''}`}>
              →
            </Text>
          </TouchableOpacity>
        </View>
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
          padding: 16,
          paddingBottom: insets.bottom + 16,
        }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchReport} />
        }
      >
        {error && (
          <View className="bg-danger-50 border border-danger-200 rounded-lg px-4 py-3 mb-4">
            <Text className="text-danger-700">
              Gagal memuat laporan: {error}
            </Text>
          </View>
        )}

        {/* Summary Cards */}
        {report && (
          <>
            <View className="flex-row mb-4">
              <View className="flex-1 mr-2">
                <Card className="bg-green-50 border-green-100">
                  <Text className="text-green-600 text-sm">
                    Total Penjualan
                  </Text>
                  <Text className="text-green-800 text-xl font-bold mt-1">
                    {formatCurrency(report.total_sales)}
                  </Text>
                </Card>
              </View>
              <View className="flex-1 ml-2">
                <Card className="bg-blue-50 border-blue-100">
                  <Text className="text-blue-600 text-sm">Transaksi</Text>
                  <Text className="text-blue-800 text-xl font-bold mt-1">
                    {report.total_transactions}
                  </Text>
                </Card>
              </View>
            </View>

            <Card className="mb-4">
              <View className="flex-row justify-between items-center py-2 border-b border-secondary-100">
                <Text className="text-secondary-500">Estimasi Keuntungan</Text>
                <Text className="text-lg font-bold text-green-600">
                  {formatCurrency(report.estimated_profit)}
                </Text>
              </View>
              <View className="flex-row justify-between items-center py-2 border-b border-secondary-100">
                <Text className="text-secondary-500">
                  Rata-rata per Transaksi
                </Text>
                <Text className="text-base font-semibold text-secondary-700">
                  {report.total_transactions > 0
                    ? formatCurrency(
                        report.total_sales / report.total_transactions,
                      )
                    : '-'}
                </Text>
              </View>
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-secondary-500">Margin Keuntungan</Text>
                <Text className="text-base font-semibold text-primary-600">
                  {report.total_sales > 0
                    ? `${((report.estimated_profit / report.total_sales) * 100).toFixed(1)}%`
                    : '-'}
                </Text>
              </View>
            </Card>
          </>
        )}

        {/* Empty State */}
        {!isLoading && !report && !error && (
          <View className="items-center py-12">
            <Text className="text-6xl mb-4">📊</Text>
            <Text className="text-secondary-500 text-lg">
              Tidak ada data untuk tanggal ini
            </Text>
            <Text className="text-secondary-400 mt-1">
              Pilih tanggal lain untuk melihat laporan
            </Text>
          </View>
        )}

        {/* No Sales */}
        {report && report.total_transactions === 0 && (
          <View className="items-center py-12">
            <Text className="text-6xl mb-4">😴</Text>
            <Text className="text-secondary-500 text-lg text-center">
              Tidak ada transaksi
            </Text>
            <Text className="text-secondary-400 mt-1 text-center">
              Belum ada penjualan pada tanggal ini
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
