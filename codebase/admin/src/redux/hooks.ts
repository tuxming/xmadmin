import {
    useSelector as useReduxSelector,
    TypedUseSelectorHook,
    useDispatch as useReduxDispatch
} from 'react-redux';

import { RootState, AppDispatch } from './store';
export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;
export const useDispatch = () => useReduxDispatch<AppDispatch>();