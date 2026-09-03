"use client";

import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  MoonStar,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from "react";

import type { TranslationDictionary } from "@/lib/translations/en";

const LUNA_PHOTOS = [
  "/luna/luna-01.jpg",
  "/luna/luna-02.jpg",
  "/luna/luna-03.jpg",
  "/luna/luna-04.jpg",
  "/luna/luna-05.jpg",
  "/luna/luna-06.jpg",
  "/luna/luna-07.jpg",
  "/luna/luna-08.jpg",
  "/luna/luna-09.jpg",
  "/luna/luna-10.jpg",
  "/luna/luna-11.jpg",
] as const;

const AUTOPLAY_DELAY_MS = 5_000;

interface LunaPhotoCarouselProps {
  copy: TranslationDictionary["hero"];
  photos?: readonly string[];
}

export function LunaPhotoCarousel({
  copy,
  photos = LUNA_PHOTOS,
}: LunaPhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<number>>(
    () => new Set(),
  );
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const availableIndices = useMemo(
    () =>
      photos
        .map((_, index) => index)
        .filter((index) => !failedImages.has(index)),
    [failedImages, photos],
  );

  const move = useCallback(
    (direction: 1 | -1) => {
      if (availableIndices.length < 2) {
        return;
      }

      setCurrentIndex((activeIndex) => {
        const activePosition =
          availableIndices.indexOf(activeIndex);

        const safePosition =
          activePosition === -1 ? 0 : activePosition;

        const nextPosition =
          (safePosition +
            direction +
            availableIndices.length) %
          availableIndices.length;

        return availableIndices[nextPosition];
      });
    },
    [availableIndices],
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    );

    if (!mediaQuery) {
      return;
    }

    const updatePreference = () => {
      setReducedMotion(mediaQuery.matches);
    };

    updatePreference();

    mediaQuery.addEventListener?.(
      "change",
      updatePreference,
    );

    return () => {
      mediaQuery.removeEventListener?.(
        "change",
        updatePreference,
      );
    };
  }, []);

  useEffect(() => {
    if (
      paused ||
      reducedMotion ||
      availableIndices.length < 2
    ) {
      return;
    }

    const interval = window.setInterval(
      () => move(1),
      AUTOPLAY_DELAY_MS,
    );

    return () => {
      window.clearInterval(interval);
    };
  }, [
    availableIndices.length,
    move,
    paused,
    reducedMotion,
  ]);

  function handleImageError() {
    const remaining = availableIndices.filter(
      (index) => index !== currentIndex,
    );

    setFailedImages(
      (previous) =>
        new Set(previous).add(currentIndex),
    );

    if (remaining.length > 0) {
      setCurrentIndex(remaining[0]);
    }
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLDivElement>,
  ) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    }
  }

  function handleBlur(
    event: FocusEvent<HTMLDivElement>,
  ) {
    if (
      !event.currentTarget.contains(
        event.relatedTarget,
      )
    ) {
      setPaused(false);
    }
  }

  const positionText = copy.carouselPosition
    .replace(
      "{current}",
      String(
        photos.length === 0
          ? 0
          : currentIndex + 1,
      ),
    )
    .replace(
      "{total}",
      String(photos.length),
    );

  const allImagesMissing =
    availableIndices.length === 0;

  return (
    <div
      className="relative aspect-[4/5] overflow-hidden rounded-[2.2rem] border-8 border-white bg-gradient-to-br from-[#f9dce4] to-[#e6daf1] shadow-[0_25px_70px_rgba(62,39,82,.18)]"
      role="region"
      aria-roledescription="carousel"
      aria-label={copy.carouselLabel}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={handleBlur}
    >
      {!allImagesMissing ? (
        <Image
          key={photos[currentIndex]}
          src={photos[currentIndex]}
          alt={`${copy.lunaPhotoAlt}. ${positionText}`}
          fill
          loading={
            currentIndex === 0
              ? "eager"
              : "lazy"
          }
          sizes="(max-width: 768px) 90vw, 420px"
          className="object-cover"
          onError={handleImageError}
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center px-8 text-center text-[#5f3d88]">
          <div className="relative mb-5">
            <MoonStar
              aria-hidden="true"
              size={94}
              strokeWidth={1.4}
            />

            <Heart
              aria-hidden="true"
              className="absolute -bottom-2 -right-5 fill-[#d45d79] text-[#d45d79]"
              size={38}
            />
          </div>

          <p className="text-2xl font-extrabold">
            Luna Love
          </p>

          <p className="mt-2 text-sm font-medium">
            {copy.lunaPhotoPlaceholder}
          </p>
        </div>
      )}

      {!allImagesMissing &&
      availableIndices.length > 1 ? (
        <>
          <button
            type="button"
            className="absolute left-3 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#5f3d88] shadow-lg backdrop-blur-sm hover:bg-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#5f3d88]"
            aria-label={copy.carouselPrevious}
            onClick={() => move(-1)}
          >
            <ChevronLeft
              aria-hidden="true"
              size={28}
            />
          </button>

          <button
            type="button"
            className="absolute right-3 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#5f3d88] shadow-lg backdrop-blur-sm hover:bg-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#5f3d88]"
            aria-label={copy.carouselNext}
            onClick={() => move(1)}
          >
            <ChevronRight
              aria-hidden="true"
              size={28}
            />
          </button>

          <div
            className="absolute inset-x-0 bottom-4 flex justify-center gap-2"
            aria-label={
              copy.carouselNavigation
            }
          >
            {availableIndices.map(
              (photoIndex) => (
                <button
                  key={photos[photoIndex]}
                  type="button"
                  className={`size-3 rounded-full border-2 border-white shadow-sm ${
                    photoIndex === currentIndex
                      ? "bg-[#5f3d88]"
                      : "bg-white/75"
                  }`}
                  aria-label={copy.carouselGoTo.replace(
                    "{number}",
                    String(photoIndex + 1),
                  )}
                  aria-current={
                    photoIndex === currentIndex
                      ? "true"
                      : undefined
                  }
                  onClick={() =>
                    setCurrentIndex(photoIndex)
                  }
                />
              ),
            )}
          </div>

          <p
            className="sr-only"
            aria-live="polite"
          >
            {positionText}
          </p>
        </>
      ) : null}
    </div>
  );
}