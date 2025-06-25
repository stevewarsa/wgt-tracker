import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {BrowserRouter} from 'react-router-dom'
import {Provider} from 'react-redux'
import {ModuleRegistry, AllCommunityModule} from 'ag-grid-community'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import App from './App.tsx'
import store from './store/index.ts'

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule])

const basename = import.meta.env.DEV ? '' : '/weight-tracker';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Provider store={store}>
            <BrowserRouter basename={basename}>
                <App/>
            </BrowserRouter>
        </Provider>
    </StrictMode>,
)