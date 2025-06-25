import {Routes, Route} from 'react-router-dom';
import AddEntry from './pages/AddEntry';
import TopNav from './components/nav/TopNav';
import AllEntries from './pages/AllEntries';
import Chart from './pages/Chart';

const App = () => {
    return (
        <>
            <TopNav/>
            <Routes>
                <Route path="/" element={<AddEntry/>}/>
                <Route path="/addEntry" element={<AddEntry/>}/>
                <Route path="/allEntries" element={<AllEntries/>}/>
                <Route path="/chart" element={<Chart/>}/>
            </Routes>
        </>
    );
};

export default App;