import React, { useState, useEffect, useRef } from 'react';
import { Home, Headphones, User, AlertCircle, Database, Wifi, WifiOff } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { NotificationBell } from './NotificationBell';
import { useAuth } from './AuthContext';
import { DatabaseService } from '../services/database';
import { Book } from '../types/database';
import { BackButton } from './BackButton';

export function MyLibraryScreen({ onNavigate, onSelectBook, books: propBooks }) {
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [databaseBooks, setDatabaseBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverConnected, setServerConnected] = useState(true);
  const { user } = useAuth();

  // Pull-to-refresh state
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load books from database with enhanced error handling
  const loadDatabaseBooks = async (showLoading = true) => {
    if (!user?.id) {
      console.log('No user ID available for loading books');
      return;
    }

    if (showLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      console.log('🔄 Loading books from database for user:', user.id);
      
      // First try to get all user books
      const result = await DatabaseService.getUserBooks(user.id);
      
      if (result.success && result.data) {
        console.log('✅ Successfully loaded books from database:', result.data.length);
        setDatabaseBooks(result.data);
        setServerConnected(true);
        
        // Transform books to match expected format
        const transformedBooks = result.data.map(book => ({
          ...book,
          // Ensure compatibility with existing book format
          cover: book.cover_url || book.cover || `https://via.placeholder.com/120x160/4A90E2/ffffff?text=${encodeURIComponent((book.title || 'Book').substring(0, 2))}`,
          duration: book.duration || '00:00',
          genre: book.genre || book.category || 'Unknown',
          progress: typeof book.progress === 'number' ? book.progress : 0,
          rating: book.rating || 0
        }));
        
        setDatabaseBooks(transformedBooks);
      } else {
        console.warn('❌ Failed to load books from database:', result.error);
        setError(result.error || 'Failed to load books from database');
        setServerConnected(false);
        
        // If we have previous books data, keep it
        if (databaseBooks.length === 0 && propBooks && propBooks.length > 0) {
          console.log('📚 Falling back to props books as backup');
          setDatabaseBooks(propBooks);
        }
      }
    } catch (err) {
      console.error('💥 Error loading books from database:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setServerConnected(false);
      
      // If we have previous books data, keep it
      if (databaseBooks.length === 0 && propBooks && propBooks.length > 0) {
        console.log('📚 Falling back to props books due to error');
        setDatabaseBooks(propBooks);
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  // Pull-to-refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (scrollRef.current && scrollRef.current.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || touchStartY.current === null || scrollRef.current?.scrollTop > 0) {
      return;
    }

    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - touchStartY.current);
    
    if (distance > 0) {
      e.preventDefault(); // Prevent scrolling
      setPullDistance(Math.min(distance * 0.5, 80)); // Max pull distance of 80px
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;

    setIsPulling(false);
    
    if (pullDistance > 60 && !isRefreshing) { // Trigger threshold
      console.log('🔄 Pull-to-refresh triggered');
      setIsRefreshing(true);
      await loadDatabaseBooks(false); // Don't show loading spinner for pull-to-refresh
      
      // Add a small delay to show the refresh animation
      setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
      }, 500);
    } else {
      setPullDistance(0);
    }
    
    touchStartY.current = null;
  };

  // Initial load when component mounts or user changes
  useEffect(() => {
    if (user?.id) {
      console.log('👤 User changed, loading books for:', user.id);
      loadDatabaseBooks();
    } else {
      console.log('❌ No user available, clearing books');
      setDatabaseBooks([]);
      setError(null);
    }
  }, [user?.id]);

  // Use database books only - remove fallback to props books for main display
  const allBooks = databaseBooks || [];

  const filteredBooks = allBooks.filter(book =>
    book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (book.category || book.genre || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return (a.title || '').localeCompare(b.title || '');
      case 'author':
        return (a.author || '').localeCompare(b.author || '');
      case 'progress':
        return (b.progress || 0) - (a.progress || 0);
      default:
        // Sort by most recent (created_at, updated_at, or converted_at)
        const dateA = new Date(a.converted_at || a.updated_at || a.created_at || 0).getTime();
        const dateB = new Date(b.converted_at || b.updated_at || b.created_at || 0).getTime();
        return dateB - dateA;
    }
  });

  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Poppins, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Pull-to-refresh indicator */}
      {(isPulling || isRefreshing) && (
        <div style={{
          position: 'absolute',
          top: Math.max(-40 + pullDistance * 0.5, -40),
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          backgroundColor: '#4A90E2',
          borderRadius: '50%',
          boxShadow: '0 4px 12px rgba(74, 144, 226, 0.3)',
          opacity: isRefreshing ? 1 : Math.min(pullDistance / 60, 1),
          transition: isRefreshing ? 'top 0.3s ease' : 'none'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderTop: '2px solid white',
            borderRadius: '50%',
            animation: (isRefreshing || pullDistance > 60) ? 'spin 1s linear infinite' : 'none'
          }} />
        </div>
      )}

      {/* Header */}
      <div style={{
        padding: '1rem 1.5rem',
        borderBottom: '1px solid #F3F4F6',
        transform: `translateY(${Math.min(pullDistance * 0.3, 25)}px)`,
        transition: isPulling ? 'none' : 'transform 0.3s ease'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <BackButton 
              onClick={() => onNavigate('back')}
              title="Go back to previous screen"
              aria-label="Return to previous screen"
              style={{ marginRight: '1rem' }}
            />
            <h2 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#374151',
              margin: 0
            }}>
              My Library
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <NotificationBell onNavigate={onNavigate} />
            {/* Connection status indicator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.5rem',
              backgroundColor: serverConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: serverConnected ? '#10B981' : '#EF4444',
              fontSize: '0.75rem'
            }}>
              {serverConnected ? <Database size={12} /> : <WifiOff size={12} />}
              <span style={{ marginLeft: '0.25rem' }}>
                {serverConnected ? 'DB' : 'Offline'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '0.5rem',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                backgroundColor: viewMode === 'list' ? '#4A90E2' : '#F3F4F6',
                color: viewMode === 'list' ? 'white' : '#6B7280',
                fontSize: '1rem'
              }}
            >
              ☰
            </button>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '0.5rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  backgroundColor: viewMode === 'grid' ? '#4A90E2' : '#F3F4F6',
                  color: viewMode === 'grid' ? 'white' : '#6B7280',
                  fontSize: '1rem'
                }}
              >
                ⊞
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <input
            placeholder="Search books, authors, or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 0.75rem 0.75rem 2.5rem',
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: '0.75rem',
              fontSize: '1rem',
              fontFamily: 'Poppins, sans-serif'
            }}
          />
          <span style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9CA3AF',
            fontSize: '1.25rem'
          }}>
            🔍
          </span>
        </div>

        {/* Sort and Filter */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '0.5rem',
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontFamily: 'Poppins, sans-serif'
            }}
          >
            <option value="recent">Most Recent</option>
            <option value="title">Title A-Z</option>
            <option value="author">Author A-Z</option>
            <option value="progress">Progress</option>
          </select>
          <button 
            onClick={() => onNavigate('upload')}
            style={{
              backgroundColor: '#4A90E2',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif'
            }}
          >
            + Add Book
          </button>
        </div>
      </div>

      {/* Content with pull-to-refresh */}
      <div 
        ref={scrollRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem 1.5rem',
          paddingBottom: '5rem',
          transform: `translateY(${Math.min(pullDistance * 0.3, 25)}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem'
        }}>
          <p style={{
            color: '#6B7280',
            fontSize: '0.875rem',
            margin: 0
          }}>
            {(loading || isRefreshing) ? 'Loading...' : `${sortedBooks.length} books found`}
            {databaseBooks.length > 0 && serverConnected && (
              <span style={{ marginLeft: '0.5rem', color: '#10B981' }}>
                • From database
              </span>
            )}
            {!serverConnected && databaseBooks.length > 0 && (
              <span style={{ marginLeft: '0.5rem', color: '#F59E0B' }}>
                • Cached data
              </span>
            )}
            {isPulling && pullDistance > 60 && (
              <span style={{ marginLeft: '0.5rem', color: '#4A90E2' }}>
                • Release to refresh
              </span>
            )}
          </p>
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              color: '#EF4444',
              fontSize: '0.75rem'
            }}>
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {sortedBooks.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            color: '#6B7280'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
            <p style={{ fontSize: '1rem', fontWeight: '500' }}>
              {!user ? 'Please sign in to view your library' : 'No books found'}
            </p>
            <p style={{ fontSize: '0.875rem' }}>
              {!user 
                ? 'Your books will appear here after signing in' 
                : loading 
                  ? 'Loading your books...' 
                  : 'Try adjusting your search or upload a new book'
              }
            </p>
            <p style={{ fontSize: '0.75rem', marginTop: '1rem', color: '#9CA3AF' }}>
              💡 Pull down to refresh your library
            </p>
            {!serverConnected && (
              <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: '#F59E0B' }}>
                📡 Server offline - showing cached data
              </p>
            )}
          </div>
        ) : viewMode === 'list' ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            {sortedBooks.map((book) => (
              <div
                key={book.id}
                onClick={() => onSelectBook(book)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem',
                  backgroundColor: '#F9FAFB',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  border: '1px solid #E5E7EB',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: '56px',
                  height: '56px',
                  backgroundColor: '#4A90E2',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '1rem',
                  fontSize: '1.5rem',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {book.cover ? (
                    <ImageWithFallback
                      src={book.cover}
                      alt={book.title || 'Book'}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <span style={{ color: 'white' }}>📖</span>
                  )}
                  {book.progress === 100 && (
                    <div style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      width: '20px',
                      height: '20px',
                      backgroundColor: '#10B981',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem'
                    }}>
                      ✓
                    </div>
                  )}
                </div>
                
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    color: '#374151',
                    fontWeight: '600',
                    margin: '0 0 0.25rem 0',
                    fontSize: '1rem'
                  }}>
                    {book.title || 'Untitled Book'}
                  </h4>
                  <p style={{
                    color: '#6B7280',
                    fontSize: '0.875rem',
                    margin: '0 0 0.5rem 0'
                  }}>
                    {book.author || 'Unknown Author'} • {book.duration || '00:00'}
                  </p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <div style={{
                      flex: 1,
                      height: '4px',
                      backgroundColor: '#E5E7EB',
                      borderRadius: '2px',
                      overflow: 'hidden'
                    }}>
                      <div 
                        style={{
                          height: '100%',
                          backgroundColor: book.progress === 100 ? '#10B981' : '#4A90E2',
                          borderRadius: '2px',
                          width: `${book.progress || 0}%`
                        }}
                      />
                    </div>
                    <span style={{
                      color: '#9CA3AF',
                      fontSize: '0.75rem',
                      minWidth: '35px'
                    }}>
                      {book.progress || 0}%
                    </span>
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectBook(book);
                    }}
                    style={{
                      backgroundColor: '#4A90E2',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    ▶
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem'
          }}>
            {sortedBooks.map((book) => (
              <div
                key={book.id}
                onClick={() => onSelectBook(book)}
                style={{
                  backgroundColor: '#F9FAFB',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  cursor: 'pointer',
                  border: '1px solid #E5E7EB',
                  textAlign: 'center'
                }}
              >
                <div style={{
                  width: '100%',
                  height: '96px',
                  backgroundColor: '#4A90E2',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.75rem',
                  fontSize: '2.5rem',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {book.cover ? (
                    <ImageWithFallback
                      src={book.cover}
                      alt={book.title || 'Book'}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <span style={{ color: 'white' }}>📖</span>
                  )}
                  {book.progress === 100 && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      width: '24px',
                      height: '24px',
                      backgroundColor: '#10B981',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.875rem'
                    }}>
                      ✓
                    </div>
                  )}
                </div>
                <h4 style={{
                  color: '#374151',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  margin: '0 0 0.25rem 0',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {book.title || 'Untitled Book'}
                </h4>
                <p style={{
                  color: '#6B7280',
                  fontSize: '0.75rem',
                  margin: '0 0 0.5rem 0',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {book.author || 'Unknown Author'}
                </p>
                <div style={{
                  width: '100%',
                  height: '4px',
                  backgroundColor: '#E5E7EB',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  marginBottom: '0.5rem'
                }}>
                  <div 
                    style={{
                      height: '100%',
                      backgroundColor: book.progress === 100 ? '#10B981' : '#4A90E2',
                      borderRadius: '2px',
                      width: `${book.progress || 0}%`
                    }}
                  />
                </div>
                <span style={{
                  color: '#9CA3AF',
                  fontSize: '0.75rem'
                }}>
                  {book.progress || 0}% • {book.duration || '00:00'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div
        style={{
          position: "absolute",
          bottom: "1.25rem",
          left: "1.25rem",
          right: "1.25rem",
          backgroundColor: "#E3F2FD",
          borderRadius: "15px",
          padding: "0 1rem",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        <button
          onClick={() => onNavigate("home")}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.25rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.5rem",
            color: "#6B7280",
          }}
        >
          <Home size={24} />
          <span
            style={{
              fontSize: "0.8rem",
              fontWeight: "500",
            }}
          >
            Home
          </span>
        </button>

        <button
          onClick={() => onNavigate("library")}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.25rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.5rem",
            color: "#4A90E2",
          }}
        >
          <Headphones size={24} />
          <span
            style={{
              fontSize: "0.8rem",
              fontWeight: "500",
            }}
          >
            Audio books
          </span>
        </button>

        <button
          onClick={() => onNavigate("profile")}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.25rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.5rem",
            color: "#6B7280",
          }}
        >
          <User size={24} />
          <span
            style={{
              fontSize: "0.8rem",
              fontWeight: "500",
            }}
          >
            Profile
          </span>
        </button>
      </div>
    </div>
  );
}