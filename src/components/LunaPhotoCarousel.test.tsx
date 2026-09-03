import { act, fireEvent, render, screen } from "@testing-library/react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { LunaPhotoCarousel } from "@/components/LunaPhotoCarousel";
import { en } from "@/lib/translations/en";
import { es } from "@/lib/translations/es";

const TEST_PHOTOS = [
  "/luna/first.jpg",
  "/luna/second.png",
  "/luna/third.webp",
  "/luna/fourth.avif",
] as const;

function setReducedMotion(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  );
}

describe("LunaPhotoCarousel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setReducedMotion(false);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("moves between photos without changing the carousel container", () => {
    render(
      <LunaPhotoCarousel
        copy={en.hero}
        photos={TEST_PHOTOS}
      />,
    );

    const carousel = screen.getByRole("region", {
      name: "Luna Love photo carousel",
    });

    expect(
      screen.getByAltText(/Photo 1 of 4/),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Next photo",
      }),
    );

    expect(
      screen.getByAltText(/Photo 2 of 4/),
    ).toBeInTheDocument();

    expect(carousel).toHaveClass("aspect-[4/5]");
  });

  it("automatically advances every five seconds", () => {
    render(
      <LunaPhotoCarousel
        copy={en.hero}
        photos={TEST_PHOTOS}
      />,
    );

    act(() => {
      vi.advanceTimersByTime(5_000);
    });

    expect(
      screen.getByAltText(/Photo 2 of 4/),
    ).toBeInTheDocument();
  });

  it("uses Spanish accessibility labels", () => {
    render(
      <LunaPhotoCarousel
        copy={es.hero}
        photos={TEST_PHOTOS}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: "Foto siguiente",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByAltText(/Foto 1 de 4/),
    ).toBeInTheDocument();
  });

  it("does not autoplay when reduced motion is requested", () => {
    setReducedMotion(true);

    render(
      <LunaPhotoCarousel
        copy={en.hero}
        photos={TEST_PHOTOS}
      />,
    );

    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    expect(
      screen.getByAltText(/Photo 1 of 4/),
    ).toBeInTheDocument();
  });
});