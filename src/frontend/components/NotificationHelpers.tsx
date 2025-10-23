import { useCallback } from 'react';
import { useNotifications } from './NotificationContext';

export function useNotificationHelpers() {
  const { addNotification } = useNotifications();

  const notifyPDFUpload = useCallback((fileName: string) => {
    addNotification({
      type: 'info',
      title: 'PDF Uploaded Successfully',
      message: `Converting "${fileName}" to audio...`,
      duration: 4000,
    });
  }, [addNotification]);

  const notifyConversionComplete = useCallback((bookTitle: string) => {
    addNotification({
      type: 'success',
      title: 'Audio Conversion Complete ✓',
      message: `"${bookTitle}" is ready to listen`,
      duration: 6000,
      action: {
        label: 'Listen Now',
        handler: () => {
          // Navigate to player or book - would need to be passed from parent
          console.log('Navigate to book player');
        }
      }
    });
  }, [addNotification]);

  const notifyConversionError = useCallback((fileName: string) => {
    addNotification({
      type: 'warning',
      title: 'Conversion Failed',
      message: `Could not convert "${fileName}". Please try a different PDF format.`,
      duration: 8000,
      action: {
        label: 'Try Again',
        handler: () => {
          console.log('Navigate back to upload');
        }
      }
    });
  }, [addNotification]);

  const notifyChapterComplete = useCallback((chapterNumber: number, totalChapters: number, bookTitle: string) => {
    addNotification({
      type: 'achievement',
      title: `Chapter ${chapterNumber} Complete! 🎯`,
      message: `${totalChapters - chapterNumber} chapters remaining in "${bookTitle}"`,
      duration: 5000,
    });
  }, [addNotification]);

  const notifyBookComplete = useCallback((bookTitle: string) => {
    addNotification({
      type: 'achievement',
      title: 'Book Completed! 🎉',
      message: `Congratulations! You finished "${bookTitle}"`,
      duration: 0, // Persistent
      action: {
        label: 'View Library',
        handler: () => {
          console.log('Navigate to library');
        }
      }
    });
  }, [addNotification]);

  const notifyDailyGoal = useCallback((minutesListened: number) => {
    addNotification({
      type: 'achievement',
      title: 'Daily Goal Achieved! 🎯',
      message: `You've completed ${minutesListened} minutes of learning today`,
      duration: 6000,
    });
  }, [addNotification]);

  const notifyLearningStreak = useCallback((days: number) => {
    addNotification({
      type: 'achievement',
      title: `${days}-Day Learning Streak! 🔥`,
      message: 'Keep up the consistent learning habit',
      duration: 6000,
    });
  }, [addNotification]);

  const notifyListeningBreak = useCallback((minutes: number) => {
    addNotification({
      type: 'info',
      title: 'Take a Break',
      message: `You've been listening for ${minutes} minutes. Consider taking a short break.`,
      duration: 8000,
      action: {
        label: 'Pause',
        handler: () => {
          console.log('Pause playback');
        }
      }
    });
  }, [addNotification]);

  const notifyShuffleMode = useCallback((enabled: boolean) => {
    addNotification({
      type: 'info',
      title: enabled ? 'Shuffle Mode ON' : 'Shuffle Mode OFF',
      message: enabled ? 'Discovering new perspectives' : 'Back to sequential playback',
      duration: 3000,
    });
  }, [addNotification]);

  const notifyRepeatMode = useCallback((enabled: boolean) => {
    addNotification({
      type: 'info',
      title: enabled ? 'Repeat Mode ON' : 'Repeat Mode OFF',
      message: enabled ? 'Reinforcing key concepts' : 'Ready for next book',
      duration: 3000,
    });
  }, [addNotification]);

  const notifySpeedTip = useCallback(() => {
    addNotification({
      type: 'info',
      title: '💡 Learning Tip',
      message: 'Try 1.25x speed for faster learning while maintaining comprehension',
      duration: 8000,
      action: {
        label: 'Adjust Speed',
        handler: () => {
          console.log('Open speed settings');
        }
      }
    });
  }, [addNotification]);

  const notifyWeeklyProgress = useCallback((hoursListened: number, booksCompleted: number) => {
    addNotification({
      type: 'achievement',
      title: 'Weekly Learning Summary 📊',
      message: `${hoursListened} hours listened, ${booksCompleted} books completed`,
      duration: 0, // Persistent
      action: {
        label: 'View Stats',
        handler: () => {
          console.log('Navigate to progress stats');
        }
      }
    });
  }, [addNotification]);

  const notifyLibrarySync = useCallback(() => {
    addNotification({
      type: 'system',
      title: 'Library Synced',
      message: 'Your audiobooks are up to date across all devices',
      duration: 4000,
    });
  }, [addNotification]);

  return {
    notifyPDFUpload,
    notifyConversionComplete,
    notifyConversionError,
    notifyChapterComplete,
    notifyBookComplete,
    notifyDailyGoal,
    notifyLearningStreak,
    notifyListeningBreak,
    notifyShuffleMode,
    notifyRepeatMode,
    notifySpeedTip,
    notifyWeeklyProgress,
    notifyLibrarySync,
  };
}