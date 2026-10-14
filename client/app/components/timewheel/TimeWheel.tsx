import { useCallback, useRef, type KeyboardEvent, type PointerEvent, type ReactNode, type WheelEvent } from "react";

type TimeWheelProps = {
    value: number;
    onChange: (minutes: number) => void;
    onAction: () => void;
    actionLabel: string;
    disabled?: boolean;
    min?: number;
    max?: number;
    step?: number;
    wrap?: boolean;
    children?: ReactNode;
    formatValue?: (minutes: number) => string;
    readOnly?: boolean;
};

const DEFAULT_FORMAT = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

function normalizeAngle(angle: number) {
    // Keep the angular difference between -180 and +180 degrees.
    return ((angle + 180 + 360) % 360) - 180;
}

export function TimeWheel({
    value,
    onChange,
    onAction,
    actionLabel,
    disabled = false,
    min = 0,
    max = 1439,
    step = 5,
    wrap = true,
    children,
    formatValue = DEFAULT_FORMAT,
    readOnly = false,
}: TimeWheelProps) {
    const wheelRef = useRef<HTMLDivElement>(null);
    const dragging = useRef(false);
    const lastAngle = useRef(0);
    const accumulatedAngle = useRef(0);
    const currentValue = useRef(value);

    const rotation = (value % 60) * 6;

    // Keep pointer interactions synchronized with controlled props.
    currentValue.current = value;

    const updateValue = useCallback(
        (amount: number) => {
            const range = max - min + 1;

            const next = wrap
                ? min + ((((currentValue.current + amount - min) % range) + range) % range)
                : Math.max(min, Math.min(max, currentValue.current + amount));

            if (next !== currentValue.current) {
                currentValue.current = next;
                onChange(next);
            }
        },
        [max, min, onChange, wrap],
    );

    const getAngle = (event: PointerEvent<HTMLDivElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - (rect.left + rect.width / 2);
        const y = event.clientY - (rect.top + rect.height / 2);

        return (Math.atan2(y, x) * 180) / Math.PI;
    };

    const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
        if (disabled || readOnly || event.button !== 0) return;

        dragging.current = true;
        accumulatedAngle.current = 0;
        lastAngle.current = getAngle(event);
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
        if (!dragging.current || disabled || readOnly) return;

        const angle = getAngle(event);
        accumulatedAngle.current += normalizeAngle(angle - lastAngle.current);
        lastAngle.current = angle;

        // A full rotation changes the time by 60 minutes.
        // With step=5, every 30 degrees changes it by five minutes.
        const degreesPerStep = step * 6;
        const steps = Math.trunc(accumulatedAngle.current / degreesPerStep);

        if (steps !== 0) {
            updateValue(steps * step);
            accumulatedAngle.current -= steps * degreesPerStep;
        }
    };

    const handlePointerUp = () => {
        dragging.current = false;
        accumulatedAngle.current = 0;
    };

    const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
        if (disabled || readOnly) return;

        event.preventDefault();
        updateValue(event.deltaY < 0 ? step : -step);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (disabled || readOnly) return;

        switch (event.key) {
            case "ArrowUp":
            case "ArrowRight":
                event.preventDefault();
                updateValue(step);
                break;
            case "ArrowDown":
            case "ArrowLeft":
                event.preventDefault();
                updateValue(-step);
                break;
            case "PageUp":
                event.preventDefault();
                updateValue(60);
                break;
            case "PageDown":
                event.preventDefault();
                updateValue(-60);
                break;
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div
                ref={wheelRef}
                role="slider"
                aria-label="Selected time"
                aria-valuemin={min}
                aria-valuemax={max}
                aria-valuenow={value}
                aria-valuetext={formatValue(value)}
                aria-disabled={disabled || readOnly}
                tabIndex={disabled || readOnly ? -1 : 0}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                // onWheel={handleWheel}
                onKeyDown={handleKeyDown}
                className={[
                    "relative flex h-72 w-72 select-none items-center",
                    "justify-center rounded-full border-8 border-slate-200",
                    "bg-linear-to-br from-slate-50 to-slate-200 ",
                    "touch-none outline-none focus-visible:ring-4",
                    "focus-visible:ring-blue-500/40",
                    disabled ? "cursor-not-allowed opacity-50" : "cursor-grab active:cursor-grabbing",
                    readOnly ? "cursor-not-allowed border-slate-100 from-slate-50 to-slate-100" : ""
                ].join(" ")}
            >
                {/* Decorative dial */}
                <div
                    className={[
                        "pointer-events-none absolute inset-3 rounded-full border border-slate-300",
                        readOnly ? "opacity-10 border-slate-100" : "",
                    ].join(" ")}
                />
                <div
                    className={["pointer-events-none absolute inset-3 rounded-full border border-slate-300", readOnly ? "opacity-50" : "",].join(" ")}
                    style={{ transform: `rotate(${rotation}deg)` }}
                >
                    <div className="absolute inset-x-0 top-0 mx-auto h-3 w-1.5 rounded-full bg-blue-600" />
                </div>

                {/* Center action is independent of drag interactions. */}
                <button
                    type="button"
                    disabled={disabled}
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={onAction}
                    className={[
                        "relative z-10 flex h-48 w-48 flex-col items-center",
                        "justify-center rounded-full border border-slate-200",
                        "bg-white shadow-lg transition hover:bg-slate-50",
                        "active:scale-[0.98] focus-visible:outline-none",
                        "focus-visible:ring-4 focus-visible:ring-blue-500/40",
                        "disabled:cursor-not-allowed",
                    ].join(" ")}
                >
                    {children ?? (
                        <>
                            <span className="text-4xl font-semibold tabular-nums text-slate-900">{formatValue(value)}</span>
                            <span className="mt-2 text-sm font-medium text-slate-500">{actionLabel}</span>
                        </>
                    )}
                </button>
            </div>

            {/* <div className="text-center text-sm text-slate-500">Drag to adjust · Scroll to change · Use arrow keys</div> */}
        </div>
    );
}
