import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/auth';
import { DayStats } from '@/types';

export default function HomeScreen() {
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState<DayStats>({
    totalWashes: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTodayStats();
  }, []);

  const loadTodayStats = async () => {
    try {
      if (user?.id) {
        const todayStats = await api.getTodayStats(user.id);
        setStats(todayStats);
      }
    } catch (error: any) {
      if (api.handleAuthError(error)) {
        router.replace('/blocked');
        return;
      }
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTodayStats();
  }, []);

  const handleLogout = async () => {
    await logout();
    // Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
    //   { text: 'Annuler', style: 'cancel' },
    //   {
    //     text: 'Déconnexion',
    //     style: 'destructive',
    //     onPress: async () => await logout(),
    //   },
    // ]);
  };

  const todayLabel = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#2f80ed" />
        <Text style={styles.loadingText}>Chargement…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header / Hero */}
        <View style={styles.hero}>
          <View style={styles.heroHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.hello}>Bonjour</Text>
              <Text style={styles.name} numberOfLines={1}>
                {user?.name ?? 'Laveur'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleLogout}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.logoutText}>Se déconnecter</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chipsRow}>
            <View style={[styles.chip, styles.chipAccent]}>
              <Text style={[styles.chipText, styles.chipTextAccent]}>
                Aujourd’hui, {todayLabel}
              </Text>
            </View>
          </View>

          <View style={styles.kpisRow}>
            <View style={[styles.kpiCard, styles.kpiPrimary]}>
              <Text style={styles.kpiIcon}>🧽</Text>
              <Text style={styles.kpiValue}>{stats.totalWashes}</Text>
              <Text style={styles.kpiLabel}>Lavages</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiIcon}>💰</Text>
              <Text style={styles.kpiValue}>
                {stats.totalRevenue.toLocaleString()}
              </Text>
              <Text style={styles.kpiLabel}>FCFA</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.primaryButton, styles.shadowLg]}
            onPress={() => router.push('/new-wash')}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryButtonText}>🧽 Nouveau lavage</Text>
            <Text style={styles.primaryButtonSub}>
              Enregistrer un nouveau lavage
            </Text>
          </TouchableOpacity>

          {/* <TouchableOpacity
            style={[styles.tile, styles.shadowSm, { marginBottom: 15 }]}
            onPress={() => router.push('/clients')}
            activeOpacity={0.9}
          >
            <Text style={styles.tileIcon}>👥</Text>
            <Text style={styles.tileTitle}>Mes clients</Text>
            <Text style={styles.tileSub}>
              Voir, ajouter, modifier mes clients
            </Text>
          </TouchableOpacity> */}

          <View style={styles.grid}>
            <TouchableOpacity
              style={[styles.tile, styles.shadowSm]}
              onPress={() => router.push('/history')}
              activeOpacity={0.9}
            >
              <Text style={styles.tileIcon}>📋</Text>
              <Text style={styles.tileTitle}>Historique</Text>
              <Text style={styles.tileSub}>Tous les lavages</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tile, styles.shadowSm]}
              onPress={() => router.push('/stats')}
              activeOpacity={0.9}
            >
              <Text style={styles.tileIcon}>📊</Text>
              <Text style={styles.tileTitle}>Statistiques</Text>
              <Text style={styles.tileSub}>Jour • Semaine • Mois</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const CARD_BG = '#ffffff';
const BG = '#f6f8fb';
const TEXT_DARK = '#1f2d3d';
const TEXT_MUTED = '#6b778b';
const BRAND = '#2f80ed';
const BRAND_DARK = '#1f6ad1';
const ACCENT = '#e9f3ff';
const SHADOW = '#0f172a';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },

  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG,
    flex: 1,
  },
  loadingText: { marginTop: 10, color: TEXT_MUTED },

  // HERO
  hero: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 18,
    marginTop: 8,
    marginBottom: 18,
    shadowColor: SHADOW,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  hello: { color: TEXT_MUTED, fontSize: 14 },
  name: { color: TEXT_DARK, fontSize: 17, fontWeight: '700' },
  logoutText: {
    color: '#e53935',
    fontSize: 13,
    textDecorationLine: 'underline',
  },

  chipsRow: { flexDirection: 'row', gap: 10, marginTop: 20, marginBottom: 14 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#f1f5f9',
  },
  chipText: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  chipAccent: { backgroundColor: ACCENT },
  chipTextAccent: { color: BRAND, fontWeight: '700' },

  kpisRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  kpiCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eef2f7',
  },
  kpiPrimary: {
    backgroundColor: '#eef5ff',
    borderColor: '#d9e8ff',
  },
  kpiIcon: { fontSize: 20, marginBottom: 6 },
  kpiValue: { fontSize: 28, fontWeight: '800', color: BRAND },
  kpiLabel: {
    fontSize: 12,
    marginTop: 2,
    color: TEXT_MUTED,
    fontWeight: '600',
  },

  // ACTIONS
  actions: { marginTop: 6 },
  primaryButton: {
    backgroundColor: BRAND,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 14,
  },
  primaryButtonText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  primaryButtonSub: { color: '#e6f1ff', fontSize: 12, marginTop: 4 },

  grid: { flexDirection: 'row', gap: 12 },
  tile: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#eef2f7',
  },
  tileIcon: { fontSize: 20, marginBottom: 8 },
  tileTitle: { fontSize: 16, color: TEXT_DARK, fontWeight: '700' },
  tileSub: { fontSize: 12, color: TEXT_MUTED, marginTop: 2 },

  // Shadows presets
  shadowLg: {
    shadowColor: SHADOW,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  shadowSm: {
    shadowColor: SHADOW,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
});
