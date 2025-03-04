# Network Slice Test Scenarios

This document outlines test cases for creating, editing, and deleting a Network Slice.

---

## Empty State Behavior: No Network Slice

### 1. No UPF
- Empty state message: Missing UPFs
- Button: Documentation link (opens in a new tab)
- Table is not displayed

### 2. No gNodeB
- Empty state message: Missing gNodeBs
- Button: Documentation link (opens in a new tab)
- Table is not displayed

### 3. No UPF, no gNodeB
- Empty state message: Missing UPFs and gNodeBs
- Button: Documentation link (opens in a new tab)
- Table is not displayed

### 4. UPFs and gNodeB exist
- Empty state message: No network slice available
- Button: Green `Create` button
- Table is not displayed

---

## Table Behavior with Existing Network Slice

### 5. No UPF
- Warning: Missing UPFs (includes a documentation link)
- Table: Displayed
- Button states:
  - Create: Disabled
  - Edit: Disabled
  - Delete: Enabled

### 6. No gNB
- Warning: Missing gNBs (includes a documentation link)
- Table: Displayed
- Button states:
  - Create: Disabled
  - Edit: Disabled
  - Delete: Enabled


### 7. No UPF and no gNB
- Warning: Missing UPFs and gNBs (includes a documentation link)
- Table: Displayed
- Button states:
  - Create: Disabled
  - Edit: Disabled
  - Delete: Enabled

### 8. UPFs and gNodeB exist
- No Warning is displayed
- Table: Displayed
- Button states:
  - Create: Enabled
  - Edit: Enabled
  - Delete: Enabled

---

## 🟢 Creating a Network Slice

### 9. Form Validation Errors  
When invalid values are entered in the form, an error is displayed, and the `Submit` button is disabled.  

#### Invalid Name:
- Starts with a number
- Contains invalid characters (`! # $ .`)
- Longer than 20 characters

#### Invalid MCC (Mobile Country Code):
- Longer than 3 characters
- Shorter than 3 characters
- Contains letters

#### Invalid MNC (Mobile Network Code):  
- Longer than 3 characters
- Shorter than 2 characters
- Contains letters

### 10. Given the Network Slice Modal
- SST field is set to `1` and cannot be edited.

### 11. Given multiple UPFs
- Each UPF can be selected.

### 12. Given multiple gNodeBs
- Multiple gNBs selection is possible using `Ctrl`.

### 13. Successful Creation
- When a valid Network Slice is created, it immediately appears in the table with the correct attributes.
- If created with multiple gNBs, the table reflects all assigned gNBs.

### 14. Duplicate Name Handling  
- If the Name already exists, an error is shown in the modal and the Network Slice is not created.

---

## ✏️ Editing a Network Slice

### 15. Edit Network Slice Modal
- Fields are prefilled with existing values.
- The following fields are not editable:
  - Name
  - MCC (Workaround for [Issue #200](https://github.com/omec-project/webconsole/issues/200))
  - MNC (Workaround for [Issue #200](https://github.com/omec-project/webconsole/issues/200))
  - SST
- The UPF and gNodeB list can be edited.
- If no changes were made, the `Submit` button remains disabled.

### 16. Successful Edit
- Updated values are reflected in the table.

---

## 🗑️ Deleting a Network Slice

### 17. Network Slice with a Device Group
- Deletion is not allowed.
- A warning modal is displayed.
- Shift shortcut cannot delete the Network Slice.

### 18. Network Slice without a Device Group
- A warning modal is displayed, confirming deletion.
- Deletion is allowed.
- The Delete button has a Shift shortcut.
- The deleted Network Slice is inmmediately removed from the table.
