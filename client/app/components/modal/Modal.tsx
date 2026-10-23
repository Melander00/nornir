import { type ReactNode, useEffect, useRef } from "react";

type ModalProps = {
    open: boolean;
    onClose: () => void;
    title: ReactNode;
    children: ReactNode;
};

export function Modal({ open, onClose, title, children }: ModalProps) {
    const ref = useRef<HTMLDialogElement>(null);

    // Drive the native dialog from the controlled `open` prop.
    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;

        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog
            ref={ref}
            // Fired by Escape as well as close(), keeps parent state in sync.
            onClose={onClose}
            className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-xl bg-white p-0 shadow-xl backdrop:bg-black/40"
        >
            <div className="flex items-center justify-between gap-4 border-b border-gray-200 p-4">
                <h2 className="text-lg font-semibold">{title}</h2>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="rounded-md p-2 hover:bg-gray-100 focus-visible:outline-2"
                >
                    <span aria-hidden="true">✕</span>
                </button>
            </div>

            <div className="p-4">{children}</div>
        </dialog>
    );
}
