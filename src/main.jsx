import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { useDispatch } from 'react-redux'
import './index.css'
// Axios interceptor: token expire হলে auto refresh + retry
import './utils/axiosInterceptor'
import { fetchMe } from './store/slices/authSlice'
import { store } from './store/store'
import App from './App.jsx'

// App load হলেই /auth/me দিয়ে user data restore (auto-login)
// Access token expire থাকলে interceptor auto /auth/refresh-token call করে retry করায়
const AuthBootstrap = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchMe());
    }, [dispatch]);
    return null;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <AuthBootstrap />
      <App />
    </Provider>
  </StrictMode>,
)
