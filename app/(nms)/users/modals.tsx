import { UserEntry } from "@/components/types"
import { useAuth } from "@/utils/auth"
import { changePassword, deleteUser, postUser } from "@/utils/queries"
import { passwordIsValid } from "@/utils/utils"
import { Button, Form, Input, Modal, PasswordToggle } from "@canonical/react-components"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ChangeEvent, useState } from "react"


type accountDeleteActionModalProps = {
  user: UserEntry
  closeFn: () => void
}
export function DeleteModal({ user, closeFn }: accountDeleteActionModalProps) {
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
          <Button appearance="negative" onClick={() => deleteMutation.mutate({ authToken: auth.user ? auth.user.authToken : "", username: user.username })}>Confirm</Button>
          <Button onClick={closeFn}>Cancel</Button>
        </>
      }>
      <p>Delete user {user.username}?</p>
      <p>This action is irreversible.</p>
    </Modal >
  )
}

type accountChangePasswordActionModalProps = {
  user: UserEntry
  closeFn: () => void
}
export function ChangePasswordModal({ user, closeFn }: accountChangePasswordActionModalProps) {
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
    <Modal
      title="Change password"
      buttonRow={
        <>
          <Button
            appearance="positive"
            disabled={!passwordsMatch || !passwordIsValid(password1)}
            onClick={(event) => { changePWMutation.mutate({ authToken: (auth.user ? auth.user.authToken : ""), username: user.username, password: password1 }) }}
          >
            Submit
          </Button>
          <Button onClick={closeFn}>Cancel</Button>
        </>
      }
    >
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
        </div>
      </Form>
    </Modal>
  )
}

type createNewAccountModalProps = {
  closeFn: () => void
}
export function CreateUserModal({ closeFn }: createNewAccountModalProps) {
  const auth = useAuth()
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: postUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setErrorText("")
      closeFn()
    },
    onError: (e: Error) => {
      setErrorText(e.message)
    }
  })
  const [username, setUsername] = useState<string>("")
  const [password1, setPassword1] = useState<string>("")
  const [password2, setPassword2] = useState<string>("")
  const passwordsMatch = password1 === password2
  const password1Error = password1 && !passwordIsValid(password1) ? "Password is not valid" : ""
  const password2Error = password2 && !passwordsMatch ? "Passwords do not match" : ""

  const [errorText, setErrorText] = useState<string>("")
  const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>) => { setUsername(event.target.value) }
  const handlePassword1Change = (event: ChangeEvent<HTMLInputElement>) => { setPassword1(event.target.value) }
  const handlePassword2Change = (event: ChangeEvent<HTMLInputElement>) => { setPassword2(event.target.value) }
  return (
    <Modal
      title="create new user"
      buttonRow={
        <>
          <Button
            appearance="positive"
            disabled={!passwordsMatch || !passwordIsValid(password1)}
            onClick={(event) => { event.preventDefault(); mutation.mutate({ authToken: (auth.user ? auth.user.authToken : ""), username: username, password: password1 }) }}
          >
            Submit
          </Button>
          <Button onClick={closeFn}>Cancel</Button>
        </>
      }>
      <Form>
        <div className="p-form__group row">
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
            label="Password"
            onChange={handlePassword2Change}
            required={true}
            error={password2Error}
          />

        </div>
      </Form>
    </Modal>
  )
}