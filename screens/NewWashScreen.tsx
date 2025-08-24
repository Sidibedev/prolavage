import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/auth';
import { Client } from '@/types';

const services = [
  { id: 'exterior', label: 'Extérieur', price: 1000 },
  { id: 'interior', label: 'Intérieur', price: 1500 },
  { id: 'full', label: 'Complet', price: 2000 },
  { id: 'other', label: 'Autre', price: 0 },
];

const paymentMethods = [
  { id: 'cash', label: 'Espèces' },
  { id: 'wave', label: 'Wave' },
  { id: 'om', label: 'Orange Money' },
];

export default function NewWashScreen() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Client fields
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientPlate, setClientPlate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Wash fields
  const [selectedService, setSelectedService] = useState<string>('');
  const [customPrice, setCustomPrice] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<string>('');

  const handleClientSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const results = await api.searchClients(query, user!.id);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const selectClient = (client: Client) => {
    setSelectedClient(client);
    setClientName(client.name);
    setClientPhone(client.phone);
    setClientPlate(client.plate);
    setSearchQuery('');
    setSearchResults([]);
  };

  const clearClientSelection = () => {
    setSelectedClient(null);
    setClientName('');
    setClientPhone('');
    setClientPlate('');
  };

  const getPrice = () => {
    if (selectedService === 'other') {
      return parseInt(customPrice) || 0;
    }
    const service = services.find((s) => s.id === selectedService);
    return service?.price || 0;
  };

  const handleSubmit = async () => {
    if (
      !clientName.trim() ||
      !clientPlate.trim() ||
      !selectedService ||
      !selectedPayment
    ) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    const price = getPrice();
    if (price <= 0) {
      Alert.alert('Erreur', 'Le prix doit être supérieur à 0');
      return;
    }

    setLoading(true);
    try {
      // Create or get client
      let client: Client;
      if (selectedClient) {
        client = selectedClient;
      } else {
        client = await api.createClient({
          user: user!.id,
          name: clientName,
          phone: clientPhone,
          plate: clientPlate,
        });
      }

      // Create wash
      await api.createWash({
        user: user!.id,
        client: client.id!,
        service: selectedService as any,
        price,
        payment_method: selectedPayment as any,
      });

      // Navigate to confirmation with wash details
      router.push({
        pathname: '/confirmation',
        params: {
          clientName,
          clientPhone,
          service: selectedService,
          price: price.toString(),
          paymentMethod: selectedPayment,
        },
      });
    } catch (error: any) {
      console.error('Error creating wash:', error);
      Alert.alert('Erreur', 'Impossible de créer le lavage');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Nouveau Lavage</Text>
      </View>

      {/* Client Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Client</Text>

        {!selectedClient && (
          <View>
            <TextInput
              style={styles.input}
              placeholder="Rechercher un client (nom, téléphone, plaque)"
              value={searchQuery}
              onChangeText={handleClientSearch}
            />

            {searchLoading && <ActivityIndicator style={styles.searchLoader} />}

            {searchResults.map((client) => (
              <TouchableOpacity
                key={client.id}
                style={styles.searchResult}
                onPress={() => selectClient(client)}
              >
                <Text style={styles.searchResultName}>{client.name}</Text>
                <Text style={styles.searchResultDetails}>
                  {client.phone} • {client.plate}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedClient && (
          <View style={styles.selectedClient}>
            <Text style={styles.selectedClientText}>
              Client sélectionné: {selectedClient.name}
            </Text>
            <TouchableOpacity onPress={clearClientSelection}>
              <Text style={styles.clearButton}>Changer</Text>
            </TouchableOpacity>
          </View>
        )}

        <TextInput
          style={styles.input}
          placeholder="Nom du client *"
          value={clientName}
          onChangeText={setClientName}
        />

        <TextInput
          style={styles.input}
          placeholder="Téléphone (optionnel)"
          value={clientPhone}
          onChangeText={setClientPhone}
          keyboardType="phone-pad"
        />

        <TextInput
          style={styles.input}
          placeholder="Plaque d'immatriculation *"
          value={clientPlate}
          onChangeText={setClientPlate}
          autoCapitalize="characters"
        />
      </View>

      {/* Service Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service</Text>
        {services.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={[
              styles.radioOption,
              selectedService === service.id && styles.radioOptionSelected,
            ]}
            onPress={() => setSelectedService(service.id)}
          >
            <Text
              style={[
                styles.radioText,
                selectedService === service.id && styles.radioTextSelected,
              ]}
            >
              {service.label}
              {service.price > 0 && ` - ${service.price.toLocaleString()} FCFA`}
            </Text>
          </TouchableOpacity>
        ))}

        {selectedService === 'other' && (
          <TextInput
            style={styles.input}
            placeholder="Prix personnalisé"
            value={customPrice}
            onChangeText={setCustomPrice}
            keyboardType="numeric"
          />
        )}
      </View>

      {/* Payment Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mode de paiement</Text>
        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.radioOption,
              selectedPayment === method.id && styles.radioOptionSelected,
            ]}
            onPress={() => setSelectedPayment(method.id)}
          >
            <Text
              style={[
                styles.radioText,
                selectedPayment === method.id && styles.radioTextSelected,
              ]}
            >
              {method.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary */}
      {selectedService && (
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Résumé</Text>
          <Text style={styles.summaryText}>
            Prix total: {getPrice().toLocaleString()} FCFA
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Valider le lavage</Text>
        )}
      </TouchableOpacity>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    marginBottom: 20,
  },
  backButton: {
    fontSize: 16,
    color: '#3498db',
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  searchLoader: {
    marginVertical: 10,
  },
  searchResult: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  searchResultDetails: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  selectedClient: {
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedClientText: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: '500',
  },
  clearButton: {
    fontSize: 14,
    color: '#3498db',
  },
  radioOption: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#e1e8ed',
  },
  radioOptionSelected: {
    borderColor: '#3498db',
    backgroundColor: '#e8f4f8',
  },
  radioText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  radioTextSelected: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  summary: {
    backgroundColor: '#e8f4f8',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  summaryText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3498db',
  },
  submitButton: {
    backgroundColor: '#27ae60',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  spacer: {
    height: 50,
  },
});
