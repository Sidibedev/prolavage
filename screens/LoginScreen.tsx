// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   ActivityIndicator,
// } from 'react-native';
// import { router } from 'expo-router';
// import { useAuthStore } from '@/store/auth';

// export default function LoginScreen() {
//   const [phone, setPhone] = useState('');
//   const [pin, setPin] = useState('');
//   const [loading, setLoading] = useState(false);
//   const { login } = useAuthStore();

//   const handleLogin = async () => {
//     if (!phone.trim() || !pin.trim()) {
//       Alert.alert('Erreur', 'Veuillez remplir tous les champs');
//       return;
//     }

//     if (pin.length !== 5) {
//       Alert.alert('Erreur', 'Le PIN doit contenir 5 chiffres');
//       return;
//     }

//     setLoading(true);
//     try {
//       await login(phone, pin);
//       // Navigation will be handled by the auth state change
//     } catch (error: any) {
//       console.error('Login error:', error);
//       Alert.alert(
//         'Erreur de connexion',
//         error?.message || 'Vérifiez vos identifiants'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.title}>Prolavage</Text>
//         <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>
//       </View>

//       <View style={styles.form}>
//         <View style={styles.inputGroup}>
//           <Text style={styles.label}>Numéro de téléphone</Text>
//           <TextInput
//             style={styles.input}
//             value={phone}
//             onChangeText={setPhone}
//             placeholder="Ex: 77123456"
//             keyboardType="phone-pad"
//             autoCapitalize="none"
//           />
//         </View>

//         <View style={styles.inputGroup}>
//           <Text style={styles.label}>Code PIN</Text>
//           <TextInput
//             style={styles.input}
//             value={pin}
//             onChangeText={setPin}
//             placeholder="5 chiffres"
//             keyboardType="numeric"
//             maxLength={5}
//             secureTextEntry
//           />
//         </View>

//         <TouchableOpacity
//           style={[styles.loginButton, loading && styles.loginButtonDisabled]}
//           onPress={handleLogin}
//           disabled={loading}
//         >
//           {loading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.loginButtonText}>Se connecter</Text>
//           )}
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//     paddingHorizontal: 20,
//   },
//   header: {
//     alignItems: 'center',
//     marginTop: 100,
//     marginBottom: 50,
//   },
//   title: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     color: '#2c3e50',
//     marginBottom: 10,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#7f8c8d',
//     textAlign: 'center',
//   },
//   form: {
//     width: '100%',
//   },
//   inputGroup: {
//     marginBottom: 20,
//   },
//   label: {
//     fontSize: 16,
//     fontWeight: '500',
//     color: '#2c3e50',
//     marginBottom: 8,
//   },
//   input: {
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     paddingHorizontal: 15,
//     paddingVertical: 15,
//     fontSize: 16,
//     borderWidth: 1,
//     borderColor: '#e1e8ed',
//   },
//   loginButton: {
//     backgroundColor: '#3498db',
//     borderRadius: 10,
//     paddingVertical: 15,
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   loginButtonDisabled: {
//     backgroundColor: '#bdc3c7',
//   },
//   loginButtonText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
// });

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '@/store/auth';

export default function LoginScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuthStore();

  const validate = () => {
    if (mode === 'signup' && !name.trim()) {
      Alert.alert('Erreur', 'Entrez votre nom');
      return false;
    }
    if (!phone.trim() || !pin.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return false;
    }
    if (!/^\d{5}$/.test(pin)) {
      Alert.alert('Erreur', 'Le PIN doit contenir exactement 5 chiffres');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(phone, pin);
      } else {
        await register(name.trim(), phone.trim(), pin.trim());
      }
      // la navigation se fera via ton guard d’auth
    } catch (error: any) {
      console.error(`${mode} error:`, error);
      // PocketBase renvoie souvent { data: { phone: { message } } } sur duplicate
      const apiMsg =
        error?.response?.data?.phone?.message ||
        error?.response?.message ||
        error?.message ||
        'Une erreur est survenue';
      Alert.alert('Erreur', apiMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Prolavage</Text>
        <Text style={styles.subtitle}>
          {mode === 'login'
            ? 'Connectez-vous à votre compte'
            : 'Créez votre compte'}
        </Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        {mode === 'signup' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom complet</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Ex: Mamadou Ndiaye"
              autoCapitalize="words"
            />
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Numéro de téléphone</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Ex: 77123456"
            keyboardType="phone-pad"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Code PIN</Text>
          <TextInput
            style={styles.input}
            value={pin}
            onChangeText={setPin}
            placeholder="5 chiffres"
            keyboardType="numeric"
            maxLength={5}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            setMode((prev) => (prev === 'login' ? 'signup' : 'login'))
          }
          style={{ marginTop: 14, alignItems: 'center' }}
        >
          <Text style={styles.switchText}>
            {mode === 'login'
              ? 'Pas de compte ? Créez-le'
              : 'Déjà inscrit ? Se connecter'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', paddingHorizontal: 20 },
  header: { alignItems: 'center', marginTop: 100, marginBottom: 50 },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  subtitle: { fontSize: 16, color: '#7f8c8d', textAlign: 'center' },
  form: { width: '100%' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#2c3e50', marginBottom: 8 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  submitButton: {
    backgroundColor: '#3498db',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: { backgroundColor: '#bdc3c7' },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  switchText: {
    color: '#3498db',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
