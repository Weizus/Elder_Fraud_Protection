import Navbar from '../components/Navbar';
import Herosection from '../components/Herosection';
import Footer from '../components/Footer';
import ScanSection from '../components/ScanSection';
import AnalysisResults from '../components/Analysis';


function Home(){

    return(
    <>
        <Navbar/>
        <Herosection/>
        <ScanSection/>
        <AnalysisResults/>
        <Footer/>
    </>
    )
}

export default Home;