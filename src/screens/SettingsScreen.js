import React, { useState } from 'react';
import { View, Text, Switch, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { useTheme } from '../theme/ThemeContext';
import * as Notifications from 'expo-notifications';
import { MaterialIcons } from '@expo/vector-icons';

const SettingsScreen = () => {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const [calorieGoal, setCalorieGoal] = useState('');
  const [notifications, setNotifications] = useState(false);

  const exportLogs = async (period) => {
    const logs = JSON.parse(await AsyncStorage.getItem('foodLogs') || '[]');
    const now = new Date();
    const filteredLogs = logs.filter(log => {
      const logDate = new Date(log.date);
      if (period === 'week') return now - logDate <= 7 * 24 * 60 * 60 * 1000;
      if (period === 'month') return now - logDate <= 30 * 24 * 60 * 60 * 1000;
      return true;
    });
    const logText = filteredLogs.map(log => `${log.meal}: ${log.calories} cal, ${log.portion}`).join('\n');
    const fileUri = `${FileSystem.documentDirectory}food_log_${period}.txt`;
    await FileSystem.writeAsStringAsync(fileUri, logText);
    alert(`Exported to ${fileUri}`);
  };

  const toggleNotifications = async (value) => {
    setNotifications(value);
    if (value) {
      await Notifications.requestPermissionsAsync();
      await Notifications.scheduleNotificationAsync({
        content: { title: 'Food Log Reminder', body: 'Did you log your meals today?' },
        trigger: { seconds: 60 * 60 * 24, repeats: true }, // Daily reminder
      });
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
      
      {/* Settings Options Card */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.option}>
          <Text style={[styles.optionText, { color: colors.text }]}>Dark Mode</Text>
          <Switch value={isDarkMode} onValueChange={toggleTheme} />
        </View>
        <View style={styles.option}>
          <Text style={[styles.optionText, { color: colors.text }]}>Daily Calorie Goal</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border || colors.text }]}
            value={calorieGoal}
            onChangeText={setCalorieGoal}
            keyboardType="numeric"
            placeholder="Enter goal"
            placeholderTextColor={colors.text}
          />
        </View>
        <View style={styles.option}>
          <Text style={[styles.optionText, { color: colors.text }]}>Notifications</Text>
          <Switch value={notifications} onValueChange={toggleNotifications} />
        </View>
      </View>

      {/* Export Logs Section */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Export Logs</Text>
      <View style={styles.exportContainer}>
        <TouchableOpacity style={[styles.exportButton, { backgroundColor: colors.primary }]} onPress={() => exportLogs('week')}>
          <MaterialIcons name="file-download" size={24} color="#fff" />
          <Text style={styles.exportButtonText}>Last Week</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.exportButton, { backgroundColor: colors.primary }]} onPress={() => exportLogs('month')}>
          <MaterialIcons name="file-download" size={24} color="#fff" />
          <Text style={styles.exportButtonText}>Last Month</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', marginBottom: 20 },
  card: {
    borderRadius: 10,
    padding: 15,
    elevation: 3,
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  optionText: { fontSize: 16 },
  input: {
    borderWidth: 1,
    padding: 8,
    borderRadius: 5,
    width: 100,
    textAlign: 'center',
  },
  sectionTitle: { fontSize: 20, fontWeight: '600', marginBottom: 10 },
  exportContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    flex: 0.48,
    justifyContent: 'center',
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default SettingsScreen;
