'use client';

import Image from 'next/image';
import Typewriter from '../fancy/components/text/typewriter';
import { Underline } from '../fancy/components/text/underline';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
export default function Home() {
  return (
    <div className="w-full min-h-screen relative noise">
      <div className="flex flex-col items-center pt-20 z-10 relative">
        <h1 className="text-8xl font-bold mb-5 font-alegreya">
          <Underline>Miles Creative</Underline>
        </h1>
        <div className="w-full h-full md:text-4xl lg:text-5xl sm:text-3xl text-2xl flex flex-row items-start justify-start bg-background font-normal overflow-hidden pl-24">
          <motion.div
            className="whitespace-pre-wrap text-xl"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.9,
              delay: 0.2,
              ease: 'easeOut',
            }}
          >
            <span>{'Where innovation meets creativity to '}</span>
            <Typewriter
              text={[
                'bring art into your home',
                'make technology feel human',
                'simplify the complex',
                'turn chaos into harmony',
                'craft digital solutions with heart',
              ]}
              speed={70}
              className="text-yellow-500"
              initialDelay={1000}
              waitTime={1500}
              deleteSpeed={40}
              cursorChar={'_'}
            />
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.9,
            delay: 0.2,
            ease: 'easeOut',
          }}
        >
          <Button variant="accent" className="mt-10">
            See Our Work
          </Button>
        </motion.div>
      </div>
      <Image
        src="/miles-creative-banner-plain.svg"
        alt="banner"
        width={2160}
        height={766}
        className="w-full h-auto absolute bottom-0"
        priority
      />
    </div>
  );
}
