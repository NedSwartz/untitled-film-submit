import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { router } from 'expo-router';

type AffiliationType = 'lmu' | 'other';

export default function WelcomeScreen() {
  const [step, setStep] = useState<'welcome' | 'register'>('welcome');
  const [affiliationType, setAffiliationType] = useState<AffiliationType>('lmu');
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    username: '',
    affiliation: '',
    bio: '',
  });
  const [loading, setLoading] = useState(false);

  const createUser = useMutation(api.users.createUser);

  const handleRegister = async () => {
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.username) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Validate LMU email if LMU is selected
    if (affiliationType === 'lmu' && !formData.email.endsWith('@lmu.edu') && !formData.email.endsWith('@lion.lmu.edu')) {
      Alert.alert('Error', 'Please use your LMU email address (@lmu.edu or @lion.lmu.edu)');
      return;
    }

    setLoading(true);
    try {
      const result = await createUser({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        affiliation: formData.affiliation || undefined,
        socialLinks: [],
        accountType: 'filmmaker',
        bio: formData.bio || undefined,
        isLMU: affiliationType === 'lmu',
      });

      if (result.success) {
        Alert.alert('Success!', 'Your account has been created successfully', [
          { text: 'Continue', onPress: () => router.push('/dashboard') }
        ]);
      } else {
        Alert.alert('Added to Waitlist', 'You\'ve been added to our waitlist. LMU students get priority access!');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'welcome') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.cameraIcon}>
                <View style={styles.cameraBody}>
                  <View style={styles.cameraLens} />
                  <View style={styles.cameraLens2} />
                </View>
                <View style={styles.cameraTop} />
              </View>
            </View>
            <Text style={styles.title}>UNTITLED</Text>
            <Text style={styles.tagline}>THE INDIE FILM REVOLUTION</Text>
            <Text style={styles.description}>
              Submit your films and get discovered by industry professionals
            </Text>
          </View>

          <View style={styles.affiliationSection}>
            <Text style={styles.sectionTitle}>Are you affiliated with LMU?</Text>
            
            <TouchableOpacity
              style={[styles.affiliationCard, affiliationType === 'lmu' && styles.selectedCard]}
              onPress={() => setAffiliationType('lmu')}
            >
              <Text style={styles.affiliationEmoji}>🎓</Text>
              <Text style={styles.affiliationTitle}>LMU Student/Alumni</Text>
              <Text style={styles.affiliationDescription}>
                Priority access with your LMU email address
              </Text>
              <View style={styles.priorityBadge}>
                <Text style={styles.priorityText}>PRIORITY ACCESS</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.affiliationCard, affiliationType === 'other' && styles.selectedCard]}
              onPress={() => setAffiliationType('other')}
            >
              <Text style={styles.affiliationEmoji}>🎬</Text>
              <Text style={styles.affiliationTitle}>Independent Filmmaker</Text>
              <Text style={styles.affiliationDescription}>
                Join our waitlist for future access
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => setStep('register')}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setStep('welcome')}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.registerTitle}>Create Account</Text>
            <Text style={styles.registerSubtitle}>
              Join the indie film revolution as a filmmaker
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Email Address * {affiliationType === 'lmu' && '(LMU Email Required)'}
              </Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                placeholder={affiliationType === 'lmu' ? 'your.email@lmu.edu' : 'your.email@example.com'}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {affiliationType === 'lmu' && (
                <Text style={styles.hint}>Use your LMU email for instant approval</Text>
              )}
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>First Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.firstName}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, firstName: text }))}
                  placeholder="John"
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Last Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.lastName}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, lastName: text }))}
                  placeholder="Doe"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username *</Text>
              <TextInput
                style={styles.input}
                value={formData.username}
                onChangeText={(text) => setFormData(prev => ({ ...prev, username: text }))}
                placeholder="johndoe"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Affiliation</Text>
              <TextInput
                style={styles.input}
                value={formData.affiliation}
                onChangeText={(text) => setFormData(prev => ({ ...prev, affiliation: text }))}
                placeholder={affiliationType === 'lmu' ? 'LMU School of Film and Television' : 'Your school or organization'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.bio}
                onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
                placeholder="Tell us about yourself and your filmmaking experience..."
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.disabledButton]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A6CF7', // Blue gradient background
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 20,
  },
  cameraIcon: {
    alignItems: 'center',
  },
  cameraBody: {
    width: 60,
    height: 40,
    backgroundColor: '#FF8A65', // Coral color from logo
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cameraLens: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4A6CF7', // Blue accent
    position: 'absolute',
    left: 8,
  },
  cameraLens2: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4A6CF7',
    position: 'absolute',
    right: 8,
  },
  cameraTop: {
    width: 30,
    height: 15,
    backgroundColor: '#FF8A65',
    borderRadius: 8,
    marginTop: -8,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF8A65', // Coral color from logo
    marginBottom: 4,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF8A65',
    marginBottom: 16,
    letterSpacing: 1,
  },
  description: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.9,
  },
  affiliationSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  affiliationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  selectedCard: {
    borderColor: '#FF8A65',
    backgroundColor: 'rgba(255, 138, 101, 0.2)',
  },
  affiliationEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  affiliationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  affiliationDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 8,
  },
  priorityBadge: {
    backgroundColor: '#FF8A65',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  continueButton: {
    backgroundColor: '#FF8A65',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backButtonText: {
    color: '#FF8A65',
    fontSize: 16,
  },
  registerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  registerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: '#FF8A65',
    marginTop: 4,
  },
  registerButton: {
    backgroundColor: '#FF8A65',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});