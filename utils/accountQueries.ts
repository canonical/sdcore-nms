import { HTTPStatus } from "@/utils/utils";
import { UserEntry } from "@/components/types";

export async function listUsers(params: { authToken: string }): Promise<UserEntry[]> {
    const response = await fetch("/config/v1/account", {
        headers: { "Authorization": "Bearer " + params.authToken }
    })
    const respData = await response.json();
    if (!response.ok) {
        throw new Error(`${response.status}: ${HTTPStatus(response.status)}. ${respData.error}`)
    }
    return respData
}

export async function deleteUser(params: { authToken: string, username: string }) {
    const response = await fetch("/config/v1/account/" + params.username, {
        method: 'DELETE',
        headers: {
            'Authorization': "Bearer " + params.authToken
        }
    })
    const respData = await response.json();
    if (!response.ok) {
        throw new Error(`${response.status}: ${HTTPStatus(response.status)}. ${respData.error}`)
    }
    return respData
}

export async function changePassword(changePasswordForm: { authToken: string, username: string, password: string }) {
    const response = await fetch("/config/v1/account/" + changePasswordForm.username + "/change_password", {
        method: "POST",
        headers: {
            'Authorization': 'Bearer ' + changePasswordForm.authToken
        },
        body: JSON.stringify({ "password": changePasswordForm.password })
    })
    const respData = await response.json();
    if (!response.ok) {
        throw new Error(`${response.status}: ${HTTPStatus(response.status)}. ${respData.error}`)
    }
    return respData
}

export async function getStatus() {
    const response = await fetch("/status")
    const respData = await response.json();
    if (!response.ok) {
        throw new Error(`${response.status}: ${HTTPStatus(response.status)}. ${respData.error}`)
    }
    return respData
}

export async function login(userForm: { username: string, password: string }) {
    const response = await fetch("/login", {
        method: "POST",
        body: JSON.stringify({ "username": userForm.username, "password": userForm.password })
    })
    const respData = await response.json();
    if (!response.ok) {
        throw new Error(`${response.status}: ${HTTPStatus(response.status)}. ${respData.error}`)
    }
    return respData.token
}

export async function postFirstUser(userForm: { username: string, password: string }) {
    const response = await fetch("/config/v1/account", {
        method: "POST",
        body: JSON.stringify({ "username": userForm.username, "password": userForm.password })
    })
    const respData = await response.json();
    if (!response.ok) {
        throw new Error(`${response.status}: ${HTTPStatus(response.status)}. ${respData.error}`)
    }
    return respData
}

export async function postUser(userForm: { authToken: string, username: string, password: string }) {
    const response = await fetch("/config/v1/account", {
        method: "POST",
        body: JSON.stringify({
            "username": userForm.username, "password": userForm.password
        }),
        headers: {
            'Authorization': "Bearer " + userForm.authToken
        }
    })
    const respData = await response.json();
    if (!response.ok) {
        throw new Error(`${response.status}: ${HTTPStatus(response.status)}. ${respData.error}`)
    }
    return respData
}
