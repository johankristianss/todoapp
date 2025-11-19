import TodoItem from './TodoItem'

function TodoList({ todos, onDeleteTodo }) {
  if (todos.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📝</div>
        <p>No todos yet. Add one above!</p>
      </div>
    )
  }

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onDelete={() => onDeleteTodo(todo.id)}
        />
      ))}
    </ul>
  )
}

export default TodoList
