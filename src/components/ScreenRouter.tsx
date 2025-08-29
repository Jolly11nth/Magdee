import React, { Suspense } from 'react';
import { AppInitLoadingScreen } from './LoadingScreen';
import { DebugFallback } from './DebugFallback';
import { createLazyComponent } from '../utils/componentHelpers';

// Core app screens - using improved lazy loading with error handling
const WelcomeScreen = createLazyComponent(
  () => import('./WelcomeScreen'),
  'WelcomeScreen',
  'WelcomeScreen'
);

const IntroScreen = createLazyComponent(
  () => import('./IntroScreen'),
  'IntroScreen',
  'IntroScreen'
);

const AuthScreen = createLazyComponent(
  () => import('./AuthScreen'),
  'AuthScreen',
  'AuthScreen'
);

const LoginScreen = createLazyComponent(
  () => import('./LoginScreen'),
  'LoginScreen',
  'LoginScreen'
);

const SignupScreen = createLazyComponent(
  () => import('./SignupScreen'),
  'SignupScreen',
  'SignupScreen'
);

const HomeScreen = createLazyComponent(
  () => import('./HomeScreen'),
  'HomeScreen',
  'HomeScreen'
);

const MyLibraryScreen = createLazyComponent(
  () => import('./MyLibraryScreen'),
  'MyLibraryScreen',
  'MyLibraryScreen'
);

const BookCoverScreen = createLazyComponent(
  () => import('./BookCoverScreen'),
  'BookCoverScreen',
  'BookCoverScreen'
);

const AudioPlayerScreen = createLazyComponent(
  () => import('./AudioPlayerScreen'),
  'AudioPlayerScreen',
  'AudioPlayerScreen'
);

const ProfileScreen = createLazyComponent(
  () => import('./ProfileScreen'),
  'ProfileScreen',
  'ProfileScreen'
);

const EditProfileScreen = createLazyComponent(
  () => import('./EditProfileScreen'),
  'EditProfileScreen',
  'EditProfileScreen'
);

const NotificationsScreen = createLazyComponent(
  () => import('./NotificationsScreen'),
  'NotificationsScreen',
  'NotificationsScreen'
);

const LanguageSettingsScreen = createLazyComponent(
  () => import('./LanguageSettingsScreen'),
  'LanguageSettingsScreen',
  'LanguageSettingsScreen'
);

const UploadPDFScreen = createLazyComponent(
  () => import('./UploadPDFScreen'),
  'UploadPDFScreen',
  'UploadPDFScreen'
);

const ChatAIScreen = createLazyComponent(
  () => import('./ChatAIScreen'),
  'ChatAIScreen',
  'ChatAIScreen'
);

const MoodTrackingScreen = createLazyComponent(
  () => import('./MoodTrackingScreen'),
  'MoodTrackingScreen',
  'MoodTrackingScreen'
);

const ProgressTrackingScreen = createLazyComponent(
  () => import('./ProgressTrackingScreen'),
  'ProgressTrackingScreen',
  'ProgressTrackingScreen'
);

const SelfHelpProgramsScreen = createLazyComponent(
  () => import('./SelfHelpProgramsScreen'),
  'SelfHelpProgramsScreen',
  'SelfHelpProgramsScreen'
);

const SpeakToTherapistScreen = createLazyComponent(
  () => import('./SpeakToTherapistScreen'),
  'SpeakToTherapistScreen',
  'SpeakToTherapistScreen'
);

const TermsOfServiceScreen = createLazyComponent(
  () => import('./TermsOfServiceScreen'),
  'TermsOfServiceScreen',
  'TermsOfServiceScreen'
);

const PrivacyPolicyScreen = createLazyComponent(
  () => import('./PrivacyPolicyScreen'),
  'PrivacyPolicyScreen',
  'PrivacyPolicyScreen'
);

// Optional debug screens - these might not exist
const PythonBackendTestScreen = createLazyComponent(
  () => import('./PythonBackendTestScreen'),
  'PythonBackendTestScreen',
  'PythonBackendTestScreen'
);

interface ScreenRouterProps {
  currentScreen: string;
  user: any;
  onNavigate: (screen: string) => void;
  books: any[];
  selectedBook: any;
  onSelectBook: (book: any) => void;
  onPlayBook: (book: any) => void;
  audioPlayerHandlers: any;
}

// Error boundary for individual screens
class ScreenErrorBoundary extends React.Component<
  { children: React.ReactNode; screenName: string; onNavigate: (screen: string) => void },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; screenName: string; onNavigate: (screen: string) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static displayName = 'ScreenErrorBoundary';

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Screen error in ${this.props.screenName}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          backgroundColor: '#ffffff',
          fontFamily: 'Poppins, sans-serif'
        }}>
          {/* Header */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            right: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h1 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#111827'
            }}>
              Screen Error
            </h1>
            <button
              onClick={() => this.props.onNavigate('back')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#F3F4F6',
                color: '#374151',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Back
            </button>
          </div>

          {/* Error content */}
          <div style={{ textAlign: 'center', maxWidth: '300px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '12px'
            }}>
              Screen Loading Error
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#6B7280',
              lineHeight: '1.5',
              marginBottom: '20px'
            }}>
              Something went wrong loading the {this.props.screenName} screen.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: undefined });
                }}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#4A90E2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => this.props.onNavigate('home')}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#F3F4F6',
                  color: '#374151',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function ScreenRouterComponent({
  currentScreen,
  user,
  onNavigate,
  books,
  selectedBook,
  onSelectBook,
  onPlayBook,
  audioPlayerHandlers
}: ScreenRouterProps) {
  
  const commonProps = {
    onNavigate,
    user,
    books,
    selectedBook,
    onSelectBook,
    onPlayBook,
    audioPlayerHandlers
  };

  const renderScreen = () => {
    // Handle debug screens that might not exist
    const debugScreens = [
      'auth-debug',
      'connection-debug', 
      'login-debug',
      'login-test',
      'error-analytics'
    ];

    if (debugScreens.includes(currentScreen)) {
      return (
        <DebugFallback 
          screenName={currentScreen} 
          onNavigate={onNavigate}
        />
      );
    }

    // Handle main app screens
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen {...commonProps} />;
      
      case 'intro':
        return <IntroScreen {...commonProps} />;
      
      case 'auth':
        return <AuthScreen {...commonProps} />;
      
      case 'login':
        return <LoginScreen {...commonProps} />;
      
      case 'signup':
        return <SignupScreen {...commonProps} />;
      
      case 'home':
        return <HomeScreen {...commonProps} />;
      
      case 'library':
      case 'my-library':
        return <MyLibraryScreen {...commonProps} />;
      
      case 'book-cover':
        return <BookCoverScreen {...commonProps} />;
      
      case 'audio-player':
        return <AudioPlayerScreen {...commonProps} />;
      
      case 'profile':
        return <ProfileScreen {...commonProps} />;
      
      case 'edit-profile':
        return <EditProfileScreen {...commonProps} />;
      
      case 'notifications':
        return <NotificationsScreen {...commonProps} />;
      
      case 'language-settings':
        return <LanguageSettingsScreen {...commonProps} />;
      
      case 'upload-pdf':
        return <UploadPDFScreen {...commonProps} />;
      
      case 'chat-ai':
        return <ChatAIScreen {...commonProps} />;
      
      case 'mood-tracking':
        return <MoodTrackingScreen {...commonProps} />;
      
      case 'progress-tracking':
        return <ProgressTrackingScreen {...commonProps} />;
      
      case 'self-help-programs':
        return <SelfHelpProgramsScreen {...commonProps} />;
      
      case 'speak-to-therapist':
        return <SpeakToTherapistScreen {...commonProps} />;
      
      case 'terms-of-service':
        return <TermsOfServiceScreen {...commonProps} />;
      
      case 'privacy-policy':
        return <PrivacyPolicyScreen {...commonProps} />;

      case 'python-backend-test':
        return <PythonBackendTestScreen {...commonProps} />;
      
      default:
        console.warn(`Unknown screen: ${currentScreen}. Redirecting to welcome.`);
        return <WelcomeScreen {...commonProps} />;
    }
  };

  return (
    <Suspense fallback={
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff'
      }}>
        <AppInitLoadingScreen />
      </div>
    }>
      <div style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <ScreenErrorBoundary screenName={currentScreen} onNavigate={onNavigate}>
          {renderScreen()}
        </ScreenErrorBoundary>
      </div>
    </Suspense>
  );
}

// Add displayName for debugging
ScreenRouterComponent.displayName = 'ScreenRouter';

export { ScreenRouterComponent as ScreenRouter };
export default ScreenRouterComponent;