import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/auth';
import { Wash } from '@/types';

export default function HistoryScreen() {
  const { user } = useAuthStore();
  const [washes, setWashes] = useState<Wash[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWashes();
  }, []);

  const loadWashes = async () => {
    try {
      if (user?.id) {
        const userWashes = await api.getUserWashes(user.id);
        setWashes(userWashes);
      }
    } catch (error: any) {
      if (api.handleAuthError(error)) {
        router.replace('/blocked');
        return;
      }
      console.error('Error loading washes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getServiceLabel = (service: string) => {
    const services: Record<string, string> = {
      exterior: 'Extérieur',
      interior: 'Intérieur', 
      full: 'Complet',
      other: 'Autre',
    };
    return services[service] || service;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderWashItem = ({ item }: { item: Wash }) => (
    <View style={styles.washItem}>
      <View style={styles.washHeader}>
        <Text style={styles.clientName}>
          {item.expand?.client?.name || 'Client inconnu'}
        </Text>
        <Text style={styles.price}>{item.price.toLocaleString()} FCFA</Text>
      </View>
      
      <View style={styles.washDetails}>
        <Text style={styles.service}>{getServiceLabel(item.service)}</Text>
        <Text style={styles.plate}>
          {item.expand?.client?.plate || 'Plaque inconnue'}
        </Text>
      </View>
      
      <Text style={styles.date}>
        {formatDate(item.created!)}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Chargement de l'historique...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Historique</Text>
      </View>

      {washes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>Aucun lavage</Text>
          <Text style={styles.emptySubtitle}>
            Vous n'avez pas encore effectué de lavage.
          </Text>
          <TouchableOpacity
            style={styles.newWashButton}
            onPress={() => router.push('/new-wash')}
          >
            <Text style={styles.newWashButtonText}>Créer un lavage</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.countText}>
            {washes.length} lavage{washes.length > 1 ? 's' : ''} au total
          </Text>
          <FlatList
            data={washes}
            renderItem={renderWashItem}
            keyExtractor={(item) => item.id!}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 10,
  },
  countText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 15,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  washItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  washHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  washDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  service: {
    fontSize: 14,
    color: '#3498db',
    backgroundColor: '#e8f4f8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  plate: {
    fontSize: 14,
    color: '#7f8c8d',
    fontFamily: 'monospace',
  },
  date: {
    fontSize: 12,
    color: '#95a5a6',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  newWashButton: {
    backgroundColor: '#3498db',
    borderRadius: 10,
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  newWashButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});