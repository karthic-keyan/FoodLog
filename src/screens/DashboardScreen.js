import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

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
      setModalVisible(false);
    } else {
      alert('Please fill in all fields');
    }
  };

  const deleteLog = async (index) => {
    const updatedLogs = logs.filter((_, i) => i !== index);
    setLogs(updatedLogs);
    await AsyncStorage.setItem('foodLogs', JSON.stringify(updatedLogs));
  };

  const totalCalories = logs.reduce((sum, log) => sum + (parseInt(log.calories) || 0), 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header]}>
      <Text style={[styles.date, { color: colors.text }]}>{currentDate}</Text>
      <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <MaterialIcons name="settings" size={28} color={colors.text} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={['Breakfast', 'Lunch', 'Dinner', 'Snacks']}
        keyExtractor={(meal) => meal}
        renderItem={({ item: meal, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 100)} key={meal}>
            <Text style={[styles.mealTitle, { color: colors.text }]}>{meal}</Text>
            {logs
              .filter((log) => log.mealType?.toLowerCase() === meal?.toLowerCase())
              .map((log, i) => (
                <Card key={i} style={[styles.card, { backgroundColor: colors.card }]}>
                  <View style={styles.cardContent}>
                    <Text style={[styles.mealText, { color: colors.text }]}>
                      {log.mealName} - {log.calories} cal
                    </Text>
                    <TouchableOpacity onPress={() => deleteLog(i)}>
                      <MaterialIcons name="delete" size={22} color="red" />
                    </TouchableOpacity>
                  </View>
                </Card>
              ))}
          </Animated.View>
        )}
      />

      <Text style={[styles.total, { color: colors.text }]}>
        Total Calories: {totalCalories}
      </Text>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: "green" }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.fabText, { color: 'white' }]}>+</Text>
      </TouchableOpacity>

      {/* Modal for Adding Food Log */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Add Food Log
            </Text>

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

            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.text }]}
              placeholder="Meal Name"
              placeholderTextColor={colors.text}
              value={newMeal.mealName}
              onChangeText={(text) => setNewMeal({ ...newMeal, mealName: text })}
            />

            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.text }]}
              placeholder="Calories"
              placeholderTextColor={colors.text}
              keyboardType="numeric"
              value={newMeal.calories}
              onChangeText={(text) => setNewMeal({ ...newMeal, calories: text })}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.primary }]}
                onPress={saveLog}
              >
                <Text style={{ color: 'white' }}>Submit</Text>
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
  date: { fontSize: 20, marginBottom: 15, fontWeight: '600' },
  mealTitle: { fontSize: 18, marginVertical: 10, fontWeight: 'bold' },
  total: { fontSize: 20, marginTop: 20, fontWeight: 'bold' },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 65,
    height: 65,
    borderRadius: 32.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  fabText: { fontSize: 30, fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: { width: '85%', padding: 20, borderRadius: 15, elevation: 5 },
  picker: { height: 50, width: '100%', marginBottom: 20 },
  input: { borderWidth: 1, padding: 12, marginVertical: 10, borderRadius: 8 },
  card: { marginVertical: 5, padding: 10, borderRadius: 10 },
  cardContent: { flexDirection: 'row', justifyContent: 'space-between' },
  header: {display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
});

export default DashboardScreen;
