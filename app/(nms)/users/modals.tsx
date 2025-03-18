import { Button, Form, Input, Modal, PasswordToggle } from "@canonical/react-components"
import { ChangeEvent, useState } from "react"
import { changePassword, deleteUser, postUser } from "@/utils/accountQueries"
import { is401UnauthorizedError, is403ForbiddenError, is409ConflictError } from "@/utils/errors"
import { passwordIsValid } from "@/utils/utils"
import { useAuth } from "@/utils/auth"
import { UserEntry } from "@/components/types"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import ErrorNotification from "@/components/ErrorNotification"
import { queryKeys } from "@/utils/queryKeys"


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
      queryClient.invalidateQueries({ queryKey: [queryKeys.users] })
      closeFn()
    },
    onError: (error) => {
      if (is401UnauthorizedError(error)) { auth.logout(); }
    },
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
      setErrorText("")
      queryClient.invalidateQueries({ queryKey: [queryKeys.users] })
      closeFn()
    },
    onError: (error) => {
      if (is401UnauthorizedError(error)) { auth.logout(); }
      setErrorText("An unexpected error occurred.")
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
      {errorText && <ErrorNotification error={errorText}/>}
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
  const router = useRouter()
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: postUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.users] })
      setErrorText("")
      closeFn()
    },
    onError: (error: Error) => {
      if (is401UnauthorizedError(error)) { auth.logout(); }
      if (is403ForbiddenError(error)) { router.push("/") }
      if (is409ConflictError(error)) { 
        setErrorText("User already exists.")
      }
      else {
        setErrorText("An unexpected error occurred.")
      }
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
      title="Create user"
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
      {errorText && <ErrorNotification error={errorText}/>}
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