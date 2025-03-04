# Subscribers Page - Test Scenarios

This document outlines test cases for creating, editing, and deleting a Subscribers.

---

## Empty State: No Subscribers

### 1. No Network Slices Available
- Expected empty state message: No subscriber available
- Expected Button: `Go to "Network Slices" page`
- Table is not displayed

### 2. No Device Groups Available
- Expected empty state message: No subscriber available
- Expected Button: `Go to "Device Groups" page`
- Table is not displayed

### 3. Network Slices and Device Groups Exist
- Expected empty state message: No subscriber available
- Expected Button: Green `Create` button
- Table is not displayed

---

## Creating a Subscriber

### 4. Validation Errors
When invalid values are entered in the form, an error is displayed, and the `Submit` button is disabled.

#### Invalid IMSI:
- Contains letters
- Longer than 15 characters
- Shorter than 14 characters

#### Invalid OPC:
- Longer than 32 characters
- Shorter than 32 characters
- Contains non-hex characters

#### Invalid Key:
- Longer than 32 characters
- Shorter than 32 characters
- Contains non-hex characters

### 5. Given the Create Subscriber Modal

#### Dropdown Selections:
- Before selecting a Network Slice, the Device Group list is empty.
- When selecting a Network Slice with two or more Device Groups → Device Group is not automatically selected, but the list is populated.
- When selecting a Network Slice with one Device Group → Device Group is automatically selected.
- When selecting a Network Slice with no Device Groups → The Device Group list remains empty.

### 6. Successful Creation
- When a valid Subscriber is created, it immediately appears in the table with the correct attributes.

### 7. Duplicate IMSI Handling
- If the IMSI already exists, an error is shown in the modal and the subscriber is not created.  

---

## Editing a Subscriber

### 8. Edit Subscriber Modal
- Fields are prefilled with existing values.
- The following field is not editable:
  - IMSI
- If no changes are made, the Submit button remains disabled.

### 9. Validation Errors in Edit Modal
- **Invalid OPC**:
  - Longer than 32 characters
  - Shorter than 32 characters
  - Contains non-hex characters

- **Invalid Key**:
  - Longer than 32 characters
  - Shorter than 32 characters
  - Contains non-hex characters

### 10. Successful Edit
- Updated values are inmediately reflected in the table.

---

## Deleting a Subscriber

### 11. Deletion Flow
- A warning modal is displayed before deletion.
- Deletion is allowed.
- The Delete button has a Shift shortcut.
- The deleted Subscriber is inmmediately removed from the table.
