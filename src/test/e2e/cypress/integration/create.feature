Feature: Create Files

  Background:
    Given User is authenticated
    And A git repository exists

  Scenario: Create a file
    Given User has permission to read and write repository
    When User creates a new file
    Then The created file is displayed

  Scenario: Upload a file
    Given User has permission to read and write repository
    When User uploads a new file
    Then The folder containing the uploaded file is displayed

  Scenario: Upload multiple files
    Given User has permission to read and write repository
    When User uploads multiple new files
    Then The folder containing the uploaded files is displayed

  Scenario: There are upload and create buttons
    Given User has permission to read and write repository
    When User visits code view of repository
    Then There is a create file button
    And There is an upload file button

  Scenario: No upload and create buttons without permissions
    Given User has permission to read repository
    When User visits code view of repository
    Then There is no create file button
    And There is no upload file button
