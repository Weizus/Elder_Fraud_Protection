import {render} from '@testing-library/react';
import Navbar from '../components/Navbar';
import { BrowserRouter } from "react-router-dom";

test('renders without crashing', () =>{
    render(
      <BrowserRouter>
        <Navbar/>
      </BrowserRouter>
    );
});