export function ensureEnv<T>(envVariable: string): T | never;
export function ensureEnv<T>(envVariable: string, defValue: T): T;

export function ensureEnv<T>(envVariable: string, defValue?: T) {
    const val = process.env[envVariable]
    if(!val) {

        if(defValue) return defValue

        console.error(`Environment variable ${envVariable} not set.`)
    }
}

export function ensureEnvs(variables: string[], shouldExit: true): string[];
export function ensureEnvs(variables: string[], shouldExit: false): (string|null)[];

export function ensureEnvs(variables: string[], shouldExit: boolean) {
    const unsetVariables: string[] = []
    const values: (string|null)[] = []

    for(const v of variables) {
        const val = process.env[v]
        if(!val) {
            unsetVariables.push(v)
            values.push(null)
        } else {
            values.push(val)
        }
    }

    if(unsetVariables.length === 0) return values

    if(shouldExit) {
        if(!process.env["BUILD"]) {   
            console.log(process.env)
            throw new Error(`Environment variable(s) ${unsetVariables.join(" ")} not set.`)
        } else {
            // We skip check if it is for BUILD since we want to allow it here. force-dynamic makes sure that the API isn't called anyway.
            // console.log(`Missing variable(s) ${unsetVariables.join(" ")} but its ok for build`)
        }
    } else {
        console.error(`Environment variable(s) ${unsetVariables.join(" ")} not set.`)
    }

    return values
}