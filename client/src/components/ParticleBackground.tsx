import { useCallback } from "react";
import Particles from "@tsparticles/react";
import { loadBasic } from "@tsparticles/basic";
import { loadExternalGrabInteraction } from "@tsparticles/interaction-external-grab";
import { loadLifeUpdater } from "@tsparticles/updater-life";
import { loadStarShape } from "@tsparticles/shape-star";
import { loadPolygonShape } from "@tsparticles/shape-polygon";
import type { Engine } from "@tsparticles/engine";

export default function ParticleBackground() {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadBasic(engine);
    await loadExternalGrabInteraction(engine);
    await loadLifeUpdater(engine);
    await loadStarShape(engine);
    await loadPolygonShape(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      className="particle-bg"
      options={{
        background: {
          color: {
            value: "transparent",
          },
        },
        fpsLimit: 120,
        interactivity: {
          events: {
            onClick: {
              enable: true,
              mode: "push",
            },
            onHover: {
              enable: true,
              mode: "grab",
            },
            resize: {
              enable: true,
            },
          },
          modes: {
            push: {
              quantity: 4,
            },
            grab: {
              distance: 150,
              links: {
                opacity: 0.3,
              },
            },
          },
        },
        particles: {
          color: {
            value: ["#8B5CF6", "#00BFFF", "#00FF00", "#FF1493"],
          },
          links: {
            color: "#8B5CF6",
            distance: 150,
            enable: true,
            opacity: 0.1,
            width: 1,
          },
          collisions: {
            enable: true,
          },
          move: {
            direction: "none",
            enable: true,
            outModes: {
              default: "bounce",
            },
            random: false,
            speed: 2,
            straight: false,
          },
          number: {
            density: {
              enable: true,
              area: 800,
            },
            value: 80,
          },
          opacity: {
            value: 0.3,
            animation: {
              enable: true,
              speed: 1,
              minimumValue: 0.1,
            },
          },
          shape: {
            type: ["circle", "triangle", "star"],
            options: {
              star: {
                nb_sides: 5,
              },
            },
          },
          size: {
            value: { min: 1, max: 5 },
            animation: {
              enable: true,
              speed: 2,
              minimumValue: 0.5,
            },
          },
        },
        detectRetina: true,
      }}
    />
  );
}