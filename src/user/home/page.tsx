import { Navbar } from "@/components/navbar-buyer";
import image from "@/assets/Iluminati_tb.png";

export default function HomePage() {
    return (
      <div className="min-h-screen ">
        <Navbar />
        <main className="container mx-auto p-3">
          <div className="flex flex-col items-center justify-center mt-4">
            <img src={image} alt="" className="rounded-md w-6xl" />
          </div>
        </main>
      </div>
    );
}