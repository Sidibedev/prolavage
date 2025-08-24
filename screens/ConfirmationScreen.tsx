import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';

export default function ConfirmationScreen() {
  const params = useLocalSearchParams<{
    clientName: string;
    clientPhone: string;
    service: string;
    price: string;
    paymentMethod: string;
  }>();

  const getServiceLabel = (service: string) => {
    const services: Record<string, string> = {
      exterior: 'Extérieur',
      interior: 'Intérieur',
      full: 'Complet',
      other: 'Autre',
    };
    return services[service] || service;
  };

  const getPaymentLabel = (method: string) => {
    const methods: Record<string, string> = {
      cash: 'Espèces',
      wave: 'Wave',
      om: 'Orange Money',
    };
    return methods[method] || method;
  };

  const handleWhatsAppShare = async () => {
    if (!params.clientPhone) {
      Alert.alert('Erreur', 'Aucun numéro de téléphone disponible');
      return;
    }

    const message =
      `Bonjour ${params.clientName}!\n\n` +
      `Votre véhicule a été lavé avec succès ✨\n\n` +
      `📋 Détails du service:\n` +
      `• Service: ${getServiceLabel(params.service)}\n` +
      `• Montant: ${parseInt(params.price).toLocaleString()} FCFA\n` +
      `• Paiement: ${getPaymentLabel(params.paymentMethod)}\n\n` +
      `Merci de nous avoir fait confiance! 🚗💙\n\n` +
      `- Équipe Prolavage`;

    const url = `whatsapp://send?phone=221${
      params.clientPhone
    }&text=${encodeURIComponent(message)}`;

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

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>✅</Text>
        <Text style={styles.title}>Lavage Confirmé!</Text>
        <Text style={styles.subtitle}>
          Le lavage a été enregistré avec succès
        </Text>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Client:</Text>
            <Text style={styles.detailValue}>{params.clientName}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Service:</Text>
            <Text style={styles.detailValue}>
              {getServiceLabel(params.service)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Montant:</Text>
            <Text style={styles.detailValue}>
              {parseInt(params.price).toLocaleString()} FCFA
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Paiement:</Text>
            <Text style={styles.detailValue}>
              {getPaymentLabel(params.paymentMethod)}
            </Text>
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          {params.clientPhone && (
            <TouchableOpacity
              style={styles.whatsappButton}
              onPress={handleWhatsAppShare}
            >
              <Text style={styles.whatsappButtonText}>
                📱 Partager sur WhatsApp
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => router.push('/')}
          >
            <Text style={styles.homeButtonText}>🏠 Retour Accueil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.newWashButton}
            onPress={() => router.replace('/new-wash')}
          >
            <Text style={styles.newWashButtonText}>+ Nouveau Lavage</Text>
          </TouchableOpacity>
        </View>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    width: '100%',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  detailLabel: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  buttonsContainer: {
    width: '100%',
    gap: 15,
  },
  whatsappButton: {
    backgroundColor: '#25d366',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
  },
  whatsappButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  homeButton: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  newWashButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#27ae60',
  },
  newWashButtonText: {
    color: '#27ae60',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
