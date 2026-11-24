"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CARDS_DATA } from "@/lib/data";

export default function ServiceCards() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Animate underline SVG paths on scroll (from HeroSection)
      gsap.to(".title-underline-svg path", {
        strokeDashoffset: 0,
        duration: 1.2,
        ease: "power3.out",
        stagger: 0.3,
        scrollTrigger: {
          trigger: ".service-cards-wrapper",
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
      });
    });

    const mm = gsap.matchMedia();
    const originalData = [
      { rotation: 4 },
      { rotation: -5 },
      { rotation: 5 },
      { rotation: -8 },
      { rotation: 5 },
    ];

    // ─── Desktop (≥ 1349px): Unchanged fan-out hover behavior ───
    mm.add("(min-width: 1349px)", () => {
      const cards = gsap.utils.toArray(".card");
      if (!cards.length) return;

      const listeners = [];

      cards.forEach((card, index) => {
        const onEnter = () => {
          const hoverGap = 120;
          const clusterGap = 150;
          const cardWidth = 320;
          const hoveredLeft = cards[index].offsetLeft;
          const leftCards = [];
          const rightCards = [];

          cards.forEach((otherCard, otherIndex) => {
            if (otherIndex < index)
              leftCards.push({ card: otherCard, index: otherIndex });
            else if (otherIndex > index)
              rightCards.push({ card: otherCard, index: otherIndex });
          });

          const currentTop = cards[index].offsetTop;
          const targetCommonTop = 50;
          const moveY = targetCommonTop - currentTop;

          gsap.to(cards[index], {
            x: 0,
            y: moveY,
            rotation: 0,
            scale: 1.08,
            duration: 0.9,
            ease: "elastic.out(1, 0.5)",
            overwrite: true,
          });

          if (rightCards.length) {
            const clusterStart = hoveredLeft + cardWidth + hoverGap;
            rightCards.forEach((item, i) => {
              const targetAbsLeft = clusterStart + i * clusterGap;
              const targetX = Math.max(targetAbsLeft - item.card.offsetLeft, 10);
              const angleRad =
                originalData[item.index].rotation * (Math.PI / 180);
              const targetY = targetX * Math.tan(angleRad);
              gsap.to(item.card, {
                x: targetX,
                y: targetY,
                rotation: originalData[item.index].rotation,
                scale: 1,
                duration: 1.0,
                ease: "elastic.out(1, 0.5)",
                overwrite: true,
              });
            });
          }

          if (leftCards.length) {
            leftCards.reverse();
            const clusterStart = hoveredLeft - hoverGap - cardWidth;
            leftCards.forEach((item, i) => {
              const targetAbsLeft = clusterStart - i * clusterGap;
              const targetX = Math.min(targetAbsLeft - item.card.offsetLeft, -10);
              const angleRad =
                originalData[item.index].rotation * (Math.PI / 180);
              const targetY = targetX * Math.tan(angleRad);
              gsap.to(item.card, {
                x: targetX,
                y: targetY,
                rotation: originalData[item.index].rotation,
                scale: 1,
                duration: 1.0,
                ease: "elastic.out(1, 0.5)",
                overwrite: true,
              });
            });
          }
        };

        const onLeave = () => {
          cards.forEach((c, i) => {
            gsap.to(c, {
              x: 0,
              y: 0,
              scale: 1,
              rotation: originalData[i].rotation,
              duration: 1.0,
              ease: "elastic.out(1, 0.5)",
              overwrite: true,
              zIndex: i + 1,
              delay: 0.08,
            });
          });
        };

        card.addEventListener("mouseenter", onEnter);
        card.addEventListener("mouseleave", onLeave);
        listeners.push({ card, onEnter, onLeave });
      });

      return () => {
        listeners.forEach(({ card, onEnter, onLeave }) => {
          card.removeEventListener("mouseenter", onEnter);
          card.removeEventListener("mouseleave", onLeave);
        });
        gsap.set(cards, { clearProps: "all" });
      };
    });

    // ─── Tablet & Small Laptop (769px – 1348px): Clean grid, no desktop fan math ───
    mm.add("(min-width: 769px) and (max-width: 1348px)", () => {
      const cards = gsap.utils.toArray(".card");
      const cardsWrapper = document.querySelector(".cards-wrapper");
      if (cardsWrapper) {
        gsap.set(cardsWrapper, { clearProps: "height" });
      }
      if (cards.length) {
        gsap.set(cards, { clearProps: "all" });
      }
    });

    // ─── Mobile (≤ 768px): Stacked card scroll reveal ───
    mm.add("(max-width: 768px)", () => {
      const cards = gsap.utils.toArray(".card");
      const cardsWrapper = document.querySelector(".cards-wrapper");
      if (!cards.length || !cardsWrapper) return;

      const mobileRotations = [-3.5, 2.5, -4, 3, -2];
      const getScrollPerCard = () =>
        Math.min(Math.max(window.innerHeight * 0.45, 260), 340);
      const startY = Math.min(Math.max(window.innerHeight * 0.5, 260), 420);

      gsap.set(cardsWrapper, { clearProps: "height" });

      cards.forEach((card, i) => {
        gsap.set(card, {
          position: "absolute",
          left: "50%",
          xPercent: -50,
          y: i === 0 ? 0 : startY,
          autoAlpha: i === 0 ? 1 : 0,
          rotation: mobileRotations[i % mobileRotations.length],
          zIndex: i + 1,
          transformOrigin: "center center",
        });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: cardsWrapper,
          start: "top 72px",
          end: () => `+=${getScrollPerCard() * (cards.length - 1)}`,
          pin: true,
          pinSpacing: true,
          scrub: 0.4,
          invalidateOnRefresh: true,
          id: "mobile-cards-pin",
        },
      });

      cards.forEach((card, i) => {
        if (i === 0) return;
        const stepStart = i - 1;
        tl.to(
          card,
          {
            autoAlpha: 1,
            duration: 0.15,
            ease: "none",
          },
          stepStart
        ).to(
          card,
          {
            y: 0,
            duration: 0.85,
            ease: "power3.out",
          },
          stepStart
        );
      });

      return () => {
        gsap.set(cards, { clearProps: "all" });
        gsap.set(cardsWrapper, { clearProps: "height" });
      };
    });

    return () => {
      mm.revert();
      ctx.revert();
    };
  }, []);

  return (
    <>
      {/* ─── "Call us if you need:" Heading ─── */}
      <div className="title-container">
        <h2 className="main-title">
          explorá nuestras <span className="italic-text">funciones:</span>
        </h2>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="160"
          viewBox="0 0 159 17"
          fill="none"
          className="title-underline-svg"
        >
          <path
            d="M1 12.1515C53.0771 5.7187 105.529 2.30552 158 1.93652"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
          <path
            d="M30.2672 15.9461C64.1899 12.8158 98.2663 11.3583 132.33 11.5735"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>
      </div>

      {/* ─── Service Cards ─── */}
      <div className="cards-wrapper" id="cards-wrapper">
        {CARDS_DATA.map((card) => (
          <div key={card.color} className={`card card-${card.color}`}>
            <div className={`card-sticker sticker-${card.sticker}`}>
              <img
                src={`/assets/Card-Sticker SVG/sticker-${card.sticker}.svg`}
                alt=""
                width="100%"
                loading="lazy"
                aria-hidden="true"
              />
            </div>
            <h3 className="card-title">{card.title}</h3>
            <svg
              width="100%"
              height="10"
              className="card-divider-svg"
              aria-hidden="true"
            >
              <use href="#card-divider" />
            </svg>
            <ul className="card-list">
              {card.services.map((service) => (
                <li key={service}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="13"
                    height="16"
                    className="services-card__bullet-svg"
                    aria-hidden="true"
                  >
                    <use href="#bullet-icon" />
                  </svg>
                  {service}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}
