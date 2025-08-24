import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as Linking from 'expo-linking';
import { useAuthStore } from '@/store/auth';

export default function BlockedScreen() {
  const { logout } = useAuthStore();

  const handleWhatsAppContact = async () => {
    const adminPhone = '+221778618313'; // Replace with actual admin phone
    const message =
      "Bonjour, mon compte Prolavage est bloqué. Merci de m'aider à le débloquer.";
    const url = `whatsapp://send?phone=${adminPhone}&text=${encodeURIComponent(
      message
    )}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'WhatsApp non disponible',
          "WhatsApp n'est pas installé sur votre téléphone"
        );
      }
    } catch (error) {
      Alert.alert('Erreur', "Impossible d'ouvrir WhatsApp");
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>🚫</Text>
        <Text style={styles.title}>Compte Bloqué</Text>
        <Text style={styles.message}>
          Votre compte a été temporairement bloqué.{'\n'}
          Contactez l'administrateur pour plus d'informations.
        </Text>

        <TouchableOpacity
          style={styles.whatsappButton}
          onPress={handleWhatsAppContact}
        >
          <Text style={styles.whatsappButtonText}>
            📱 Contacter via WhatsApp
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
  },
  icon: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 20,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  whatsappButton: {
    backgroundColor: '#25d366',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  whatsappButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#95a5a6',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    width: '100%',
  },
  logoutButtonText: {
    color: '#95a5a6',
    fontSize: 16,
  },
});
