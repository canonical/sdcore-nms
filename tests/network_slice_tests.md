# Network Slice Test Scenarios

This document outlines test cases for creating, editing, and deleting a Network Slice.

## Creating a Network Slice

**Precondition**: 
- There is at least one UPF registered in the NMS.
- There is at least one gNB registered in the NMS.

### 1. Test Create Network Slice Modal

#### 1.1. Default Values
- **Expected**: only the folowing values are set by default:

  - **SST** : `1:eMBB`. It cannot be modified.

#### 1.2. Placeholder hints
- **Expected**: only the following fields contain the following placeholder:
  - **Name**: `default`
  - **MCC**: `001`
  - **MNC**: `01`

#### 1.3. Form Validation Errors

- **Action**: Introduce invalid values in the form.
- **Expected**: 
    - An error is displayed below the field.
    - The `Submit` button is disabled.  

These are invalid values for the form:

- **Name**:
  - The name starts with a number (ex. `1network-slice`).
  - The name contains invalid characters (`! # $ .`).
  - The name is longer than 20 characters.
- **MCC**:
  - Longer than 3 digits
  - Shorter than 3 digits
  - Contain characters other than numbers
- **MNC**:
  - Longer than 3 digits
  - Shorter than 2 digits
  - Contain characters other than numbers

#### 1.4. UPF Dropdown

- **Action**: Click on the UPF dropdown.
  - Test using a list that contains 1 element
  - Test using a list that contains more than one element
- **Expected**: 
  - The list is displayed
  - We can select any element that we want
  - The elements correspond to the actual list of UPFs

#### 1.5. gNodeBs Multiple Selection
- **Action**: Click on the gNodeB list elements
  - Test using a list that contains 1 element
  - Test using a list that contains more than one element
- **Expected**:
  - We can select more than one element using `Ctrl`
  - If we click 2 times on the same element, it is no longer selected

### 2. Test Network Slice creation flow

- **Action**: 
  - Open the Create Network Slice Modal
  - Fill all the fields with valid values
  - Click on the `Submit` button
- **Expected**:
  - The `Submit` button is not enabled until all the fields are filled in.
  - The Network Slice is created
  - The Network Slice appears in the table with the correct attributes
  - There is no need to refresh to display the Network Slice

### 3. Test Create a Network Slice with duplicate name

- **Precondition**: There is at least one Network Slice registered in the NMS.
- **Action**:
  - Open the Create Network Slice Modal
  - Use a name of a Network Slice that already exists
  - Fill the other fields with valid values
  - Click on the `Submit` button
- **Expected**: 
  - An error is shown in the modal
  - The Network Slice is not created


## Editing a Network Slice
**Precondition**:
  - There is at least 2 UPF registered in the NMS.
  - There is at least 2 gNB registered in the NMS.
  - There is at least one Network Slice registered in the NMS.
  - Edit Network Slice modal is open

### 4. Edit Network Slice modal
- **Expected**: 
  - All the fields are prefilled with existing values.
  - The Submit button remains disabled until a valid change in any field is made.

#### 4.1. Not editable fields
- **Expected**: the following fields cannot be edited.
  - Name
  - MCC
  - MNC
  - SST

#### 4.2. UPF Dropdown
- **Action**: Click on the UPF dropdown.
- **Expected**: 
  - The list is displayed
  - We can select any element that we want
  - The elements correspond to the actual list of UPFs

#### 4.3. gNodeBs Multiple Selection
- **Action**: Click on the gNodeB list elements
- **Expected**:
  - We can select more than one element using `Ctrl`
  - If we click 2 times on the same element, it is no longer selected

### 5. Test Network Slice edition flow
- **Action**: 
  - Open the Edit Network Slice Modal
  - Change all the fields with valid values
  - Click on the `Submit` button
- **Expected**:
  - The Network Slice is edited
  - The Network Slice appears in the table with the correct attributes
  - There is no need to refresh to display the Network Slice update

## Deleting a Network Slice

**Precondition**:
- There is at least one Network Slice registered in the NMS.

### 6. Delete a Network Slice that contains a Device Group

**Precondition**: add a Device Group and associate it to the Network Slice under test.

#### 6.1. Without using shift
- **Action**: 
  - Click on the `Delete` button
- **Expected**:
  - A warning modal is displayed.
  - The Network Slice cannot be deleted

#### 6.2. Using shift
- **Action**:
  - Click on the `Delete` button using `shift` at the same time
- **Expected**: 
  - A warning modal is displayed.
  - The Network Slice cannot be deleted

### 7. Delete a Network Slice that does not contain a Device Group

**Precondition**: the Network Slice under test does not have any Device Group associated.

#### 7.1. Without using shift
- **Action**: 
  - Click on the `Delete` button
- **Expected**:
  - A warning modal is displayed.
  - When clicking in the delete button the Network Slice is deleted
  - The Network Slice is inmmediately removed from the table

#### 7.2. Using shift
- **Action**:
  - Click on the `Delete` button using `shift` at the same time
- **Expected**: 
  - The Network Slice is deleted
  - The Network Slice is inmmediately removed from the table


## Test Empty State: no Network Slices
**Precondition**: 
- There are no Network Slices registered in the NMS.

### 8. No UPFs
**Precondition**: 
- There are no UPFs registered in the NMS.
- There is at least one gNB registered in the NMS.

#### 8.1. Network Slices page
- **Action**: Go to the Network Slices page
- **Expected**: we should see:
  - Empty state message: 
    ```
      No network slice available. 
      To create a network slice first:
        - Integrate your UPF charm with the NMS charm.
    ```
  - Button: `Go to Documentation`
  - Table is not displayed

#### 8.2. Button
- **Action**: Click on the `Go to Documentation` button
- **Expected**: the documentation is opened in a new tab

### 9. No gNodeBs
- There is at least one UPF registered in the NMS.
- There are no gNBs registered in the NMS.

#### 9.1. Network Slices page
- **Action**: Go to the Network Slices page
- **Expected**: we should see:
  - Empty state message: 
    ```
      No network slice available. 
      To create a network slice first:
        - Integrate your gNodeB charm with the NMS charm.
    ```
  - Button: `Go to Documentation`
  - Table is not displayed

#### 9.2. Button
- **Action**: Click on the `Go to Documentation` button
- **Expected**: the documentation is opened in a new tab

### 10. No UPFs and No gNodeBs
**Precondition**: 
- There are no UPFs registered in the NMS.
- There are no gNBs registered in the NMS.

#### 10.1. Network Slices page
- **Action**: Go to the Network Slices page
- **Expected**: we should see:
  - Empty state message: 
    ```
      No network slice available. 
      To create a network slice first:
        - Integrate your UPF charm with the NMS charm.
        - Integrate your gNodeB charm with the NMS charm.
    ```
  - Button: `Go to Documentation`
  - Table is not displayed

#### 10.2. Button
- **Action**: Click on the `Go to Documentation` button
- **Expected**: the documentation is opened in a new tab

### 11. gNodeBs and UPFs exist
**Precondition**: 
- There is at least one UPF registered in the NMS.
- There is at least one gNB registered in the NMS.

#### 11.1. Network Slices page
- **Action**: Go to the Network Slices page
- **Expected**: we should see:
  - Empty state message: No network slice available
  - Button: `Create`
  - Table is not displayed

#### 11.2. Button
- **Action**: Click on the `Create` button
- **Expected**: create Network Slices modal appears

## Table Behavior with Existing Network Slice
**Precondition**: 
- There is at least 1 Network Slice registered in the NMS.

### 12. No UPFs and No gNodeBs
**Precondition**: 
- There are no UPFs registered in the NMS.
- There are no gNBs registered in the NMS.

#### 12.1. Network Slices page
- **Action**: Go to the Network Slices page
- **Expected**: we should see:
  - Warning is displayed: 
    ```
      Inventory is not initialized
      To add UPFs to the inventory, integrate your UPF charm with the NMS charm.
      To add gNodeBs to the inventory, integrate your gNodeB charm with the NMS charm.
      For more details, see the documentation.
    ```
  - Link: `documentation`. Opens the documentation in a new tab
  - Table is displayed
  - Button states:
    - Create: Disabled
    - Edit: Disabled
    - Delete: Enabled
