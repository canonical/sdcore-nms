import { UserEntry } from "@/components/types";

export async function ListUsers(params: { authToken: string }): Promise<UserEntry[]> {
    const response = await fetch("/config/v1/account", {
        headers: { "Authorization": "Bearer " + params.authToken }
    })
    const respData = await response.json();
    if (!response.ok) {
        throw new Error(`${response.status}: ${HTTPStatus(response.status)}. ${respData.error}`)
    }
    return respData.result
}

export const HTTPStatus = (code: number): string => {
    const map: { [key: number]: string } = {
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        404: "Not Found",
        500: "Internal Server Error",
    }
    if (!(code in map)) {
        throw new Error("code not recognized: " + code)
    }
    return map[code]
}