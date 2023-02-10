import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom';
import { Center } from '@chakra-ui/react';

import PerCapitaMap from './pages/PerCapitaMap';
import AnimatedMap from './pages/AnimatedMap';
import Home from './pages/Home';

import SiteHeader from './components/SiteHeader';
import { SITE_URL } from './constants';

function App() {
    return (
        <Center>
            <Router>
                <Routes>
                    <Route path={SITE_URL.HOME} element={<Home />} />
                    <Route element={<SiteHeader />}>
                        <Route
                            path={SITE_URL.PER_CAPITA_MAP}
                            element={<PerCapitaMap />}
                        />
                        <Route
                            path={SITE_URL.ANIMATED_MAP}
                            element={<AnimatedMap />}
                        />
                    </Route>
                    <Route path='*' element={<Navigate to={SITE_URL.HOME} />} />
                </Routes>
            </Router>
        </Center>
    );
}

export default App;
