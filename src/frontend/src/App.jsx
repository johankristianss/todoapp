import { useState, useEffect } from 'react'
import './App.css'
import TodoForm from './components/TodoForm'
import TodoList from './components/TodoList'
import ErrorMessage from './components/ErrorMessage'

const API_URL = '/api/todos'

function App() {
  const [todos, setTodos] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  // Fetch todos from API
  const fetchTodos = async () => {
    try {
      const response = await fetch(API_URL)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setTodos(data)
      setError('')
    } catch (err) {
      console.error('Error fetching todos:', err)
      setError('Failed to load todos. Make sure the backend server is running on port 8000.')
    } finally {
      setLoading(false)
    }
  }

  // Add a new todo
  const addTodo = async (text) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create todo')
      }

      await fetchTodos()
      setError('')
    } catch (err) {
      console.error('Error adding todo:', err)
      setError(err.message)
    }
  }

  // Delete a todo
  const deleteTodo = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete todo')
      }

      await fetchTodos()
      setError('')
    } catch (err) {
      console.error('Error deleting todo:', err)
      setError('Failed to delete todo. Please try again.')
    }
  }

  // Load todos on component mount
  useEffect(() => {
    fetchTodos()
  }, [])

  return (
    <div className="container">
      <h1>Todo List</h1>
      <p className="subtitle">REST API Demo - Flask + React</p>

      <ErrorMessage message={error} />

      <TodoForm onAddTodo={addTodo} />

      {loading ? (
        <div className="loading">Loading todos...</div>
      ) : (
        <TodoList todos={todos} onDeleteTodo={deleteTodo} />
      )}
    </div>
  )
}

export default App
