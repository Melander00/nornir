
import {
    type HTMLAttributes,
    type ReactNode,
    useEffect,
} from "react";

type SlidePanelProps = {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  side?: "left" | "right" | "top" | "bottom";
  width?: string;
  height?: string;
  overlay?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
  panelClassName?: string;
  overlayClassName?: string;
  duration?: number;
  showCloseButton?: boolean;
  closeButtonLabel?: string;
  title?: string | React.ReactNode;
  id?: string;
  role?: HTMLAttributes<HTMLDivElement>["role"];
};

const sideClasses = {
  left: {
    position: "left-0 top-0 h-dvh",
    hidden: "-translate-x-full",
    visible: "translate-x-0",
    size: "w-[var(--panel-width)]",
  },
  right: {
    position: "right-0 top-0 h-dvh",
    hidden: "translate-x-full",
    visible: "translate-x-0",
    size: "w-[var(--panel-width)]",
  },
  top: {
    position: "left-0 top-0 w-full",
    hidden: "-translate-y-full",
    visible: "translate-y-0",
    size: "h-[var(--panel-height)]",
  },
  bottom: {
    position: "bottom-0 left-0 w-full",
    hidden: "translate-y-full",
    visible: "translate-y-0",
    size: "h-[var(--panel-height)]",
  },
};

export function SlidePanel({
  open,
  onClose,
  children,
  side = "left",
  width = "18rem",
  height = "50vh",
  overlay = true,
  closeOnOverlayClick = true,
  className = "",
  panelClassName = "",
  overlayClassName = "",
  duration = 300,
  showCloseButton = false,
  closeButtonLabel = "Close panel",
  title,
  id,
  role = "dialog",
}: SlidePanelProps) {
  const styles = sideClasses[side];

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () =>
      document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <>
      {overlay && (
        <div
          aria-hidden="true"
          onClick={() => {
            if (closeOnOverlayClick) onClose?.();
          }}
          className={[
            "fixed inset-0 z-40 bg-black/40",
            "transition-opacity ease-out",
            open
              ? "opacity-100"
              : "pointer-events-none opacity-0",
            overlayClassName,
          ].join(" ")}
          style={{ transitionDuration: `${duration}ms` }}
        />
      )}

      <aside
        id={id}
        role={role}
        aria-modal={role === "dialog" ? true : undefined}
        aria-label={title ? undefined : "Slide panel"}
        aria-labelledby={title ? `${id}-title` : undefined}
        aria-hidden={!open}
        inert={!open}
        className={[
          "fixed z-50 overflow-y-auto bg-white shadow-xl",
          "transition-transform ease-in-out",
          "motion-reduce:transition-none",
          styles.position,
          styles.size,
          open ? styles.visible : styles.hidden,
          className,
          panelClassName,
        ].join(" ")}
        style={{
          "--panel-width": width,
          "--panel-height": height,
          transitionDuration: `${duration}ms`,
        } as React.CSSProperties}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between gap-4 border-b p-4">
            {title && (
              <h2
                id={id ? `${id}-title` : undefined}
                className="text-lg font-semibold"
              >
                {title}
              </h2>
            )}

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label={closeButtonLabel}
                className="ml-auto rounded-md p-2 hover:bg-gray-100 focus-visible:outline-2"
              >
                <span aria-hidden="true">✕</span>
              </button>
            )}
          </div>
        )}

        {children}
      </aside>
    </>
  );
}
