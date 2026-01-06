import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { DeveloperPresenceProps, DeveloperPresenceSize } from './DeveloperPresence.types';

const DEFAULT_GITHUB_URL = 'https://github.com/jimzord12/absence-pdf-maker';
const DEFAULT_NAME = 'Dimitrios Stamatakis';
const REVERT_DELAY = 500;
const FLIP_SEQUENCE_ROTATION = 540;

const SIZE_CONFIG: Record<
  DeveloperPresenceSize,
  { width: string; fontSize: string; iconSize: string }
> = {
  sm: { width: '60px', fontSize: 'text-xs', iconSize: 'w-5 h-5' },
  md: { width: '90px', fontSize: 'text-xs', iconSize: 'w-6 h-6' },
  lg: { width: '120px', fontSize: 'text-sm', iconSize: 'w-7 h-7' },
};

const GitHubIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

export const DeveloperPresence = ({
  avatarUrl,
  name = DEFAULT_NAME,
  githubUrl = DEFAULT_GITHUB_URL,
  size = 'md',
  className = '',
  ariaLabel = `Developer profile for ${name}`,
}: DeveloperPresenceProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [shouldShowInfo, setShouldShowInfo] = useState(false);
  const [hasFlippedForward, setHasFlippedForward] = useState(false);
  const revertTimerRef = useRef<NodeJS.Timeout | null>(null);

  const config = SIZE_CONFIG[size];

  useEffect(() => {
    if (isHovered) {
      setShouldShowInfo(true);
      if (revertTimerRef.current) {
        clearTimeout(revertTimerRef.current);
        revertTimerRef.current = null;
      }
    } else {
      if (revertTimerRef.current) {
        clearTimeout(revertTimerRef.current);
        revertTimerRef.current = null;
      }
      if (hasFlippedForward) {
        revertTimerRef.current = setTimeout(() => {
          setShouldShowInfo(false);
        }, REVERT_DELAY);
      }
    }

    return () => {
      if (revertTimerRef.current) {
        clearTimeout(revertTimerRef.current);
      }
    };
  }, [isHovered, hasFlippedForward]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleFocus = () => {
    setIsHovered(true);
  };

  const handleBlur = () => {
    setIsHovered(false);
  };

  return (
    <motion.div
      className={`inline-block relative lg:fixed lg:bottom-4 lg:right-4 lg:top-auto lg:left-auto lg:z-fixed ${className}`}
      style={{ width: config.width, height: config.width }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      aria-label={ariaLabel}
      role="button"
      tabIndex={0}
    >
      <motion.div
        className="absolute -inset-2 rounded-full opacity-50"
        style={{
          background: 'conic-gradient(from 0deg, #ff6b6b, #ffd93d, #6bcb77, #4d96ff, #ff6b6b)',
          filter: 'blur(4px)',
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      <motion.div
        className="relative w-full h-full"
        style={{ perspective: 1000 }}
        initial={false}
        animate={{ rotateY: shouldShowInfo ? FLIP_SEQUENCE_ROTATION : 0 }}
        transition={{
          type: 'spring',
          stiffness: 80,
          damping: 25,
          mass: 1.2,
        }}
        onAnimationComplete={() => {
          setHasFlippedForward(shouldShowInfo);
        }}
      >
        <motion.div
          className="absolute inset-0 backface-hidden"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
          animate={{
            scale: shouldShowInfo ? 0.9 : 1,
            opacity: shouldShowInfo ? 0 : 1,
          }}
          transition={{
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          <motion.img
            src={avatarUrl}
            alt={name}
            className="w-full h-full object-cover rounded-full"
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{
              boxShadow: shouldShowInfo
                ? '0 0 0 rgba(0, 0, 0, 0)'
                : '0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          />
        </motion.div>

        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
          animate={
            shouldShowInfo
              ? {
                  boxShadow: [
                    'inset 0 6px 16px rgba(0, 0, 0, 0.15)',
                    'inset 0 12px 32px rgba(0, 0, 0, 0.4)',
                    'inset 0 8px 20px rgba(0, 0, 0, 0.2)',
                    'inset 0 6px 16px rgba(0, 0, 0, 0.15)',
                    'inset 0 12px 32px rgba(0, 0, 0, 0.4)',
                    'inset 0 8px 20px rgba(0, 0, 0, 0.2)',
                  ],
                  scale: [1, 1.06, 1, 1.06, 1],
                  transition: {
                    boxShadow: {
                      duration: 0.6,
                      times: [0, 0.2, 0.5, 0.7, 1.0],
                      ease: ['easeOut', 'easeIn', 'easeOut', 'easeIn', 'easeOut'],
                      repeat: Infinity,
                      repeatDelay: 1,
                    },
                    scale: {
                      duration: 0.6,
                      times: [0, 0.2, 0.5, 0.7, 1.0],
                      ease: ['easeOut', 'easeIn', 'easeOut', 'easeIn', 'easeOut'],
                      repeat: Infinity,
                      repeatDelay: 1,
                    },
                  },
                }
              : {
                  scale: shouldShowInfo ? 1 : 0.9,
                  opacity: shouldShowInfo ? 1 : 0,
                  boxShadow: 'inset 0 6px 16px rgba(0, 0, 0, 0.3)',
                }
          }
          transition={{
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center">
            <p
              className={`font-semibold text-gray-800 leading-tight mb-2 ${config.fontSize}`}
              style={{
                transform: 'rotateY(180deg)',
              }}
              // initial={{ y: 10, opacity: 0 }}
              // animate={shouldShowInfo ? { y: 0, opacity: 1 } : { y: 10, opacity: 0 }}
              // transition={{ delay: 0.1, duration: 0.3 }}
            >
              {name}
            </p>

            <motion.a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-black transition-colors p-1 rounded-full hover:bg-gray-300"
              style={{
                transform: 'rotateY(180deg)',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={shouldShowInfo ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
              transition={{ delay: 0.2, duration: 0.3, type: 'spring', stiffness: 300 }}
              aria-label={`Visit ${name}'s GitHub profile`}
              onClick={e => e.stopPropagation()}
              onBlur={() => setIsHovered(false)}
            >
              <GitHubIcon className={config.iconSize} />
            </motion.a>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

