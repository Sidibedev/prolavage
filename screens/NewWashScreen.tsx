import React, { useState, useEffect, useRef } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';

const services = [
  { id: 'exterior', label: 'Extérieur', defaultPrice: 0 },
  { id: 'interior', label: 'Intérieur', defaultPrice: 0 },
  { id: 'full', label: 'Complet', defaultPrice: 0 },
  { id: 'other', label: 'Autre', defaultPrice: 0 },
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
  const submittingRef = useRef(false); // anti double-tap

  // Client fields
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientPlate, setClientPlate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Wash fields
  const [selectedService, setSelectedService] = useState<string>('full');
  const [price, setPrice] = useState<string>('2000'); // prix éditable par défaut
  const [userEditedPrice, setUserEditedPrice] = useState(false); // pour ne pas écraser un prix déjà saisi
  const [selectedPayment, setSelectedPayment] = useState<string>('cash');

  // Met à jour le prix par défaut quand on change de service (si pas déjà édité)
  useEffect(() => {
    if (userEditedPrice) return;
    const s = services.find((x) => x.id === selectedService);
    setPrice(String(s?.defaultPrice ?? 0));
  }, [selectedService, userEditedPrice]);

  // Recherche clients (filtrée par user)
  const handleClientSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const results = await api.searchClients(query.trim(), user!.id);
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

  const priceNumber = Number(price.replace(/\D/g, '')); // nettoie tout sauf chiffres

  const handleSubmit = async () => {
    if (submittingRef.current) return;
    if (
      !clientName.trim() ||
      !clientPlate.trim() ||
      !selectedService ||
      !selectedPayment
    ) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }
    if (!priceNumber || priceNumber <= 0) {
      Alert.alert('Erreur', 'Le prix doit être supérieur à 0');
      return;
    }

    submittingRef.current = true;
    setLoading(true);
    try {
      // Create or get client
      let client: Client;
      if (selectedClient) {
        client = selectedClient;
      } else {
        client = await api.createClient({
          user: user!.id,
          name: clientName.trim(),
          phone: clientPhone.trim(),
          plate: clientPlate.trim().toUpperCase(),
        });
      }

      // Create wash
      await api.createWash({
        user: user!.id,
        client: client.id!,
        service: selectedService as any,
        price: priceNumber,
        payment_method: selectedPayment as any,
      });

      router.push({
        pathname: '/confirmation',
        params: {
          clientName: clientName.trim(),
          clientPhone: clientPhone.trim(),
          service: selectedService,
          price: String(priceNumber),
          paymentMethod: selectedPayment,
        },
      });
    } catch (error: any) {
      console.error('Error creating wash:', error?.response?.data || error);
      Alert.alert('Erreur', 'Impossible de créer le lavage');
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
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
              placeholderTextColor={'gray'}
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
          style={[styles.input, { marginTop: 30 }]}
          placeholder="Nom du client *"
          placeholderTextColor={'#ccc'}
          value={clientName}
          onChangeText={setClientName}
        />

        <TextInput
          style={styles.input}
          placeholder="Téléphone (optionnel)"
          value={clientPhone}
          onChangeText={setClientPhone}
          placeholderTextColor={'#ccc'}
          keyboardType="phone-pad"
        />

        <TextInput
          style={styles.input}
          placeholderTextColor={'#ccc'}
          placeholder="Plaque d'immatriculation *"
          value={clientPlate}
          onChangeText={setClientPlate}
          autoCapitalize="characters"
        />
      </View>

      {/* Service Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service</Text>

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}
        >
          {services.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.radioOption,
                { width: '48%', alignItems: 'center' },
                selectedService === service.id && styles.radioOptionSelected,
              ]}
              onPress={() => {
                setSelectedService(service.id);
                setUserEditedPrice(false); // autorise le prix par défaut à écraser si pas encore édité
              }}
            >
              <Text
                style={[
                  styles.radioText,
                  selectedService === service.id && styles.radioTextSelected,
                ]}
              >
                {service.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Prix toujours visible et éditable */}
        <Text style={[styles.sectionTitle, { marginTop: 10 }]}>
          Prix (FCFA)
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Entrez le prix"
          keyboardType="numeric"
          value={price}
          onChangeText={(t) => {
            setPrice(t.replace(/[^\d]/g, '')); // garde seulement chiffres
            setUserEditedPrice(true);
          }}
        />
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
      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Résumé</Text>
        <Text style={styles.summaryText}>
          Prix total: {priceNumber.toLocaleString()} FCFA
        </Text>
      </View>

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
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: { fontSize: 16, color: '#3498db', marginRight: 15 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50' },
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
  searchLoader: { marginVertical: 10 },
  searchResult: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  searchResultName: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
  searchResultDetails: { fontSize: 14, color: '#7f8c8d', marginTop: 2 },
  selectedClient: {
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedClientText: { fontSize: 14, color: '#27ae60', fontWeight: '500' },
  clearButton: { fontSize: 14, color: '#3498db' },
  radioOption: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#e1e8ed',
  },
  radioOptionSelected: { borderColor: '#3498db', backgroundColor: '#e8f4f8' },
  radioText: { fontSize: 16, color: '#2c3e50' },
  radioTextSelected: { color: '#3498db', fontWeight: 'bold' },
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
  summaryText: { fontSize: 18, fontWeight: 'bold', color: '#3498db' },
  submitButton: {
    backgroundColor: '#27ae60',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonDisabled: { backgroundColor: '#95a5a6' },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  spacer: { height: 50 },
});
