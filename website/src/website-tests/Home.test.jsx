import Home from "../pages/Home";
import {render} from "@testing-library/react"
import { BrowserRouter } from "react-router-dom";

test('renders Home page', () =>{
    render(
      <BrowserRouter>
        <Home/>
      </BrowserRouter>
    )
})