import { useState } from 'react'

function TodoForm({ onAddTodo }) {
  const [text, setText] = useState('')
  const [category, setCategory] = useState('General')

  const handleSubmit = (e) => {
    e.preventDefault()

    const trimmedText = text.trim()
    if (trimmedText === '') {
      return
    }

    onAddTodo(trimmedText, category)
    setText('')
    setCategory('General')
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="todo-input"
        placeholder="What needs to be done?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
      />
      <select
        className="category-select"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="General">General</option>
        <option value="Work">Work</option>
        <option value="Personal">Personal</option>
        <option value="Shopping">Shopping</option>
        <option value="Health">Health</option>
      </select>
      <button type="submit" className="add-button">
        Add
      </button>
    </form>
  )
}

export default TodoForm
