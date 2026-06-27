import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "./page";

describe("Home", () => {
  it("introduces the B2B agency MVP foundation", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        name: /B2B 에이전시의 일을 덜 흩어지게 만듭니다/,
      }),
    ).toBeTruthy();
    expect(screen.getByText("B2B Agency MVP")).toBeTruthy();
  });
});
