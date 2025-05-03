import { useEffect, useState } from 'react'
import Filter from './components/Filter'
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'
import personService from './services/persons'
import Notification from './components/Notification'

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [filter, setFilter] = useState('');
  const [notification, setNotification] = useState(null);
  const [notificationClass, setNotificationClass] = useState("note")

  const sendNotification = (msg, className) => {
    setNotification(msg);
    setNotificationClass(className);
    setTimeout(() => {
      setNotification(null);
    }, 2000);
  }

  useEffect(() => {
    personService
      .getAll()
      .then(initalPersons => {
        setPersons(initalPersons);
      })
    .catch(() => {
      setNotification("Error fetching persons from server");
      setNotificationClass("error");
    });
  }, [])

  const handleSubmit = (event) => {
    event.preventDefault();
    const existingPerson = persons.find(person => person.name === newName);
    if(existingPerson){
      if(window.confirm(`${existingPerson.name} is already in the phonebook, replace the old number with a new one?`)){
        personService
          .update(existingPerson.id, {...existingPerson, number: newNumber})
          .then(updatedPerson => {
            setPersons(persons.filter(person => person.id != existingPerson.id.concat(updatedPerson)));
            sendNotification(`Updated ${updatedPerson.name} number`, "note");
          })
          .catch(() => sendNotification("Error updating person", "error"));
      }
      setNewName('');
      setNewNumber('');
      return;
    }

    personService
      .create({name: newName, number: newNumber})
      .then(newPerson => {
        setPersons(persons.concat(newPerson));
        setNewName('');
        setNewNumber('');
        sendNotification(`Added ${newPerson.name}`, "note");
      })
      .catch(() => sendNotification("Error creating new person", "error"));
  }

  const handleDelete = (personToDelete) => {
    if(!window.confirm(`Delete ${personToDelete.name} ?`)){
      return;
    }

    personService
      .deletePerson(personToDelete.id)
      .then(() => {
        setPersons(persons.filter(person => person.id != personToDelete.id));
        sendNotification(`${personToDelete.name} deleted`, "note")
      })
      .catch(() => sendNotification(`Error deleting ${personToDelete.name}`, "error"));
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value);
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value);
  }
  
  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  }

  return (
    <div>
      <h2>Phonebook</h2>

      <Notification msg={notification} className={notificationClass} />

      <Filter filter={filter} handleFilterChange={handleFilterChange} />

      <h2>add a new</h2>

      <PersonForm handleSubmit={handleSubmit} handleNameChange={handleNameChange} handleNumberChange={handleNumberChange} newName={newName} newNumber={newNumber}/>

      <h2>Numbers</h2>

      <Persons persons={persons} filter={filter} handleDelete={handleDelete}/>

    </div>
  );
}

export default App;