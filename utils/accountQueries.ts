import { UserEntry } from "@/components/types";
import { WebconsoleApiError } from "@/utils/errors";

export async function listUsers(params: { authToken: string }): Promise<UserEntry[]> {
    try {
        const response = await fetch("/config/v1/account", {
            headers: { "Authorization": "Bearer " + params.authToken }
        })
        const respData = await response.json();
        if (!response.ok) {
            throw new WebconsoleApiError(response.status, respData.error);
        }
        return respData
    } catch (error) {
        console.error(`Error retrieving users: ${error}`);
        throw error;
    }
}

export async function deleteUser(params: { authToken: string, username: string }) {
    try {
        const response = await fetch("/config/v1/account/" + params.username, {
            method: 'DELETE',
            headers: {
                'Authorization': "Bearer " + params.authToken
            }
        })
        const respData = await response.json();
        if (!response.ok) {
            throw new WebconsoleApiError(response.status, respData.error);
        }
        return respData
    } catch (error) {
        console.error(`Error deleting user ${params.username}: ${error}`);
        throw error;
    }
}

export async function changePassword(changePasswordForm: { authToken: string, username: string, password: string }) {
    try {
        const response = await fetch("/config/v1/account/" + changePasswordForm.username + "/change_password", {
            method: "POST",
            headers: {
                'Authorization': 'Bearer ' + changePasswordForm.authToken
            },
            body: JSON.stringify({ "password": changePasswordForm.password })
        })
        const respData = await response.json();
        if (!response.ok) {
            throw new WebconsoleApiError(response.status, respData.error);
        }
        return respData

    } catch (error) {
        console.error(`Error updating password of user ${changePasswordForm.username}: ${error}`);
        throw error;
    }
}

export async function getStatus() {
    try {
        const response = await fetch("/status")
        if (!response.ok) {
            throw new WebconsoleApiError(response.status, "Failed to get status");
        }
        const respData = await response.json();
        return respData
    } catch (error) {
        console.error(`Error fetching webconsole status: ${error}`);
        throw error;
    }
}

export async function login(userForm: { username: string, password: string }) : Promise<string> {
    try {
        const response = await fetch("/login", {
            method: "POST",
            body: JSON.stringify({ "username": userForm.username, "password": userForm.password })
        })
        const respData = await response.json();
        if (!response.ok) {
            throw new WebconsoleApiError(response.status, respData.error);
        }
        return respData.token

    } catch (error) {
        console.error(`Error logging in as ${userForm.username}: ${error}`);
        throw error;
    }
}

export async function postFirstUser(userForm: { username: string, password: string }) {
    try {
        const response = await fetch("/config/v1/account", {
            method: "POST",
            body: JSON.stringify({ "username": userForm.username, "password": userForm.password })
        })
        const respData = await response.json();
        if (!response.ok) {
            throw new WebconsoleApiError(response.status, respData.error);
        }
        return respData

    } catch (error) {
        console.error(`Error creating first user ${userForm.username}: ${error}`);
        throw error;
    }
}

export async function postUser(userForm: { authToken: string, username: string, password: string }) {
    try {
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
            throw new WebconsoleApiError(response.status, respData.error);
        }
        return respData
    } catch (error) {
        console.error(`Error creating user ${userForm.username}: ${error}`);
        throw error;
    }
}
