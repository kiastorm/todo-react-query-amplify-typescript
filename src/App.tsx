import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import callGraphQL, { subscribeGraphQL } from './api/graphql-api';
import { listTodos } from './graphql/queries';
import { ListTodosQuery, OnCreateTodoSubscription } from './API';
import Todo, { mapListTodosQuery, mapOnCreateTodoSubscription } from './api/todo';
import { onCreateTodo } from './graphql/subscriptions';
import CreateTodo from './components/CreateTodo';
import { withAuthenticator } from '@aws-amplify/ui-react'

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>();

  useEffect(() => {
    const getTodos = async () => {
      try {
        const todosData = await callGraphQL<ListTodosQuery>(listTodos);
        const todos = mapListTodosQuery(todosData);
    
        setTodos(todos);
      } catch (error) {
        console.error("Error fetching todos", error);
      }
    }
    
    getTodos();
  }, []);

  const onCreateTodoHandler = useCallback((
    createTodoSubscription: OnCreateTodoSubscription
  ) => {
    const todo = mapOnCreateTodoSubscription(createTodoSubscription);
    setTodos([...todos, todo]);
  }, [todos]);

  useEffect(() => {
    const subscription = subscribeGraphQL<OnCreateTodoSubscription>(
      onCreateTodo,
      onCreateTodoHandler
    );

    return () => subscription.unsubscribe();
  }, [todos, onCreateTodoHandler]);

  return (
    <div className="App">
      <CreateTodo />
        {todos?.map((t: Todo) => (
          <div key={t.id}>
            <h2>{t.name}</h2>
            <p>{t.description}</p>
          </div>
        ))}
    </div>
  );
}

export default withAuthenticator(App);