import { useState, useEffect } from 'react';
import personService from './services/persons'

const Filter = ({ searchTerm, handleSearchChange }) => (
  <div>
    filter shown with: <input value={searchTerm} onChange={handleSearchChange} />
  </div>
);

const PersonForm = ({ newName, newNumber, handleNameChange, handleNumberChange, addPerson }) => (
  <form onSubmit={addPerson}>
    <div>
      name: <input value={newName} onChange={handleNameChange} />
    </div>
    <div>
      number: <input value={newNumber} onChange={handleNumberChange} />
    </div>
    <div>
      <button type="submit">add</button>
    </div>
  </form>
);

const Persons = ({ filteredPersons, deletePerson }) => (
  <ul>
    {filteredPersons.map((person) => (
      <li key={person.id}>
        {person.name} {person.number}{' '}
        <button onClick={() => deletePerson(person.id)}>delete</button>
      </li>
    ))}
  </ul>
);

const Notification = ({ message, type }) => {
  if (message === null) {
    return null
  }

  if (type === "successful") {
    return (
      <div className='successfulPopup'>
        {message}
      </div>
    )
  } else if (type === "unsuccessful") {
    return (
      <div className='unsuccessfulPopup'>
        {message}
      </div>
    )
  }
};

const App = () => {
  const [persons, setPersons] = useState([]);
  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons);
      })
  }, []);

  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [successfulPopup, setSuccessfulPopup] = useState(null)
  const [unsuccessfulPopup, setUnsuccessfulPopup] = useState(null)

  const handleNameChange = (event) => {
    setNewName(event.target.value);
  };

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const addPerson = (event) => {
    event.preventDefault();
  
    if (newName.trim() === '' || newNumber.trim() === '') {
      return;
    }
  
    const existingPerson = persons.find((person) => person.name === newName);
    const existingNumber = persons.find((person) => person.number === newNumber);
  
    if (existingPerson) {
      const confirmUpdate = window.confirm(
        `${newName} is already added to the phonebook, replace the old number with a new one?`
      );
  
      if (!confirmUpdate) {
        return;
      }
  
      const updatedPerson = { ...existingPerson, number: newNumber };
  
      personService
        .update(existingPerson.id, updatedPerson)
        .then((returnedPerson) => {
          setSuccessfulPopup(`Added ${returnedPerson.name}`)
          setTimeout(() => {
            setSuccessfulPopup(null)
          }, 5000)
          setPersons(persons.map((person) => (person.id !== existingPerson.id ? person : returnedPerson)));
        })
        .catch(() => {
          setUnsuccessfulPopup(`Information of ${newName} has already been removed from the server`)
          setTimeout(() => {
            setUnsuccessfulPopup(null)
          }, 5000)
        });
    } else if (existingNumber) {
      alert(`${newNumber} is already added to the phonebook`);
      return;
    } else {
      const newPerson = {
        name: newName,
        number: newNumber,
        id: (persons.length + 1).toString(),
      };
  
      personService
        .create(newPerson)
        .then(returnedPerson => {
          setSuccessfulPopup(`Added ${returnedPerson.name}`)
          setTimeout(() => {
            setSuccessfulPopup(null)
          }, 5000)
          setPersons([...persons, returnedPerson]);
        })
        .catch(error => {
          console.error('Error adding person:', error);
        });
    }
  
    setNewName('');
    setNewNumber('');
  };

  const deletePerson = id => {
    const url = `http://localhost:3001/persons/${id}`;
    const personToDelete = persons.find(person => person.id === id);
    const confirmDeletion = window.confirm(`Delete ${personToDelete.name}?`);

    if (confirmDeletion) {
      personService
        .remove(url)
        .then(() => {
          setPersons(persons.filter((person) => person.id !== id));
        })
        .catch((error) => {
          console.error('Error deleting person:', error);
        });
    }
  };

  const filteredPersons = persons.filter((person) =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={successfulPopup} type="successful" />
      <Notification message={unsuccessfulPopup} type="unsuccessful" />
      <Filter searchTerm={searchTerm} handleSearchChange={handleSearchChange} />
      <h3>Add a new</h3>
      <PersonForm
        newName={newName}
        newNumber={newNumber}
        handleNameChange={handleNameChange}
        handleNumberChange={handleNumberChange}
        addPerson={addPerson}
      />
      <h3>Numbers</h3>
      <Persons filteredPersons={filteredPersons} deletePerson={deletePerson} />
    </div>
  );
};

export default App;