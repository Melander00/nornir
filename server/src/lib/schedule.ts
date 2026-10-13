export function scheduleInterval(fn: () => void, intervalMs: number) {
    let isRunning = false;

    const run = async () => {
        if(isRunning) return;

        isRunning = true;

        try {
            fn()
        } finally {
            isRunning = false;
        }
    }

    run()

    return setInterval(run, intervalMs)
}