import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import Animated, { FadeInDown } from 'react-native-reanimated';

const DashboardScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [logs, setLogs] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newMeal, setNewMeal] = useState({
    mealType: 'Breakfast', // Default value
    mealName: '',
    calories: '',
  });
  const currentDate = new Date().toLocaleDateString();

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    const storedLogs = await AsyncStorage.getItem('foodLogs');
    if (storedLogs) setLogs(JSON.parse(storedLogs));
  };

  const saveLog = async () => {
    if (newMeal.mealName && newMeal.calories) {
      const updatedLogs = [
        ...logs,
        { ...newMeal, date: new Date().toISOString() },
      ];
      setLogs(updatedLogs);
      await AsyncStorage.setItem('foodLogs', JSON.stringify(updatedLogs));
      setNewMeal({ mealType: 'Breakfast', mealName: '', calories: '' });
      setModalVisible(false); // Close modal after submission
    } else {
      alert('Please fill in all fields');
    }
  };

  const totalCalories = logs.reduce((sum, log) => sum + (parseInt(log.calories) || 0), 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.date, { color: colors.text }]}>{currentDate}</Text>
      <ScrollView>
        {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((meal, index) => (
          <Animated.View entering={FadeInDown.delay(index * 100)} key={meal}>
            <Text style={[styles.mealTitle, { color: colors.text }]}>{meal}</Text>
            {logs
              .filter(log => log.mealType?.toLowerCase() === meal?.toLowerCase())
              .map((log, i) => (
                <Text key={i} style={{ color: colors.text }}>
                  {log.mealName}: {log.calories} cal
                </Text>
              ))}
          </Animated.View>
        ))}
      </ScrollView>
      <Text style={[styles.total, { color: colors.text }]}>
        Total Calories: {totalCalories}
      </Text>
      <TouchableOpacity
        style={[styles.settingsButton, { backgroundColor: colors.card }]}
        onPress={() => navigation.navigate('Settings')}
      >
        <Text style={{ color: colors.text }}>Settings</Text>
      </TouchableOpacity>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.card }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.fabText, { color: colors.text }]}>+</Text>
      </TouchableOpacity>

      {/* Modal for Adding Food Log */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Add Food Log
            </Text>

            {/* Meal Type Dropdown */}
            <Picker
              selectedValue={newMeal.mealType}
              style={[styles.picker, { color: colors.text }]}
              onValueChange={(itemValue) =>
                setNewMeal({ ...newMeal, mealType: itemValue })
              }
            >
              <Picker.Item label="Breakfast" value="Breakfast" />
              <Picker.Item label="Lunch" value="Lunch" />
              <Picker.Item label="Dinner" value="Dinner" />
              <Picker.Item label="Snacks" value="Snacks" />
            </Picker>

            {/* Meal Name Input */}
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.text }]}
              placeholder="Meal Name"
              placeholderTextColor={colors.text}
              value={newMeal.mealName}
              onChangeText={(text) => setNewMeal({ ...newMeal, mealName: text })}
            />

            {/* Calories Input */}
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.text }]}
              placeholder="Calories"
              placeholderTextColor={colors.text}
              keyboardType="numeric"
              value={newMeal.calories}
              onChangeText={(text) => setNewMeal({ ...newMeal, calories: text })}
            />

            {/* Submit and Cancel Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.card }]}
                onPress={saveLog}
              >
                <Text style={{ color: colors.text }}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: colors.card }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: colors.text }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  date: { fontSize: 18, marginBottom: 20 },
  mealTitle: { fontSize: 16, marginVertical: 10 },
  total: { fontSize: 18, marginTop: 20 },
  settingsButton: { padding: 10, borderRadius: 5, alignSelf: 'flex-start' },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  fabText: { fontSize: 30 },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: { fontSize: 20, marginBottom: 20, textAlign: 'center' },
  picker: { height: 50, width: '100%', marginBottom: 20 },
  input: { borderWidth: 1, padding: 10, marginVertical: 10, borderRadius: 5 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  submitButton: { padding: 10, borderRadius: 5, flex: 1, marginRight: 10, alignItems: 'center' },
  cancelButton: { padding: 10, borderRadius: 5, flex: 1, alignItems: 'center' },
});

export default DashboardScreen;