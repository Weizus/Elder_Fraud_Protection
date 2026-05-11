import {render} from '@testing-library/react';
import HeroSection from '../components/Herosection';

test('renders without crashing', () =>{
    render(<HeroSection/>);
});