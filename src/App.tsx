import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Top from './todos/components/Top';
import Todos from './todos/components/todos';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Top />} />
        <Route path="/todos" element={<Todos />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;