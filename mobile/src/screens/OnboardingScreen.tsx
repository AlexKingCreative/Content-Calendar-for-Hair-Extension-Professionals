import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation';

const { width, height } = Dimensions.get('window');

const serviceIcons = {
  extensions: require('../../assets/icon_hair_extensions.png'),
  toppers: require('../../assets/icon_toppers.png'),
  wigs: require('../../assets/icon_wigs.png'),
  coloring: require('../../assets/icon_color_services.png'),
  cutting: require('../../assets/icon_cut_and_style.png'),
};

const CONFETTI_COLORS = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#f59e0b', '#10b981', '#D4A574', '#E8B4A0'];

const ConfettiPiece = ({ delay, color, startX }: { delay: number; color: string; startX: number }) => {
  const fallAnim = useRef(new Animated.Value(0)).current;
  const swayAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    const startAnimation = () => {
      Animated.parallel([
        Animated.timing(fallAnim, {
          toValue: height + 50,
          duration: 3000 + Math.random() * 1000,
          delay,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(swayAnim, {
              toValue: 30,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(swayAnim, {
              toValue: -30,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
        ),
        Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          })
        ),
      ]).start();
    };
    startAnimation();
  }, []);
  
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: startX,
        top: -20,
        width: 10 + Math.random() * 8,
        height: 10 + Math.random() * 8,
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? 50 : 2,
        transform: [
          { translateY: fallAnim },
          { translateX: swayAnim },
          { rotate },
        ],
      }}
    />
  );
};

const BuildingScheduleAnimation = ({ onComplete }: { onComplete: () => void }) => {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [statusText, setStatusText] = useState('Analyzing your preferences...');
  const [progressPercent, setProgressPercent] = useState(0);
  
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
    
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2500,
      useNativeDriver: false,
    }).start();
    
    const statusUpdates = [
      { time: 600, text: 'Building your content calendar...', percent: 35 },
      { time: 1200, text: 'Customizing post ideas...', percent: 60 },
      { time: 1800, text: 'Adding personalized hashtags...', percent: 85 },
      { time: 2200, text: 'Finalizing your schedule...', percent: 100 },
    ];
    
    const timers = statusUpdates.map(update => 
      setTimeout(() => {
        setStatusText(update.text);
        setProgressPercent(update.percent);
      }, update.time)
    );
    
    const completeTimer = setTimeout(onComplete, 2800);
    
    return () => {
      timers.forEach(t => clearTimeout(t));
      clearTimeout(completeTimer);
    };
  }, []);
  
  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  return (
    <Animated.View style={[buildingStyles.container, { opacity: fadeAnim }]}>
      <View style={buildingStyles.content}>
        <View style={buildingStyles.iconContainer}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Ionicons name="calendar" size={40} color="#FFFFFF" />
          </Animated.View>
        </View>
        
        <Text style={buildingStyles.title}>Building Your Schedule</Text>
        <Text style={buildingStyles.statusText}>{statusText}</Text>
        
        <View style={buildingStyles.progressContainer}>
          <Animated.View 
            style={[
              buildingStyles.progressBar,
              { 
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                })
              }
            ]} 
          />
        </View>
        <Text style={buildingStyles.percentText}>{progressPercent}%</Text>
        
        <View style={buildingStyles.featuresRow}>
          <View style={buildingStyles.featureItem}>
            <Ionicons name="checkmark-circle" size={16} color="#D4A574" />
            <Text style={buildingStyles.featureText}>365 Days</Text>
          </View>
          <View style={buildingStyles.featureItem}>
            <Ionicons name="checkmark-circle" size={16} color="#D4A574" />
            <Text style={buildingStyles.featureText}>Custom Hashtags</Text>
          </View>
          <View style={buildingStyles.featureItem}>
            <Ionicons name="checkmark-circle" size={16} color="#D4A574" />
            <Text style={buildingStyles.featureText}>AI Captions</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const buildingStyles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FAF7F5',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#D4A574',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#D4A574',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D1810',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusText: {
    fontSize: 15,
    color: '#8B7355',
    textAlign: 'center',
    marginBottom: 24,
  },
  progressContainer: {
    width: 200,
    height: 8,
    backgroundColor: '#E8E0D8',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#D4A574',
    borderRadius: 4,
  },
  percentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4A574',
    marginBottom: 32,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featureText: {
    fontSize: 12,
    color: '#5D4E3C',
  },
});

const CelebrationAnimation = ({ onComplete }: { onComplete: () => void }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(checkAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
    
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, []);
  
  const confettiPieces = React.useMemo(() => 
    Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      delay: Math.random() * 500,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      startX: Math.random() * width,
    })),
  []);
  
  return (
    <View style={celebrationStyles.container}>
      {confettiPieces.map(piece => (
        <ConfettiPiece 
          key={piece.id} 
          delay={piece.delay} 
          color={piece.color} 
          startX={piece.startX} 
        />
      ))}
      
      <Animated.View style={[celebrationStyles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={celebrationStyles.iconContainer}>
          <Animated.View style={{ opacity: checkAnim, transform: [{ scale: checkAnim }] }}>
            <Ionicons name="checkmark" size={48} color="#FFFFFF" />
          </Animated.View>
        </View>
        <Text style={celebrationStyles.title}>You're All Set!</Text>
        <Text style={celebrationStyles.subtitle}>Your personalized content calendar is ready</Text>
        <View style={celebrationStyles.starsRow}>
          <Ionicons name="star" size={20} color="#f59e0b" />
          <Text style={celebrationStyles.encouragement}>Let's create amazing content!</Text>
          <Ionicons name="star" size={20} color="#f59e0b" />
        </View>
      </Animated.View>
    </View>
  );
};

const celebrationStyles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FAF7F5',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#D4A574',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#D4A574',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D1810',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8B7355',
    textAlign: 'center',
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  encouragement: {
    fontSize: 14,
    color: '#A89580',
    fontWeight: '500',
  },
});

const SERVICE_CATEGORIES = [
  { 
    id: 'extensions', 
    label: 'Hair Extensions', 
    description: 'Tape-ins, sew-ins, fusion, etc.',
    color: '#E8B4A0',
  },
  { 
    id: 'toppers', 
    label: 'Hair Toppers', 
    description: 'Coverage for thinning hair',
    color: '#D4A574',
  },
  { 
    id: 'wigs', 
    label: 'Wigs & Units', 
    description: 'Full coverage solutions',
    color: '#C9A67A',
  },
  { 
    id: 'coloring', 
    label: 'Color Services', 
    description: 'Balayage, highlights, color',
    color: '#B8A090',
  },
  { 
    id: 'cutting', 
    label: 'Cut & Style', 
    description: 'Haircuts and styling',
    color: '#A89580',
  },
];

const ServiceIcon = ({ serviceId, size = 48, selected }: { serviceId: string; size?: number; selected?: boolean }) => {
  const iconSource = serviceIcons[serviceId as keyof typeof serviceIcons];
  
  return (
    <View style={{ 
      width: size, 
      height: size, 
      overflow: 'hidden',
      borderRadius: 12,
      backgroundColor: selected ? '#FDF5F0' : '#FAF7F5',
    }}>
      <Image
        source={iconSource}
        style={{
          width: size,
          height: size,
        }}
        resizeMode="cover"
      />
    </View>
  );
};

const CONTENT_GOALS = [
  { id: 'clients', label: 'Attract More Clients', icon: 'people' as const },
  { id: 'premium', label: 'Book Premium Services', icon: 'diamond' as const },
  { id: 'consistent', label: 'Post Consistently', icon: 'calendar' as const },
  { id: 'brand', label: 'Build My Brand', icon: 'star' as const },
  { id: 'education', label: 'Educate My Audience', icon: 'school' as const },
  { id: 'engagement', label: 'Increase Engagement', icon: 'heart' as const },
];

const CERTIFIED_BRANDS = [
  "Great Lengths",
  "Bellami",
  "Hairdreams",
  "Hotheads",
  "IBE",
  "NBR",
  "DreamCatchers",
  "Habit Hand Tied",
  "Invisible Bead",
  "Halocouture",
  "Locks & Bonds",
];

const EXTENSION_METHODS = [
  "Tape-In",
  "Hand-Tied Weft",
  "Machine Weft",
  "Keratin/Fusion",
  "I-Tip/Micro Links",
  "Clip-Ins",
  "Sew-In",
  "Halo/Wire",
];

type OnboardingData = {
  services: string[];
  postingServices: string[];
  location: string;
  goals: string[];
  instagram: string;
  selectedBrand: string;
  customBrand: string;
  methods: string[];
};

export default function OnboardingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const [step, setStep] = useState(0);
  const [showBuildingSchedule, setShowBuildingSchedule] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    services: [],
    postingServices: [],
    location: '',
    goals: [],
    instagram: '',
    selectedBrand: '',
    customBrand: '',
    methods: [],
  });
  const [showBrandPicker, setShowBrandPicker] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const hasExtensions = data.services.includes('extensions');
  const baseSteps = 4;
  const totalSteps = hasExtensions ? baseSteps + 1 : baseSteps;

  const animateProgress = (toStep: number) => {
    Animated.spring(progressAnim, {
      toValue: toStep / totalSteps,
      friction: 8,
      useNativeDriver: false,
    }).start();
  };

  const toggleService = (id: string) => {
    setData(prev => ({
      ...prev,
      services: prev.services.includes(id)
        ? prev.services.filter(s => s !== id)
        : [...prev.services, id],
    }));
  };

  const togglePostingService = (id: string) => {
    setData(prev => ({
      ...prev,
      postingServices: prev.postingServices.includes(id)
        ? prev.postingServices.filter(s => s !== id)
        : [...prev.postingServices, id],
    }));
  };

  const toggleGoal = (id: string) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.includes(id)
        ? prev.goals.filter(g => g !== id)
        : [...prev.goals, id],
    }));
  };

  const selectBrand = (brand: string) => {
    setData(prev => ({
      ...prev,
      selectedBrand: brand,
      customBrand: brand === 'Other' ? prev.customBrand : '',
    }));
    setShowBrandPicker(false);
  };

  const toggleMethod = (method: string) => {
    setData(prev => ({
      ...prev,
      methods: prev.methods.includes(method)
        ? prev.methods.filter(m => m !== method)
        : [...prev.methods, method],
    }));
  };

  const getLogicalStep = () => {
    if (step === 0) return 0;
    if (step === 1) return 'postingServices';
    if (hasExtensions && step === 2) return 'brands';
    if (hasExtensions) return step - 1;
    return step;
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      const nextStep = step + 1;
      setStep(nextStep);
      animateProgress(nextStep);
    } else {
      setShowBuildingSchedule(true);
    }
  };
  
  const handleBuildingComplete = () => {
    setShowBuildingSchedule(false);
    setShowCelebration(true);
  };
  
  const handleCelebrationComplete = () => {
    navigation.navigate('Register');
  };

  const handleBack = () => {
    if (step > 0) {
      const prevStep = step - 1;
      setStep(prevStep);
      animateProgress(prevStep);
    } else {
      navigation.goBack();
    }
  };

  const canContinue = () => {
    const logicalStep = getLogicalStep();
    switch (logicalStep) {
      case 0:
        return data.services.length > 0;
      case 'postingServices':
        return data.postingServices.length > 0;
      case 'brands':
        const hasBrand = data.selectedBrand !== '' && (data.selectedBrand !== 'Other' || data.customBrand.trim().length > 0);
        return hasBrand && data.methods.length > 0;
      case 2:
        return data.location.trim().length > 0;
      case 3:
        return data.goals.length > 0;
      default:
        return false;
    }
  };

  const renderStep = () => {
    const logicalStep = getLogicalStep();
    switch (logicalStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What services do you offer?</Text>
            <Text style={styles.stepSubtitle}>
              Select all that apply - we'll personalize your content
            </Text>
            <View style={styles.servicesGrid}>
              {SERVICE_CATEGORIES.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  style={[
                    styles.serviceCard,
                    data.services.includes(service.id) && styles.serviceCardSelected,
                  ]}
                  onPress={() => toggleService(service.id)}
                >
                  <ServiceIcon 
                    serviceId={service.id} 
                    size={52} 
                    selected={data.services.includes(service.id)}
                  />
                  <View style={styles.serviceTextContainer}>
                    <Text
                      style={[
                        styles.serviceLabel,
                        data.services.includes(service.id) && styles.serviceLabelSelected,
                      ]}
                    >
                      {service.label}
                    </Text>
                    <Text style={styles.serviceDescription}>{service.description}</Text>
                  </View>
                  {data.services.includes(service.id) && (
                    <View style={styles.checkmark}>
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'postingServices':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Which services do you want to attract?</Text>
            <Text style={styles.stepSubtitle}>
              Select the services you want more clients for
            </Text>
            <View style={styles.servicesGrid}>
              {SERVICE_CATEGORIES.filter(s => data.services.includes(s.id)).map((service) => (
                <TouchableOpacity
                  key={service.id}
                  style={[
                    styles.serviceCard,
                    data.postingServices.includes(service.id) && styles.serviceCardSelected,
                  ]}
                  onPress={() => togglePostingService(service.id)}
                >
                  <ServiceIcon 
                    serviceId={service.id} 
                    size={52} 
                    selected={data.postingServices.includes(service.id)}
                  />
                  <View style={styles.serviceTextContainer}>
                    <Text
                      style={[
                        styles.serviceLabel,
                        data.postingServices.includes(service.id) && styles.serviceLabelSelected,
                      ]}
                    >
                      {service.label}
                    </Text>
                    <Text style={styles.serviceDescription}>{service.description}</Text>
                  </View>
                  {data.postingServices.includes(service.id) && (
                    <View style={styles.checkmark}>
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.quoteContainer}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=100' }}
                style={styles.quoteAvatar}
              />
              <View style={styles.quoteTextContainer}>
                <Text style={styles.quoteText}>
                  "What you post about, you will bring about!"
                </Text>
                <Text style={styles.quoteAuthor}>
                  — Ashley Diana, Hair Extension Business Coach
                </Text>
              </View>
            </View>
          </View>
        );

      case 'brands':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Extension Expertise</Text>
            <Text style={styles.stepSubtitle}>
              Select your certified brand and methods
            </Text>
            
            <Text style={styles.sectionLabel}>Certified Brand</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowBrandPicker(true)}
            >
              <Text style={data.selectedBrand ? styles.dropdownButtonText : styles.dropdownPlaceholder}>
                {data.selectedBrand || 'Select your certified brand'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#A89580" />
            </TouchableOpacity>
            
            {showBrandPicker && (
              <View style={styles.pickerOverlay}>
                <View style={styles.pickerContainer}>
                  <View style={styles.pickerHeader}>
                    <Text style={styles.pickerTitle}>Select Brand</Text>
                    <TouchableOpacity onPress={() => setShowBrandPicker(false)}>
                      <Ionicons name="close" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                  </View>
                  <ScrollView style={styles.pickerList}>
                    {CERTIFIED_BRANDS.map((brand) => (
                      <TouchableOpacity
                        key={brand}
                        style={[
                          styles.pickerItem,
                          data.selectedBrand === brand && styles.pickerItemSelected,
                        ]}
                        onPress={() => selectBrand(brand)}
                      >
                        <Text style={[
                          styles.pickerItemText,
                          data.selectedBrand === brand && styles.pickerItemTextSelected,
                        ]}>
                          {brand}
                        </Text>
                        {data.selectedBrand === brand && (
                          <Ionicons name="checkmark" size={20} color="#D4A574" />
                        )}
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                      style={[
                        styles.pickerItem,
                        data.selectedBrand === 'Other' && styles.pickerItemSelected,
                      ]}
                      onPress={() => selectBrand('Other')}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        data.selectedBrand === 'Other' && styles.pickerItemTextSelected,
                      ]}>
                        Other
                      </Text>
                      {data.selectedBrand === 'Other' && (
                        <Ionicons name="checkmark" size={20} color="#D4A574" />
                      )}
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              </View>
            )}
            
            {data.selectedBrand === 'Other' && (
              <View style={styles.customBrandContainer}>
                <Text style={styles.customBrandLabel}>Enter your brand name</Text>
                <TextInput
                  style={styles.customBrandInput}
                  placeholder="e.g., Custom Brand Co."
                  placeholderTextColor="#A89580"
                  value={data.customBrand}
                  onChangeText={(text) => setData(prev => ({ ...prev, customBrand: text }))}
                />
                <Text style={styles.customBrandHint}>This will be saved to your profile only</Text>
              </View>
            )}

            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Extension Methods</Text>
            <View style={styles.brandGrid}>
              {EXTENSION_METHODS.map((method) => (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.brandChip,
                    data.methods.includes(method) && styles.brandChipSelected,
                  ]}
                  onPress={() => toggleMethod(method)}
                >
                  <Text
                    style={[
                      styles.brandChipText,
                      data.methods.includes(method) && styles.brandChipTextSelected,
                    ]}
                  >
                    {method}
                  </Text>
                  {data.methods.includes(method) && (
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Where are you located?</Text>
            <Text style={styles.stepSubtitle}>
              We'll include location-based hashtags for you
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons name="location" size={24} color="#D4A574" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="City, State (e.g., Miami, FL)"
                placeholderTextColor="#A89580"
                value={data.location}
                onChangeText={(text) => setData(prev => ({ ...prev, location: text }))}
                autoCapitalize="words"
              />
            </View>
            <View style={styles.inputContainer}>
              <Ionicons name="logo-instagram" size={24} color="#E1306C" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Instagram handle"
                placeholderTextColor="#A89580"
                value={data.instagram}
                onChangeText={(text) => setData(prev => ({ ...prev, instagram: text }))}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What are your content goals?</Text>
            <Text style={styles.stepSubtitle}>
              Select all that apply
            </Text>
            <View style={styles.goalsGrid}>
              {CONTENT_GOALS.map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  style={[
                    styles.goalCard,
                    data.goals.includes(goal.id) && styles.goalCardSelected,
                  ]}
                  onPress={() => toggleGoal(goal.id)}
                >
                  <Ionicons
                    name={goal.icon}
                    size={24}
                    color={data.goals.includes(goal.id) ? '#D4A574' : '#8B7355'}
                  />
                  <Text
                    style={[
                      styles.goalLabel,
                      data.goals.includes(goal.id) && styles.goalLabelSelected,
                    ]}
                  >
                    {goal.label}
                  </Text>
                  {data.goals.includes(goal.id) && (
                    <View style={styles.goalCheckmark}>
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  if (showBuildingSchedule) {
    return <BuildingScheduleAnimation onComplete={handleBuildingComplete} />;
  }
  
  if (showCelebration) {
    return <CelebrationAnimation onComplete={handleCelebrationComplete} />;
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#5D4E3C" />
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {step + 1} of {totalSteps}
            </Text>
          </View>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderStep()}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.continueButton, !canContinue() && styles.continueButtonDisabled]}
            onPress={handleNext}
            disabled={!canContinue()}
          >
            <Text style={styles.continueButtonText}>
              {step === totalSteps - 1 ? 'Create Account' : 'Continue'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flex: 1,
    gap: 6,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#E5D5C5',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D4A574',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#8B7355',
    textAlign: 'right',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#5D4E3C',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 15,
    color: '#8B7355',
    marginBottom: 28,
    lineHeight: 22,
  },
  servicesGrid: {
    gap: 12,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  serviceCardSelected: {
    borderColor: '#D4A574',
    backgroundColor: '#FFF8F0',
  },
  serviceIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceTextContainer: {
    flex: 1,
  },
  serviceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5D4E3C',
    marginBottom: 2,
  },
  serviceLabelSelected: {
    color: '#D4A574',
  },
  serviceDescription: {
    fontSize: 13,
    color: '#A89580',
  },
  checkmark: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#D4A574',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5D5C5',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: '#5D4E3C',
  },
  experienceList: {
    gap: 12,
  },
  experienceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    gap: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  experienceCardSelected: {
    borderColor: '#D4A574',
    backgroundColor: '#FFF8F0',
  },
  experienceRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D4A574',
    alignItems: 'center',
    justifyContent: 'center',
  },
  experienceRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#D4A574',
  },
  experienceText: {
    flex: 1,
  },
  experienceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5D4E3C',
    marginBottom: 2,
  },
  experienceLabelSelected: {
    color: '#D4A574',
  },
  experienceDescription: {
    fontSize: 13,
    color: '#A89580',
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  goalCard: {
    width: (width - 60) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    gap: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  goalCardSelected: {
    borderColor: '#D4A574',
    backgroundColor: '#FFF8F0',
  },
  goalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5D4E3C',
    textAlign: 'center',
  },
  goalLabelSelected: {
    color: '#D4A574',
  },
  goalCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#D4A574',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5D4E3C',
    marginBottom: 12,
  },
  brandGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  brandChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: '#E5D5C5',
  },
  brandChipSelected: {
    borderColor: '#D4A574',
    backgroundColor: '#D4A574',
  },
  brandChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5D4E3C',
  },
  brandChipTextSelected: {
    color: '#FFFFFF',
  },
  quoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF5F0',
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5D5C5',
  },
  quoteAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  quoteTextContainer: {
    flex: 1,
  },
  quoteText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#5D4E3C',
    lineHeight: 20,
  },
  quoteAuthor: {
    fontSize: 12,
    color: '#A89580',
    marginTop: 4,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5D5C5',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#D4A574',
    borderRadius: 14,
    padding: 18,
    shadowColor: '#D4A574',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E5D5C5',
    marginBottom: 12,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#5D4E3C',
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: '#A89580',
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: width - 48,
    maxHeight: height * 0.6,
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5D5C5',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5D4E3C',
  },
  pickerList: {
    maxHeight: height * 0.5,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F0EB',
  },
  pickerItemSelected: {
    backgroundColor: '#FFF8F0',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#5D4E3C',
  },
  pickerItemTextSelected: {
    color: '#D4A574',
    fontWeight: '600',
  },
  customBrandContainer: {
    marginTop: 8,
    marginBottom: 12,
  },
  customBrandLabel: {
    fontSize: 14,
    color: '#8B7355',
    marginBottom: 8,
  },
  customBrandInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#5D4E3C',
    borderWidth: 1,
    borderColor: '#E5D5C5',
  },
  customBrandHint: {
    fontSize: 12,
    color: '#A89580',
    marginTop: 6,
    fontStyle: 'italic',
  },
});
