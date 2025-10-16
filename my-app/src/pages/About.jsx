import React from "react";
import Header from "../components/common/Header.jsx";
import Footer from "../components/common/Footer.jsx";
import MakoImage from "../assets/Mako.jpg";


const About = () => {
    return (
        <div className="bg-gray-900 min-h-[100dvh] w-screen box-border pb-10 text-white">
            {/* Global Header */}
            <Header />


            {/* Page content */}
            <main className="mx-auto w-full max-w-[1200px] flex flex-col md:flex-row justify-between items-start flex-wrap gap-10 pt-32 px-5">
                <section className="flex-1 basis-[60%] text-center md:text-left">
                    <h1 className="uppercase font-black text-[#e63946] tracking-[3px] mb-7 text-5xl lg:text-7xl [text-shadow:3px_3px_0_#06d6a0]">CRTVSHOTS</h1>
                    <p className="text-base lg:text-lg text-white bg-black/60 p-6 border-l-4 border-[#06d6a0] rounded-[10px] shadow-[0_4px_15px_rgba(0,0,0,0.5)]">
                        Hey, I'm Makomborero “Mako” Chiripanyanga, a multidisciplinary creative based in Johannesburg, South Africa.
                        I work across photography, colour grading, video editing, cinematography, and directing — bringing stories to
                        life through visuals that resonate. My work captures raw emotion, authentic energy, and bold style, merging
                        creative vision with technical precision. From collaborating with underground artists to established brands,
                        I strive to create visuals that feel alive and true. I’ve worked with artists such as KindlyNxsh, Blxckie,
                        Blaqbonez, Pabi Cooper, Brotherkupa, Jaykatana, Shouldbeyuang, and Shekhinah, as well as brands like Cold Soul,
                        Cobalt, FYM3021, and Blest Club. My philosophy is simple: I aim to tell stories that move people — to turn
                        dreams into reality, one shot at a time.
                    </p>
                </section>

                <section className="flex-1 basis-[35%] flex justify-center items-center">
<img
  className="w-full max-w-[320px] md:max-w-[500px] aspect-square object-cover rounded-[12px] border-4 border-[#06d6a0] shadow-[0_8px_20px_rgba(0,0,0,0.6)] mt-[100px]"
  src={MakoImage}
  alt="Makomborero Chiripanyanga - CRTVSHOTS"
/>
                </section>
            </main>

            {/* Global Footer */}
            <Footer />
        </div>
    );
};

export default About;