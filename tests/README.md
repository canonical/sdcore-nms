# Manual Frontend Test Scenarios

This directory contains manual test cases that must be executed before every release.

## Purpose
These test cases define the expected behavior for the NMS frontend functionalities. They ensure that the UI elements behave correctly, validation rules are enforced and data updates are reflected as expected.

## When to Run These Tests
1. Before a Release: Run all test cases to validate correctness.
2. After a Code Change: If you modify a specific feature (e.g., Device Groups), run only the test cases for that feature (recommended).

## Test Categories
Each Markdown file contains test cases for a specific section of the application:

| File Name                         | Test Coverage |
|-----------------------------------|----------------|
| `network_slices_tests.md`         | Network Slices Page |
| `device_groups_tests.md`          | Device Groups Page |
| `subscribers_tests.md`            | Subscribers Page |

## How to Execute Manual Tests
These are not automated tests, so they need to be run manually on a running NMS: either trough a SD-Core deployment or a [local deployment for development](/sdcore-nms/CONTRIBUTING.md).

To run the tests:

1. Open the corresponding `.md` file for the section you're testing.
2. Go trough all the described tests and verify that the UI behaves as expected.
4. If an issue is found, report it [here](https://github.com/canonical/charmed-aether-sd-core/issues/new/choose).

## Keeping Tests Updated
- If a feature changes, update the relevant test cases accordingly.
- If a new feature is introduced, create a new `.md` file with test scenarios.

---

 **Reminder:** These tests do not replace automated testing but serve as a final verification step before deployment.
