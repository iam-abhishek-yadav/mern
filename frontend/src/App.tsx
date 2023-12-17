import { useState, useEffect, ChangeEvent } from 'react';

function App() {
  const [todos, setTodos] = useState<Array<{ id: number; title: string; description: string; completed: boolean; isEditing: boolean }>>([]);
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3000/todos');
        const data = await response.json();
        setTodos(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleAdd = async() => {
    if(!title || !description){
      console.error('Title and Description are required');
      return
    }
    try {
      const response = await fetch('http://localhost:3000/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          completed: false,
        })
      })

      if(response.ok) {
        const newTodo = await response.json()
        setTodos((prevTodos) => [...prevTodos, newTodo])
        setTitle('')
        setDescription('')
      } else console.error('Failed');
      
    } catch (error) {
      console.error('Error adding todo:', error);
      
    }
  }

  const handleCompleteToggle = async (id: number) => {
    const updatedTodo = todos.find((todo) => todo.id === id);

    if (updatedTodo) {
      try {
        const response = await fetch(`http://localhost:3000/todos/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: updatedTodo.title,
            description: updatedTodo.description,
            completed: !updatedTodo.completed,
          }),
        });

        if (response.ok) {
          const updatedTodo = await response.json();
          setTodos((prevTodos) =>
            prevTodos.map((todo) => (todo.id === id ? updatedTodo : todo))
          );
        } else {
          console.error(`Failed to update todo with ID ${id}`);
        }
      } catch (error) {
        console.error('Error updating todo:', error);
      }
    }
  };

  const handleEditToggle = (id: number) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) => ({
        ...todo,
        isEditing: todo.id === id ? !todo.isEditing : todo.isEditing,
      }))
    );
  };

  const handleEditSave = async (id: number) => {
    const updatedTodo = todos.find((todo) => todo.id === id);

    if (updatedTodo) {
      try {
        const response = await fetch(`http://localhost:3000/todos/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: updatedTodo.title,
            description: updatedTodo.description,
            completed: updatedTodo.completed,
          }),
        });

        if (response.ok) {
          const updatedTodo = await response.json();
          setTodos((prevTodos) =>
            prevTodos.map((todo) => (todo.id === id ? { ...updatedTodo, isEditing: false } : todo))
          );
        } else {
          console.error(`Failed to update todo with ID ${id}`);
        }
      } catch (error) {
        console.error('Error updating todo:', error);
      }
    }
  };

  const handleTodoDelete = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3000/todos/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        const updatedTodos = await response.json();
        setTodos(updatedTodos);
      } else {
        console.error('Failed to delete completed todos');
      }
    } catch (error) {
      
    }
  }

  const handleRemove = async () => {
    try {
      const response = await fetch('http://localhost:3000/todos', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        const updatedTodos = await response.json();
        setTodos(updatedTodos);
      } else {
        console.error('Failed to delete completed todos');
      }
    } catch (error) {
      console.error('Error deleting todos:', error);
    }
  };
  

  return (
    <>
      <div>
        <input type='text' value={title} onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} placeholder='Title'/>
        <input type='text' value={description} onChange={(e: ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)} placeholder='Description'/>
        <button onClick={handleAdd}>Add todo</button>
      </div>
      <hr />
      <hr />
      {todos.map((todo) => (
        <div key={todo.id}>
          {todo.isEditing ? (
            <>
              <input
                type="text"
                value={todo.title}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setTodos((prevTodos) =>
                    prevTodos.map((t) =>
                      t.id === todo.id ? { ...t, title: e.target.value } : t
                    )
                  )
                }
              />
              <input
                type="text"
                value={todo.description}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setTodos((prevTodos) =>
                    prevTodos.map((t) =>
                      t.id === todo.id ? { ...t, description: e.target.value } : t
                    )
                  )
                }
              />
              <button onClick={() => handleEditSave(todo.id)}>Save</button>
            </>
          ) : (
            <>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleCompleteToggle(todo.id)}
              />
              &nbsp; &nbsp;
              <span onClick={() => handleEditToggle(todo.id)}>{todo.title} - {todo.description}</span>
              &nbsp; &nbsp;
              <button onClick = {() => handleTodoDelete(todo.id)}>Delete</button>
            </>
          )}
        </div>
      ))}
      <div><button onClick={handleRemove}>Remove completed</button></div>
    </>
  );
}

export default App;
