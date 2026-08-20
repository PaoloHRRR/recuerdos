import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RecuerdosPage from './pages/RecuerdosPage';
import AventuraPage from './pages/AventuraPage';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<RecuerdosPage />} />

                <Route path="/aventura" element={<AventuraPage />} />
            </Routes>
        </BrowserRouter>
    );
}