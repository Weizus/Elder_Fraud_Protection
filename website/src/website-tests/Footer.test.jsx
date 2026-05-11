import { render } from "@testing-library/react";
import Footer from "../components/Footer";

test('renders without crashing', () => {
    render(<Footer/>);
});