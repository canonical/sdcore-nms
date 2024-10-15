"use client"

import { useQuery } from "@tanstack/react-query"
import { ListUsers } from "@/utils/queries"
import { UserEntry } from "@/components/types"
import Loader from "@/components/Loader"
import { useAuth } from "@/utils/auth"
import PageHeader from "@/components/PageHeader"
import { Button, MainTable } from "@canonical/react-components"
import PageContent from "@/components/PageContent"
import { useState } from "react"
import SyncOutlinedIcon from "@mui/icons-material/SyncOutlined";

export default function Users() {
    const [isCreateModalVisible, setCreateModalVisible] = useState<boolean>(false);
    const [isEditModalVisible, setEditModalVisible] = useState<boolean>(false);

    const toggleCreateModal = () => setCreateModalVisible((prev) => !prev);
    const toggleEditModal = () => setEditModalVisible((prev) => !prev);

    const auth = useAuth()

    const query = useQuery<UserEntry[], Error>({
        queryKey: ['users'],
        queryFn: () => ListUsers({ authToken: auth.user ? auth.user.authToken : "" }),
        retry: (failureCount, error): boolean => {
            if (error.message.includes("401")) {
                return false
            }
            return true
        },
    })

    const handleRefresh = async () => {
        await queryClient.invalidateQueries({ queryKey: [queryKeys.subscribers] });
        await queryClient.invalidateQueries({ queryKey: [queryKeys.deviceGroups] });
        await queryClient.invalidateQueries({ queryKey: [queryKeys.networkSlices] });
    };

    if (query.status == "pending") { return <Loader text="loading..." /> }
    if (query.status == "error") {
        if (query.error.message.includes("401")) {
            auth.logout()
        }
        return <p>{query.error.message}</p>
    }
    const users = Array.from(query.data ? query.data : [])
    return (
        <>
            <PageHeader title={`NMS Accounts (${users.length})`}>
                <Button
                    hasIcon
                    appearance="base"
                    onClick={handleRefresh}
                    title="refresh subscriber list"
                >
                    <SyncOutlinedIcon style={{ color: "#666" }} />
                </Button>
                <Button appearance="positive" onClick={toggleCreateModal}>
                    Create
                </Button>
            </PageHeader>
            <PageContent>
                <MainTable
                    defaultSort='"abcd"'
                    defaultSortDirection="ascending"
                    headers={[
                        { content: "IMSI" },
                        { content: "Actions", className: "u-align--right" },
                    ]}
                    rows={tableContent}
                />
            </PageContent>
            {isCreateModalVisible && <SubscriberModal toggleModal={toggleCreateModal} slices={slices} deviceGroups={deviceGroups} />}
            {isEditModalVisible &&
                <SubscriberModal toggleModal={toggleEditModal} subscriber={subscriber} slices={slices} deviceGroups={deviceGroups} />}
        </>
    )
}