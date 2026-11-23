'use client';

export default function Showreel() {
    return (
        <section className="showreel-section" id="showreel-section">
            <div className="showreel__content">
                <div className="showreel__image-wrapper">
                    <img 
                        src="/assets/luga/referencia principal.jpg" 
                        alt="Radiografía urbana de CABA - Mapa Minimalista Lüga" 
                        className="showreel__image"
                    />
                    <div className="showreel__overlay">
                        <span className="showreel__tag">Radiografía Urbana de CABA</span>
                        <h2 className="showreel__title">La ciudad en tus manos, sin ruido visual.</h2>
                        <p className="showreel__subtitle">Un diseño cartográfico limpio que pone la información clave exactamente donde la necesitás para explorar el entorno.</p>
                        <p className="showreel__desc">
                            Explorá Buenos Aires cuadra por cuadra. Nuestro mapa minimalista resalta de forma intuitiva la traza de subtes y trenes, los espacios verdes, los polos educativos y las zonas de menor ruido, permitiéndote entender el pulso real de cada barrio.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
