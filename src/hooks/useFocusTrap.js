import { useEffect, useRef } from 'react';

const FOCUSABLE_ELEMENTS_SELECTOR = 
  'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])';

export function useFocusTrap(isActive = true) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!isActive) return;

        const container = containerRef.current;
        if (!container) return;

        const focusableElements = container.querySelectorAll(FOCUSABLE_ELEMENTS_SELECTOR);
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Focus the first element when the trap activates
        if (firstElement) {
            firstElement.focus();
        }

        const handleKeyDown = (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) { // Shift + Tab
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else { // Tab
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        };

        container.addEventListener('keydown', handleKeyDown);

        return () => {
            container.removeEventListener('keydown', handleKeyDown);
        };
    }, [isActive]);

    return containerRef;
}
