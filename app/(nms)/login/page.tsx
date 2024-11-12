"use client"

import { getStatus, login } from "@/utils/accountQueries"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useState, ChangeEvent } from "react"
import { useCookies } from "react-cookie"
import { useRouter } from "next/navigation"
import { statusResponse } from "@/components/types"
import { Input, PasswordToggle, Button, Form, Notification, LoginPageLayout } from "@canonical/react-components";


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
                secure: true,
                expires: new Date(new Date().getTime() + 60 * 60 * 1000),
            })
            router.push('/')
        },
        onError: (e: Error) => {
            setErrorText(e.message)
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
                    title: 'Network Management Service',
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
                    {errorText &&
                        <Notification
                            severity="negative"
                            title="Error"
                        >
                            {errorText.split("error: ")}
                        </Notification>
                    }
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