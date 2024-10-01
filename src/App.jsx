import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import title from './assets/title.png';
import nextButtonImage from './assets/right-arrow.png'; 
import prevButtonImage from './assets/left-arrow.png'; 
import questionMark from './assets/question-mark.png';

function App() {
  const [pokemonData, setPokemonData] = useState([]);         // Stores the current pokemon data
  const [currentPokemon, setCurrentPokemon] = useState(null); // Gets the current pokemon to load
  const [currentIndex, setCurrentIndex] = useState(-1);       // Keeps track of position in data array
  const [revealState, setRevealState] = useState({});         // Tracks if a pokemon has been revealed or is hidden
  const [history, setHistory] = useState([]);                 // Store viewed pokemon for previous button
  const [viewedPokemons, setViewedPokemons] = useState([]);   // Keep track of viewed pokemon for next button

  // Fetches the pokemon data from PokeAPI and gets the name, ID, and image
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
        getNextPokemon(pokemonDetails);  // Load a random pokemon on start
      } catch (error) {
        console.error('Error fetching Pokemon data:', error);
      }
    };

    fetchPokemonData();
  }, []);

  // Load the next unviewed pokemon when using the next button without using previous
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
    setHistory((prevHistory) => [...prevHistory, selectedPokemon]);  
    setViewedPokemons((prevViewed) => [...prevViewed, selectedPokemon.id]);  
    setRevealState((prevState) => ({
      ...prevState,
      [selectedPokemon.id]: false, // Hide Pokémon initially
    }));
  };

  // Delays before showing the next loaded pokemon to ensure the silhouette is applied
  const handleDelay = (callback, delay) => {
    setRevealState((prevState) => ({
      ...prevState,
      [currentPokemon.id]: false,
    }));

    // Set a delay before showing the next pokemon
    setTimeout(callback, delay);
  };

  // Gets a new random pokemon when proceeding without using back button
  // Gets the next pokemon if the pokemon has already been loaded
  const handleNextPokemon = () => {
    handleDelay(() => {
      if (currentIndex < history.length - 1) {
        const nextPokemon = history[currentIndex + 1];
        setCurrentPokemon(nextPokemon);
        setCurrentIndex(currentIndex + 1);
      } else {
        getNextPokemon(pokemonData); 
      }
    }, 300);  // 300ms delay to allow time for filter to re-apply
  };

  // Gets the previously loaded Pokémon with a delay
  const handlePreviousPokemon = () => {
    if (currentIndex > 0) {
      handleDelay(() => {
        const prevPokemon = history[currentIndex - 1];
        setCurrentPokemon(prevPokemon);
        setCurrentIndex(currentIndex - 1);
        setRevealState((prevState) => ({
          ...prevState,
          [prevPokemon.id]: false, // Hide initially
        }));
      }, 300);  // 300ms delay
    }
  };

  // Reveals or hides the name and image
  const handleRevealName = (pokemonId) => {
    setRevealState((prevState) => ({
      ...prevState,
      [pokemonId]: !prevState[pokemonId], 
    }));
  };
  
  return (
    <div className="App">
      <div className="header">
        <img src={title} alt="Who's That Pokemon?" />
      </div>
      {currentPokemon ? (
        <div className="flashcard" onClick={() => handleRevealName(currentPokemon.id)}>
          <div className="pokemon-info">
            <img src={currentPokemon.image} alt={currentPokemon.name} className={revealState[currentPokemon.id] ? 'revealed' : 'silhouette'} />
            {revealState[currentPokemon.id] ? (
              <h2>{currentPokemon.name}</h2>
            ) : (
              <img src={questionMark} alt="?" className="question-mark" />
            )}
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
      <div className="button-container">
        <img src={prevButtonImage} alt="Previous Pokémon" onClick={handlePreviousPokemon} className="nav-button" />
        
        <div className="pokemon-counter">
          {currentIndex + 1} / {pokemonData.length} {/* Updated counter */}
        </div>

        <img src={nextButtonImage} alt="Next Pokémon" onClick={handleNextPokemon} className="nav-button" />
      </div>
    </div>
  );
}

export default App;
