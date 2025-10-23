import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, BookOpen, Target, TrendingUp, Award } from 'lucide-react';
import { useAuth } from './AuthContext';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProgressStats {
  totalBooksRead: number;
  totalListeningTime: number;
  currentStreak: number;
  weeklyGoal: number;
  weeklyProgress: number;
  averageSessionTime: number;
  favoriteGenre: string;
  totalSessions: number;
}

interface RecentActivity {
  id: string;
  bookTitle: string;
  sessionTime: number;
  date: string;
  progress: number;
}

export function ProgressTrackingScreen({ onNavigate, books }) {
  const { user } = useAuth();
  const [timeFrame, setTimeFrame] = useState('week'); // 'week', 'month', 'year'
  
  // Mock progress data - in real app this would come from database
  const [progressStats] = useState<ProgressStats>({
    totalBooksRead: 12,
    totalListeningTime: 4320, // in minutes
    currentStreak: 7,
    weeklyGoal: 300, // in minutes
    weeklyProgress: 180, // in minutes
    averageSessionTime: 25,
    favoriteGenre: 'Fiction',
    totalSessions: 89
  });

  const [recentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      bookTitle: 'The Psychology of Money',
      sessionTime: 45,
      date: '2024-01-15',
      progress: 85
    },
    {
      id: '2',
      bookTitle: 'Atomic Habits',
      sessionTime: 30,
      date: '2024-01-14',
      progress: 92
    },
    {
      id: '3',
      bookTitle: 'Think and Grow Rich',
      sessionTime: 35,
      date: '2024-01-13',
      progress: 67
    }
  ]);

  // Calculate weekly progress percentage
  const weeklyProgressPercent = Math.min((progressStats.weeklyProgress / progressStats.weeklyGoal) * 100, 100);

  // Format time in hours and minutes
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Get achievement badges
  const getAchievements = () => {
    const achievements = [];
    
    if (progressStats.currentStreak >= 7) {
      achievements.push({ icon: '🔥', title: 'Week Warrior', desc: '7-day streak' });
    }
    
    if (progressStats.totalBooksRead >= 10) {
      achievements.push({ icon: '📚', title: 'Book Lover', desc: '10+ books completed' });
    }
    
    if (progressStats.totalListeningTime >= 3600) {
      achievements.push({ icon: '⏰', title: 'Time Master', desc: '60+ hours listened' });
    }

    return achievements;
  };

  const achievements = getAchievements();

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Poppins, sans-serif',
      position: 'relative'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '2rem 1.25rem 1.5rem 1.25rem',
        background: 'linear-gradient(135deg, #74b9ff 0%, #4A90E2 50%, #357ABD 100%)',
        borderRadius: '0 0 1.5rem 1.5rem',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background elements */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          zIndex: 0
        }} />
        
        <button 
          onClick={() => onNavigate('profile')}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            cursor: 'pointer',
            padding: '0.75rem',
            borderRadius: '12px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1
          }}
        >
          <ArrowLeft size={20} />
        </button>
        
        <h1 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          margin: 0,
          zIndex: 1
        }}>
          Progress Tracking
        </h1>
        
        <div style={{ width: '44px', height: '44px' }} /> {/* Spacer */}
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        padding: '1.25rem',
        paddingBottom: '2rem',
        overflowY: 'auto'
      }}>
        {/* Time Frame Selector */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          padding: '0.25rem',
          backgroundColor: '#F3F4F6',
          borderRadius: '0.75rem'
        }}>
          {[
            { key: 'week', label: 'Week' },
            { key: 'month', label: 'Month' },
            { key: 'year', label: 'Year' }
          ].map(option => (
            <button
              key={option.key}
              onClick={() => setTimeFrame(option.key)}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: timeFrame === option.key ? '#4A90E2' : 'transparent',
                color: timeFrame === option.key ? '#ffffff' : '#6B7280',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                fontFamily: 'Poppins, sans-serif',
                transition: 'all 0.2s ease'
              }}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Weekly Goal Progress */}
        <div style={{
          backgroundColor: '#F9FAFB',
          borderRadius: '1rem',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          border: '1px solid #E5E7EB'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem'
          }}>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              color: '#374151',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Target size={20} color="#4A90E2" />
              Weekly Goal
            </h3>
            <span style={{
              fontSize: '0.9rem',
              color: '#6B7280'
            }}>
              {formatTime(progressStats.weeklyProgress)} / {formatTime(progressStats.weeklyGoal)}
            </span>
          </div>
          
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#E5E7EB',
            borderRadius: '4px',
            overflow: 'hidden',
            marginBottom: '0.5rem'
          }}>
            <div style={{
              width: `${weeklyProgressPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #4A90E2, #74b9ff)',
              borderRadius: '4px',
              transition: 'width 0.5s ease'
            }} />
          </div>
          
          <p style={{
            fontSize: '0.85rem',
            color: '#6B7280',
            margin: 0,
            textAlign: 'center'
          }}>
            {weeklyProgressPercent.toFixed(0)}% completed this week
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            backgroundColor: '#EBF8FF',
            borderRadius: '1rem',
            padding: '1.25rem',
            textAlign: 'center',
            border: '1px solid #BEE3F8'
          }}>
            <BookOpen size={24} color="#3182CE" style={{ margin: '0 auto 0.5rem' }} />
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1A365D', margin: '0.25rem 0' }}>
              {progressStats.totalBooksRead}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#4A5568' }}>
              Books Completed
            </div>
          </div>

          <div style={{
            backgroundColor: '#F0FFF4',
            borderRadius: '1rem',
            padding: '1.25rem',
            textAlign: 'center',
            border: '1px solid #9AE6B4'
          }}>
            <Clock size={24} color="#38A169" style={{ margin: '0 auto 0.5rem' }} />
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1A202C', margin: '0.25rem 0' }}>
              {formatTime(progressStats.totalListeningTime)}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#4A5568' }}>
              Total Listened
            </div>
          </div>

          <div style={{
            backgroundColor: '#FFFAF0',
            borderRadius: '1rem',
            padding: '1.25rem',
            textAlign: 'center',
            border: '1px solid #FBD38D'
          }}>
            <div style={{
              fontSize: '1.5rem',
              margin: '0 auto 0.5rem',
              display: 'flex',
              justifyContent: 'center'
            }}>🔥</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1A202C', margin: '0.25rem 0' }}>
              {progressStats.currentStreak}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#4A5568' }}>
              Day Streak
            </div>
          </div>

          <div style={{
            backgroundColor: '#FAF5FF',
            borderRadius: '1rem',
            padding: '1.25rem',
            textAlign: 'center',
            border: '1px solid #D6BCFA'
          }}>
            <TrendingUp size={24} color="#805AD5" style={{ margin: '0 auto 0.5rem' }} />
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1A202C', margin: '0.25rem 0' }}>
              {formatTime(progressStats.averageSessionTime)}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#4A5568' }}>
              Avg Session
            </div>
          </div>
        </div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <div style={{
            backgroundColor: '#F9FAFB',
            borderRadius: '1rem',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            border: '1px solid #E5E7EB'
          }}>
            <h3 style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              color: '#374151',
              margin: '0 0 1rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Award size={20} color="#F59E0B" />
              Achievements
            </h3>
            
            <div style={{
              display: 'flex',
              gap: '1rem',
              overflowX: 'auto',
              paddingBottom: '0.5rem'
            }}>
              {achievements.map((achievement, index) => (
                <div key={index} style={{
                  minWidth: '120px',
                  backgroundColor: '#ffffff',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  textAlign: 'center',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {achievement.icon}
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.25rem'
                  }}>
                    {achievement.title}
                  </div>
                  <div style={{
                    fontSize: '0.7rem',
                    color: '#6B7280'
                  }}>
                    {achievement.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div style={{
          backgroundColor: '#F9FAFB',
          borderRadius: '1rem',
          padding: '1.5rem',
          border: '1px solid #E5E7EB'
        }}>
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: '600',
            color: '#374151',
            margin: '0 0 1rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Calendar size={20} color="#4A90E2" />
            Recent Activity
          </h3>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            {recentActivity.map((activity) => (
              <div key={activity.id} style={{
                backgroundColor: '#ffffff',
                borderRadius: '0.75rem',
                padding: '1rem',
                border: '1px solid #E5E7EB',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.25rem'
                  }}>
                    {activity.bookTitle}
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#6B7280'
                  }}>
                    {activity.date} • {formatTime(activity.sessionTime)}
                  </div>
                </div>
                
                <div style={{
                  backgroundColor: '#E0F2FE',
                  color: '#0369A1',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '1rem',
                  fontSize: '0.8rem',
                  fontWeight: '500'
                }}>
                  {activity.progress}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}