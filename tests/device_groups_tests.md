# Device Groups Page - Test Scenarios

This document outlines test cases for creating, editing, and deleting a Device Groups.

---

### 1. Test Empty State: No Device groups, no Network Slices
**Precondition**: There are no Network slices or Device groups registered in the NMS

#### 1.1. Device groups page
- **Action**: Go to the Device groups page
- **Expected**: we should see:
  - Empty state message: No device group available
  - Button: `Go to "Network Slices" page`
  - Table is not displayed

#### 1.2. Button
- **Action**: Click on the  `Go to "Network Slices" page`
- **Expected**: We are redictected to the Network Slices page

### 2. Test Empty State: No Device groups, Network Slices exists
**Precondition**: There are Device groups registered in the NMS. There is at least one Network
Slice registered in the NMS.

#### 2.1. Device groups page
- **Action**: Go to the Device groups page
- **Expected**: we should see:
  - Empty state message: No device group available
  - Button: `Create`
  - Table is not displayed

#### 2.2. Button
- **Action**: Click on the `Create` button
- **Expected**: create Device group modal appears

---

## Creating a Device Group

**Precondition**: There is at least one Network Slice registered in the NMS.

### 3. Test Create Device Group Modal

**Precondition**: Create Device group modal is open

#### 3.1. Default Values
- **Expected**: only the folowing values are selected by default:

  - **DNS** : `8.8.8.8`
  - **MTU**: `1456`
  - **5QI**: `1: GBR - Conversational Voice`
  - **ARP**: `6`

#### 3.2. Placeholder hints
- **Expected**: only the following fields contain the following placeholder:
  - **Name**: `default`
  - **Subscriber IP pool**: `172.250.1.0/16`
  - **MBR Downstream**: `20`
  - **MBR Updstream**: `5`

#### 3.3. Form Validation Errors

- **Action**: Invalid values are introduced in the form
- **Expected**: 
    - An error is displayed next to the field
    - The `Submit` button is disabled.  

These are invalid values for the form:

- **Invalid Name**:
  - The name starts with a number (ex. `1device-group`)
  - The name contains invalid characters (`! # $ .`)
  - The name is longer than 20 characters
- **UE IP Pool**: Not in CIDR format
- **DNS**: Not a valid IP address
- **MTU**:
  - Greater than `65535`
  - Less than `1200`

- **MBR (Maximum Bit Rate) Downstream**:
  - Greater than `1,000,000`
  - Less than `0`
- **MBR Upstream**:
  - Greater than `1,000,000`
  - Less than `0`

#### 3.4. Dropdown elements

- **Action**: click in the each dropdown
- **Expected**: 
    - The list is displayed
    - We can select any element that we want

Tests the following dropdows

- **Network Slice**
  - Test that the elements correspond to the actual networks slices
  - Test one element and more elements in the list
- **5QI**: contains the following options:
  - 1: GBR - Conversational Voice
  - 2: GBR - Conversational Video
  - 9: Non-GBR
- **ARP**: contains a list from 1 to 15


### 4. Test Device Group creation flow

- **Action**: 
  - Open the Create Device Group Modal
  - Fill all the fields with valid values
  - Click on the `Submit` button
- **Expected**: 
  - The device group is created
  - The device group appears in the table with the correct attributes
  - There is no need to refresh to display the device group

### 5. Test Create a Device group with duplicate name 
- **Action**:
  - Open the Create Device Group Modal
  - Use a name of a device group that already exists
  - Fill the other fields with valid values
  - Click on the `Submit` button
- **Expected**: 
  - An error is shown in the modal
  - The Device Group is not created

---

## Editing a Device Group

**Precondition**: Edit Device group modal is open

### 6. Edit device group modal
- **Expected**: 
  - All the fields are prefilled with existing values.
  - The Submit button remains disabled until a valid change is field is made.

#### 6.2 Not editable fields
- **Expected**: the following fields cannot be edited.
  - Name
  - Network Slice

#### 6.3. Form Validation Errors
- **Action**: Invalid values are introduced in the form
- **Expected**: 
    - An error is displayed next to the field
    - The `Submit` button is disabled.  

These are invalid values for the form:

- **UE IP Pool**: Not in CIDR format
- **DNS**: Not a valid IP address
- **MTU**:
  - Greater than `65535`
  - Less than `1200`

- **MBR (Maximum Bit Rate) Downstream**:
  - Greater than `1,000,000`
  - Less than `0`

- **MBR Upstream**:
  - Greater than `1,000,000`
  - Less than `0`

#### 6.4. Dropdown elements
- **Action**: click in the each dropdown
- **Expected**: 
    - The list is displayed
    - We can select any element that we want

Tests the following dropdows

- **5QI**: contains the following options:
  - 1: GBR - Conversational Voice
  - 2: GBR - Conversational Video
  - 9: Non-GBR
- **ARP**: contains a list from 1 to 15

### 7. Test Device Group edition flow
- **Action**: 
  - Open the Edit Device Group Modal
  - Change all the fields with valid values
  - Click on the `Submit` button
- **Expected**: 
  - The device group is edited
  - The device group appears in the table with the correct attributes
  - There is no need to refresh to display the device group update

---

## Deleting a Device Group

**Precondition**: at least there is one device group


### 8. Delete a device group that contains a subscriber

#### 8.1 Without using shift
- **Action**: 
  - Click on the `Delete` button
- **Expected**:
  - A warning modal is displayed.
  - The device group cannot be deleted

#### 8.2 Using shift
- **Action**:
  - Click on the `Delete` button using `shift` at the same time
- **Expected**: 
  - A warning modal is displayed.
  - The device group cannot be deleted



### 9. Delete a device group that does not contain a subscriber

#### 9.2 Without using shift
- **Action**: 
  - Click on the `Delete` button
- **Expected**:
  - A warning modal is displayed.
  - When clicking in the delete button the device group is deleted
  - The device group is inmmediately removed from the table

#### 9.1 Using shift
- **Action**:
  - Click on the `Delete` button using `shift` at the same time
- **Expected**: 
  - The device group is deleted
  - The device group is inmmediately removed from the table
