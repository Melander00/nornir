import useSWR from "swr";
import { fetcher } from "~/lib/fetcher";
import { redirect } from "~/lib/redirect";
import type { User } from "~/types";

export function useUser() {
    const { data: user, error: userError, mutate: mutateUser } = useSWR<User>("/api/me", fetcher);
    
    if (userError) {
        redirect("/login");
    }

    return {user, mutateUser}
}