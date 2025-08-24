// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ActivityIndicator,
//   TouchableOpacity,
//   ScrollView,
// } from 'react-native';
// import { router } from 'expo-router';
// import { api } from '@/services/api';
// import { useAuthStore } from '@/store/auth';
// import { Wash } from '@/types';

// interface Stats {
//   totalWashes: number;
//   totalRevenue: number;
// }

// interface PeriodStats {
//   today: Stats;
//   week: Stats;
//   month: Stats;
// }

// export default function StatsScreen() {
//   const { user } = useAuthStore();
//   const [stats, setStats] = useState<PeriodStats>({
//     today: { totalWashes: 0, totalRevenue: 0 },
//     week: { totalWashes: 0, totalRevenue: 0 },
//     month: { totalWashes: 0, totalRevenue: 0 },
//   });
//   const [loading, setLoading] = useState(true);
//   const [washes, setWashes] = useState<Wash[]>([]);

//   useEffect(() => {
//     loadAllWashes();
//   }, []);

//   const loadAllWashes = async () => {
//     try {
//       if (user?.id) {
//         const userWashes = await api.getUserWashes(user.id);
//         setWashes(userWashes);
//         calculateStats(userWashes);
//       }
//     } catch (error: any) {
//       if (api.handleAuthError(error)) {
//         router.replace('/blocked');
//         return;
//       }
//       console.error('Error loading washes:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const calculateStats = (allWashes: Wash[]) => {
//     const now = new Date();
//     const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//     const weekStart = new Date(today);
//     weekStart.setDate(weekStart.getDate() - weekStart.getDay());
//     const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

//     const todayWashes = allWashes.filter(wash => {
//       const washDate = new Date(wash.created!);
//       return washDate >= today;
//     });

//     const weekWashes = allWashes.filter(wash => {
//       const washDate = new Date(wash.created!);
//       return washDate >= weekStart;
//     });

//     const monthWashes = allWashes.filter(wash => {
//       const washDate = new Date(wash.created!);
//       return washDate >= monthStart;
//     });

//     setStats({
//       today: {
//         totalWashes: todayWashes.length,
//         totalRevenue: todayWashes.reduce((sum, wash) => sum + wash.price, 0),
//       },
//       week: {
//         totalWashes: weekWashes.length,
//         totalRevenue: weekWashes.reduce((sum, wash) => sum + wash.price, 0),
//       },
//       month: {
//         totalWashes: monthWashes.length,
//         totalRevenue: monthWashes.reduce((sum, wash) => sum + wash.price, 0),
//       },
//     });
//   };

//   const getServiceStats = () => {
//     const serviceCount: Record<string, { count: number; revenue: number }> = {};

//     washes.forEach(wash => {
//       if (!serviceCount[wash.service]) {
//         serviceCount[wash.service] = { count: 0, revenue: 0 };
//       }
//       serviceCount[wash.service].count++;
//       serviceCount[wash.service].revenue += wash.price;
//     });

//     return serviceCount;
//   };

//   const getServiceLabel = (service: string) => {
//     const services: Record<string, string> = {
//       exterior: 'Extérieur',
//       interior: 'Intérieur',
//       full: 'Complet',
//       other: 'Autre',
//     };
//     return services[service] || service;
//   };

//   if (loading) {
//     return (
//       <View style={[styles.container, styles.centered]}>
//         <ActivityIndicator size="large" color="#3498db" />
//         <Text style={styles.loadingText}>Calcul des statistiques...</Text>
//       </View>
//     );
//   }

//   const serviceStats = getServiceStats();

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()}>
//           <Text style={styles.backButton}>← Retour</Text>
//         </TouchableOpacity>
//         <Text style={styles.title}>Statistiques</Text>
//       </View>

//       <ScrollView showsVerticalScrollIndicator={false}>
//         {/* Period Stats */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Statistiques par période</Text>

//           <View style={styles.statCard}>
//             <Text style={styles.periodTitle}>Aujourd'hui</Text>
//             <View style={styles.statRow}>
//               <View style={styles.statItem}>
//                 <Text style={styles.statNumber}>{stats.today.totalWashes}</Text>
//                 <Text style={styles.statLabel}>Lavages</Text>
//               </View>
//               <View style={styles.statItem}>
//                 <Text style={styles.statNumber}>
//                   {stats.today.totalRevenue.toLocaleString()}
//                 </Text>
//                 <Text style={styles.statLabel}>FCFA</Text>
//               </View>
//             </View>
//           </View>

//           <View style={styles.statCard}>
//             <Text style={styles.periodTitle}>Cette semaine</Text>
//             <View style={styles.statRow}>
//               <View style={styles.statItem}>
//                 <Text style={styles.statNumber}>{stats.week.totalWashes}</Text>
//                 <Text style={styles.statLabel}>Lavages</Text>
//               </View>
//               <View style={styles.statItem}>
//                 <Text style={styles.statNumber}>
//                   {stats.week.totalRevenue.toLocaleString()}
//                 </Text>
//                 <Text style={styles.statLabel}>FCFA</Text>
//               </View>
//             </View>
//           </View>

//           <View style={styles.statCard}>
//             <Text style={styles.periodTitle}>Ce mois</Text>
//             <View style={styles.statRow}>
//               <View style={styles.statItem}>
//                 <Text style={styles.statNumber}>{stats.month.totalWashes}</Text>
//                 <Text style={styles.statLabel}>Lavages</Text>
//               </View>
//               <View style={styles.statItem}>
//                 <Text style={styles.statNumber}>
//                   {stats.month.totalRevenue.toLocaleString()}
//                 </Text>
//                 <Text style={styles.statLabel}>FCFA</Text>
//               </View>
//             </View>
//           </View>
//         </View>

//         {/* Service Breakdown */}
//         {Object.keys(serviceStats).length > 0 && (
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Répartition par service</Text>
//             {Object.entries(serviceStats).map(([service, data]) => (
//               <View key={service} style={styles.serviceCard}>
//                 <Text style={styles.serviceName}>
//                   {getServiceLabel(service)}
//                 </Text>
//                 <View style={styles.serviceStats}>
//                   <Text style={styles.serviceCount}>
//                     {data.count} lavages
//                   </Text>
//                   <Text style={styles.serviceRevenue}>
//                     {data.revenue.toLocaleString()} FCFA
//                   </Text>
//                 </View>
//               </View>
//             ))}
//           </View>
//         )}

//         {/* Average Stats */}
//         {washes.length > 0 && (
//           <View style={styles.section}>
//             <Text style={styles.sectionTitle}>Moyennes</Text>
//             <View style={styles.averageCard}>
//               <View style={styles.averageItem}>
//                 <Text style={styles.averageLabel}>Prix moyen par lavage</Text>
//                 <Text style={styles.averageValue}>
//                   {Math.round(
//                     washes.reduce((sum, wash) => sum + wash.price, 0) / washes.length
//                   ).toLocaleString()} FCFA
//                 </Text>
//               </View>
//               <View style={styles.averageItem}>
//                 <Text style={styles.averageLabel}>Revenus journaliers moyens</Text>
//                 <Text style={styles.averageValue}>
//                   {Math.round(stats.month.totalRevenue / 30).toLocaleString()} FCFA
//                 </Text>
//               </View>
//             </View>
//           </View>
//         )}

//         <View style={styles.spacer} />
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//     paddingHorizontal: 20,
//   },
//   centered: {
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingTop: 50,
//     marginBottom: 20,
//   },
//   backButton: {
//     fontSize: 16,
//     color: '#3498db',
//     marginRight: 15,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#2c3e50',
//   },
//   loadingText: {
//     fontSize: 16,
//     color: '#7f8c8d',
//     marginTop: 10,
//   },
//   section: {
//     marginBottom: 25,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#2c3e50',
//     marginBottom: 15,
//   },
//   statCard: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 20,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   periodTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#2c3e50',
//     marginBottom: 15,
//     textAlign: 'center',
//   },
//   statRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//   },
//   statItem: {
//     alignItems: 'center',
//   },
//   statNumber: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#3498db',
//   },
//   statLabel: {
//     fontSize: 14,
//     color: '#7f8c8d',
//     marginTop: 5,
//   },
//   serviceCard: {
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     padding: 15,
//     marginBottom: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 1,
//     elevation: 1,
//   },
//   serviceName: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#2c3e50',
//     marginBottom: 8,
//   },
//   serviceStats: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   serviceCount: {
//     fontSize: 14,
//     color: '#7f8c8d',
//   },
//   serviceRevenue: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#27ae60',
//   },
//   averageCard: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   averageItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f1f2f6',
//   },
//   averageLabel: {
//     fontSize: 14,
//     color: '#7f8c8d',
//     flex: 1,
//   },
//   averageValue: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#2c3e50',
//   },
//   spacer: {
//     height: 50,
//   },
// });

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/auth';
import { Wash } from '@/types';

interface Stats {
  totalWashes: number;
  totalRevenue: number;
}
interface PeriodStats {
  today: Stats;
  week: Stats;
  month: Stats; // ← dépend maintenant du mois sélectionné
}

// --- Utils dates (UTC safe pour éviter les bords de journée) ---
const toUTCStartOfDay = (d: Date) =>
  new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0)
  );
const startOfTodayUTC = () => toUTCStartOfDay(new Date());
const startOfWeekUTC = () => {
  const t = startOfTodayUTC();
  // Lundi comme début de semaine
  const day = t.getUTCDay(); // 0=dim
  const diff = (day + 6) % 7;
  t.setUTCDate(t.getUTCDate() - diff);
  return t;
};
const firstOfMonthUTC = (y: number, m: number) =>
  new Date(Date.UTC(y, m, 1, 0, 0, 0, 0));
const addMonthsUTC = (d: Date, delta: number) =>
  new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + delta, 1, 0, 0, 0, 0)
  );
const nextMonthUTC = (d: Date) => addMonthsUTC(d, 1);
const daysInMonth = (y: number, m: number) =>
  new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
const monthLabelFR = (d: Date) =>
  d.toLocaleString('fr-FR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

export default function StatsScreen() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<PeriodStats>({
    today: { totalWashes: 0, totalRevenue: 0 },
    week: { totalWashes: 0, totalRevenue: 0 },
    month: { totalWashes: 0, totalRevenue: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [washes, setWashes] = useState<Wash[]>([]);

  // Mois sélectionné (1er jour du mois en UTC)
  const [monthCursor, setMonthCursor] = useState<Date>(() => {
    const now = new Date();
    return firstOfMonthUTC(now.getUTCFullYear(), now.getUTCMonth());
  });

  // Nombre de jours dans le mois sélectionné (pour la moyenne/jour)
  const selectedMonthDays = useMemo(
    () => daysInMonth(monthCursor.getUTCFullYear(), monthCursor.getUTCMonth()),
    [monthCursor]
  );

  useEffect(() => {
    loadAllWashes();
  }, []);

  useEffect(() => {
    // Recalcule les stats quand on change de mois (sans refetch côté serveur)
    calculateStats(washes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthCursor]);

  const loadAllWashes = async () => {
    try {
      if (user?.id) {
        const userWashes = await api.getUserWashes(user.id);
        setWashes(userWashes);
        calculateStats(userWashes);
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

  const calculateStats = (allWashes: Wash[]) => {
    // Bornes "aujourd’hui" / "semaine courante" (UTC)
    const todayStart = startOfTodayUTC();
    const weekStart = startOfWeekUTC();

    // Bornes du mois sélectionné (UTC)
    const monthStart = monthCursor;
    const nextMonthStart = nextMonthUTC(monthCursor);

    const todayWashes = allWashes.filter((w) => {
      const d = new Date(w.created!);
      return d >= todayStart;
    });

    const weekWashes = allWashes.filter((w) => {
      const d = new Date(w.created!);
      return d >= weekStart;
    });

    const monthWashes = allWashes.filter((w) => {
      const d = new Date(w.created!);
      return d >= monthStart && d < nextMonthStart;
    });

    setStats({
      today: {
        totalWashes: todayWashes.length,
        totalRevenue: todayWashes.reduce((s, w) => s + w.price, 0),
      },
      week: {
        totalWashes: weekWashes.length,
        totalRevenue: weekWashes.reduce((s, w) => s + w.price, 0),
      },
      month: {
        totalWashes: monthWashes.length,
        totalRevenue: monthWashes.reduce((s, w) => s + w.price, 0),
      },
    });
  };

  const getServiceStats = () => {
    const serviceCount: Record<string, { count: number; revenue: number }> = {};
    // On calcule sur le mois sélectionné (plus logique pour ce bloc)
    const monthStart = monthCursor;
    const nextMonthStart = nextMonthUTC(monthCursor);

    washes.forEach((w) => {
      const d = new Date(w.created!);
      if (d < monthStart || d >= nextMonthStart) return;

      if (!serviceCount[w.service]) {
        serviceCount[w.service] = { count: 0, revenue: 0 };
      }
      serviceCount[w.service].count++;
      serviceCount[w.service].revenue += w.price;
    });

    return serviceCount;
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

  const goPrevMonth = () => setMonthCursor((prev) => addMonthsUTC(prev, -1));
  const goNextMonth = () => setMonthCursor((prev) => addMonthsUTC(prev, +1));

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Calcul des statistiques...</Text>
      </View>
    );
  }

  const serviceStats = getServiceStats();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Statistiques</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Period Stats */}
        <View style={styles.section}>
          {/* Aujourd'hui */}
          <View style={styles.statCard}>
            <Text style={styles.periodTitle}>Aujourd'hui</Text>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.today.totalWashes}</Text>
                <Text style={styles.statLabel}>Lavages</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {stats.today.totalRevenue.toLocaleString()}
                </Text>
                <Text style={styles.statLabel}>FCFA</Text>
              </View>
            </View>
          </View>

          {/* Semaine courante */}
          <View style={styles.statCard}>
            <Text style={styles.periodTitle}>Cette semaine</Text>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.week.totalWashes}</Text>
                <Text style={styles.statLabel}>Lavages</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {stats.week.totalRevenue.toLocaleString()}
                </Text>
                <Text style={styles.statLabel}>FCFA</Text>
              </View>
            </View>
          </View>

          {/* Mois sélectionné + navigation */}
          <View style={styles.statCard}>
            <View style={styles.monthNav}>
              <TouchableOpacity onPress={goPrevMonth} style={styles.monthBtn}>
                <Text style={styles.monthBtnText}>◀︎</Text>
              </TouchableOpacity>
              <Text style={styles.monthLabel}>{monthLabelFR(monthCursor)}</Text>
              <TouchableOpacity onPress={goNextMonth} style={styles.monthBtn}>
                <Text style={styles.monthBtnText}>▶︎</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.month.totalWashes}</Text>
                <Text style={styles.statLabel}>Lavages</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {stats.month.totalRevenue.toLocaleString()}
                </Text>
                <Text style={styles.statLabel}>FCFA</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Répartition par service (sur le mois sélectionné) */}
        {Object.keys(serviceStats).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Répartition par service ({monthLabelFR(monthCursor)})
            </Text>
            {Object.entries(serviceStats).map(([service, data]) => (
              <View key={service} style={styles.serviceCard}>
                <Text style={styles.serviceName}>
                  {getServiceLabel(service)}
                </Text>
                <View style={styles.serviceStats}>
                  <Text style={styles.serviceCount}>{data.count} lavages</Text>
                  <Text style={styles.serviceRevenue}>
                    {data.revenue.toLocaleString()} FCFA
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Moyennes (adaptées au mois sélectionné) */}

        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingHorizontal: 20 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: { fontSize: 16, color: '#3498db', marginRight: 15 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50' },
  loadingText: { fontSize: 16, color: '#7f8c8d', marginTop: 10 },
  section: { marginBottom: 25 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  statCard: {
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
  periodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  statRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#3498db' },
  statLabel: { fontSize: 14, color: '#7f8c8d', marginTop: 5 },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  monthBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  monthBtnText: { fontSize: 18, color: '#2c3e50' },
  monthLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    textTransform: 'capitalize',
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  serviceStats: { flexDirection: 'row', justifyContent: 'space-between' },
  serviceCount: { fontSize: 14, color: '#7f8c8d' },
  serviceRevenue: { fontSize: 14, fontWeight: 'bold', color: '#27ae60' },
  averageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  averageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  averageLabel: { fontSize: 14, color: '#7f8c8d', flex: 1 },
  averageValue: { fontSize: 14, fontWeight: 'bold', color: '#2c3e50' },
  spacer: { height: 50 },
});
