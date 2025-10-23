import { usePlaylist } from "../services/playlistService";
import { useAuth } from "./AuthContext";
import { useUserDisplayInfo } from "../hooks/useUserProfile";
import { useRecentlyConvertedBooks } from "../hooks/useRecentBooks";
import { SeedDataButton } from "./SeedDataButton";

export function HomeScreen({
  onNavigate,
  onSelectBook,
  books,
  user,
}) {
  const {
    notifyDailyGoal,
    notifyLearningStreak,
    notifyLibrarySync,
  } = useNotificationHelpers();
  const { user: authUser } = useAuth();
  const playlistData = usePlaylist(authUser?.id || null);
  
  // Use database-connected user display info with connection status
  const { 
    displayName,
    username, 
    profilePictureUrl, 
    email, 
    loading: profileLoading, 
    refreshData: refreshProfile,
    connectionStatus: profileConnectionStatus
  } = useUserDisplayInfo();

  // Use database-connected recent books
  const { 
    books: recentBooks, 
    loading: recentBooksLoading, 
    error: recentBooksError,
    refresh: refreshRecentBooks,
    isEmpty: recentBooksEmpty
  } = useRecentlyConvertedBooks(4);

  // Fallback user data if database user is not available
  const displayUser = user || {
    name: displayName || "Guest",
    username: displayName || "guest",
    email: email || "guest@magdee.com",
    avatar: profilePictureUrl,
    avatar_url: profilePictureUrl,
    profileImage: profilePictureUrl,
  };

  // Get username function (retrieves username from database collected during signup)
  const getUsername = () => {
    // Return the username from database, or fall back to displayName if no username
    return username || displayName || "Guest";
  };

  // Refresh profile picture when component mounts or when user changes
  useEffect(() => {
    if (authUser?.id && refreshProfile) {
      refreshProfile().catch(error => {
        console.warn('Failed to refresh profile on mount:', error);
        // Don't show error toast on initial load - the hook handles fallbacks
      });
    }
  }, [authUser?.id, refreshProfile]);

  // Show toast notification for profile connection status changes
  useEffect(() => {
    if (profileConnectionStatus === 'timeout') {
      // Show a subtle notification about slow connection but data still available
      console.info('🐌 Profile loading slow, using cached data');
    } else if (profileConnectionStatus === 'connected') {
      console.info('🔄 Profile data refreshed from database');
    }
  }, [profileConnectionStatus]);

  // Trigger welcome notifications when component mounts
  useEffect(() => {
    // Only show notifications if we have a real user (not guest)
    if (user && user.id) {
      // Simulate checking if user achieved daily goal
      const hasListenedToday = Math.random() > 0.5;
      if (hasListenedToday) {
        setTimeout(() => notifyDailyGoal(30), 2000);
      }

      // Simulate learning streak
      const currentStreak = Math.floor(Math.random() * 10) + 1;
      if (currentStreak >= 3) {
        setTimeout(
          () => notifyLearningStreak(currentStreak),
          4000,
        );
      }

      // Library sync notification
      setTimeout(() => notifyLibrarySync(), 6000);
    }
  }, [
    notifyDailyGoal,
    notifyLearningStreak,
    notifyLibrarySync,
    user,
  ]);

  // Handle profile picture refresh
  const handleProfileRefresh = async () => {
    if (refreshProfile) {
      try {
        await refreshProfile();
      } catch (error) {
        console.error('Failed to refresh profile:', error);
      }
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Poppins, sans-serif",
        position: "relative",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "2rem 1.25rem 1.5rem 1.25rem",
          background:
            "linear-gradient(135deg, #74b9ff 0%, #4A90E2 50%, #357ABD 100%)",
          borderRadius: "0 0 1.5rem 1.5rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative background elements */}
        <div
          style={{
            position: "absolute",
            top: "-20px",
            right: "-20px",
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.1)",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-10px",
            left: "-10px",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.05)",
            zIndex: 0,
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            zIndex: 1,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              overflow: "hidden",
              backgroundColor: "#ffffff",
              border: "3px solid rgba(255, 255, 255, 0.3)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            }}
            onClick={handleProfileRefresh}
            title="Click to refresh profile picture"
          >
            <ImageWithFallback
              src={
                profilePictureUrl ||
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
              }
              alt="User Avatar"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            />
            
            {/* Loading indicator overlay */}
            {profileLoading && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: "rgba(74, 144, 226, 0.8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                }}
              >
                <RefreshCw 
                  size={20} 
                  color="white" 
                  style={{ 
                    animation: "spin 1s linear infinite" 
                  }} 
                />
              </div>
            )}

            {/* Connection status indicator */}
            {!profileLoading && (
              <div
                style={{
                  position: "absolute",
                  bottom: "-2px",
                  right: "-2px",
                  width: "12px",
                  height: "12px",
                  backgroundColor: 
                    profileConnectionStatus === 'connected' ? "#10B981" :
                    profileConnectionStatus === 'connecting' ? "#F59E0B" :
                    profileConnectionStatus === 'timeout' ? "#EF4444" :
                    "#6B7280",
                  borderRadius: "50%",
                  border: "2px solid white",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                  animation: profileConnectionStatus === 'connecting' ? "pulse 2s infinite" : "none"
                }}
                title={
                  profileConnectionStatus === 'connected' ? "Profile loaded from database" :
                  profileConnectionStatus === 'connecting' ? "Loading profile..." :
                  profileConnectionStatus === 'timeout' ? "Profile loading slow - using cached data" :
                  "Using offline profile data"
                }
              />
            )}
          </div>
          <div>
            <div
              style={{
                fontSize: "0.85rem",
                fontWeight: "400",
                color: "rgba(255, 255, 255, 0.8)",
                marginBottom: "0.15rem",
              }}
            >
              Good morning! 👋
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "600",
                  color: "#ffffff",
                  textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                }}
              >
                {getUsername()}
              </span>
              {profileLoading && (
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                    borderTopColor: "white",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
              )}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            zIndex: 1,
            position: "relative",
          }}
        >
          <NotificationBell
            onNavigate={onNavigate}
            color="#ffffff"
            size={20}
          />
          <button
            onClick={() => onNavigate("profile")}
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              cursor: "pointer",
              padding: "0.75rem",
              borderRadius: "12px",
              color: "#ffffff",
              transition: "all 0.2s ease",
              backdropFilter: "blur(10px)",
            }}
            onMouseEnter={(e) => {
              e.target.style.background =
                "rgba(255, 255, 255, 0.3)";
              e.target.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background =
                "rgba(255, 255, 255, 0.2)";
              e.target.style.transform = "translateY(0)";
            }}
          >
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* Action Cards */}
      <div
        style={{
          padding: "0 1.25rem",
          marginTop: "1.25rem",
          marginBottom: "1.25rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.25rem",
          }}
        >
          <button
            onClick={() => onNavigate("upload-pdf")}
            style={{
              backgroundColor: "#E3F2FD",
              border: "2px solid #4A90E2",
              borderRadius: "1.5rem",
              padding: "0.875rem 0.5rem",
              cursor: "pointer",
              fontFamily: "Poppins, sans-serif",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.75rem",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(74, 144, 226, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                backgroundColor: "#374151",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Upload size={24} color="white" />
            </div>
            <span
              style={{
                color: "#374151",
                fontWeight: "500",
                fontSize: "0.9rem",
              }}
            >
              upload pdf
            </span>
          </button>

          <button
            onClick={() => {
              // Refresh playlist data when clicked
              if (playlistData.refreshData) {
                playlistData.refreshData();
              }
              onNavigate("my-library"); // Fixed: was "library", should be "my-library"
            }}
            style={{
              backgroundColor: "#E3F2FD",
              border: "2px solid #4A90E2",
              borderRadius: "1.5rem",
              padding: "0.875rem 1rem",
              cursor: "pointer",
              fontFamily: "Poppins, sans-serif",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.75rem",
              transition: "all 0.2s ease",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(74, 144, 226, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Loading state overlay */}
            {playlistData.loading && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1,
                }}
              >
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    border: "2px solid #4A90E2",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
              </div>
            )}

            <div
              style={{
                width: "48px",
                height: "48px",
                backgroundColor: playlistData.loading ? "#9CA3AF" : "#374151",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                transition: "background-color 0.2s ease",
              }}
            >
              {playlistData.error ? (
                <Clock size={24} color="white" />
              ) : (
                <List size={24} color="white" />
              )}
              
              {/* Book count badge */}
              {playlistData.data && playlistData.data.totalBooks > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                    backgroundColor: "#10B981",
                    color: "white",
                    borderRadius: "50%",
                    minWidth: "18px",
                    height: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    fontWeight: "600",
                    border: "2px solid white",
                  }}
                >
                  {playlistData.data.totalBooks > 99 ? "99+" : playlistData.data.totalBooks}
                </div>
              )}
            </div>
            
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <span
                style={{
                  color: "#374151",
                  fontWeight: "500",
                  fontSize: "0.9rem",
                }}
              >
                playlist
              </span>
              
              {/* Status indicator */}
              {playlistData.data ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    fontSize: "0.7rem",
                    color: "#6B7280",
                  }}
                >
                  <BookOpen size={10} />
                  <span>{playlistData.data.totalBooks} books</span>
                  {playlistData.data.inProgressBooks > 0 && (
                    <>
                      <span>•</span>
                      <TrendingUp size={10} />
                      <span>{playlistData.data.inProgressBooks} reading</span>
                    </>
                  )}
                </div>
              ) : playlistData.error ? (
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: "#EF4444",
                  }}
                >
                  Offline
                </span>
              ) : playlistData.loading ? (
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: "#6B7280",
                  }}
                >
                  Loading...
                </span>
              ) : (
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: "#6B7280",
                  }}
                >
                  Tap to view
                </span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Recently Converted Section */}
      <div
        style={{
          flex: 1,
          padding: "0 1.25rem",
          paddingTop: "1.25rem",
          paddingBottom: "5rem",
        }}
      >
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.25rem"
        }}>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: "600",
              color: "#374151",
              margin: 0,
            }}
          >
            Recently converted
          </h2>

          {/* Refresh button and status indicators */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            {/* Connection status */}
            {recentBooksError ? (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                color: "#EF4444",
                fontSize: "0.75rem"
              }}>
                <WifiOff size={12} />
                <span>Offline</span>
              </div>
            ) : (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                color: "#10B981",
                fontSize: "0.75rem"
              }}>
                <Wifi size={12} />
                <span>Live</span>
              </div>
            )}

            {/* Refresh button */}
            <button
              onClick={() => {
                refreshRecentBooks();
                if (playlistData.refreshData) {
                  playlistData.refreshData();
                }
              }}
              disabled={recentBooksLoading}
              style={{
                background: "rgba(74, 144, 226, 0.1)",
                border: "1px solid rgba(74, 144, 226, 0.2)",
                borderRadius: "8px",
                padding: "0.5rem",
                color: "#4A90E2",
                cursor: recentBooksLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
                opacity: recentBooksLoading ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!recentBooksLoading) {
                  e.target.style.background = "rgba(74, 144, 226, 0.15)";
                  e.target.style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(74, 144, 226, 0.1)";
                e.target.style.transform = "translateY(0)";
              }}
              title="Refresh recent books"
            >
              <RefreshCw 
                size={14} 
                style={{ 
                  animation: recentBooksLoading ? "spin 1s linear infinite" : "none" 
                }} 
              />
            </button>
          </div>
        </div>

        {/* Loading state */}
        {recentBooksLoading && recentBooks.length === 0 ? (
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "2rem",
            color: "#6B7280"
          }}>
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem"
            }}>
              <div style={{
                width: "32px",
                height: "32px",
                border: "3px solid #E5E7EB",
                borderTopColor: "#4A90E2",
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
              }}></div>
              <span style={{ fontSize: "0.875rem" }}>Loading recent books...</span>
            </div>
          </div>
        ) : 
        /* Error state */
        recentBooksError && recentBooks.length === 0 ? (
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "2rem",
          }}>
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
              textAlign: "center",
              maxWidth: "300px"
            }}>
              <AlertCircle size={48} color="#EF4444" />
              <div>
                <h3 style={{
                  fontSize: "1rem",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "0.5rem"
                }}>
                  Unable to load recent books
                </h3>
                <p style={{
                  fontSize: "0.875rem",
                  color: "#6B7280",
                  marginBottom: "1rem"
                }}>
                  {recentBooksError}
                </p>
                <button
                  onClick={refreshRecentBooks}
                  style={{
                    backgroundColor: "#4A90E2",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.5rem 1rem",
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#357ABD";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#4A90E2";
                  }}
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        ) : 
        /* Empty state */
        recentBooksEmpty ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "2rem",
            }}
          >
            <img
              src={emptyStateImage}
              alt="No files uploaded yet"
              style={{
                maxWidth: "100%",
                height: "auto",
                cursor: "pointer",
              }}
              onClick={() => onNavigate("upload-pdf")}
            />
          </div>
        ) : (
          <>
            <div
              className="hide-scrollbar"
              style={{
                display: "flex",
                gap: "1.25rem",
                overflowX: "auto",
                paddingBottom: "0.5rem",
                position: "relative"
              }}
            >
              {recentBooks.map((book) => (
                <div
                  key={book.id}
                  style={{
                    minWidth: "200px",
                    backgroundColor:
                      "linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)",
                    background:
                      "linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)",
                    borderRadius: "1.5rem",
                    padding: "1rem",
                    color: "white",
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    transition: "all 0.2s ease",
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
                    e.currentTarget.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  onClick={() => onSelectBook(book)}
                >
                  {/* Background decoration */}
                  <div
                    style={{
                      position: "absolute",
                      top: "-20px",
                      right: "-20px",
                      width: "80px",
                      height: "80px",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      borderRadius: "50%",
                    }}
                  />

                  {/* Book Cover */}
                  <div
                    style={{
                      width: "80px",
                      height: "120px",
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      borderRadius: "10px",
                      marginBottom: "1rem",
                      backgroundImage: book.cover
                        ? `url(${book.cover})`
                        : "none",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      border: "2px solid rgba(255, 255, 255, 0.3)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {!book.cover && (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <BookOpen size={32} color="rgba(255, 255, 255, 0.8)" />
                      </div>
                    )}
                  </div>

                  {/* Book Title */}
                  <div
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      textAlign: "center",
                      marginBottom: "0.5rem",
                      lineHeight: "1.3",
                      maxWidth: "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {book.title}
                  </div>

                  {/* Book Info */}
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "rgba(255, 255, 255, 0.8)",
                      textAlign: "center",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <Clock size={12} />
                    <span>{book.duration || "2h 30m"}</span>
                  </div>

                  {/* Play Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectBook(book);
                      onNavigate('audio-player');
                    }}
                    style={{
                      position: "absolute",
                      bottom: "1rem",
                      right: "1rem",
                      width: "32px",
                      height: "32px",
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      border: "none",
                      borderRadius: "50%",
                      color: "white",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s ease",
                      backdropFilter: "blur(10px)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
                      e.currentTarget.style.transform = "scale(1.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    <Play size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Seed Data Button for Development */}
            <SeedDataButton 
              style={{
                marginTop: "1rem",
                alignSelf: "center"
              }}
            />
          </>
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
            color: "#4A90E2", // Active state for current screen
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
          onClick={() => onNavigate("my-library")}
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
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.target.style.color = "#4A90E2";
            e.target.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.color = "#6B7280";
            e.target.style.transform = "translateY(0)";
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
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.target.style.color = "#4A90E2";
            e.target.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.color = "#6B7280";
            e.target.style.transform = "translateY(0)";
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