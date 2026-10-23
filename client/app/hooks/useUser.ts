import useSWR from "swr";
import { ApiError, fetcher } from "~/lib/fetcher";
import { redirect } from "~/lib/redirect";
import type { User } from "~/types";

export function useUser() {
    const { data: user, error: userError, mutate: mutateUser } = useSWR<User>("/api/me", fetcher);

    if (userError instanceof ApiError && userError.status === 401) {
        redirect("/login");
    }

    return {user, mutateUser}
}
