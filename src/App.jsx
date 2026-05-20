import FrontPage from "./Components/front_page";
import Navbar from "./Components/Navbar";
import Button from "./Components/Button";
import bgImage from "./assets/images/bgimage.jpg";

function App() {

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-cover bg-center bg-no-repeat text-white"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 flex-col justify-center px-6 py-16 sm:px-10 lg:px-20">
          <FrontPage />
          <Button />
        </main>
      </div>
    </div>
  );
}

export default App
