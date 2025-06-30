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
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { router } from 'expo-router';

export default function DashboardScreen() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    genre: '',
    budget: '',
    fundingGoal: '',
  });
  const [loading, setLoading] = useState(false);

  const createFilmSubmission = useMutation(api.filmSubmissions.createSubmission);
  // Note: In a real app, you'd get the actual user ID from authentication
  // For now, we'll use a placeholder that won't cause errors
  const userSubmissions = useQuery(api.filmSubmissions.getAllSubmissions);

  const genres = [
    'Drama', 'Comedy', 'Action', 'Horror', 'Documentary', 
    'Animation', 'Thriller', 'Romance', 'Sci-Fi', 'Fantasy'
  ];

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.videoUrl || !formData.genre) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Validate video URL
    const isValidUrl = formData.videoUrl.includes('youtube.com') || 
                      formData.videoUrl.includes('youtu.be') || 
                      formData.videoUrl.includes('vimeo.com');
    
    if (!isValidUrl) {
      Alert.alert('Error', 'Please provide a valid YouTube or Vimeo URL');
      return;
    }

    setLoading(true);
    try {
      // Note: In a real app, you'd get the actual user ID from authentication
      // For demo purposes, we'll create a temporary user ID
      const tempUserId = "temp-user-id" as any; // This will need to be fixed with real auth
      
      await createFilmSubmission({
        userId: tempUserId,
        title: formData.title,
        description: formData.description,
        videoUrl: formData.videoUrl,
        genre: formData.genre,
        budget: formData.budget || undefined,
        fundingGoal: formData.fundingGoal || undefined,
      });

      Alert.alert('Success!', 'Your film has been submitted successfully!', [
        { text: 'OK', onPress: () => {
          setFormData({
            title: '',
            description: '',
            videoUrl: '',
            genre: '',
            budget: '',
            fundingGoal: '',
          });
        }}
      ]);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to submit film');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
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
            <Text style={styles.title}>Submit Your Film</Text>
            <Text style={styles.subtitle}>
              Share your creative work with the indie film community
            </Text>
            <View style={styles.opportunityBanner}>
              <Text style={styles.bannerEmoji}>🌟</Text>
              <Text style={styles.bannerText}>
                Your submission will have the chance to be seen by top industry insiders including producers and production studios when we launch!
              </Text>
            </View>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Film Title *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                placeholder="Enter your film title"
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Video URL *</Text>
              <TextInput
                style={styles.input}
                value={formData.videoUrl}
                onChangeText={(text) => setFormData(prev => ({ ...prev, videoUrl: text }))}
                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                keyboardType="url"
                autoCapitalize="none"
              />
              <Text style={styles.hint}>YouTube or Vimeo links only</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Genre *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreScroll}>
                {genres.map((genre) => (
                  <TouchableOpacity
                    key={genre}
                    style={[
                      styles.genreChip,
                      formData.genre === genre && styles.selectedGenre
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, genre }))}
                  >
                    <Text style={[
                      styles.genreText,
                      formData.genre === genre && styles.selectedGenreText
                    ]}>
                      {genre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Describe your film, its story, and what makes it unique..."
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Budget</Text>
                <TextInput
                  style={styles.input}
                  value={formData.budget}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, budget: text }))}
                  placeholder="$10,000"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Funding Goal</Text>
                <TextInput
                  style={styles.input}
                  value={formData.fundingGoal}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, fundingGoal: text }))}
                  placeholder="$50,000"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Submitting...' : 'Submit Film'}
            </Text>
          </TouchableOpacity>

          {userSubmissions && userSubmissions.length > 0 && (
            <View style={styles.submissionsSection}>
              <Text style={styles.sectionTitle}>Recent Submissions</Text>
              {userSubmissions.slice(0, 3).map((submission) => (
                <View key={submission._id} style={styles.submissionCard}>
                  <Text style={styles.submissionTitle}>{submission.title}</Text>
                  <Text style={styles.submissionGenre}>{submission.genre}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{submission.status}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
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
    marginBottom: 16,
  },
  cameraIcon: {
    alignItems: 'center',
  },
  cameraBody: {
    width: 50,
    height: 32,
    backgroundColor: '#FF8A65', // Coral color from logo
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cameraLens: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4A6CF7', // Blue accent
    position: 'absolute',
    left: 6,
  },
  cameraLens2: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4A6CF7',
    position: 'absolute',
    right: 6,
  },
  cameraTop: {
    width: 24,
    height: 12,
    backgroundColor: '#FF8A65',
    borderRadius: 6,
    marginTop: -6,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 20,
  },
  opportunityBanner: {
    backgroundColor: 'rgba(255, 138, 101, 0.2)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 138, 101, 0.3)',
  },
  bannerEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  bannerText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    color: '#FFFFFF',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: '#FF8A65',
    marginTop: 4,
  },
  genreScroll: {
    marginTop: 8,
  },
  genreChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  selectedGenre: {
    backgroundColor: '#FF8A65',
    borderColor: '#FF8A65',
  },
  genreText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  selectedGenreText: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#FF8A65',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  submissionsSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  submissionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  submissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  submissionGenre: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: 'rgba(255, 138, 101, 0.3)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    color: '#FF8A65',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});