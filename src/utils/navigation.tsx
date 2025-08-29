export function createNavigationHandler(user, setCurrentScreen, setSelectedBook) {
  return (screen) => {
    if (user && ['welcome', 'login', 'signup'].includes(screen)) {
      setCurrentScreen('home');
      return;
    }
    setCurrentScreen(screen);
  };
}

export function createBookHandlers(setSelectedBook, setCurrentScreen) {
  const handleSelectBook = (book) => {
    setSelectedBook(book);
    setCurrentScreen('book-cover');
  };

  const handlePlayBook = (book) => {
    setSelectedBook(book);
    setCurrentScreen('audio-player'); // Fixed: was 'player', should be 'audio-player'
  };

  return { handleSelectBook, handlePlayBook };
}