function TodoItem({ todo, onDelete }) {
  return (
    <li className="todo-item">
      <span className="todo-id">#{todo.id}</span>
      <span className="todo-text">{todo.text}</span>
      <button className="delete-button" onClick={onDelete}>
        Delete
      </button>
    </li>
  )
}

export default TodoItem
