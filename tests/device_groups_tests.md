# Device Groups Page - Test Scenarios

This document outlines test cases for creating, editing, and deleting a Device Groups.

## Creating a Device Group

**Precondition**: There is at least one Network Slice registered in the NMS.

### 1. Test Create Device Group Modal

**Precondition**: Create Device group modal is open

#### 1.1. Default Values
- **Expected**: only the folowing values are set by default:

  - **DNS** : `8.8.8.8`
  - **MTU**: `1456`
  - **5QI**: `1: GBR - Conversational Voice`
  - **ARP**: `6`

#### 1.2. Placeholder hints
- **Expected**: only the following fields contain the following placeholder:
  - **Name**: `default`
  - **Subscriber IP pool**: `172.250.1.0/16`
  - **MBR Downstream**: `20`
  - **MBR Updstream**: `5`

#### 1.3. Form Validation Errors

- **Action**: Introduce invalid values in the form.
- **Expected**: 
    - An error is displayed below the field.
    - The `Submit` button is disabled.  

These are invalid values for the form:

- **Name**:
  - The name starts with a number (ex. `1device-group`).
  - The name contains invalid characters (`! # $ .`).
  - The name is longer than 20 characters.
- **UE IP Pool**: Not in CIDR format.
- **DNS**: Not a valid IP address.
- **MTU**:
  - Greater than `65,535`
  - Less than `1200`

- **MBR (Maximum Bit Rate) Downstream**:
  - Greater than `1,000,000`
  - Less than `0`
- **MBR Upstream**:
  - Greater than `1,000,000`
  - Less than `0`

#### 1.4. Dropdown elements

- **Action**: Click on the each dropdown.
- **Expected**: 
  - The list is displayed
  - We can select any element that we want

Tests the following dropdows:

- **Network Slice**
  - Test that the elements correspond to the actual networks slices
  - Test one element in the list
  - Test more than one element in the list
- **5QI**: contains the following options:
  - 1: GBR - Conversational Voice
  - 2: GBR - Conversational Video
  - 9: Non-GBR
- **ARP**: contains a list from 1 to 15


### 2. Test Device Group creation flow

- **Action**: 
  - Open the Create Device Group Modal
  - Fill all the fields with valid values
  - Click on the `Submit` button
- **Expected**:
  - The `Submit` button is not enabled until all the fields are filled in.
  - The device group is created
  - The device group appears in the table with the correct attributes
  - There is no need to refresh to display the device group

### 3. Test Create a Device group with duplicate name

- **Precondition**: There is at least one Device Group registered in the NMS.
- **Action**:
  - Open the Create Device Group Modal
  - Use a name of a device group that already exists
  - Fill the other fields with valid values
  - Click on the `Submit` button
- **Expected**: 
  - An error is shown in the modal
  - The Device Group is not created

## Editing a Device Group

**Precondition**:
  - There is at least one Network Slice registered in the NMS.
  - There is at least one Device Group registered in the NMS.
  - Edit Device group modal is open

### 4. Edit device group modal
- **Expected**: 
  - All the fields are prefilled with existing values.
  - The Submit button remains disabled until a valid change in any field is made.

#### 4.1. Not editable fields
- **Expected**: the following fields cannot be edited.
  - Name
  - Network Slice

#### 4.2. Form Validation Errors
- **Action**: Introduce invalid values in the form
- **Expected**: 
    - An error is displayed below the field
    - The `Submit` button is disabled.  

These are invalid values for the form:

- **UE IP Pool**: Not in CIDR format
- **DNS**: Not a valid IP address
- **MTU**:
  - Greater than `65,535`
  - Less than `1200`

- **MBR (Maximum Bit Rate) Downstream**:
  - Greater than `1,000,000`
  - Less than `0`

- **MBR Upstream**:
  - Greater than `1,000,000`
  - Less than `0`

#### 4.3. Dropdown elements
- **Action**: click on the each dropdown
- **Expected**: 
    - The list is displayed
    - We can select any element that we want

Tests the following dropdows

- **5QI**: contains the following options:
  - 1: GBR - Conversational Voice
  - 2: GBR - Conversational Video
  - 9: Non-GBR
- **ARP**: contains a list from 1 to 15

### 5. Test Device Group edition flow
- **Action**: 
  - Open the Edit Device Group Modal
  - Change all the fields with valid values
  - Click on the `Submit` button
- **Expected**:
  - The device group is edited
  - The device group appears in the table with the correct attributes
  - There is no need to refresh to display the device group update


## Deleting a Device Group

**Precondition**:
  - There is at least one Network Slice registered in the NMS.
  - There is at least one Device Group registered in the NMS.

### 6. Delete a device group that contains a Subscriber

**Precondition**: add a Subscriber and associate it to the Device Group under test.

#### 6.1. Without using shift
- **Action**: 
  - Click on the `Delete` button
- **Expected**:
  - A warning modal is displayed.
  - The device group cannot be deleted

#### 6.2. Using shift
- **Action**:
  - Click on the `Delete` button using `shift` at the same time
- **Expected**: 
  - A warning modal is displayed.
  - The device group cannot be deleted


### 7. Delete a device group that does not contain a subscriber

**Precondition**: the Device Group under test does not have any Subscriber associated.

#### 7.1. Without using shift
- **Action**: 
  - Click on the `Delete` button
- **Expected**:
  - A warning modal is displayed.
  - When clicking in the delete button the device group is deleted
  - The device group is inmmediately removed from the table

#### 7.2. Using shift
- **Action**:
  - Click on the `Delete` button using `shift` at the same time
- **Expected**: 
  - The device group is deleted
  - The device group is inmmediately removed from the table


### 8. Test Empty State: No Device groups, no Network Slices
**Precondition**: 
- There are no Network Slices registered in the NMS.
- There are no Device Groups registered in the NMS.

#### 8.1. Device groups page
- **Action**: Go to the Device groups page
- **Expected**: we should see:
  - Empty state message: No device group available
  - Button: `Go to "Network Slices" page`
  - Table is not displayed

#### 8.2. Button
- **Action**: Click on the  `Go to "Network Slices" page`
- **Expected**: We are redictected to the Network Slices page

### 9. Test Empty State: No Device groups, Network Slices exists
**Precondition**: 
- There is at least one Network Slices registered in the NMS.
- There are no Device Groups registered in the NMS.

#### 9.1. Device groups page
- **Action**: Go to the Device groups page
- **Expected**: we should see:
  - Empty state message: No device group available
  - Button: `Create`
  - Table is not displayed

#### 9.2. Button
- **Action**: Click on the `Create` button
- **Expected**: create Device group modal appears
