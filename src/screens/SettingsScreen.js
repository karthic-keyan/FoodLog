import React, { useState } from 'react';
import { View, Text, Switch, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { useTheme } from '../theme/ThemeContext';
import * as Notifications from 'expo-notifications';

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
    // Optionally, share the file using Expo Sharing
    // import * as Sharing from 'expo-sharing';
    // await Sharing.shareAsync(fileUri);
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
      <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      <View style={styles.option}>
        <Text style={{ color: colors.text }}>Dark Mode</Text>
        <Switch value={isDarkMode} onValueChange={toggleTheme} />
      </View>
      <View style={styles.option}>
        <Text style={{ color: colors.text }}>Daily Calorie Goal</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.text }]}
          value={calorieGoal}
          onChangeText={setCalorieGoal}
          keyboardType="numeric"
        />
      </View>
      <View style={styles.option}>
        <Text style={{ color: colors.text }}>Notifications</Text>
        <Switch value={notifications} onValueChange={toggleNotifications} />
      </View>
      <TouchableOpacity onPress={() => exportLogs('week')}>
        <Text style={{ color: colors.text }}>Export Last Week</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => exportLogs('month')}>
        <Text style={{ color: colors.text }}>Export Last Month</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, marginBottom: 20 },
  option: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
  input: { borderWidth: 1, padding: 5, width: 100 },
});

export default SettingsScreen;