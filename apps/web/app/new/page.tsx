"use client";

import Image from "next/image";
import Typewriter from "../fancy/components/text/typewriter";
import { Underline } from "../fancy/components/text/underline";
import { motion } from "motion/react";
import { IsoButton } from "@/components/ui/isolated-button";

export default function Home() {
  return (
    <div className="noise relative min-h-screen w-full">
      <header className="h-min-48 absolute -top-0 left-0 block h-[150px] w-full">
        <svg
          className="fill-foreground"
          viewBox="0 0 500 500"
          preserveAspectRatio="xMinYMin slice"
        >
          <defs>
            <clipPath id="headerClip">
              <path
                d="M0,80 C10,80 350,30 500,70 L500,00 L00,0 Z"
                style={{ stroke: "none" }}
              />
            </clipPath>
          </defs>
          <path
            d="M0,80 C10,80 350,30 500,70 L500,00 L00,0 Z"
            style={{ stroke: "none" }}
          />
          <defs>
            <pattern
              id="img1"
              patternUnits="userSpaceOnUse"
              width="100"
              height="100"
            >
              <image href="/noise-s.svg" x="0" y="0" width="100" height="100" />
            </pattern>
          </defs>
          <path
            d="M0,80 C10,80 350,30 500,70 L500,00 L00,0 Z"
            style={{ stroke: "none", fill: "url(#img1)" }}
          />
        </svg>
        <a
          href="https://github.com/milescreative"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute right-4 top-4 z-10"
        >
          <svg
            role="img"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="hover:text-accent-two h-6 w-6 text-background transition-colors"
          >
            <title>GitHub</title>
            <path
              fill="currentColor"
              d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
            />
          </svg>
        </a>
      </header>

      <div className="relative flex flex-col pt-10">
        <h1
          className="font-satisfy mb-5 ml-10 text-left text-3xl font-bold text-background"
          id="title"
        >
          <span className="title-anchor">Miles Creative</span>
        </h1>

        <div
          id="typewriter"
          className="relative m-auto mt-5 w-[80vw] justify-start overflow-hidden pb-10 text-2xl font-normal sm:text-3xl md:text-4xl lg:text-5xl"
        >
          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.9,
              delay: 0.2,
              ease: "easeOut",
            }}
          >
            <div id="subtitle" className="z-10 leading-snug">
              <div className="relative">
                <div>
                  <div className="absolute inset-0 inline-flex flex-wrap items-center gap-x-2 text-background [mix-blend-mode:difference]">
                    Where
                    <Underline>innovation</Underline>
                    meets
                    <Underline>creativity</Underline>
                    to
                  </div>
                </div>
                <div>
                  <div className="inline-flex flex-wrap items-center gap-x-2 text-foreground [mix-blend-mode:exclusion]">
                    Where
                    <Underline>innovation</Underline>
                    meets
                    <Underline>creativity</Underline>
                    to
                  </div>
                </div>
              </div>

              <Typewriter
                text={[
                  "bring art into your home",
                  "make technology feel human",
                  "simplify the complex",
                  "turn chaos into harmony",
                  "craft digital solutions with heart",
                ]}
                speed={70}
                className="text-accent-two block decoration-foreground"
                initialDelay={1000}
                waitTime={1500}
                deleteSpeed={40}
                cursorChar={"_"}
              />
            </div>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.9,
            delay: 0.2,
            ease: "easeOut",
          }}
          className="mt-0 flex flex-row justify-center"
        >
          <IsoButton className="button-74">See Our Work</IsoButton>
        </motion.div>
      </div>
      <Image
        src="/miles-creative-banner-plain.svg"
        alt="banner"
        width={2160}
        height={766}
        className="absolute bottom-0 left-1/2 max-h-[45vh] w-full -translate-x-1/2 overflow-hidden object-cover object-top"
        priority
      />
    </div>
  );
}
