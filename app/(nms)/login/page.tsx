"use client"

import { ChangeEvent, useState,  } from "react"
import { Input, PasswordToggle, Button, Form, LoginPageLayout } from "@canonical/react-components";
import { is401UnauthorizedError } from "@/utils/errors"
import { getStatus, login } from "@/utils/accountQueries"
import { statusResponse } from "@/components/types"
import { useCookies } from "react-cookie"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

import ErrorNotification from "@/components/ErrorNotification";


export default function LoginPage() {
    const router = useRouter()
    const [cookies, setCookie, removeCookie] = useCookies(['user_token']);
    const statusQuery = useQuery<statusResponse, Error>({
        queryKey: ['status'],
        queryFn: getStatus,
    })
    if (statusQuery.data && !statusQuery.data.initialized) {
        router.push("/initialize")
    }
    const mutation = useMutation({
        mutationFn: login,
        onSuccess: (result) => {
            setErrorText("")
            setCookie('user_token', result, {
                sameSite: true,
                expires: new Date(new Date().getTime() + 60 * 60 * 1000),
            })
            router.push('/')
        },
        onError: (error: Error) => {
            if (is401UnauthorizedError(error)) {
                setErrorText("Incorrect username or password. Please, try again.")
            } else {
                setErrorText("An unexpected error occurred.");
            }
        }
    })

    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [errorText, setErrorText] = useState<string>("")
    const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => { setUsername(event.target.value) }
    const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => { setPassword(event.target.value) }
    return (
        <>
            <LoginPageLayout
                logo={{
                    src: 'https://assets.ubuntu.com/v1/82818827-CoF_white.svg',
                    title: 'Network Management System',
                    url: '#'
                }}
                title="Log in"
            >
                <Form>
                    <Input
                        id="InputUsername"
                        label="Username"
                        type="text"
                        required={true}
                        onChange={handleUsernameChange}
                    />
                    <PasswordToggle
                        id="InputPassword"
                        label="Password"
                        required={true}
                        onChange={handlePasswordChange}
                    />
                    {errorText && <ErrorNotification error={ errorText}/>}
                    <Button
                        appearance="positive"
                        disabled={password.length == 0 || username.length == 0}
                        onClick={
                            (event) => {
                                event.preventDefault();
                                mutation.mutate({ username: username, password: password })
                            }
                        }
                    >
                        Log In
                    </Button>
                </Form>
            </LoginPageLayout>
        </>
    )
}