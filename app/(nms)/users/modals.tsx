import { UserEntry } from "@/components/types"
import { useAuth } from "@/utils/auth"
import { changePassword, deleteUser } from "@/utils/queries"
import { passwordIsValid } from "@/utils/utils"
import { Button, Form, Input, Modal, PasswordToggle } from "@canonical/react-components"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ChangeEvent, useState } from "react"


type accountDeleteActionModalData = {
    user: UserEntry
    closeFn: () => void
}

export function DeleteModal({ user, closeFn }: accountDeleteActionModalData) {
    const auth = useAuth()
    const queryClient = useQueryClient()
    const deleteMutation = useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            closeFn()
        }
    })
    return (
        <Modal
            title="Confirm delete"
            buttonRow={
                <>
                    <Button onClick={() => deleteMutation.mutate({ authToken: auth.user ? auth.user.authToken : "", username: user.username })}>Confirm</Button>
                    <Button onClick={closeFn}>Cancel</Button>
                </>
            }>
            <p>Delete user {user.username}?</p>
            <p>This action is irreversible.</p>
        </Modal >
    )
}

type accountChangePasswordActionModalData = {
    user: UserEntry
    closeFn: () => void
}

export function ChangePasswordModal({ user, closeFn }: accountChangePasswordActionModalData) {
    const auth = useAuth()
    const queryClient = useQueryClient()
    const changePWMutation = useMutation({
        mutationFn: changePassword,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            closeFn()
        }
    })
    const [password1, setPassword1] = useState<string>("")
    const [password2, setPassword2] = useState<string>("")
    const passwordsMatch = password1 === password2
    const password1Error = password1 && !passwordIsValid(password1) ? "Password is not valid" : ""
    const password2Error = password2 && !passwordsMatch ? "Passwords do not match" : ""

    const [errorText, setErrorText] = useState<string>("")
    const handlePassword1Change = (event: ChangeEvent<HTMLInputElement>) => { setPassword1(event.target.value) }
    const handlePassword2Change = (event: ChangeEvent<HTMLInputElement>) => { setPassword2(event.target.value) }
    return (
        <Modal>
            <Form>
                <div className="p-form__group row">
                    <Input
                        id="InputUsername"
                        label="Username"
                        type="text"
                        value={user.username}
                        disabled={true}
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
                        label="Password"
                        onChange={handlePassword2Change}
                        required={true}
                        error={password2Error}
                    />
                    <Button
                        appearance="positive"
                        disabled={!passwordsMatch || !passwordIsValid(password1)}
                        onClick={(event) => { changePWMutation.mutate({ authToken: (auth.user ? auth.user.authToken : ""), username: user.username, password: password1 }) }}
                    >
                        Submit
                    </Button>
                </div>
            </Form>
        </Modal>
    )
}