'use client';

import SvgSymbols from '@/components/SvgSymbols';
import Navbar from '@/components/Navbar';
import VimeoHero from '@/components/VimeoHero';
import ServiceCards from '@/components/ServiceCards';
import MotionCards from '@/components/MotionCards';
import Showreel from '@/components/Showreel';
import DoubleMarquee from '@/components/DoubleMarquee';
import Footer from '@/components/Footer';
import TransitionScribble from '@/components/TransitionScribble';
import CursorBubble from '@/components/CursorBubble';
import SmoothScroll from '@/components/SmoothScroll';

import HorizontalWords from '@/components/HorizontalWords';
import ModelMetrics from '@/components/ModelMetrics';

export default function Home() {
    return (
        <>
            <SvgSymbols />
            <SmoothScroll />
            <CursorBubble />
            <header className="main-header" id="inicio">
                <Navbar />
                <VimeoHero />
            </header>
            <HorizontalWords />
            <main>
                <div className="content-section motion-cards-wrapper" id="plataforma">
                    <MotionCards />
                </div>
                <ModelMetrics />
                <Showreel />
                <div className="content-section service-cards-wrapper" id="funciones">
                    <ServiceCards />
                </div>
            </main>
            <section className="Double-marquee" id="barrios">
                <DoubleMarquee />
            </section>
            <footer className="main-footer" id="contacto">
                <Footer />
            </footer>
            <TransitionScribble />
        </>
    );
}
