"use client";
import { SVGProps } from "react";
import "./newnew.css";
import Typewriter from "@/app/fancy/components/text/typewriter";
import { IsoButton } from "@/components/ui/isolated-button";
export default function LandingPage() {
  const text = (
    <span id="text-main" className="font-satisfy">
      Where innovation meets creativity to &nbsp;
      <Typewriter
        text={[
          "bring art into your home",
          "make technology feel human",
          "simplify the complex",
          "turn chaos into harmony",
          "craft digital solutions with heart",
        ]}
        speed={70}
        className="inline text-accent"
        initialDelay={1000}
        waitTime={1500}
        deleteSpeed={40}
        cursorChar={"_"}
        cursorClassName="text-accent-two"
      />
    </span>
  );

  const HeaderPath = (props: SVGProps<SVGPathElement>) => (
    <path
      fillOpacity="1"
      d="M0,320L48,309.3C96,299,192,277,288,277.3C384,277,480,299,576,282.7C672,267,768,213,864,202.7C960,192,1056,224,1152,208C1248,192,1344,128,1392,96L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
      {...props}
      className="header-path"
      // transform="scale(2.0)"
    />
  );

  return (
    <div className="noise relative min-h-screen w-full">
      <div className="top-div">
        <svg
          id="svg-main"
          width="100%"
          viewBox="0 0 1440 320"
          preserveAspectRatio="xMinYMin meet"
        >
          <title>Two-Circle Venn Diagram</title>
          <defs>
            <pattern
              id="img1"
              patternUnits="userSpaceOnUse"
              width="100"
              height="100"
            >
              <rect
                x="0"
                y="0"
                width="100"
                height="100"
                fill="hsl(var(--foreground))"
              />
              <image href="/noise-s.svg" x="0" y="0" width="100" height="100" />
            </pattern>
          </defs>

          <clipPath id="clip-left">
            <HeaderPath />
          </clipPath>

          <HeaderPath fill="url(#img1)" />

          <foreignObject x="0" y="0">
            <div className="foreign-text">{text}</div>
          </foreignObject>

          <g clipPath="url(#clip-left)">
            <foreignObject x="0" y="0">
              <div className="foreign-text-neg">{text}</div>
            </foreignObject>
          </g>
        </svg>
      </div>
      <div className="absolute top-5 flex w-full justify-center pt-4 md:top-4 lg:top-4 xl:top-4">
        <div id="overlay-title" className="div-74-inverted w-[80%]">
          some title text
        </div>
      </div>
      <div className="flex justify-center">
        <IsoButton className="button-74">See Our Work</IsoButton>
      </div>
    </div>
  );
}
