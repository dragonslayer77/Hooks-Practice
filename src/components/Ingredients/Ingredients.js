import React, { useState, useCallback, useReducer } from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import ErrorModal from '../UI/ErrorModal';
import Search from './Search';

const ingredientReducer = (currentIngredients, action) => {
  switch(action.type) {
    case 'SET':
      return action.ingredients;
    case 'ADD':
      return [...currentIngredients, action.ingredient];
    case 'DELETE':
      return currentIngredients.filter(ing => ing.id !== action.id);
    default:
      throw new Error('Should not get here...')
  }
};

const httpReducer = (curHttpState, action) => {
  switch(action.type) {
    case 'SEND':
      return {loading: true, error: null};
    case 'RESPONSE':
      return {...curHttpState, loading: false};
    case 'ERROR':
      return {loading: false, error: action.errorData};
    case 'CLEAR':
      return {...curHttpState, error: null};
    default:
      throw new Error('Should not get here...')
  }
};

const Ingredients = () => {

  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);

  const [httpState, dispatchHttp] = useReducer(httpReducer, {loading: false, error: null});

  // const [userIngredients, setUserIngredients] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState();

  const filteredIngredientsHandler = useCallback(filteredIngs => {
    dispatch({type: 'SET', ingredients: filteredIngs});
  }, []);

  const addIngredientHandler = ingredient => {
    dispatchHttp({type:'SEND'});
    fetch('https://udemy-react-hooks-27228.firebaseio.com/ingredients.json', {
      method: 'POST',
      body: JSON.stringify(ingredient),
      headers: { 'Content-Type': 'application/json' }
    }).then(response => {
      dispatchHttp({type:'RESPONSE'});
      return response.json();
    }).then (responseData => {   
      // setUserIngredients(prevIngredients => [
      //   ...prevIngredients,
      //   { id: responseData.name, ...ingredient }
      // ]);
      dispatch({type:'ADD', ingredient: { id: responseData.name, ...ingredient }})
    }).catch(err => {
      dispatchHttp({type:'ERROR', errorData: err.message});
    })
  };


  const removeIngredientHandler = ingredientId => {
    dispatchHttp({type:'SEND'});
    fetch(`https://udemy-react-hooks-27228.firebaseio.com/ingredients/${ingredientId}.json`,{
      method: 'DELETE'
    }).then(response => {
      dispatchHttp({type:'RESPONSE'});
      // setUserIngredients(prevIngredients =>
      //   prevIngredients.filter(ingredient => ingredient.id !== ingredientId)
      // );
      dispatch({type:'DELETE', id: ingredientId});
    }).catch(err => {
      dispatchHttp({type:'ERROR', errorData: err.message});
    })
  }
  const clearError = () => {
    dispatchHttp({type: 'CLEAR'});
  }

  return (
    <div className="App">
      {httpState.error && <ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>}
      <IngredientForm 
      loading={httpState.loading}
      onAddIngredient={addIngredientHandler} />

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        <IngredientList ingredients={userIngredients} onRemoveItem={removeIngredientHandler} />
      </section>
    </div>
  );
}

export default Ingredients;
