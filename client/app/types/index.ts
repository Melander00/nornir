export type User = {
    id: string;
    subject: string;
    name?: string;
    username?: string;
    picture?: string;
    entries?: LogEntry[];
    active?: ActiveLog;
};

export type LogEntry = {
    id: string;
    userId: string;
    note: string;
    from: Date;
    to: Date;
    user?: User;
};

export type ActiveLog = {
    id: string;
    userId: string;
    from: Date;
    user?: User;
};
