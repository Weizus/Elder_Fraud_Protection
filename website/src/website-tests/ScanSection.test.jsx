import { render } from "@testing-library/react";
import ScanSection from "../components/ScanSection";

test('renders without crashing', () =>{
    render(<ScanSection/>);
})