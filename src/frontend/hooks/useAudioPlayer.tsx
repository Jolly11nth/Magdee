import { useState } from 'react';

export function useAudioPlayer(books) {
  const [selectedBook, setSelectedBook] = useState(null);
  const [isShuffleMode, setIsShuffleMode] = useState(false);
  const [isRepeatMode, setIsRepeatMode] = useState(false);

  const handleSelectBook = (book) => {
    setSelectedBook(book);
  };

  const handlePlayNextBook = () => {
    if (!selectedBook) return;
    
    if (isRepeatMode) {
      console.log("Repeating current book:", selectedBook.title);
      return;
    }
    
    if (isShuffleMode) {
      const availableBooks = books.filter(book => book.id !== selectedBook.id);
      if (availableBooks.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableBooks.length);
        const randomBook = availableBooks[randomIndex];
        setSelectedBook(randomBook);
      }
    } else {
      const currentIndex = books.findIndex(book => book.id === selectedBook.id);
      const nextIndex = (currentIndex + 1) % books.length;
      const nextBook = books[nextIndex];
      setSelectedBook(nextBook);
    }
  };

  const handlePlayPreviousBook = () => {
    if (!selectedBook) return;
    
    const currentIndex = books.findIndex(book => book.id === selectedBook.id);
    const previousIndex = (currentIndex - 1 + books.length) % books.length;
    const previousBook = books[previousIndex];
    
    setSelectedBook(previousBook);
  };

  const handleFastForward = () => {
    console.log("Fast-forwarding 15 seconds");
  };

  const handleRewind = () => {
    console.log("Rewinding 15 seconds");
  };

  const handleToggleShuffle = () => {
    setIsShuffleMode(!isShuffleMode);
    console.log(`Shuffle mode ${!isShuffleMode ? 'enabled' : 'disabled'}`);
  };

  const handleToggleRepeat = () => {
    setIsRepeatMode(!isRepeatMode);
    console.log(`Repeat mode ${!isRepeatMode ? 'enabled' : 'disabled'}`);
  };

  const handleBookEnd = () => {
    if (isRepeatMode) {
      console.log("Book ended - repeating current book:", selectedBook?.title);
    } else {
      console.log("Book ended - playing next book");
      handlePlayNextBook();
    }
  };

  return {
    selectedBook,
    setSelectedBook,
    isShuffleMode,
    isRepeatMode,
    handleSelectBook,
    handlePlayNextBook,
    handlePlayPreviousBook,
    handleFastForward,
    handleRewind,
    handleToggleShuffle,
    handleToggleRepeat,
    handleBookEnd
  };
}