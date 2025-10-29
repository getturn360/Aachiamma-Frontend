// src/components/ui/AddToCartButton.jsx
import React from "react";
import styled from "styled-components";

/**
 * AddToCartButton (improved cart icon)
 *
 * - Uses transient prop ($fullWidth) so `fullWidth` is NOT forwarded to DOM.
 * - Improved SVG cart icon: outline, rounded strokes, visually clearer at small sizes.
 * - API unchanged: pass `fullWidth`, `label`, `showIcon`, `disabled`, `onClick`, etc.
 */

const StyledButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  /* transient prop - prevents forwarding to DOM */
  width: ${(p) => (p.$fullWidth ? "100%" : "140px")};
  border-radius: 0.375rem; /* ~6px */
  border: none;
  background-color: ${(p) =>
    p.disabled ? "rgba(255,255,255,0.08)" : "#08665F"};
  color: ${(p) => (p.disabled ? "rgba(255,255,255,0.7)" : "#ffffff")};
  cursor: ${(p) => (p.disabled ? "not-allowed" : "pointer")};
  transition: transform 0.15s ease, box-shadow 0.2s ease;
  padding: 0 12px;
  font-weight: 600;
  font-size: 0.95rem;
  line-height: 1;
  user-select: none;
  -webkit-tap-highlight-color: transparent;

  .iconContainer {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
    height: 18px;
    width: 18px;
    transition: transform 0.35s ease;
    transform: translateX(0);
  }

  .text {
    display: inline-block;
    white-space: nowrap;
    transition: transform 0.35s ease;
  }

  &:active {
    transform: translateY(1px);
  }

  &:hover {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  }

  &:hover .iconContainer {
    transform: translateX(6px);
  }

  &:hover .text {
    transform: translateX(3px);
  }

  &:disabled,
  &[aria-disabled="true"] {
    pointer-events: none;
    opacity: 0.98;
  }
`;

/**
 * Improved CartIcon:
 * - Outline style so it scales crisp at small sizes.
 * - Uses stroke with rounded line caps (keeps good contrast with text color).
 * - Sized to match .iconContainer (18px).
 */
const CartIcon = ({ title = "cart icon" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden={title ? "false" : "true"}
    role={title ? "img" : undefined}
  >
    {title ? <title>{title}</title> : null}
    {/* Cart basket */}
    <path d="M6.5 6.5h13l-1.4 6.5a3 3 0 0 1-2.9 2.3H10.4" />
    {/* Handle / top */}
    <path d="M7 6.5l-1-3.5" />
    {/* Wheels */}
    <circle cx="10.5" cy="18.5" r="1.2" />
    <circle cx="18" cy="18.5" r="1.2" />
  </svg>
);

/**
 * Props:
 * - label (string)
 * - showIcon (bool)
 * - fullWidth (bool) - kept in API, mapped to transient $fullWidth
 * - disabled (bool)
 * - onClick, className, ...rest
 */
const BuyNowButton = ({
  label = "Buy now",
  showIcon = true,
  fullWidth = false,
  disabled = false,
  className = "",
  onClick,
  ...rest
}) => {
  return (
    <StyledButton
      $fullWidth={!!fullWidth}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled}
      className={className}
      type="button"
      {...rest}
    >
      {showIcon && (
        <span className="iconContainer" aria-hidden="true">
          <CartIcon title="Add to cart" />
        </span>
      )}
      <span className="text">{label}</span>
    </StyledButton>
  );
};

export default BuyNowButton;
