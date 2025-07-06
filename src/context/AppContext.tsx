'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
interface Category {
  name: string;
  count: number;
}

interface SizeItem {
  size: string;
  count: number;
}

interface GeneratedPDF {
  filename: string;
  download_url: string;
  category: string;
  size: string;
  product_count: number;
}

// Initial state
interface AppState {
  selectedCategory: string | null;
  selectedSizes: string[];
  categories: Category[];
  availableSizes: SizeItem[];
  loading: boolean;
  error: string | null;
  generatedPDFs: GeneratedPDF[];
}

const initialState: AppState = {
  selectedCategory: null,
  selectedSizes: [],
  categories: [],
  availableSizes: [],
  loading: false,
  error: null,
  generatedPDFs: [],
};

// Action types
export enum ActionTypes {
  SET_LOADING = 'SET_LOADING',
  SET_ERROR = 'SET_ERROR',
  CLEAR_ERROR = 'CLEAR_ERROR',
  SET_CATEGORIES = 'SET_CATEGORIES',
  SET_SELECTED_CATEGORY = 'SET_SELECTED_CATEGORY',
  SET_AVAILABLE_SIZES = 'SET_AVAILABLE_SIZES',
  SET_SELECTED_SIZES = 'SET_SELECTED_SIZES',
  ADD_SELECTED_SIZE = 'ADD_SELECTED_SIZE',
  REMOVE_SELECTED_SIZE = 'REMOVE_SELECTED_SIZE',
  CLEAR_SELECTED_SIZES = 'CLEAR_SELECTED_SIZES',
  SET_GENERATED_PDFS = 'SET_GENERATED_PDFS',
  CLEAR_ALL = 'CLEAR_ALL',
}

// Action interfaces
interface SetLoadingAction {
  type: ActionTypes.SET_LOADING;
  payload: boolean;
}

interface SetErrorAction {
  type: ActionTypes.SET_ERROR;
  payload: string;
}

interface ClearErrorAction {
  type: ActionTypes.CLEAR_ERROR;
}

interface SetCategoriesAction {
  type: ActionTypes.SET_CATEGORIES;
  payload: Category[];
}

interface SetSelectedCategoryAction {
  type: ActionTypes.SET_SELECTED_CATEGORY;
  payload: string;
}

interface SetAvailableSizesAction {
  type: ActionTypes.SET_AVAILABLE_SIZES;
  payload: SizeItem[];
}

interface SetSelectedSizesAction {
  type: ActionTypes.SET_SELECTED_SIZES;
  payload: string[];
}

interface AddSelectedSizeAction {
  type: ActionTypes.ADD_SELECTED_SIZE;
  payload: string;
}

interface RemoveSelectedSizeAction {
  type: ActionTypes.REMOVE_SELECTED_SIZE;
  payload: string;
}

interface ClearSelectedSizesAction {
  type: ActionTypes.CLEAR_SELECTED_SIZES;
}

interface SetGeneratedPDFsAction {
  type: ActionTypes.SET_GENERATED_PDFS;
  payload: GeneratedPDF[];
}

interface ClearAllAction {
  type: ActionTypes.CLEAR_ALL;
}

type AppAction = 
  | SetLoadingAction
  | SetErrorAction
  | ClearErrorAction
  | SetCategoriesAction
  | SetSelectedCategoryAction
  | SetAvailableSizesAction
  | SetSelectedSizesAction
  | AddSelectedSizeAction
  | RemoveSelectedSizeAction
  | ClearSelectedSizesAction
  | SetGeneratedPDFsAction
  | ClearAllAction;

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case ActionTypes.SET_CATEGORIES:
      return {
        ...state,
        categories: action.payload,
        loading: false,
        error: null,
      };

    case ActionTypes.SET_SELECTED_CATEGORY:
      return {
        ...state,
        selectedCategory: action.payload,
        selectedSizes: [], // Clear sizes when changing category
        availableSizes: [],
        generatedPDFs: [],
      };

    case ActionTypes.SET_AVAILABLE_SIZES:
      return {
        ...state,
        availableSizes: action.payload,
        loading: false,
        error: null,
      };

    case ActionTypes.SET_SELECTED_SIZES:
      return {
        ...state,
        selectedSizes: action.payload,
      };

    case ActionTypes.ADD_SELECTED_SIZE:
      if (!state.selectedSizes.includes(action.payload)) {
        return {
          ...state,
          selectedSizes: [...state.selectedSizes, action.payload],
        };
      }
      return state;

    case ActionTypes.REMOVE_SELECTED_SIZE:
      return {
        ...state,
        selectedSizes: state.selectedSizes.filter(size => size !== action.payload),
      };

    case ActionTypes.SET_GENERATED_PDFS:
      return {
        ...state,
        generatedPDFs: action.payload,
        loading: false,
      };

    case ActionTypes.CLEAR_ALL:
      return {
        ...initialState,
        categories: state.categories, // Keep loaded categories
      };

    default:
      return state;
  }
}

// Context interfaces
interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  clearError: () => void;
  setCategories: (categories: Category[]) => void;
  setSelectedCategory: (category: string) => void;
  setAvailableSizes: (sizes: SizeItem[]) => void;
  setSelectedSizes: (sizes: string[]) => void;
  addSelectedSize: (size: string) => void;
  removeSelectedSize: (size: string) => void;
  setGeneratedPDFs: (pdfs: GeneratedPDF[]) => void;
  clearAll: () => void;
}

// Create context
const AppContext = createContext<AppContextValue | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Action creators
  const actions = {
    setLoading: (loading: boolean) => 
      dispatch({ type: ActionTypes.SET_LOADING, payload: loading }),
    
    setError: (error: string) => 
      dispatch({ type: ActionTypes.SET_ERROR, payload: error }),
    
    clearError: () => 
      dispatch({ type: ActionTypes.CLEAR_ERROR }),
    
    setCategories: (categories: Category[]) => 
      dispatch({ type: ActionTypes.SET_CATEGORIES, payload: categories }),
    
    setSelectedCategory: (category: string) => 
      dispatch({ type: ActionTypes.SET_SELECTED_CATEGORY, payload: category }),
    
    setAvailableSizes: (sizes: SizeItem[]) => 
      dispatch({ type: ActionTypes.SET_AVAILABLE_SIZES, payload: sizes }),
    
    setSelectedSizes: (sizes: string[]) => 
      dispatch({ type: ActionTypes.SET_SELECTED_SIZES, payload: sizes }),
    
    addSelectedSize: (size: string) => 
      dispatch({ type: ActionTypes.ADD_SELECTED_SIZE, payload: size }),
    
    removeSelectedSize: (size: string) => 
      dispatch({ type: ActionTypes.REMOVE_SELECTED_SIZE, payload: size }),
    
    setGeneratedPDFs: (pdfs: GeneratedPDF[]) => 
      dispatch({ type: ActionTypes.SET_GENERATED_PDFS, payload: pdfs }),
    
    clearAll: () => 
      dispatch({ type: ActionTypes.CLEAR_ALL }),
  };

  const value: AppContextValue = {
    state,
    dispatch,
    ...actions,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the context
export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

// Export types for use in other components
export type { Category, SizeItem, GeneratedPDF, AppState };