# Device Groups Page - Test Scenarios

This document outlines test cases for creating, editing, and deleting a Device Groups.

---

## Empty State: No Device Groups

### 1. No Network Slices Available
- Expected empty state message: No device group available
- Expected Button: `Go to "Network Slices" page`
- Table is not displayed

### 2. Network Slices Exist
- Expected empty state message: No device group available
- Expected Button: Green `Create` button
- Table is not displayed

---

## 🟢 Creating a Device Group

### 3. Form Validation Errors
When invalid values are entered in the form, an error is displayed, and the `Submit` button is disabled.  

#### Invalid Name:
- Starts with a number
- Contains invalid characters (`! # $ .`)
- Longer than 20 characters

#### Invalid Fields:
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

### 4. Given the Create Device Group Modal
- We can properly select elements in the following dropdowns:
  - Network Slice (test with multiple elements in the list)
  - 5QI
  - ARP
- If no changes are made, the Submit button remains disabled.

### 5. Successful Creation
- When a valid Device Group is created, it immediately appears in the table with the correct attributes.

### 6. Duplicate Name Handling
- If the Name already exists, an error is shown in the modal and the Device Group is not created.

---

## ✏️ Editing a Device Group

### 7. Edit Device Group Modal
- Fields are prefilled with existing values.
- The following fields are not editable:
  - Name
  - Network Slice

### 8. Validation Errors in Edit Modal
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

### 9. Successful Edit  
- Updated values are inmediately reflected in the table.

---

## 🗑️ Deleting a Device Group

### 10. Device Group with a Subscriber
- Deletion is not allowed.
- A warning modal is displayed.
- Shift shortcut cannot delete the Device Group.

### 11. Device Group without a Subscriber
- A warning modal is displayed, confirming deletion. 
- Deletion is allowed.
- The Delete button has a Shift shortcut.
- The deleted Device Group is inmmediately removed from the table.
