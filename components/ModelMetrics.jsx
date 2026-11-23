'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const CLOSE_DELAY = 0.1;

const SETTINGS = {
    from: 0.2,
    to: -0.04,
    driftDuration: 3,
    fadeDuration: 0.5,
    leave: -0.1,
    closeDuration: 0.5,
    lightDuration: 0.3,
};

export default function ModelMetrics() {
    const rootRef = useRef(null);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        let cancelled = false;
        let cleanup = () => {};

        const initBackdropHover = () => {
            if (cancelled) return;

            const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const isHidden = (el) => getComputedStyle(el).visibility === 'hidden';

            const oneTweenEach = () => {
                const tweens = new WeakMap();
                return (key, make) => {
                    tweens.get(key)?.kill();
                    const tween = make?.() ?? null;
                    tweens.set(key, tween);
                    return tween;
                };
            };

            const figures = new WeakMap();
            const createdFigures = [];
            const running = new WeakMap();
            const lights = oneTweenEach();

            const sections = [...root.querySelectorAll('[data-variation="backdrop"]')];
            if (!sections.length) return;

            sections.forEach((section) => {
                let layer = section.querySelector(':scope > .backdrop');
                if (!layer) {
                    layer = document.createElement('div');
                    layer.className = 'backdrop';
                    layer.setAttribute('aria-hidden', 'true');
                    section.prepend(layer);
                }

                section.querySelectorAll('.term[data-figure]').forEach((term) => {
                    gsap.set(term, { '--line': 0 });
                    const figure = document.createElement('span');
                    figure.className = 'backdrop__figure';
                    figure.textContent = term.dataset.figure;
                    layer.append(figure);
                    figures.set(term, figure);
                    createdFigures.push(figure);
                });
            });

            const lightUp = (term) => {
                lights(term, () =>
                    gsap.to(term, {
                        '--line': 1,
                        duration: reducedMotion ? 0 : SETTINGS.lightDuration,
                        ease: 'power2.out',
                    }),
                );
            };

            const lightDown = (term) => {
                lights(term, () =>
                    gsap.to(term, {
                        '--line': 0,
                        duration: reducedMotion ? 0 : SETTINGS.lightDuration,
                        ease: 'power2.out',
                    }),
                );
            };

            const openEffect = (term, section) => {
                const figure = figures.get(term);
                if (!figure) return null;
                const word = term.getBoundingClientRect();
                const top = word.top + word.height / 2 - section.getBoundingClientRect().top - figure.offsetHeight / 2;
                lightUp(term);

                if (isHidden(figure)) gsap.set(figure, { top, x: SETTINGS.from * window.innerWidth });
                return gsap
                    .timeline()
                    .to(figure, { x: SETTINGS.to * window.innerWidth, duration: SETTINGS.driftDuration, ease: 'expo.out' }, 0)
                    .to(figure, { autoAlpha: 1, duration: SETTINGS.fadeDuration, ease: 'expo.out' }, 0);
            };

            const closeEffect = (term) => {
                const figure = figures.get(term);
                lightDown(term);
                if (!figure) return null;
                return gsap
                    .timeline({ defaults: { duration: SETTINGS.closeDuration, ease: 'expo.out' } })
                    .to(figure, { x: `+=${SETTINGS.leave * window.innerWidth}`, autoAlpha: 0 }, 0);
            };

            let open = null;
            let closeCall = null;
            let pressType = 'mouse';
            let wasOpenOnPress = false;

            const termOf = (target) => {
                if (!(target instanceof Element)) return null;
                const term = target.closest('.term[data-figure]');
                if (!term || !root.contains(term)) return null;
                return term.closest('[data-variation="backdrop"]') ? term : null;
            };

            const run = (term, animation) => {
                running.get(term)?.kill();
                running.set(term, animation);
                if (reducedMotion) animation?.progress(1);
            };

            const show = (term) => {
                closeCall?.kill();
                closeCall = null;
                if (open?.term === term) return;
                if (open) hide();

                const section = term.closest('[data-variation="backdrop"]');
                if (!section) return;
                term.classList.add('is-open');
                open = { term, section };
                run(term, openEffect(term, section));
            };

            const hide = () => {
                closeCall?.kill();
                closeCall = null;
                if (!open) return;
                const context = open;
                open = null;
                context.term.classList.remove('is-open');
                run(context.term, closeEffect(context.term));
            };

            const isOpenArea = (el) => el instanceof Node && Boolean(open) && open.term.contains(el);

            const onPointerOver = (ev) => {
                if (ev.pointerType === 'touch') return;
                const term = termOf(ev.target);
                if (term) show(term);
            };
            const onPointerOut = (ev) => {
                if (ev.pointerType === 'touch' || !isOpenArea(ev.target) || isOpenArea(ev.relatedTarget)) return;
                closeCall?.kill();
                closeCall = gsap.delayedCall(CLOSE_DELAY, hide);
            };
            const onPointerDown = (ev) => {
                const term = termOf(ev.target);
                pressType = ev.pointerType;
                wasOpenOnPress = Boolean(term) && open?.term === term;
                if (!term && !isOpenArea(ev.target)) hide();
            };
            const onFocusIn = (ev) => {
                const term = termOf(ev.target);
                if (term) show(term);
            };
            const onFocusOut = (ev) => {
                const term = termOf(ev.target);
                if (term && open?.term === term) hide();
            };
            const onClick = (ev) => {
                const term = termOf(ev.target);
                if (!term) return;
                ev.preventDefault();
                if (pressType === 'touch' && wasOpenOnPress) hide();
                else show(term);
                pressType = 'mouse';
            };
            const onKeyDown = (ev) => {
                if (ev.key === 'Escape') hide();
            };

            let lastWidth = window.innerWidth;
            const onResize = () => {
                if (window.innerWidth === lastWidth) return;
                lastWidth = window.innerWidth;
                hide();
            };

            document.addEventListener('pointerover', onPointerOver);
            document.addEventListener('pointerout', onPointerOut);
            document.addEventListener('pointerdown', onPointerDown);
            document.addEventListener('focusin', onFocusIn);
            document.addEventListener('focusout', onFocusOut);
            document.addEventListener('click', onClick);
            document.addEventListener('keydown', onKeyDown);
            window.addEventListener('resize', onResize);

            cleanup = () => {
                closeCall?.kill();
                document.removeEventListener('pointerover', onPointerOver);
                document.removeEventListener('pointerout', onPointerOut);
                document.removeEventListener('pointerdown', onPointerDown);
                document.removeEventListener('focusin', onFocusIn);
                document.removeEventListener('focusout', onFocusOut);
                document.removeEventListener('click', onClick);
                document.removeEventListener('keydown', onKeyDown);
                window.removeEventListener('resize', onResize);
                createdFigures.forEach((fig) => fig.remove());
            };
        };

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(initBackdropHover);
        } else {
            initBackdropHover();
        }

        return () => {
            cancelled = true;
            cleanup();
        };
    }, []);

    const handleScrollToRoi = (e) => {
        e.preventDefault();
        const target = document.getElementById('calculadora-inmobiliarias');
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <section className="luga-metrics-section" id="modelo-metricas" ref={rootRef}>
            <div className="luga-metrics__container">
                {/* BEGIN: HeroSectionTitle (sin cuadros ni desenfoque de texto) */}
                <div className="lm-hero" data-purpose="hero-title-area" data-variation="backdrop">
                    <div className="lm-hero-sticker lm-sticker-badge">
                        <span className="lm-hero-sticker__text">✨ Datos auditados</span>
                    </div>

                    <div className="lm-block lm-block-60">
                        <div className="lm-hero-pill">
                            <span className="lm-hero-pill__dot" />
                            Transparencia y Algoritmos
                        </div>
                        <h2 className="lm-hero-title">
                            Lüga{' '}
                            <span className="lm-font-editorial-italic lm-hero-title__italic">
                                modelo y negocio, en números.
                            </span>
                        </h2>
                        <p className="statement lm-hero-desc">
                            Nuestra tecnología de{' '}
                            <a className="term" href="#modelo-metricas" data-figure="0,736">
                                valuación inmobiliaria
                            </a>{' '}
                            predictiva en{' '}
                            <a className="term" href="#modelo-metricas" data-figure="48">
                                CABA
                            </a>{' '}
                            combinada con{' '}
                            <a className="term" href="#calculadora-inmobiliarias" data-figure="105%">
                                indicadores de negocio
                            </a>{' '}
                            transparentes y medibles.
                        </p>
                    </div>
                </div>
                {/* END: HeroSectionTitle */}

                {/* BEGIN: Section1_EvaluatedModelAndGoals */}
                <div className="lm-section-1" data-purpose="evaluated-model-section">
                    <div className="lm-grid-12">
                        {/* Left Column: Modelo Evaluado Card */}
                        <div className="lm-col-7">
                            <div
                                className="lm-purple-card lm-card-purple-glow"
                                data-variation="backdrop"
                                data-theme="purple"
                            >
                                <div className="lm-purple-card__glow-clip">
                                    <div className="lm-purple-card__glow-circle" />
                                </div>

                                <div className="lm-block">
                                    <div className="lm-purple-card__header">
                                        <span className="statement lm-purple-card__badge">modelo evaluado</span>
                                        <div className="lm-purple-card__bolt">⚡</div>
                                    </div>

                                    <div className="lm-metrics-grid">
                                        <div className="lm-metric-r2">
                                            <div className="statement-muted lm-metric-r2__label">R²</div>
                                            <div className="lm-metric-r2__value">
                                                <a className="term term--black" href="#modelo-metricas" data-figure="0,736">
                                                    0,736
                                                </a>
                                            </div>
                                            <div className="statement-muted lm-metric-sub">Supera el umbral de 0,70</div>
                                        </div>

                                        <div className="lm-metrics-stack">
                                            <div>
                                                <div className="lm-metric-item__value">
                                                    <a className="term term--black" href="#modelo-metricas" data-figure="$403">
                                                        USD 403/m²
                                                    </a>
                                                </div>
                                                <div className="statement-muted lm-metric-item__desc">
                                                    Error absoluto promedio (MAE)
                                                </div>
                                            </div>
                                            <div>
                                                <div className="lm-metric-item__value">
                                                    <a className="term term--black" href="#modelo-metricas" data-figure="11,8%">
                                                        11,8 %
                                                    </a>
                                                </div>
                                                <div className="statement-muted lm-metric-item__desc">
                                                    Error porcentual mediano (MdAPE)
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="lm-purple-divider" />

                                    <div className="statement lm-purple-highlight">
                                        <span>
                                            <a className="term" href="#modelo-metricas" data-figure="−31%">
                                                31 % menos MAE
                                            </a>{' '}
                                            que la mediana de comparables
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="lm-footnote" data-variation="backdrop">
                                <div className="lm-block lm-footnote__block">
                                    <p className="statement">
                                        <a className="term" href="#modelo-metricas" data-figure="HGB">
                                            HistGradientBoosting
                                        </a>{' '}
                                        con variables de edificio.
                                    </p>
                                    <p className="statement">
                                        Validación anidada:{' '}
                                        <a className="term" href="#modelo-metricas" data-figure="3.806">
                                            3.806 avisos
                                        </a>{' '}
                                        de{' '}
                                        <a className="term" href="#modelo-metricas" data-figure="48">
                                            48 barrios
                                        </a>
                                        .
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Metas por Validar */}
                        <div className="lm-col-5 lm-goals-col">
                            <div>
                                <h3 className="lm-goals-heading">metas por validar</h3>
                            </div>

                            <div className="lm-goal-card" data-variation="backdrop" data-theme="card">
                                <div className="lm-block">
                                    <div className="lm-goal-card__top">
                                        <span className="lm-goal-card__value">
                                            <a
                                                className="term term--purple term--black"
                                                href="#modelo-metricas"
                                                data-figure="≥25%"
                                            >
                                                ≥25 %
                                            </a>
                                        </span>
                                        <span className="statement-muted lm-goal-card__tag">Particulares</span>
                                    </div>
                                    <p className="statement-strong lm-goal-card__title">conversión a pago</p>
                                    <div className="statement lm-goal-card__footer">
                                        USD 9 por 30 días de seguimiento
                                    </div>
                                </div>
                            </div>

                            <div className="lm-goal-card" data-variation="backdrop" data-theme="card">
                                <div className="lm-block">
                                    <div className="lm-goal-card__top">
                                        <span className="lm-goal-card__value">
                                            <a
                                                className="term term--purple term--black"
                                                href="#modelo-metricas"
                                                data-figure="≥5 min"
                                            >
                                                ≥5 min
                                            </a>
                                        </span>
                                        <span className="statement-muted lm-goal-card__tag">Inmobiliarias</span>
                                    </div>
                                    <p className="statement-strong lm-goal-card__title">mediana de ahorro</p>
                                    <div className="statement lm-goal-card__footer">
                                        <span>Objetivo más exigente: 10 minutos</span>
                                        <span className="lm-target-pill">Target</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* END: Section1_EvaluatedModelAndGoals */}

                {/* Scroll down pointer indicator */}
                <div className="lm-scroll-indicator">
                    <a
                        href="#calculadora-inmobiliarias"
                        onClick={handleScrollToRoi}
                        aria-label="Ir a la calculadora para inmobiliarias"
                        className="lm-scroll-indicator__btn"
                    >
                        <svg
                            className="lm-scroll-indicator__icon"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M19 14l-7 7m0 0l-7-7m7 7V3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </a>
                </div>

                {/* BEGIN: Section2_InmobiliariasROI */}
                <div
                    className="lm-section-2"
                    id="calculadora-inmobiliarias"
                    data-purpose="inmobiliarias-calculator-section"
                >
                    <div className="lm-section-2__header">
                        <span className="lm-section-2__title">Para inmobiliarias</span>
                        <span className="lm-section-2__pill">Calculadora de impacto</span>
                    </div>

                    <div className="lm-roi-box" data-variation="backdrop">
                        <div className="lm-block">
                            <div className="lm-roi-grid">
                                <div aria-hidden="true" className="lm-roi-divider" />

                                <div className="lm-scenario" data-purpose="scenario-5min">
                                    <div>
                                        <p className="statement-muted lm-scenario__time">5 min promedio</p>
                                        <p className="statement lm-scenario__sub">
                                            de ahorro promedio por revisión
                                        </p>
                                        <div className="lm-scenario__roi">
                                            <a
                                                className="term term--purple term--black"
                                                href="#calculadora-inmobiliarias"
                                                data-figure="2,6%"
                                            >
                                                2,6 %
                                            </a>
                                        </div>
                                        <p className="statement-muted lm-scenario__roi-label">
                                            de ROI mensual estimado
                                        </p>
                                        <div className="lm-scenario__rows">
                                            <div className="lm-scenario__row">
                                                <span className="statement">Valor del tiempo al mes</span>
                                                <span className="statement-strong" style={{ fontWeight: 700 }}>
                                                    USD 40
                                                </span>
                                            </div>
                                            <div className="lm-scenario__row">
                                                <span className="statement">Cuota mensual</span>
                                                <span className="statement-strong" style={{ fontWeight: 700 }}>
                                                    USD 39
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="lm-scenario__footer">
                                        <div className="lm-scenario__footer-inner">
                                            <span className="statement-strong lm-scenario__net-label">
                                                Valor neto estimado
                                                <br /> del tiempo
                                            </span>
                                            <span className="lm-scenario__net-value">
                                                <a
                                                    className="term term--black"
                                                    href="#calculadora-inmobiliarias"
                                                    data-figure="USD 1"
                                                >
                                                    USD 1
                                                </a>{' '}
                                                <span className="statement lm-scenario__net-unit">/mes</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="lm-scenario lm-scenario--right" data-purpose="scenario-10min">
                                    <div>
                                        <p className="statement-muted lm-scenario__time">10 min promedio</p>
                                        <p className="statement lm-scenario__sub">
                                            de ahorro promedio por revisión
                                        </p>
                                        <div className="lm-scenario__roi">
                                            <a
                                                className="term term--purple term--black"
                                                href="#calculadora-inmobiliarias"
                                                data-figure="105,1%"
                                            >
                                                105,1 %
                                            </a>
                                        </div>
                                        <p className="statement-muted lm-scenario__roi-label">
                                            de ROI mensual estimado
                                        </p>
                                        <div className="lm-scenario__rows">
                                            <div className="lm-scenario__row">
                                                <span className="statement">Valor del tiempo al mes</span>
                                                <span className="statement-strong" style={{ fontWeight: 700 }}>
                                                    USD 80
                                                </span>
                                            </div>
                                            <div className="lm-scenario__row">
                                                <span className="statement">Cuota mensual</span>
                                                <span className="statement-strong" style={{ fontWeight: 700 }}>
                                                    USD 39
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="lm-scenario__footer">
                                        <div className="lm-scenario__footer-inner">
                                            <span className="statement-strong lm-scenario__net-label">
                                                Valor neto estimado
                                                <br /> del tiempo
                                            </span>
                                            <span className="lm-scenario__net-value">
                                                <a
                                                    className="term term--purple term--black"
                                                    href="#calculadora-inmobiliarias"
                                                    data-figure="USD 41"
                                                >
                                                    USD 41
                                                </a>{' '}
                                                <span className="statement lm-scenario__net-unit">/mes</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Assumptions Bar (sin cuadros emergentes ni desenfoque) */}
                    <div className="lm-assumptions" data-variation="backdrop">
                        <div className="lm-block lm-block-60 lm-assumptions__block">
                            <p className="statement">
                                <span style={{ fontWeight: 700 }}>Supuestos:</span>{' '}
                                <a className="term" href="#calculadora-inmobiliarias" data-figure="40/mes">
                                    40 revisiones/mes
                                </a>{' '}
                                &nbsp;·&nbsp; Valor del tiempo:{' '}
                                <a className="term" href="#calculadora-inmobiliarias" data-figure="$12/h">
                                    USD 12/h
                                </a>
                            </p>
                            <p className="statement lm-assumptions__sub">
                                Cálculo proyectado para{' '}
                                <a className="term" href="#calculadora-inmobiliarias" data-figure="1–5">
                                    inmobiliarias de 1 a 5 asesores
                                </a>{' '}
                                en CABA.
                            </p>
                        </div>
                    </div>
                </div>
                {/* END: Section2_InmobiliariasROI */}
            </div>
        </section>
    );
}
