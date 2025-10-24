import React, { useState, useEffect, Suspense } from 'react';
import { AuthProvider, useAuth } from './frontend/components/AuthContext';
import { NotificationProvider } from './frontend/components/NotificationContext';
import { ToastContainer } from './frontend/components/ToastNotification';
import { ConnectionStatus } from './frontend/components/ConnectionStatus';


import { EnvironmentValidator } from './frontend/components/EnvironmentValidator';
import { AuthLoadingScreen, AppInitLoadingScreen } from './frontend/components/LoadingScreen';
import { PerformanceOptimizer, PerformanceErrorBoundary } from './frontend/components/PerformanceOptimizer';
import { ScreenRouter } from './frontend/components/ScreenRouter';
import { useAudioPlayer } from './frontend/hooks/useAudioPlayer';
import { createNavigationHandler, createBookHandlers } from './frontend/utils/navigation';
import { BOOKS_DATA } from './frontend/constants/booksData';
import { errorAnalytics } from './frontend/services/errorAnalytics';



function AppContentComponent() {
  const { user, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [navigationHistory, setNavigationHistory] = useState<string[]>(['welcome']);
  const [books] = useState(BOOKS_DATA);
  const [appInitialized, setAppInitialized] = useState(false);


  
  const audioPlayerHandlers = useAudioPlayer(books);
  const { selectedBook, setSelectedBook } = audioPlayerHandlers;
  
  // Enhanced navigation handler with history tracking
  const handleNavigate = (screen: string) => {
    if (screen === 'back') {
      // Go back to previous screen
      if (navigationHistory.length > 1) {
        const newHistory = [...navigationHistory];
        newHistory.pop(); // Remove current screen
        const previousScreen = newHistory[newHistory.length - 1];
        setCurrentScreen(previousScreen);
        setNavigationHistory(newHistory);
      } else {
        // If no history, go to home
        setCurrentScreen('home');
        setNavigationHistory(['home']);
      }
    } else {
      // Regular navigation
      try {
        const navigationHandler = createNavigationHandler(user, setCurrentScreen, setSelectedBook);
        navigationHandler(screen);
        
        // Update history (avoid duplicates of consecutive same screens)
        setNavigationHistory(prev => {
          if (prev[prev.length - 1] !== screen) {
            return [...prev, screen];
          }
          return prev;
        });
      } catch (error) {
        console.error('Navigation error:', error);
        // Fallback navigation
        setCurrentScreen(screen);
        setNavigationHistory(prev => [...prev, screen]);
      }
    }
  };
  
  const { handleSelectBook, handlePlayBook } = createBookHandlers(setSelectedBook, (screen) => {
    setCurrentScreen(screen);
    setNavigationHistory(prev => {
      if (prev[prev.length - 1] !== screen) {
        return [...prev, screen];
      }
      return prev;
    });
  });

  // App initialization effect
  useEffect(() => {
    if (!loading) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(async () => {
        try {
          // Sync any locally stored errors when app initializes (async, non-blocking)
          if (errorAnalytics && typeof errorAnalytics.syncLocalErrors === 'function') {
            errorAnalytics.syncLocalErrors()
              .then(() => console.log('✅ Local error analytics synced on app start'))
              .catch(syncError => console.warn('⚠️ Failed to sync local errors on app start:', syncError));
          }
        } catch (error) {
          console.warn('Error analytics not available:', error);
        }
        
        // Initialize navigation history based on auth state
        if (user) {
          setCurrentScreen('home');
          setNavigationHistory(['home']);
        } else {
          setCurrentScreen('welcome');
          setNavigationHistory(['welcome']);
        }
        
        setAppInitialized(true);
      }, 50); // Reduced delay for faster initialization
      
      return () => clearTimeout(timer);
    }
  }, [loading, user]);

  // Show auth loading screen while checking authentication
  if (loading) {
    return (
      <div className="auth-loading performance-critical session-loading">
        <AuthLoadingScreen />
      </div>
    );
  }

  // Show app initialization loading
  if (!appInitialized) {
    return (
      <div className="initial-load performance-critical">
        <AppInitLoadingScreen />
      </div>
    );
  }

  return (
    <NotificationProvider>
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        fontFamily: 'Poppins, sans-serif'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '375px',
          height: '812px',
          backgroundColor: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '1.5rem',
          boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25), 0 0 0 1px rgb(0 0 0 / 0.05)',
          // Add transform for smoother rendering
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden'
        }}>
          <Suspense fallback={<AppInitLoadingScreen />}>
            <ScreenRouter 
              currentScreen={currentScreen}
              user={user}
              onNavigate={handleNavigate}
              books={books}
              selectedBook={selectedBook}
              onSelectBook={handleSelectBook}
              onPlayBook={handlePlayBook}
              audioPlayerHandlers={audioPlayerHandlers}
            />
          </Suspense>
          <ToastContainer />
          <ConnectionStatus />

        </div>
      </div>
    </NotificationProvider>
  );
}

// Add displayName for debugging
AppContentComponent.displayName = 'AppContentComponent';

function AppComponent() {
  return (
    <PerformanceErrorBoundary>
      <EnvironmentValidator>
        <AuthProvider>
          <PerformanceOptimizer>
            <AppContentComponent />
          </PerformanceOptimizer>
        </AuthProvider>
      </EnvironmentValidator>
    </PerformanceErrorBoundary>
  );
}

// Add displayName for debugging
AppComponent.displayName = 'AppComponent';

export default AppComponent;