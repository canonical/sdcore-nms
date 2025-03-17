"use client"

import { Input, PasswordToggle, Button, Form, LoginPageLayout } from "@canonical/react-components";
import { getStatus, login, postFirstUser } from "@/utils/accountQueries"
import { is401UnauthorizedError, is404NotFound } from "@/utils/errors";
import { passwordIsValid } from "@/utils/utils"
import { statusResponse } from "@/components/types"
import { useCookies } from "react-cookie"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState, ChangeEvent } from "react"

import ErrorNotification from "@/components/ErrorNotification";


export default function Initialize() {
    const router = useRouter()
    const [cookies, setCookie, removeCookie] = useCookies(['user_token']);
    const [errorText, setErrorText] = useState<string>("")
    const statusQuery = useQuery<statusResponse, Error>({
        queryKey: ['status'],
        queryFn: getStatus
    })
    if (statusQuery.status === "error"){
        if (is404NotFound(statusQuery.error)){
            setErrorText("Endpoint not found.");
        } else {
            setErrorText("An unexpected error occurred.");
        }
    }
    if (statusQuery.status !== "error" && statusQuery.data && statusQuery.data.initialized) {
        router.push("/login")
    }
    const loginMutation = useMutation({
        mutationFn: login,
        onSuccess: (result) => {
            setErrorText("")
            setCookie('user_token', result, {
                sameSite: true,
                secure: true,
                expires: new Date(new Date().getTime() + 60 * 60 * 1000),
            })
            router.push('/network-configuration')
        },
        onError: (error: Error) => {
            if (is401UnauthorizedError(error)) {
                setErrorText("Incorrect username or password. Please, try again.")
            } else {
                setErrorText("An unexpected error occurred.");
            }
        }
    })
    const postUserMutation = useMutation({
        mutationFn: postFirstUser,
        onSuccess: () => {
            setErrorText("")
            loginMutation.mutate({ username: username, password: password1 })
        },
        onError: (e: Error) => {
            setErrorText("An unexpected error occurred.")
        }
    })
    const [username, setUsername] = useState<string>("")
    const [password1, setPassword1] = useState<string>("")
    const [password2, setPassword2] = useState<string>("")
    const passwordsMatch = password1 === password2
    const password1Error = password1 && !passwordIsValid(password1) ? "Password is not valid" : ""
    const password2Error = password2 && !passwordsMatch ? "Passwords do not match" : ""

    const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => { setUsername(event.target.value) }
    const handlePassword1Change = (event: ChangeEvent<HTMLInputElement>) => { setPassword1(event.target.value) }
    const handlePassword2Change = (event: ChangeEvent<HTMLInputElement>) => { setPassword2(event.target.value) }
    return (
        <>
            <LoginPageLayout
                logo={{
                    src: 'https://assets.ubuntu.com/v1/82818827-CoF_white.svg',
                    title: 'NMS',
                    url: '#'
                }}
                title="Initialize Network Management System"
            >
                <Form>
                    <h4>Create the initial admin user</h4>
                    {errorText && <ErrorNotification error={errorText}/>}
                    <Input
                        id="InputUsername"
                        label="Username"
                        type="text"
                        required={true}
                        onChange={handleUsernameChange}
                    />
                    <PasswordToggle
                        help="Password must have 8 or more characters, must include at least one capital letter, one lowercase letter, and either a number or a symbol."
                        id="password1"
                        label="Password"
                        onChange={handlePassword1Change}
                        required={true}
                        error={password1Error}
                    />
                    <PasswordToggle
                        id="password2"
                        label="Confirm Password"
                        onChange={handlePassword2Change}
                        required={true}
                        error={password2Error}
                    />
                    <Button
                        appearance="positive"
                        disabled={!passwordsMatch || !passwordIsValid(password1)}
                        onClick={(event) => {
                            event.preventDefault();
                            if (passwordsMatch && passwordIsValid(password1)) {
                                postUserMutation.mutate({ username: username, password: password1 });
                            }
                        }}
                    >
                        Submit
                    </Button>
                </Form>
            </LoginPageLayout>
        </>
    )
}