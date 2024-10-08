import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import title from './assets/title.png';
import nextButtonImage from './assets/right-arrow.png';
import prevButtonImage from './assets/left-arrow.png';
import questionMark from './assets/question-mark.png';

function App() {
  const [pokemonData, setPokemonData] = useState([]);
  const [currentPokemon, setCurrentPokemon] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [revealState, setRevealState] = useState({});
  const [history, setHistory] = useState([]);
  const [viewedPokemons, setViewedPokemons] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  useEffect(() => {
    const fetchPokemonData = async () => {
      try {
        const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=1025');
        const results = response.data.results;
        const pokemonDetails = await Promise.all(results.map(async (pokemon) => {
          const pokemonResponse = await axios.get(pokemon.url);
          return {
            id: pokemonResponse.data.id,
            name: pokemonResponse.data.name,
            image: pokemonResponse.data.sprites.other['home'].front_default,
          };
        }));
        setPokemonData(pokemonDetails);
        getNextPokemon(pokemonDetails); // Load a random pokemon on start
      } catch (error) {
        console.error('Error fetching Pokemon data:', error);
      }
    };

    fetchPokemonData();
  }, []);

  const getNextPokemon = (data) => {
    const unviewedPokemons = data.filter(pokemon => !viewedPokemons.includes(pokemon.id));

    if (unviewedPokemons.length === 0) {
      alert('Gotta Catch em all!');
      return;
    }

    const randomIndex = Math.floor(Math.random() * unviewedPokemons.length);
    const selectedPokemon = unviewedPokemons[randomIndex];

    setCurrentPokemon(selectedPokemon);
    setCurrentIndex(history.length);

    setHistory(prevHistory => [...prevHistory, selectedPokemon]);
    setViewedPokemons(prevViewed => [...prevViewed, selectedPokemon.id]);

    setRevealState(prevState => ({
      ...prevState,
      [selectedPokemon.id]: false, // Hide Pokémon initially
    }));

    setUserInput(''); // Clear user input for the new pokemon
    setFeedbackMessage(''); // Clear previous feedback message
  };

  const handleNextPokemon = () => {
    if (currentIndex < history.length - 1) {
      const nextPokemon = history[currentIndex + 1];
      setCurrentPokemon(nextPokemon);
      setCurrentIndex(currentIndex + 1);
    } else {
      getNextPokemon(pokemonData);
    }
  };

  const handlePreviousPokemon = () => {
    if (currentIndex > 0) {
      const prevPokemon = history[currentIndex - 1];
      setCurrentPokemon(prevPokemon);
      setCurrentIndex(currentIndex - 1);
      setRevealState(prevState => ({
        ...prevState,
        [prevPokemon.id]: false, // Hide initially
      }));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (currentPokemon) {
      const formattedInput = userInput.trim().toLowerCase();
      const correctName = currentPokemon.name.toLowerCase();

      if (formattedInput === correctName) {
        setFeedbackMessage('Correct!');
      } else {
        setFeedbackMessage('Incorrect, Try Again!');
      }

      // Reveal the Pokémon name and remove silhouette regardless of correctness
      setRevealState(prevState => ({
        ...prevState,
        [currentPokemon.id]: true, 
      }));
    }
  };

  const handleReset = () => {
    setUserInput(''); // Clear user input
    setFeedbackMessage(''); // Clear feedback message
    setRevealState(prevState => ({
      ...prevState,
      [currentPokemon.id]: false, // Hide the current Pokémon again
    }));
  };

  return (
    <div className="App">
      <div className="header">
        <img src={title} alt="Who's That Pokemon?" />
      </div>
      <div className="content-container">
        {currentPokemon ? (
          <div className="flashcard">
            <div className="pokemon-info">
              <img
                src={currentPokemon.image}
                alt={currentPokemon.name}
                className={revealState[currentPokemon.id] ? 'revealed' : 'silhouette'}
              />
              {revealState[currentPokemon.id] ? (
                <h2>{currentPokemon.name}</h2>
              ) : (
                <img src={questionMark} alt="?" className="question-mark" style={{ width: '1500px', height: 'auto' }} />
              )}
            </div>
          </div>
        ) : (
          <p style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%', 
            width: '100%',  
            color: '#fecc01', 
            fontSize: '24px',
            letterSpacing: '3px' }}>Loading...</p>
        )}

        <div className="form-container">
          <form onSubmit={handleSubmit} className="answer-form">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Enter Pokémon name"
            />
            <button type="submit">Submit</button>
            <button type="button" onClick={handleReset} className="reset-button">Reset</button>
            {feedbackMessage && <p className="feedback">{feedbackMessage}</p>}
          </form>
        </div>
      </div>

      <div className="button-container">
        <img
          src={prevButtonImage}
          alt="Previous Pokémon"
          onClick={handlePreviousPokemon}
          className="nav-button"
        />
        <div className="pokemon-counter">
          {currentIndex + 1} / {pokemonData.length}
        </div>
        <img
          src={nextButtonImage}
          alt="Next Pokémon"
          onClick={handleNextPokemon}
          className="nav-button"
        />
      </div>
    </div>
  );
}

export default App;
