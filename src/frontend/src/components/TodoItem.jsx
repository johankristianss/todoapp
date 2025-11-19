function TodoItem({ todo, onDelete }) {
  return (
    <li className="todo-item">
      <span className="todo-id">#{todo.id}</span>
      <div className="todo-content">
        <span className="todo-text">{todo.text}</span>
        {todo.category && <span className="todo-category">{todo.category}</span>}
      </div>
      <button className="delete-button" onClick={onDelete}>
        Delete
      </button>
    </li>
  )
}

export default TodoItem
